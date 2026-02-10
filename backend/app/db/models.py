"""Database models as plain dataclasses (no SQLAlchemy dependency)."""

from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional
from uuid import UUID


class ArticleStatus(str, Enum):
    """Article processing status."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DEFERRED = "deferred"
    PUBLISHED = "published"


@dataclass
class Article:
    """Article data model."""
    id: UUID
    title: str
    url: str
    content: str
    source: str
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    relevance_score: Optional[int] = None
    newsworthiness_score: Optional[int] = None
    summary: Optional[str] = None
    generated_tweet: Optional[str] = None
    hashtags: list[str] = field(default_factory=list)
    embedding: Optional[list[float]] = None
    status: str = "pending"
    moderated_at: Optional[datetime] = None
    edited_tweet: Optional[str] = None


@dataclass
class PublishedTweet:
    """Published tweet tracking."""
    id: UUID
    article_id: UUID
    platform: str
    tweet_text: str
    published_at: Optional[datetime] = None
    platform_post_id: Optional[str] = None
    likes: int = 0
    retweets: int = 0
    replies: int = 0
    impressions: int = 0
    metrics_updated_at: Optional[datetime] = None
