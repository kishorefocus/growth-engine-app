"""
Post metrics router:
- POST /metrics: ingest performance metrics for a published post
- GET /metrics/{post_id}: get metrics for a post
- GET /metrics/insights: aggregated performance insights
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.auth import User
from app.models.trend import PostMetrics

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/metrics", tags=["metrics"])


# ─── Inline schemas ───────────────────────────────────────────────────────────

class PostMetricsCreate(BaseModel):
    post_id: str
    platform: str
    reach: Optional[int] = None
    impressions: Optional[int] = None
    saves: Optional[int] = None
    shares: Optional[int] = None
    comments: Optional[int] = None
    likes: Optional[int] = None
    watch_time_seconds: Optional[int] = None


class PostMetricsResponse(BaseModel):
    id: str
    post_id: str
    platform: str
    reach: Optional[int]
    impressions: Optional[int]
    saves: Optional[int]
    shares: Optional[int]
    comments: Optional[int]
    likes: Optional[int]
    watch_time_seconds: Optional[int]
    created_at: Optional[datetime]


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/insights")
async def get_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregated performance insights for the last 30 days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)

    result = await db.execute(
        select(PostMetrics)
        .where(
            PostMetrics.user_id == current_user.id,
            PostMetrics.created_at >= cutoff,
        )
        .order_by(PostMetrics.reach.desc())
    )
    metrics = result.scalars().all()

    if not metrics:
        return {
            "avg_reach": 0.0,
            "total_posts_tracked": 0,
            "best_platform": None,
            "top_posts": [],
            "insights": ["No performance data found for the last 30 days. Start tracking posts to see insights."],
        }

    total_posts = len(metrics)
    avg_reach = sum(m.reach or 0 for m in metrics) / total_posts

    # Best platform by avg reach
    platform_reach: dict[str, list[int]] = {}
    for m in metrics:
        platform_reach.setdefault(m.platform, []).append(m.reach or 0)
    best_platform = max(platform_reach, key=lambda p: sum(platform_reach[p]) / len(platform_reach[p]))

    # Top 5 posts
    top_posts = [
        {
            "post_id": str(m.post_id),
            "platform": m.platform,
            "reach": m.reach,
            "likes": m.likes,
            "shares": m.shares,
            "comments": m.comments,
        }
        for m in metrics[:5]
    ]

    # Simple insights
    insights: list[str] = []
    if avg_reach > 0:
        insights.append(f"Your average reach over the last 30 days is {avg_reach:.0f}.")
    insights.append(f"Your best performing platform is {best_platform}.")
    if total_posts < 10:
        insights.append("Track more posts to unlock deeper performance patterns.")

    return {
        "avg_reach": round(avg_reach, 2),
        "total_posts_tracked": total_posts,
        "best_platform": best_platform,
        "top_posts": top_posts,
        "insights": insights,
    }


@router.post("", response_model=PostMetricsResponse, status_code=status.HTTP_201_CREATED)
async def ingest_metrics(
    payload: PostMetricsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ingest performance metrics for a published post."""
    import uuid as _uuid

    metrics = PostMetrics(
        user_id=current_user.id,
        post_id=_uuid.UUID(payload.post_id),
        platform=payload.platform,
        reach=payload.reach,
        impressions=payload.impressions,
        saves=payload.saves,
        shares=payload.shares,
        comments=payload.comments,
        likes=payload.likes,
        watch_time_seconds=payload.watch_time_seconds,
    )
    db.add(metrics)
    await db.commit()
    await db.refresh(metrics)
    return _metrics_to_response(metrics)


@router.get("/{post_id}", response_model=list[PostMetricsResponse])
async def get_post_metrics(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all metrics snapshots for a specific post."""
    import uuid as _uuid

    try:
        post_uuid = _uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post_id format")

    result = await db.execute(
        select(PostMetrics)
        .where(
            PostMetrics.user_id == current_user.id,
            PostMetrics.post_id == post_uuid,
        )
        .order_by(PostMetrics.created_at.asc())
    )
    records = result.scalars().all()
    return [_metrics_to_response(m) for m in records]


# ─── Helper ───────────────────────────────────────────────────────────────────

def _metrics_to_response(m: PostMetrics) -> PostMetricsResponse:
    return PostMetricsResponse(
        id=str(m.id),
        post_id=str(m.post_id),
        platform=m.platform,
        reach=m.reach,
        impressions=m.impressions,
        saves=m.saves,
        shares=m.shares,
        comments=m.comments,
        likes=m.likes,
        watch_time_seconds=m.watch_time_seconds,
        created_at=m.created_at,
    )
