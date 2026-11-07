"""
Content Studio router:
- POST /content-studio/generate: generate content pack from idea card
- GET /content-studio/packs: list content packs
- GET /content-studio/packs/{id}: get single pack
- PATCH /content-studio/packs/{id}/status: approve/reject pack
"""
import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.auth import BrandProfile, User
from app.models.trend import ContentPack, NicheProfile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/content-studio", tags=["content-studio"])


# ─── Inline schemas ───────────────────────────────────────────────────────────

class GeneratePackRequest(BaseModel):
    idea_card_id: Optional[str] = None
    idea_id: Optional[str] = None  # existing ContentIdea id
    platform: str
    verified_facts: Optional[str] = None


class PackStatusUpdate(BaseModel):
    status: str


class ContentPackResponse(BaseModel):
    id: str
    idea_card_id: Optional[str]
    idea_id: Optional[str]
    platform: str
    hooks: Optional[list[dict]]
    body: Optional[str]
    slides: Optional[list[dict]]
    script: Optional[list[dict]]
    caption: Optional[str]
    cta: Optional[str]
    alt_text: Optional[list[str]]
    first_comment: Optional[str]
    claims_to_verify: Optional[list[str]]
    lint_report: Optional[list[dict]]
    quality_score: Optional[int]
    status: str
    created_at: Optional[datetime]


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=ContentPackResponse)
async def generate_pack(
    payload: GeneratePackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a content pack from an idea card or existing idea."""
    # Fetch NicheProfile for brand context
    niche_result = await db.execute(
        select(NicheProfile)
        .where(NicheProfile.user_id == current_user.id)
        .limit(1)
    )
    niche_profile = niche_result.scalar_one_or_none()

    # Fetch BrandProfile
    brand_result = await db.execute(select(BrandProfile).limit(1))
    brand_profile = brand_result.scalar_one_or_none()

    try:
        from app.services.content_studio import generate_content_pack

        pack = await generate_content_pack(
            db=db,
            platform=payload.platform,
            idea_card_id=payload.idea_card_id,
            idea_id=payload.idea_id,
            verified_facts=payload.verified_facts,
            niche_profile=niche_profile,
            brand_profile=brand_profile,
        )
    except Exception as exc:
        logger.error("Content pack generation failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Content generation failed: {exc}")

    return _pack_to_response(pack)


@router.get("/packs", response_model=list[ContentPackResponse])
async def list_packs(
    platform: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List content packs with optional filters."""
    query = select(ContentPack).order_by(ContentPack.created_at.desc()).limit(limit)
    if platform:
        query = query.where(ContentPack.platform == platform)
    if status_filter:
        query = query.where(ContentPack.status == status_filter)
    result = await db.execute(query)
    packs = result.scalars().all()
    return [_pack_to_response(p) for p in packs]


@router.get("/packs/{id}", response_model=ContentPackResponse)
async def get_pack(
    id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a single content pack by ID."""
    pack = await db.get(ContentPack, uuid.UUID(id))
    if not pack:
        raise HTTPException(status_code=404, detail="Content pack not found")
    return _pack_to_response(pack)


@router.patch("/packs/{id}/status", response_model=ContentPackResponse)
async def update_pack_status(
    id: str,
    payload: PackStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Approve, reject, or revert a content pack to draft."""
    valid_statuses = {"draft", "approved", "rejected"}
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Must be one of: {valid_statuses}",
        )
    pack = await db.get(ContentPack, uuid.UUID(id))
    if not pack:
        raise HTTPException(status_code=404, detail="Content pack not found")
    pack.status = payload.status
    await db.commit()
    await db.refresh(pack)
    return _pack_to_response(pack)


# ─── Helper ───────────────────────────────────────────────────────────────────

def _pack_to_response(p: ContentPack) -> ContentPackResponse:
    return ContentPackResponse(
        id=str(p.id),
        idea_card_id=str(p.idea_card_id) if p.idea_card_id else None,
        idea_id=str(p.idea_id) if p.idea_id else None,
        platform=p.platform,
        hooks=p.hooks,
        body=p.body,
        slides=p.slides,
        script=p.script,
        caption=p.caption,
        cta=p.cta,
        alt_text=p.alt_text,
        first_comment=p.first_comment,
        claims_to_verify=p.claims_to_verify,
        lint_report=p.lint_report,
        quality_score=p.quality_score,
        status=p.status,
        created_at=p.created_at,
    )
