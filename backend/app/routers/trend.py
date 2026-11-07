"""
Trend radar router:
- GET /trend/feed: daily idea feed (up to 10 cards)
- GET /trend/signals: list recent trend signals
- POST /trend/ingest: manually trigger ingest (admin only)
- GET /trend/clusters: list trend clusters
- PATCH /trend/cards/{id}/status: update idea card status
"""
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.auth import User
from app.models.trend import IdeaCard, TrendCluster, TrendSignal

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trend", tags=["trend"])


# ─── Inline schemas ───────────────────────────────────────────────────────────

class TrendSignalResponse(BaseModel):
    id: str
    source: str
    title: str
    url: Optional[str]
    velocity: Optional[float]
    first_seen: Optional[datetime]


class IdeaCardResponse(BaseModel):
    id: str
    angle_type: Optional[str]
    headline: Optional[str]
    core_insight: Optional[str]
    suggested_format: Optional[str]
    best_platform: Optional[str]
    relevance_score: Optional[int]
    freshness_hours: Optional[int]
    freshness_expires: Optional[datetime]
    risk_flags: Optional[list[str]]
    status: str
    audience_pain_point: Optional[str]
    created_at: Optional[datetime]


class TrendClusterResponse(BaseModel):
    id: str
    label: str
    category: Optional[str]
    created_at: Optional[datetime]


class CardStatusUpdate(BaseModel):
    status: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/feed", response_model=list[IdeaCardResponse])
async def get_idea_feed(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Daily idea feed — most relevant + fresh cards."""
    result = await db.execute(
        select(IdeaCard)
        .where(IdeaCard.status.in_(["new", "saved"]))
        .order_by(IdeaCard.relevance_score.desc(), IdeaCard.created_at.desc())
        .limit(limit)
    )
    cards = result.scalars().all()
    return [_card_to_response(c) for c in cards]


@router.get("/signals", response_model=list[TrendSignalResponse])
async def list_trend_signals(
    source: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List recent trend signals, optionally filtered by source."""
    query = select(TrendSignal).order_by(TrendSignal.first_seen.desc()).limit(limit)
    if source:
        query = query.where(TrendSignal.source == source)
    result = await db.execute(query)
    signals = result.scalars().all()
    return [
        TrendSignalResponse(
            id=str(s.id),
            source=s.source,
            title=s.title,
            url=s.url,
            velocity=s.velocity,
            first_seen=s.first_seen,
        )
        for s in signals
    ]


@router.post("/ingest")
async def manual_ingest(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually trigger trend ingest + clustering (admin only)."""
    if getattr(current_user, "role", None) not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        from app.services.trend_ingest import ingest_all
        from app.services.trend_cluster import cluster_unclustered_signals

        signals_ingested = await ingest_all(db)
        clusters_created = await cluster_unclustered_signals(db)
        return {"signals_ingested": signals_ingested, "clusters_created": clusters_created}
    except Exception as exc:
        logger.error("Manual ingest failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Ingest failed: {exc}")


@router.get("/clusters", response_model=list[TrendClusterResponse])
async def list_trend_clusters(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List trend clusters ordered by newest first."""
    result = await db.execute(
        select(TrendCluster).order_by(TrendCluster.created_at.desc()).limit(limit)
    )
    clusters = result.scalars().all()
    return [
        TrendClusterResponse(
            id=str(c.id),
            label=c.label,
            category=c.category,
            created_at=c.created_at,
        )
        for c in clusters
    ]


@router.patch("/cards/{id}/status", response_model=IdeaCardResponse)
async def update_card_status(
    id: str,
    payload: CardStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update an IdeaCard status (e.g. new→saved, new→dismissed)."""
    import uuid
    valid_statuses = {"new", "saved", "dismissed", "used"}
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Must be one of: {valid_statuses}",
        )
    card = await db.get(IdeaCard, uuid.UUID(id))
    if not card:
        raise HTTPException(status_code=404, detail="IdeaCard not found")
    card.status = payload.status
    await db.commit()
    await db.refresh(card)
    return _card_to_response(card)


# ─── Helper ───────────────────────────────────────────────────────────────────

def _card_to_response(c: IdeaCard) -> IdeaCardResponse:
    return IdeaCardResponse(
        id=str(c.id),
        angle_type=c.angle_type,
        headline=c.headline,
        core_insight=c.core_insight,
        suggested_format=c.suggested_format,
        best_platform=c.best_platform,
        relevance_score=c.relevance_score,
        freshness_hours=c.freshness_hours,
        freshness_expires=c.freshness_expires,
        risk_flags=c.risk_flags,
        status=c.status,
        audience_pain_point=c.audience_pain_point,
        created_at=c.created_at,
    )
