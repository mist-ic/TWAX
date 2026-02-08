"""Pydantic models for API requests and responses."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ArticleStatus(str, Enum):
    """Article processing status."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DEFERRED = "deferred"


class ArticleInput(BaseModel):
    """Input article from RSS/API sources."""

    title: str
    url: str
    content: str
    source: str
    published_at: datetime | None = None


class ArticleScore(BaseModel):
    """AI-generated article scoring."""

    relevance: int = Field(ge=1, le=10, description="Relevance score 1-10")
    newsworthiness: int = Field(ge=1, le=10, description="Newsworthiness score 1-10")
    summary: str = Field(max_length=280, description="Brief summary")


class TweetOutput(BaseModel):
    """Generated tweet with validation."""

    tweet: str = Field(max_length=260, description="Tweet text (leave room for link)")
    hashtags: list[str] = Field(max_length=2, description="1-2 hashtags max")
    score: int = Field(ge=1, le=10, description="Confidence score")


class Article(BaseModel):
    """Full article model with AI processing results."""

    id: str
    title: str
    url: str
    content: str
    source: str
    published_at: datetime | None
    created_at: datetime

    # AI-generated fields
    relevance_score: int | None = None
    summary: str | None = None
    generated_tweet: str | None = None
    hashtags: list[str] = []
    embedding: list[float] | None = None

    # Status
    status: ArticleStatus = ArticleStatus.PENDING

    class Config:
        from_attributes = True


class ArticleApproval(BaseModel):
    """Article approval/rejection request."""

    article_id: str
    action: ArticleStatus
    edited_tweet: str | None = None


class DeduplicationRequest(BaseModel):
    """Request to check for duplicate articles."""

    title: str
    content: str
    threshold: float = Field(default=0.85, ge=0.0, le=1.0)


class DeduplicationResponse(BaseModel):
    """Deduplication check result."""

    is_duplicate: bool
    similar_article_id: str | None = None
    similarity_score: float | None = None
