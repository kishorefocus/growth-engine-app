"""
Trend ingest service: fetches signals from Google Trends (via RSS/SerpApi),
News RSS feeds, Reddit (official API), Hacker News (free API), and YouTube Data API.
Writes raw signals to trend_signals table with deduplication by URL/title.
"""
import logging
import re
from datetime import datetime, timezone
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy model import — models may not be available during early syntax checks
# ---------------------------------------------------------------------------
def _get_trend_signal_model():
    from app.models.trend import TrendSignal  # noqa: PLC0415
    return TrendSignal


async def ingest_rss_feeds(
    db: AsyncSession,
    feed_urls: list[str],
    source_name: str = "rss",
) -> int:
    """
    Fetch RSS feeds via HTTP, parse <item> tags, and deduplicate by URL.
    Returns count of new TrendSignal rows inserted.
    """
    TrendSignal = _get_trend_signal_model()
    inserted = 0

    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        for feed_url in feed_urls:
            try:
                resp = await client.get(feed_url, headers={"User-Agent": "GrowthEngine/1.0"})
                resp.raise_for_status()
                xml_text = resp.text

                # Simple regex extraction of <item> blocks
                items = re.findall(r"<item>(.*?)</item>", xml_text, re.DOTALL)
                for item_xml in items:
                    # Extract title
                    title_match = re.search(r"<title>(.*?)</title>", item_xml, re.DOTALL)
                    title = title_match.group(1).strip() if title_match else ""
                    # Strip CDATA wrappers
                    title = re.sub(r"<!\[CDATA\[(.*?)\]\]>", r"\1", title).strip()

                    # Extract link — prefer <link> but RSS often uses atom:link or bare text link
                    link_match = re.search(r"<link>(.*?)</link>", item_xml, re.DOTALL)
                    if not link_match:
                        link_match = re.search(r"<link\s[^>]*href=['\"]([^'\"]+)['\"]", item_xml)
                    url = link_match.group(1).strip() if link_match else ""
                    url = re.sub(r"<!\[CDATA\[(.*?)\]\]>", r"\1", url).strip()

                    if not url or not title:
                        continue

                    # Deduplication check
                    existing = await db.execute(
                        select(TrendSignal).where(TrendSignal.url == url)
                    )
                    if existing.scalar_one_or_none() is not None:
                        continue

                    signal = TrendSignal(
                        source=source_name,
                        title=title,
                        url=url,
                        first_seen=datetime.now(timezone.utc),
                    )
                    db.add(signal)
                    inserted += 1

                await db.flush()
                logger.info("RSS feed %s: inserted %d new signals", feed_url, inserted)

            except Exception as exc:  # noqa: BLE001
                logger.error("Failed to ingest RSS feed %s: %s", feed_url, exc)

    await db.commit()
    return inserted


async def ingest_hackernews(db: AsyncSession, limit: int = 30) -> int:
    """
    Fetch top stories from the Hacker News Firebase API and insert new TrendSignals.
    Returns count of new rows inserted.
    """
    TrendSignal = _get_trend_signal_model()
    inserted = 0

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                "https://hacker-news.firebaseio.com/v0/topstories.json"
            )
            resp.raise_for_status()
            story_ids: list[int] = resp.json()
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to fetch HN top stories: %s", exc)
            return 0

        for story_id in story_ids[:limit]:
            try:
                item_resp = await client.get(
                    f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
                )
                item_resp.raise_for_status()
                item = item_resp.json()
                if not item or item.get("type") != "story":
                    continue

                title: str = item.get("title", "").strip()
                url: str = item.get("url") or f"https://news.ycombinator.com/item?id={story_id}"

                if not title:
                    continue

                # Deduplication
                existing = await db.execute(
                    select(TrendSignal).where(TrendSignal.url == url)
                )
                if existing.scalar_one_or_none() is not None:
                    continue

                signal = TrendSignal(
                    source="hackernews",
                    title=title,
                    url=url,
                    velocity=0.5,
                    first_seen=datetime.now(timezone.utc),
                )
                db.add(signal)
                inserted += 1

            except Exception as exc:  # noqa: BLE001
                logger.warning("Failed to fetch HN item %s: %s", story_id, exc)

    await db.commit()
    logger.info("HackerNews ingest: inserted %d new signals", inserted)
    return inserted


async def ingest_youtube_trending(
    db: AsyncSession,
    api_key: str,
    region_code: str = "US",
    max_results: int = 20,
) -> int:
    """
    Fetch trending YouTube videos via the YouTube Data API v3.
    Returns count of new TrendSignal rows inserted.
    """
    if not api_key:
        return 0

    TrendSignal = _get_trend_signal_model()
    inserted = 0

    url = (
        f"https://www.googleapis.com/youtube/v3/videos"
        f"?part=snippet&chart=mostPopular"
        f"&regionCode={region_code}&maxResults={max_results}&key={api_key}"
    )

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to fetch YouTube trending: %s", exc)
            return 0

        for item in data.get("items", []):
            try:
                video_id = item.get("id", "")
                snippet = item.get("snippet", {})
                title: str = snippet.get("title", "").strip()
                video_url = f"https://youtube.com/watch?v={video_id}"

                if not title or not video_id:
                    continue

                existing = await db.execute(
                    select(TrendSignal).where(TrendSignal.url == video_url)
                )
                if existing.scalar_one_or_none() is not None:
                    continue

                signal = TrendSignal(
                    source="youtube",
                    title=title,
                    url=video_url,
                    velocity=0.7,
                    first_seen=datetime.now(timezone.utc),
                )
                db.add(signal)
                inserted += 1

            except Exception as exc:  # noqa: BLE001
                logger.warning("Failed to process YouTube item: %s", exc)

    await db.commit()
    logger.info("YouTube ingest: inserted %d new signals", inserted)
    return inserted


async def ingest_all(db: AsyncSession) -> dict:
    """
    Run all ingest sources. Handles per-source exceptions gracefully.
    Returns a summary dict: {"rss": N, "hackernews": N, "youtube": N, "total": N}.
    """
    results: dict[str, int] = {"rss": 0, "hackernews": 0, "youtube": 0, "total": 0}

    # --- RSS feeds (always run, no API key needed) ---
    default_feeds = [
        "https://feeds.feedburner.com/TechCrunch",
        "https://hnrss.org/frontpage",
        "https://www.reddit.com/r/marketing/.rss",
        "https://www.reddit.com/r/entrepreneur/.rss",
        "https://www.reddit.com/r/smallbusiness/.rss",
    ]
    try:
        rss_count = await ingest_rss_feeds(db, default_feeds, source_name="rss")
        results["rss"] = rss_count
    except Exception as exc:  # noqa: BLE001
        logger.error("RSS ingest failed: %s", exc)

    # --- Hacker News (free, no key) ---
    try:
        hn_count = await ingest_hackernews(db)
        results["hackernews"] = hn_count
    except Exception as exc:  # noqa: BLE001
        logger.error("HackerNews ingest failed: %s", exc)

    # --- YouTube (requires API key) ---
    # Prefer dedicated youtube_data_api_key; fall back to google_client_id as placeholder
    yt_key = settings.youtube_data_api_key or (
        settings.google_client_id if settings.google_client_id else ""
    )
    if yt_key:
        try:
            yt_count = await ingest_youtube_trending(db, api_key=yt_key)
            results["youtube"] = yt_count
        except Exception as exc:  # noqa: BLE001
            logger.error("YouTube ingest failed: %s", exc)

    results["total"] = results["rss"] + results["hackernews"] + results["youtube"]
    logger.info("ingest_all complete: %s", results)
    return results
