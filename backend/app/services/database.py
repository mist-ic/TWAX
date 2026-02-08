"""Database service for article operations."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings
from app.db.models import Article, ArticleStatus


# Create async engine and session
engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncSession:
    """Get database session."""
    async with async_session() as session:
        yield session


async def save_article(
    title: str,
    url: str,
    content: str,
    source: str,
    published_at: Optional[datetime],
    relevance_score: int,
    newsworthiness_score: int,
    summary: str,
    generated_tweet: str,
    hashtags: list[str],
    embedding: list[float],
) -> Article:
    """Save a new article to the database."""
    async with async_session() as session:
        article = Article(
            title=title,
            url=url,
            content=content,
            source=source,
            published_at=published_at,
            relevance_score=relevance_score,
            newsworthiness_score=newsworthiness_score,
            summary=summary,
            generated_tweet=generated_tweet,
            hashtags=hashtags,
            embedding=embedding,
            status=ArticleStatus.PENDING,
        )
        session.add(article)
        await session.commit()
        await session.refresh(article)
        return article


async def get_pending_articles(limit: int = 20) -> list[Article]:
    """Get pending articles for moderation, ordered by relevance."""
    async with async_session() as session:
        result = await session.execute(
            select(Article)
            .where(Article.status == ArticleStatus.PENDING)
            .order_by(Article.relevance_score.desc())
            .limit(limit)
        )
        return result.scalars().all()


async def update_article_status(
    article_id: UUID,
    status: ArticleStatus,
    edited_tweet: Optional[str] = None,
) -> bool:
    """Update article status (approve/reject/defer)."""
    async with async_session() as session:
        values = {
            "status": status,
            "moderated_at": datetime.utcnow(),
        }
        if edited_tweet:
            values["edited_tweet"] = edited_tweet

        result = await session.execute(
            update(Article)
            .where(Article.id == article_id)
            .values(**values)
        )
        await session.commit()
        return result.rowcount > 0


async def get_article_by_url(url: str) -> Optional[Article]:
    """Check if article with URL already exists."""
    async with async_session() as session:
        result = await session.execute(
            select(Article).where(Article.url == url)
        )
        return result.scalar_one_or_none()


async def get_recent_embeddings(limit: int = 100) -> list[tuple[UUID, list[float]]]:
    """Get recent article embeddings for deduplication."""
    async with async_session() as session:
        result = await session.execute(
            select(Article.id, Article.embedding)
            .where(Article.embedding.isnot(None))
            .order_by(Article.created_at.desc())
            .limit(limit)
        )
        return [(row[0], row[1]) for row in result.all()]
