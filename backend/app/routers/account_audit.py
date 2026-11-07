"""
Account Manager router:
- GET /account-audit/{platform}: get latest audit
- POST /account-audit/run: run a new audit
- GET /account-audit/best-times: best posting times per platform
- GET /account-audit/memo: weekly strategy memo
- GET /account-audit/tasks: engagement tasks
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.auth import BrandProfile, User
from app.models.trend import AccountAudit, NicheProfile, PostMetrics

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/account-audit", tags=["account-audit"])

# Platform-specific posting time defaults (UTC hours)
_DEFAULT_POSTING_HOURS: dict[str, list[int]] = {
    "linkedin": [8, 9, 12, 17],
    "instagram": [9, 11, 14, 17, 19],
    "facebook": [9, 13, 15],
    "x": [8, 12, 17, 20],
    "twitter": [8, 12, 17, 20],
}


# ─── Inline schemas ───────────────────────────────────────────────────────────

class RunAuditRequest(BaseModel):
    platform: str
    profile_data: Optional[dict] = None


class AccountAuditResponse(BaseModel):
    id: str
    platform: str
    score: Optional[int]
    findings: Optional[list[dict]]
    best_posting_hours: Optional[list[int]]
    engagement_tasks: Optional[list[dict]]
    created_at: Optional[datetime]


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/best-times")
async def get_best_times(
    platform: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return best UTC posting hours for the given platform."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)

    result = await db.execute(
        select(PostMetrics)
        .where(
            PostMetrics.user_id == current_user.id,
            PostMetrics.platform == platform.lower(),
            PostMetrics.created_at >= cutoff,
        )
    )
    metrics = result.scalars().all()

    platform_key = platform.lower()
    defaults = _DEFAULT_POSTING_HOURS.get(platform_key, [9, 12, 17])

    if len(metrics) < 5:
        return {
            "platform": platform,
            "recommended_hours_utc": defaults,
            "reasoning": f"Insufficient data (< 5 tracked posts). Using platform defaults for {platform}.",
        }

    # Group by hour of published_at and find hours with highest avg reach
    hour_reach: dict[int, list[int]] = {}
    for m in metrics:
        if m.published_at:
            hour = m.published_at.hour
            reach = m.reach or 0
            hour_reach.setdefault(hour, []).append(reach)

    if not hour_reach:
        return {
            "platform": platform,
            "recommended_hours_utc": defaults,
            "reasoning": "No published_at timestamps found. Using platform defaults.",
        }

    avg_by_hour = {h: sum(v) / len(v) for h, v in hour_reach.items()}
    sorted_hours = sorted(avg_by_hour, key=lambda h: avg_by_hour[h], reverse=True)
    best_hours = sorted(sorted_hours[:5])

    return {
        "platform": platform,
        "recommended_hours_utc": best_hours,
        "reasoning": f"Based on {len(metrics)} tracked posts in the last 30 days. Hours ranked by average reach.",
    }


@router.get("/memo")
async def get_weekly_memo(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a weekly strategy memo based on recent performance."""
    from app.core.config import settings

    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    week_start = cutoff.strftime("%Y-%m-%d")
    week_end = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    date_range = f"{week_start} to {week_end}"

    # Fetch PostMetrics from last 7 days
    result = await db.execute(
        select(PostMetrics)
        .where(
            PostMetrics.user_id == current_user.id,
            PostMetrics.created_at >= cutoff,
        )
        .order_by(PostMetrics.created_at.desc())
    )
    metrics = result.scalars().all()

    # Fetch NicheProfile for context
    niche_result = await db.execute(
        select(NicheProfile)
        .where(NicheProfile.user_id == current_user.id)
        .limit(1)
    )
    niche = niche_result.scalar_one_or_none()
    niche_summary = niche.industry if niche else "general"

    # Build performance summary
    if metrics:
        total_reach = sum(m.reach or 0 for m in metrics)
        avg_reach = total_reach / len(metrics)
        performance_summary = (
            f"{len(metrics)} posts tracked. Total reach: {total_reach}. "
            f"Avg reach: {avg_reach:.0f}. "
            f"Niche: {niche_summary}."
        )
    else:
        performance_summary = f"No posts tracked this week. Niche: {niche_summary}."
        avg_reach = 0

    fallback_memo = {
        "week": date_range,
        "what_worked": ["Consistent posting schedule", "Educational content"],
        "what_flopped": ["Overly promotional posts", "Posts without clear CTAs"],
        "next_week_ideas": [
            "Share a behind-the-scenes story",
            "Post a data-driven insight",
            "Create a how-to tutorial",
        ],
        "content_mix": {"educational": "40%", "promotional": "20%", "engagement": "40%"},
        "engagement_tasks": [
            {"task": "Reply to all comments within 2 hours"},
            {"task": "Engage with 10 accounts in your niche daily"},
        ],
    }

    if not settings.anthropic_api_key:
        return fallback_memo

    try:
        from app.services.ai import generate, _load_prompt

        template = _load_prompt("strategy_memo")
        prompt = template.format(
            performance_data=performance_summary,
            niche_summary=niche_summary,
            date_range=date_range,
        )
        import json
        raw = await generate(prompt=prompt, max_tokens=1500)
        # Try to parse structured response; fall back to simple dict
        if isinstance(raw, str):
            try:
                return json.loads(raw)
            except Exception:
                return {**fallback_memo, "memo_text": raw}
        return raw
    except Exception as exc:
        logger.warning("Strategy memo AI generation failed (%s), using fallback", exc)
        return fallback_memo


@router.get("/tasks")
async def get_engagement_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return engagement tasks from latest account audit across all platforms."""
    result = await db.execute(
        select(AccountAudit)
        .where(AccountAudit.user_id == current_user.id)
        .order_by(AccountAudit.created_at.desc())
        .limit(10)
    )
    audits = result.scalars().all()

    all_tasks: list[dict] = []
    seen_platforms: set[str] = set()
    for audit in audits:
        if audit.platform not in seen_platforms:
            seen_platforms.add(audit.platform)
            if audit.engagement_tasks:
                for task in audit.engagement_tasks:
                    all_tasks.append({**task, "platform": audit.platform})

    return {"tasks": all_tasks}


@router.post("/run", response_model=AccountAuditResponse)
async def run_audit(
    payload: RunAuditRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run a new account audit for the given platform."""
    from app.core.config import settings

    # Build profile data from BrandProfile + payload
    brand_result = await db.execute(select(BrandProfile).limit(1))
    brand = brand_result.scalar_one_or_none()

    profile_data = payload.profile_data or {}
    if brand and not profile_data:
        profile_data = {
            "product_name": brand.product_name,
            "one_liner": brand.one_liner,
            "tone": brand.tone,
        }

    score = 50
    findings: list[dict] = [
        {"finding": "Profile completeness needs improvement", "severity": "medium"},
        {"finding": "Posting frequency below optimal", "severity": "low"},
        {"finding": "Engagement rate within acceptable range", "severity": "info"},
    ]
    best_posting_hours = _DEFAULT_POSTING_HOURS.get(payload.platform.lower(), [9, 12, 17])
    engagement_tasks: list[dict] = [
        {"task": "Reply to comments within 2 hours", "priority": "high"},
        {"task": "Engage with 10 accounts in your niche daily", "priority": "medium"},
        {"task": "Share a pinned post from a partner account", "priority": "low"},
    ]

    if settings.anthropic_api_key:
        try:
            from app.services.ai import generate, _load_prompt
            import json

            template = _load_prompt("account_audit")
            prompt = template.format(
                platform=payload.platform,
                profile_data=json.dumps(profile_data, indent=2),
            )
            raw = await generate(prompt=prompt, max_tokens=2000)
            if isinstance(raw, dict):
                score = raw.get("score", score)
                findings = raw.get("findings", findings)
                best_posting_hours = raw.get("best_posting_hours", best_posting_hours)
                engagement_tasks = raw.get("engagement_tasks", engagement_tasks)
            elif isinstance(raw, str):
                try:
                    parsed = json.loads(raw)
                    score = parsed.get("score", score)
                    findings = parsed.get("findings", findings)
                    best_posting_hours = parsed.get("best_posting_hours", best_posting_hours)
                    engagement_tasks = parsed.get("engagement_tasks", engagement_tasks)
                except Exception:
                    pass
        except Exception as exc:
            logger.warning("Account audit AI call failed (%s), using defaults", exc)

    audit = AccountAudit(
        user_id=current_user.id,
        platform=payload.platform.lower(),
        score=score,
        findings=findings,
        best_posting_hours=best_posting_hours,
        engagement_tasks=engagement_tasks,
    )
    db.add(audit)
    await db.commit()
    await db.refresh(audit)
    return _audit_to_response(audit)


@router.get("/{platform}", response_model=AccountAuditResponse)
async def get_latest_audit(
    platform: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the most recent audit for a platform."""
    result = await db.execute(
        select(AccountAudit)
        .where(
            AccountAudit.user_id == current_user.id,
            AccountAudit.platform == platform.lower(),
        )
        .order_by(AccountAudit.created_at.desc())
        .limit(1)
    )
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail=f"No audit found for platform '{platform}'")
    return _audit_to_response(audit)


# ─── Helper ───────────────────────────────────────────────────────────────────

def _audit_to_response(a: AccountAudit) -> AccountAuditResponse:
    return AccountAuditResponse(
        id=str(a.id),
        platform=a.platform,
        score=a.score,
        findings=a.findings,
        best_posting_hours=a.best_posting_hours,
        engagement_tasks=a.engagement_tasks,
        created_at=a.created_at,
    )
