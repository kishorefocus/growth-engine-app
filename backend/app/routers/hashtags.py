"""
Hashtag optimizer router:
- POST /hashtags/optimize: generate hashtag set for a post
- GET /hashtags/sets: list saved hashtag sets
"""
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.auth import User
from app.models.trend import HashtagSet

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hashtags", tags=["hashtags"])


# ─── Inline schemas ───────────────────────────────────────────────────────────

class HashtagOptimizeRequest(BaseModel):
    post_text: str
    platform: str
    niche_summary: Optional[str] = None
    candidate_tags: Optional[list[str]] = None
    content_pack_id: Optional[str] = None


class HashtagSetResponse(BaseModel):
    id: str
    platform: str
    hashtags: Optional[list[dict]]
    keywords: Optional[list[str]]
    risk_flags: Optional[list[str]]
    reach_score: Optional[int]
    reach_breakdown: Optional[dict]
    created_at: Optional[datetime]


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/optimize", response_model=HashtagSetResponse)
async def optimize_hashtags_endpoint(
    payload: HashtagOptimizeRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Generate and save an optimized hashtag set for a post."""
    try:
        from app.services.hashtag import optimize_hashtags

        hashtag_set = await optimize_hashtags(
            db=db,
            post_text=payload.post_text,
            platform=payload.platform,
            niche_summary=payload.niche_summary,
            candidate_tags=payload.candidate_tags,
            content_pack_id=payload.content_pack_id,
        )
    except Exception as exc:
        logger.error("Hashtag optimization failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Hashtag optimization failed: {exc}")

    return _set_to_response(hashtag_set)


@router.get("/sets", response_model=list[HashtagSetResponse])
async def list_hashtag_sets(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List saved hashtag sets ordered by newest first."""
    result = await db.execute(
        select(HashtagSet).order_by(HashtagSet.created_at.desc()).limit(limit)
    )
    sets = result.scalars().all()
    return [_set_to_response(s) for s in sets]


# ─── Helper ───────────────────────────────────────────────────────────────────

def _set_to_response(s: HashtagSet) -> HashtagSetResponse:
    return HashtagSetResponse(
        id=str(s.id),
        platform=s.platform,
        hashtags=s.hashtags,
        keywords=s.keywords,
        risk_flags=s.risk_flags,
        reach_score=s.reach_score,
        reach_breakdown=s.reach_breakdown,
        created_at=s.created_at,
    )
