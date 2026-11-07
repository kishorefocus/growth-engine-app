"""
Content Studio service: generates multi-format content packs from idea cards.
Runs platform linting and quality scoring deterministically before LLM calls.
"""
import json
import logging
from typing import Optional

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.ai import generate, _load_prompt

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy model import
# ---------------------------------------------------------------------------
def _get_content_pack_model():
    from app.models.trend import ContentPack  # noqa: PLC0415
    return ContentPack


# ---------------------------------------------------------------------------
# Platform rules
# ---------------------------------------------------------------------------

PLATFORM_RULES: dict = {
    "linkedin": {
        "max_chars": 3000,
        "min_chars": 900,
        "max_hashtags": 5,
        "min_hashtags": 3,
        "rules": [
            "Hook must be under 210 chars",
            "No external links in body",
            "End with open question",
        ],
    },
    "instagram": {
        "max_chars": 2200,
        "max_hashtags": 5,
        "min_hashtags": 3,
        "rules": [
            "First sentence keyword-rich",
            "Include CTA in caption",
            "Alt text required",
        ],
    },
    "facebook": {
        "max_chars": 500,
        "max_hashtags": 3,
        "rules": [
            "No engagement bait",
            "One clear idea",
            "Conversational tone",
        ],
    },
    "x": {
        "max_chars": 280,
        "max_hashtags": 2,
        "rules": [
            "Under 280 characters",
            "No engagement bait",
        ],
    },
    "reel": {
        "max_duration_seconds": 90,
        "rules": [
            "Hook in first 3 seconds",
            "On-screen text from frame 1",
            "CTA at end",
        ],
    },
}

# Engagement bait phrases to flag
_ENGAGEMENT_BAIT_PHRASES = [
    "comment yes",
    "tag 3 friends",
    "like to win",
    "share if you agree",
    "comment below",
    "double tap",
]


# ---------------------------------------------------------------------------
# Internal AI schema
# ---------------------------------------------------------------------------

class _HookItem(BaseModel):
    text: str
    rationale: str


class _ContentPackAISchema(BaseModel):
    platform: str
    hooks: list[_HookItem]
    body: Optional[str] = None
    slides: Optional[list[dict]] = None
    script: Optional[list[dict]] = None
    caption: Optional[str] = None
    cta: Optional[str] = None
    alt_text: Optional[list[str]] = None
    first_comment: Optional[str] = None
    claims_to_verify: Optional[list[str]] = None


# ---------------------------------------------------------------------------
# Deterministic linting
# ---------------------------------------------------------------------------

def lint_content_deterministic(
    body: str,
    platform: str,
    hashtags: list[str] = None,
) -> list[dict]:
    """
    Run purely deterministic checks against PLATFORM_RULES.
    Returns a list of {"rule": str, "pass": bool, "fix": str} dicts.
    """
    results: list[dict] = []
    rules = PLATFORM_RULES.get(platform, {})
    hashtags = hashtags or []

    # Character count check
    if "max_chars" in rules:
        char_count = len(body)
        passes = char_count <= rules["max_chars"]
        results.append({
            "rule": f"Max {rules['max_chars']} characters",
            "pass": passes,
            "fix": f"Shorten by {char_count - rules['max_chars']} chars" if not passes else "",
        })

    if "min_chars" in rules:
        char_count = len(body)
        passes = char_count >= rules["min_chars"]
        results.append({
            "rule": f"Min {rules['min_chars']} characters",
            "pass": passes,
            "fix": f"Expand by {rules['min_chars'] - char_count} chars" if not passes else "",
        })

    # Hashtag count checks
    tag_count = len(hashtags)
    if "max_hashtags" in rules:
        passes = tag_count <= rules["max_hashtags"]
        results.append({
            "rule": f"Max {rules['max_hashtags']} hashtags",
            "pass": passes,
            "fix": f"Remove {tag_count - rules['max_hashtags']} hashtags" if not passes else "",
        })

    if "min_hashtags" in rules:
        passes = tag_count >= rules["min_hashtags"]
        results.append({
            "rule": f"Min {rules['min_hashtags']} hashtags",
            "pass": passes,
            "fix": f"Add {rules['min_hashtags'] - tag_count} more hashtags" if not passes else "",
        })

    # Engagement bait detection
    body_lower = body.lower()
    bait_found = [phrase for phrase in _ENGAGEMENT_BAIT_PHRASES if phrase in body_lower]
    results.append({
        "rule": "No engagement bait",
        "pass": len(bait_found) == 0,
        "fix": f"Remove engagement bait phrase(s): {bait_found}" if bait_found else "",
    })

    # LinkedIn-specific: no external links in body
    if platform == "linkedin":
        has_link = "http" in body
        results.append({
            "rule": "No external links in body (LinkedIn)",
            "pass": not has_link,
            "fix": "Move URL to first comment instead of body" if has_link else "",
        })

    return results


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

async def generate_content_pack(
    db: AsyncSession,
    platform: str,
    angle: str,
    core_insight: str,
    industry: str,
    brand_profile: dict,
    verified_facts: str = "",
    past_top_posts: str = "",
) -> object:  # ContentPack
    """
    Generate a full content pack for the given platform and angle using Claude.
    Runs deterministic linting and quality scoring before persisting.
    Returns a saved ContentPack instance.
    """
    ContentPack = _get_content_pack_model()

    platform_rules = PLATFORM_RULES.get(platform, {})

    # Load and format prompt
    prompt_template = _load_prompt("content_studio")
    prompt = prompt_template.format(
        industry=industry,
        angle=angle,
        core_insight=core_insight,
        verified_facts=verified_facts,
        platform=platform,
        brand_profile=json.dumps(brand_profile, indent=2),
        platform_rules=json.dumps(platform_rules, indent=2),
        past_top_posts=past_top_posts,
    )

    # Call Claude
    ai_result: _ContentPackAISchema = await generate(
        prompt,
        response_model=_ContentPackAISchema,
        brand_context=brand_profile,
        max_tokens=4000,
    )

    # Determine body text for linting (caption for instagram, body for others)
    body_text = ai_result.body or ai_result.caption or ""

    # Run deterministic lint
    lint_results = lint_content_deterministic(body_text, platform)
    lint_failures = sum(1 for r in lint_results if not r["pass"])
    quality_score = max(0, 100 - (10 * lint_failures))

    # Build hooks list
    hooks_data = [h.model_dump() for h in ai_result.hooks]

    # Persist ContentPack
    content_pack = ContentPack(
        platform=platform,
        angle=angle,
        core_insight=core_insight,
        hooks=hooks_data,
        body=ai_result.body,
        slides=ai_result.slides,
        script=ai_result.script,
        caption=ai_result.caption,
        cta=ai_result.cta,
        alt_text=ai_result.alt_text,
        first_comment=ai_result.first_comment,
        claims_to_verify=ai_result.claims_to_verify,
        lint_results=lint_results,
        quality_score=quality_score,
    )
    db.add(content_pack)
    await db.commit()
    await db.refresh(content_pack)

    logger.info(
        "generate_content_pack: platform=%s quality_score=%d lint_failures=%d",
        platform,
        quality_score,
        lint_failures,
    )
    return content_pack
