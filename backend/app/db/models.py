"""SQLAlchemy database models."""

from datetime import datetime
from enum import Enum as PyEnum
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ArticleStatus(str, PyEnum):
    """Article processing status."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DEFERRED = "deferred"
    PUBLISHED = "published"


class Article(Base):
    """Article database model."""

    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String(500), nullable=False)
    url = Column(String(2000), nullable=False, unique=True)
    content = Column(Text, nullable=False)
    source = Column(String(100), nullable=False)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # AI-generated fields
    relevance_score = Column(Integer, nullable=True)
    newsworthiness_score = Column(Integer, nullable=True)
    summary = Column(Text, nullable=True)
    generated_tweet = Column(String(280), nullable=True)
    hashtags = Column(ARRAY(String), default=[], nullable=False)

    # Embedding for deduplication (pgvector in production)
    embedding = Column(ARRAY(Float), nullable=True)

    # Status and moderation
    status = Column(Enum(ArticleStatus), default=ArticleStatus.PENDING, nullable=False)
    moderated_at = Column(DateTime, nullable=True)
    edited_tweet = Column(String(280), nullable=True)


class PublishedTweet(Base):
    """Published tweet tracking."""

    __tablename__ = "published_tweets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    article_id = Column(UUID(as_uuid=True), nullable=False)
    platform = Column(String(50), nullable=False)  # x, bluesky, mastodon, threads
    platform_post_id = Column(String(100), nullable=True)
    tweet_text = Column(String(500), nullable=False)
    published_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Engagement metrics (fetched later)
    likes = Column(Integer, default=0)
    retweets = Column(Integer, default=0)
    replies = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    metrics_updated_at = Column(DateTime, nullable=True)
