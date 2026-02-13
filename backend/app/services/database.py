"""Database service using raw asyncpg (lazy imports).

Uses a connection pool for efficient async PostgreSQL access to Neon.
All heavy imports happen on first database call, not at module level.
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from app.core.config import settings
from app.db.models import Article

# Connection pool (lazy-initialized)
_pool = None


def _get_dsn() -> str:
    """Convert DATABASE_URL to asyncpg-compatible DSN."""
    url = settings.DATABASE_URL
    url = url.replace("sslmode=", "ssl=")
    url = url.replace("postgresql+asyncpg://", "postgresql://")
    return url


async def get_pool():
    """Get or create the connection pool (lazy)."""
    global _pool
    if _pool is None:
        import asyncpg
        _pool = await asyncpg.create_pool(dsn=_get_dsn(), min_size=1, max_size=5)
    return _pool


def _row_to_article(row) -> Article:
    """Convert a database row to an Article dataclass."""
    return Article(
        id=row["id"],
        title=row["title"],
        url=row["url"],
        content=row["content"],
        source=row["source"],
        published_at=row.get("published_at"),
        created_at=row.get("created_at"),
        relevance_score=row.get("relevance_score"),
        newsworthiness_score=row.get("newsworthiness_score"),
        summary=row.get("summary"),
        generated_tweet=row.get("generated_tweet"),
        hashtags=row.get("hashtags") or [],
        embedding=row.get("embedding"),
        status=row.get("status", "pending"),
        moderated_at=row.get("moderated_at"),
        edited_tweet=row.get("edited_tweet"),
    )


def _to_naive_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Convert a datetime to naive UTC for 'timestamp without time zone' columns.
    asyncpg is strict: it refuses to mix aware and naive datetimes.
    Our DB columns use 'timestamp' (naive), so we strip tzinfo after converting to UTC.
    """
    if dt is None:
        return None
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


async def save_article(
    title: str,
    url: str,
    content: str,
    source: str,
    published_at: Optional[datetime] = None,
    relevance_score: Optional[int] = None,
    newsworthiness_score: Optional[int] = None,
    summary: Optional[str] = None,
    generated_tweet: Optional[str] = None,
    hashtags: Optional[list[str]] = None,
    embedding: Optional[list[float]] = None,
) -> Article:
    """Save a new article to the database."""
    pool = await get_pool()
    article_id = uuid4()
    now = datetime.utcnow()  # naive UTC — matches DB 'timestamp' columns
    pub_at = _to_naive_utc(published_at)

    await pool.execute(
        """
        INSERT INTO articles (
            id, title, url, content, source, published_at, created_at,
            relevance_score, newsworthiness_score, summary,
            generated_tweet, hashtags, embedding, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        """,
        article_id, title, url, content[:10000], source, pub_at, now,
        relevance_score, newsworthiness_score, summary,
        generated_tweet, hashtags or [], embedding, "pending",
    )

    return Article(
        id=article_id, title=title, url=url, content=content,
        source=source, published_at=pub_at, created_at=now,
        relevance_score=relevance_score, newsworthiness_score=newsworthiness_score,
        summary=summary, generated_tweet=generated_tweet,
        hashtags=hashtags or [], embedding=embedding, status="pending",
    )


async def get_article(article_id: UUID) -> Optional[Article]:
    """Get a single article by ID."""
    pool = await get_pool()
    row = await pool.fetchrow("SELECT * FROM articles WHERE id = $1", article_id)
    return _row_to_article(row) if row else None


async def get_article_by_url(url: str) -> Optional[Article]:
    """Check if article with URL already exists."""
    pool = await get_pool()
    row = await pool.fetchrow("SELECT * FROM articles WHERE url = $1", url)
    return _row_to_article(row) if row else None


async def get_pending_articles(limit: int = 20) -> list[Article]:
    """Get pending articles ordered by relevance."""
    pool = await get_pool()
    rows = await pool.fetch(
        """SELECT * FROM articles WHERE status = 'pending'
           ORDER BY relevance_score DESC NULLS LAST LIMIT $1""",
        limit,
    )
    return [_row_to_article(r) for r in rows]


async def get_articles_by_status(status: str, limit: int = 20) -> list[Article]:
    """Get articles filtered by status."""
    pool = await get_pool()
    if status == "all":
        rows = await pool.fetch(
            "SELECT * FROM articles ORDER BY created_at DESC LIMIT $1", limit
        )
    else:
        rows = await pool.fetch(
            "SELECT * FROM articles WHERE status = $1 ORDER BY created_at DESC LIMIT $2",
            status, limit,
        )
    return [_row_to_article(r) for r in rows]


async def update_article_status(
    article_id: UUID, status: str, edited_tweet: Optional[str] = None,
) -> bool:
    """Update article status (approve/reject/defer)."""
    pool = await get_pool()
    if edited_tweet:
        result = await pool.execute(
            "UPDATE articles SET status=$1, moderated_at=$2, edited_tweet=$3 WHERE id=$4",
            status, datetime.utcnow(), edited_tweet, article_id,
        )
    else:
        result = await pool.execute(
            "UPDATE articles SET status=$1, moderated_at=$2 WHERE id=$3",
            status, datetime.utcnow(), article_id,
        )
    return result != "UPDATE 0"


async def delete_all_articles() -> int:
    """Delete all articles from the database. Returns count of deleted rows."""
    pool = await get_pool()
    result = await pool.execute("DELETE FROM articles")
    # result is like "DELETE 42"
    count = int(result.split()[-1]) if result else 0
    return count
