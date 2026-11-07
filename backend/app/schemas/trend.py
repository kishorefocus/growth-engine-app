"""Pydantic schemas for the Trend Engine endpoints."""
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# NicheProfile
# ---------------------------------------------------------------------------

class NicheProfileCreate(BaseModel):
    industry: str
    sub_niche: Optional[str] = None
    audience_description: Optional[str] = None
    pillars: Optional[List[str]] = None
    competitors: Optional[List[str]] = None
    tone_notes: Optional[str] = None


class NicheProfileResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    industry: str
    sub_niche: Optional[str] = None
    audience_description: Optional[str] = None
    pillars: Optional[List[str]] = None
    competitors: Optional[List[str]] = None
    tone_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# TrendSignal
# ---------------------------------------------------------------------------

class TrendSignalResponse(BaseModel):
    id: str
    source: str
    title: str
    url: Optional[str] = None
    region: Optional[str] = None
    velocity: Optional[float] = None
    raw_data: Optional[Dict[str, Any]] = None
    first_seen: Optional[datetime] = None
    is_clustered: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# TrendCluster
# ---------------------------------------------------------------------------

class TrendClusterResponse(BaseModel):
    id: str
    label: str
    signal_ids: Optional[List[str]] = None
    peak_estimate: Optional[datetime] = None
    category: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# IdeaCard
# ---------------------------------------------------------------------------

class IdeaCardResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    cluster_id: Optional[str] = None
    angle_type: Optional[str] = None
    headline: Optional[str] = None
    core_insight: Optional[str] = None
    suggested_format: Optional[str] = None
    best_platform: Optional[str] = None
    relevance_score: Optional[int] = None
    freshness_hours: Optional[int] = None
    freshness_expires: Optional[datetime] = None
    risk_flags: Optional[List[str]] = None
    status: str = "new"
    audience_pain_point: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class IdeaFeedResponse(BaseModel):
    cards: List[IdeaCardResponse]


# ---------------------------------------------------------------------------
# ContentPack
# ---------------------------------------------------------------------------

class ContentPackCreate(BaseModel):
    idea_card_id: Optional[str] = None
    idea_id: Optional[str] = None
    platform: str
    verified_facts: Optional[str] = None


class ContentPackResponse(BaseModel):
    id: str
    idea_card_id: Optional[str] = None
    idea_id: Optional[str] = None
    platform: str
    hooks: Optional[List[Dict[str, Any]]] = None  # list of {text, rationale}
    body: Optional[str] = None
    slides: Optional[Any] = None
    script: Optional[Any] = None
    caption: Optional[str] = None
    cta: Optional[str] = None
    alt_text: Optional[List[str]] = None
    first_comment: Optional[str] = None
    claims_to_verify: Optional[List[str]] = None
    lint_report: Optional[Dict[str, Any]] = None
    quality_score: Optional[int] = None
    status: str = "draft"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# HashtagSet
# ---------------------------------------------------------------------------

class HashtagOptimizeRequest(BaseModel):
    post_text: str
    platform: str
    niche_summary: Optional[str] = None
    candidate_tags: Optional[List[str]] = None


class HashtagSetResponse(BaseModel):
    id: str
    content_pack_id: Optional[str] = None
    platform: str
    hashtags: Optional[List[Dict[str, Any]]] = None  # list of {tag, tier, reason}
    keywords: Optional[List[str]] = None
    risk_flags: Optional[List[str]] = None
    reach_score: Optional[int] = None
    reach_breakdown: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# PostMetrics
# ---------------------------------------------------------------------------

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
    post_id: Optional[str] = None
    platform: Optional[str] = None
    reach: Optional[int] = None
    impressions: Optional[int] = None
    saves: Optional[int] = None
    shares: Optional[int] = None
    comments: Optional[int] = None
    likes: Optional[int] = None
    watch_time_seconds: Optional[int] = None
    engagement_rate: Optional[float] = None
    collected_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MetricsInsightsResponse(BaseModel):
    best_format: str
    avg_reach: float
    top_posts: List[Dict[str, Any]]
    insights: List[str]


# ---------------------------------------------------------------------------
# AccountAudit
# ---------------------------------------------------------------------------

class AccountAuditResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    platform: str
    score: Optional[int] = None
    findings: Optional[List[Dict[str, Any]]] = None  # list of {field, issue, suggestion, one_click_fix}
    best_posting_hours: Optional[List[int]] = None
    engagement_tasks: Optional[List[Dict[str, Any]]] = None  # list of {task, description, draft}
    raw_profile_data: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class BestTimesResponse(BaseModel):
    platform: str
    recommended_hours_utc: List[int]
    reasoning: str


class StrategyMemoResponse(BaseModel):
    what_worked: List[str]
    what_flopped: List[str]
    next_week_plan: List[str]
    content_mix: Dict[str, Any]
