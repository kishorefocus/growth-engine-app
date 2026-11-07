"""Trend Engine models: niche profiles, signals, clusters, idea cards, content packs, hashtag sets, post metrics, account audits."""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class NicheProfile(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "niche_profiles"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    industry: Mapped[str] = mapped_column(String(100), nullable=False)
    sub_niche: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    audience_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pillars: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of strings
    competitors: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of strings/URLs
    tone_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class TrendSignal(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "trend_signals"

    source: Mapped[str] = mapped_column(String(50), nullable=False)  # google_trends|rss|reddit|hackernews|youtube
    title: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    region: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, default="global")
    velocity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # search volume growth rate 0-1
    raw_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    first_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_clustered: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class TrendCluster(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "trend_clusters"

    label: Mapped[str] = mapped_column(String(255), nullable=False)
    signal_ids: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of UUID strings
    peak_estimate: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class IdeaCard(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "idea_cards"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    cluster_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trend_clusters.id", ondelete="SET NULL"), nullable=True
    )
    angle_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # educational|contrarian|how-to
    headline: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    core_insight: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    suggested_format: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)  # carousel|reel|text|image
    best_platform: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    relevance_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 0-10
    freshness_hours: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    freshness_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    risk_flags: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of strings
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="new")  # new|saved|dismissed|generated
    audience_pain_point: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ContentPack(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "content_packs"

    idea_card_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("idea_cards.id", ondelete="SET NULL"), nullable=True
    )
    idea_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("content_ideas.id", ondelete="SET NULL"), nullable=True
    )
    platform: Mapped[str] = mapped_column(String(30), nullable=False)
    hooks: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of {text, rationale}
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    slides: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    script: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    caption: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cta: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    alt_text: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of strings
    first_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    claims_to_verify: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of strings
    lint_report: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    quality_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 0-100
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft|approved|scheduled|published|rejected


class HashtagSet(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "hashtag_sets"

    content_pack_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("content_packs.id", ondelete="SET NULL"), nullable=True
    )
    platform: Mapped[str] = mapped_column(String(30), nullable=False)
    hashtags: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of {tag, tier, reason}
    keywords: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of strings
    risk_flags: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of strings
    reach_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 0-100
    reach_breakdown: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)


class PostMetrics(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "post_metrics"

    post_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("posts.id", ondelete="SET NULL"), nullable=True
    )
    platform: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    reach: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    impressions: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    saves: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    shares: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    comments: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    likes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    watch_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    engagement_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    collected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class AccountAudit(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "account_audits"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    platform: Mapped[str] = mapped_column(String(30), nullable=False)
    score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 0-100
    findings: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of {field, issue, suggestion, one_click_fix}
    best_posting_hours: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of ints (UTC hours)
    engagement_tasks: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # list of {task, description, draft}
    raw_profile_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
