"""
Trend clustering service: groups similar TrendSignals into TrendClusters
using simple keyword/title similarity (no pgvector required for Phase 1).
"""
import logging
import re
import string
import uuid
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy model imports
# ---------------------------------------------------------------------------
def _models():
    from app.models.trend import TrendSignal, TrendCluster, IdeaCard, NicheProfile  # noqa: PLC0415
    return TrendSignal, TrendCluster, IdeaCard, NicheProfile


# ---------------------------------------------------------------------------
# Keyword helpers
# ---------------------------------------------------------------------------

_STOPWORDS = frozenset({
    "the", "and", "for", "that", "this", "with", "from", "have", "been",
    "will", "are", "was", "were", "has", "had", "not", "but", "can", "its",
    "you", "your", "they", "their", "our", "about", "just", "how", "what",
    "when", "who", "why", "which", "than", "into", "also", "more", "some",
})


def _extract_keywords(text: str, min_len: int = 4) -> set[str]:
    """Return meaningful lowercase words ≥ min_len chars from text."""
    text = text.lower()
    words = re.sub(r"[^a-z0-9\s]", " ", text).split()
    return {w for w in words if len(w) >= min_len and w not in _STOPWORDS}


def _keyword_overlap(kw_a: set[str], kw_b: set[str]) -> int:
    return len(kw_a & kw_b)


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

async def cluster_unclustered_signals(db: AsyncSession) -> int:
    """
    Fetch all TrendSignals where is_clustered=False, group by keyword overlap,
    create TrendCluster records, and mark signals as clustered.
    Returns the number of clusters created.
    """
    TrendSignal, TrendCluster, IdeaCard, NicheProfile = _models()

    result = await db.execute(
        select(TrendSignal).where(TrendSignal.is_clustered == False)  # noqa: E712
    )
    unclustered = list(result.scalars().all())

    if not unclustered:
        return 0

    # Build keyword sets per signal
    kw_map: dict[int, set[str]] = {
        i: _extract_keywords(sig.title) for i, sig in enumerate(unclustered)
    }

    visited: set[int] = set()
    groups: list[list] = []

    for i, sig_i in enumerate(unclustered):
        if i in visited:
            continue
        group = [sig_i]
        visited.add(i)
        for j, sig_j in enumerate(unclustered):
            if j <= i or j in visited:
                continue
            if _keyword_overlap(kw_map[i], kw_map[j]) >= 1:
                group.append(sig_j)
                visited.add(j)
        groups.append(group)

    clusters_created = 0

    for group in groups:
        # Find the most representative label: most common keyword across titles
        all_keywords: list[str] = []
        for sig in group:
            all_keywords.extend(_extract_keywords(sig.title))
        keyword_counts = Counter(all_keywords)
        label = keyword_counts.most_common(1)[0][0] if keyword_counts else group[0].title[:50]

        # Check if a cluster with similar label already exists
        ilike_pattern = f"%{label}%"
        existing_result = await db.execute(
            select(TrendCluster).where(TrendCluster.label.ilike(ilike_pattern))
        )
        existing_cluster = existing_result.scalar_one_or_none()

        signal_ids = [str(s.id) for s in group]

        if existing_cluster is None:
            new_cluster = TrendCluster(
                label=label,
                signal_ids=signal_ids,
                peak_estimate=datetime.now(timezone.utc) + timedelta(days=2),
            )
            db.add(new_cluster)
            clusters_created += 1
        else:
            # Merge signal IDs into existing cluster
            existing_ids: list[str] = existing_cluster.signal_ids or []
            merged = list(set(existing_ids + signal_ids))
            existing_cluster.signal_ids = merged

        # Mark signals as clustered
        for sig in group:
            sig.is_clustered = True

    await db.commit()
    logger.info("cluster_unclustered_signals: created %d clusters", clusters_created)
    return clusters_created


async def score_cluster_for_niche(
    cluster,  # TrendCluster
    niche_profile,  # NicheProfile
    db: AsyncSession,
) -> Optional[object]:  # Optional[IdeaCard]
    """
    Score a cluster against a niche profile and optionally generate idea angles
    via Claude. Returns an unsaved IdeaCard or None if relevance < 3.
    """
    TrendSignal, TrendCluster, IdeaCard, NicheProfile = _models()

    # Build niche keyword pool
    niche_text = " ".join(filter(None, [
        niche_profile.industry or "",
        niche_profile.sub_niche or "",
        " ".join(niche_profile.pillars or []),
    ]))
    niche_kw = _extract_keywords(niche_text, min_len=3)
    cluster_kw = _extract_keywords(cluster.label or "", min_len=3)

    overlap = len(niche_kw & cluster_kw)
    # Simple relevance: 0-10 based on keyword overlap count (cap at 10)
    relevance_score = min(10, overlap * 2)

    if relevance_score < 3:
        return None

    # Fetch top 3 signals for context
    signal_ids = (cluster.signal_ids or [])[:3]
    top_signals = []
    for sid in signal_ids:
        try:
            res = await db.execute(
                select(TrendSignal).where(TrendSignal.id == uuid.UUID(sid))
            )
            sig = res.scalar_one_or_none()
            if sig:
                top_signals.append(sig)
        except Exception:  # noqa: BLE001
            pass

    signal_summary = "; ".join(s.title for s in top_signals) if top_signals else cluster.label

    # --- AI path ---
    if settings.anthropic_api_key:
        try:
            from app.services.ai import generate, _load_prompt  # noqa: PLC0415
            from pydantic import BaseModel  # noqa: PLC0415

            class _AngleItem(BaseModel):
                angle: str
                rationale: str

            class _TrendRelevanceSchema(BaseModel):
                angles: list[_AngleItem]
                headline: str
                core_insight: str

            prompt_template = _load_prompt("trend_relevance")
            prompt = prompt_template.format(
                cluster_label=cluster.label,
                signal_summary=signal_summary,
                industry=niche_profile.industry or "",
                sub_niche=niche_profile.sub_niche or "",
                pillars=", ".join(niche_profile.pillars or []),
                relevance_score=relevance_score,
            )
            ai_result = await generate(prompt, response_model=_TrendRelevanceSchema)
            idea = IdeaCard(
                cluster_id=cluster.id,
                niche_profile_id=niche_profile.id,
                headline=ai_result.headline,
                core_insight=ai_result.core_insight,
                angles=[a.model_dump() for a in ai_result.angles],
                relevance_score=relevance_score,
            )
            return idea
        except Exception as exc:  # noqa: BLE001
            logger.warning("AI idea generation failed for cluster %s: %s", cluster.id, exc)
            # Fall through to deterministic fallback

    # --- Deterministic fallback ---
    headline = f"{cluster.label.title()} Trend: What {niche_profile.industry or 'Your Industry'} Needs to Know"
    core_insight = (
        f"The trend around '{cluster.label}' is gaining momentum. "
        f"Here's how it relates to {niche_profile.sub_niche or niche_profile.industry or 'your niche'}."
    )
    angles = [
        {"angle": f"Educational: Explain the '{cluster.label}' trend to your audience", "rationale": "Builds authority"},
        {"angle": f"Opinion: Your take on '{cluster.label}' in {niche_profile.industry or 'your space'}", "rationale": "Drives engagement"},
        {"angle": f"Practical: 3 ways '{cluster.label}' affects your clients", "rationale": "High utility"},
    ]

    idea = IdeaCard(
        cluster_id=cluster.id,
        niche_profile_id=niche_profile.id,
        headline=headline,
        core_insight=core_insight,
        angles=angles,
        relevance_score=relevance_score,
    )
    return idea


async def generate_idea_feed(
    db: AsyncSession,
    user_id: Optional[uuid.UUID],
    niche_profile,  # NicheProfile
    limit: int = 10,
) -> list:
    """
    Get recent clusters (last 48 hours), score against niche, save and return
    top `limit` IdeaCards sorted by relevance_score descending.
    """
    TrendSignal, TrendCluster, IdeaCard, NicheProfile = _models()

    since = datetime.now(timezone.utc) - timedelta(hours=48)
    result = await db.execute(
        select(TrendCluster).where(TrendCluster.created_at >= since)
    )
    clusters = list(result.scalars().all())

    idea_cards = []
    for cluster in clusters:
        try:
            idea = await score_cluster_for_niche(cluster, niche_profile, db)
            if idea is not None:
                if user_id:
                    idea.user_id = user_id
                idea_cards.append(idea)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to score cluster %s: %s", cluster.id, exc)

    # Sort by relevance descending, take top limit
    idea_cards.sort(key=lambda x: x.relevance_score or 0, reverse=True)
    top_ideas = idea_cards[:limit]

    # Persist to db
    for idea in top_ideas:
        db.add(idea)
    await db.commit()
    for idea in top_ideas:
        await db.refresh(idea)

    logger.info("generate_idea_feed: saved %d idea cards for user %s", len(top_ideas), user_id)
    return top_ideas
