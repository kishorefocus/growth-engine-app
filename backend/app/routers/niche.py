"""
Niche Profile router:
- GET /niche: get current user's niche profile
- POST /niche: create or update niche profile
- DELETE /niche: delete niche profile
"""
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.auth import User
from app.models.trend import NicheProfile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/niche", tags=["niche"])


class NicheProfileCreate(BaseModel):
    industry: str
    sub_niche: Optional[str] = None
    audience_description: Optional[str] = None
    pillars: Optional[list[str]] = None
    competitors: Optional[list[str]] = None
    tone_notes: Optional[str] = None


class NicheProfileResponse(BaseModel):
    id: str
    industry: str
    sub_niche: Optional[str]
    audience_description: Optional[str]
    pillars: Optional[list[str]]
    competitors: Optional[list[str]]
    tone_notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


def _to_response(profile: NicheProfile) -> NicheProfileResponse:
    return NicheProfileResponse(
        id=str(profile.id),
        industry=profile.industry,
        sub_niche=profile.sub_niche,
        audience_description=profile.audience_description,
        pillars=profile.pillars,
        competitors=profile.competitors,
        tone_notes=profile.tone_notes,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.get("", response_model=NicheProfileResponse)
async def get_niche_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's niche profile."""
    result = await db.execute(
        select(NicheProfile)
        .where(NicheProfile.user_id == current_user.id)
        .limit(1)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Niche profile not found")
    return _to_response(profile)


@router.post("", response_model=NicheProfileResponse, status_code=status.HTTP_200_OK)
async def upsert_niche_profile(
    payload: NicheProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update niche profile for the current user."""
    result = await db.execute(
        select(NicheProfile)
        .where(NicheProfile.user_id == current_user.id)
        .limit(1)
    )
    profile = result.scalar_one_or_none()

    if profile:
        # Update existing
        profile.industry = payload.industry
        if payload.sub_niche is not None:
            profile.sub_niche = payload.sub_niche
        if payload.audience_description is not None:
            profile.audience_description = payload.audience_description
        if payload.pillars is not None:
            profile.pillars = payload.pillars
        if payload.competitors is not None:
            profile.competitors = payload.competitors
        if payload.tone_notes is not None:
            profile.tone_notes = payload.tone_notes
    else:
        # Create new
        profile = NicheProfile(
            user_id=current_user.id,
            industry=payload.industry,
            sub_niche=payload.sub_niche,
            audience_description=payload.audience_description,
            pillars=payload.pillars,
            competitors=payload.competitors,
            tone_notes=payload.tone_notes,
        )
        db.add(profile)

    await db.commit()
    await db.refresh(profile)
    return _to_response(profile)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_niche_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete current user's niche profile."""
    result = await db.execute(
        select(NicheProfile)
        .where(NicheProfile.user_id == current_user.id)
        .limit(1)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Niche profile not found")
    await db.delete(profile)
    await db.commit()
    return None
