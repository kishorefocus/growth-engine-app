"""
Trend worker jobs:
1. run_trend_ingest: hourly cron - ingest signals from all sources
2. run_daily_idea_feed: daily cron at 6 AM UTC - generate idea cards per user
3. run_performance_ingest: daily - fetch post metrics from platform APIs (stub for now)
"""
import logging

logger = logging.getLogger(__name__)


async def run_trend_ingest(ctx=None) -> dict:
    """Ingest trend signals from all sources and cluster unclustered signals."""
    from app.core.database import AsyncSessionLocal
    from app.services.trend_ingest import ingest_all
    from app.services.trend_cluster import cluster_unclustered_signals

    async with AsyncSessionLocal() as db:
        try:
            result = await ingest_all(db)
            clusters = await cluster_unclustered_signals(db)
            logger.info("[run_trend_ingest] ingested=%s clusters_created=%s", result, clusters)
            return {"ingested": result, "clusters_created": clusters}
        except Exception as exc:
            logger.error("[run_trend_ingest] Failed: %s", exc)
            return {"ingested": 0, "clusters_created": 0, "error": str(exc)}


async def run_daily_idea_feed(ctx=None) -> dict:
    """Generate daily idea cards for each niche profile (runs at 6 AM UTC)."""
    from app.core.database import AsyncSessionLocal
    from sqlalchemy import select
    from app.models.trend import NicheProfile
    from app.services.trend_cluster import generate_idea_feed

    total_created = 0

    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(NicheProfile))
            profiles = result.scalars().all()

            for profile in profiles:
                try:
                    created = await generate_idea_feed(db, niche_profile=profile)
                    total_created += created
                    logger.info(
                        "[run_daily_idea_feed] niche_id=%s idea_cards_created=%s",
                        profile.id,
                        created,
                    )
                except Exception as exc:
                    logger.error(
                        "[run_daily_idea_feed] Failed for niche_id=%s: %s",
                        profile.id,
                        exc,
                    )

            logger.info("[run_daily_idea_feed] Total idea cards created: %s", total_created)
            return {"idea_cards_created": total_created}
        except Exception as exc:
            logger.error("[run_daily_idea_feed] Job failed: %s", exc)
            return {"idea_cards_created": 0, "error": str(exc)}


async def run_performance_ingest(ctx=None) -> dict:
    """
    Stub: Fetch post metrics from platform APIs.

    In a real implementation this would:
    - Enumerate connected SocialAccount records
    - Call platform APIs (LinkedIn, Instagram Graph API, Twitter v2, etc.)
    - Persist PostMetrics snapshots at 24h and 7d intervals
    """
    logger.info(
        "[run_performance_ingest] STUB — Platform metrics API integration pending. "
        "Connect your social platform API credentials to enable automated metrics ingestion."
    )
    return {"status": "stub", "message": "Platform metrics API integration pending"}
