"""
Hashtag service: candidate generation, tiering, clustering, safety filter.
"""
import logging
import re
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy model import
# ---------------------------------------------------------------------------
def _get_hashtag_set_model():
    from app.models.trend import HashtagSet  # noqa: PLC0415
    return HashtagSet


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

HASHTAG_BLOCKLIST: set[str] = {
    "#followme",
    "#like4like",
    "#likeforlike",
    "#follow4follow",
    "#spamforspam",
    "#instadaily",
    "#directsales",
    "#mlm",
}

PLATFORM_TAG_LIMITS: dict = {
    "instagram": 5,
    "linkedin": 5,
    "facebook": 3,
    "x": 2,
    "twitter": 2,
}


# ---------------------------------------------------------------------------
# Internal AI schema
# ---------------------------------------------------------------------------

class _HashtagItem(BaseModel):
    tag: str
    tier: str
    reason: str


class _LintItem(BaseModel):
    rule: str
    pass_: bool = Field(alias="pass")
    fix: str


class _HashtagAISchema(BaseModel):
    hashtags: list[_HashtagItem]
    keywords: list[str]
    lint: list[_LintItem]
    reach_score: dict


# ---------------------------------------------------------------------------
# Deterministic helpers
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> list[str]:
    """Extract meaningful lowercase alpha words ≥ 3 chars."""
    words = re.sub(r"[^a-zA-Z0-9\s]", " ", text).lower().split()
    stopwords = {
        "the", "and", "for", "that", "this", "with", "from", "have", "are",
        "was", "not", "but", "can", "its", "you", "your", "how", "what",
        "about", "just", "more", "some", "also", "into",
    }
    return [w for w in words if len(w) >= 3 and w not in stopwords]


def generate_candidate_tags(topic: str, niche: str, industry: str) -> list[str]:
    """
    Deterministically generate 10-15 candidate hashtags from topic/niche/industry.
    Returns broad → mid → niche tags.
    """
    all_text = f"{topic} {niche} {industry}"
    tokens = _tokenize(all_text)
    # Deduplicate while preserving order
    seen: set[str] = set()
    unique_tokens: list[str] = []
    for t in tokens:
        if t not in seen:
            seen.add(t)
            unique_tokens.append(t)

    # Industry-level broad tags (use industry tokens, limit 3)
    industry_tokens = _tokenize(industry)[:3]
    broad_tags = [f"#{t}" for t in industry_tokens]

    # Niche-level mid tags (niche tokens, limit 5)
    niche_tokens = _tokenize(niche)[:5]
    mid_tags = [f"#{t}" for t in niche_tokens if f"#{t}" not in broad_tags]

    # Topic/hyper-niche tags (remaining unique tokens, limit 7)
    topic_tokens = _tokenize(topic)
    niche_tags = [
        f"#{t}" for t in topic_tokens
        if f"#{t}" not in broad_tags and f"#{t}" not in mid_tags
    ][:7]

    candidates = broad_tags + mid_tags + niche_tags

    # De-dupe final list
    final: list[str] = []
    seen_tags: set[str] = set()
    for tag in candidates:
        if tag not in seen_tags:
            seen_tags.add(tag)
            final.append(tag)

    return final[:15]


def filter_safe_tags(tags: list[str]) -> list[str]:
    """Remove any tag present in HASHTAG_BLOCKLIST (case-insensitive)."""
    blocklist_lower = {t.lower() for t in HASHTAG_BLOCKLIST}
    return [tag for tag in tags if tag.lower() not in blocklist_lower]


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

async def optimize_hashtags(
    db: AsyncSession,
    post_text: str,
    platform: str,
    niche_summary: str,
    candidate_tags: list[str] = None,
    user_history: str = "",
) -> object:  # HashtagSet
    """
    Generate, filter, and optionally AI-optimize hashtags for the given platform.
    Saves and returns a HashtagSet instance.
    """
    HashtagSet = _get_hashtag_set_model()

    # --- Generate candidates if not provided ---
    if not candidate_tags:
        candidate_tags = generate_candidate_tags(
            topic=post_text[:200],
            niche=niche_summary,
            industry=niche_summary,  # fallback; callers can pass richer data
        )

    # --- Safety filter ---
    safe_tags = filter_safe_tags(candidate_tags)

    limit = PLATFORM_TAG_LIMITS.get(platform, 5)

    # Build rule checklist
    rule_checklist = [
        {"rule": f"Max {limit} tags for {platform}", "pass": len(safe_tags) <= limit},
        {"rule": "No blocked/banned tags", "pass": len(safe_tags) == len(candidate_tags)},
    ]

    # --- AI path ---
    if settings.anthropic_api_key:
        try:
            from app.services.ai import generate, _load_prompt  # noqa: PLC0415

            prompt_template = _load_prompt("hashtag_linter")
            prompt = prompt_template.format(
                post_text=post_text,
                platform=platform,
                niche_summary=niche_summary,
                candidate_tags=", ".join(safe_tags),
                user_history=user_history,
                limit=limit,
                rule_checklist=str(rule_checklist),
            )
            ai_result: _HashtagAISchema = await generate(
                prompt,
                response_model=_HashtagAISchema,
            )

            final_tags = [h.tag for h in ai_result.hashtags[:limit]]
            tiers = {h.tag: h.tier for h in ai_result.hashtags}
            lint_results = [
                {"rule": item.rule, "pass": item.pass_, "fix": item.fix}
                for item in ai_result.lint
            ]
            keywords = ai_result.keywords
            reach_score = ai_result.reach_score

            hashtag_set = HashtagSet(
                platform=platform,
                tags=final_tags,
                tiers=tiers,
                keywords=keywords,
                lint_results=lint_results,
                reach_score=reach_score,
            )
            db.add(hashtag_set)
            await db.commit()
            await db.refresh(hashtag_set)
            logger.info("optimize_hashtags (AI): platform=%s tags=%s", platform, final_tags)
            return hashtag_set

        except Exception as exc:  # noqa: BLE001
            logger.warning("AI hashtag optimization failed, using fallback: %s", exc)

    # --- Deterministic fallback ---
    final_tags = safe_tags[:limit]
    # Tier assignment: first=broad, middle=mid, last=niche
    tiers: dict[str, str] = {}
    total = len(final_tags)
    for idx, tag in enumerate(final_tags):
        if idx == 0:
            tiers[tag] = "broad"
        elif idx == total - 1:
            tiers[tag] = "niche"
        else:
            tiers[tag] = "mid"

    lint_results = [
        {
            "rule": f"Max {limit} tags for {platform}",
            "pass": len(final_tags) <= limit,
            "fix": "",
        },
        {
            "rule": "No blocked/banned tags",
            "pass": len(safe_tags) == len(candidate_tags),
            "fix": f"Removed {len(candidate_tags) - len(safe_tags)} blocked tag(s)" if len(safe_tags) != len(candidate_tags) else "",
        },
    ]

    hashtag_set = HashtagSet(
        platform=platform,
        tags=final_tags,
        tiers=tiers,
        keywords=_tokenize(post_text)[:10],
        lint_results=lint_results,
        reach_score={"estimated": "unknown", "note": "AI key not configured"},
    )
    db.add(hashtag_set)
    await db.commit()
    await db.refresh(hashtag_set)
    logger.info("optimize_hashtags (fallback): platform=%s tags=%s", platform, final_tags)
    return hashtag_set
