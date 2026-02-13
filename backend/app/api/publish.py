"""Publishing API endpoints for Twitter/X and Bluesky.

Supports:
- Publishing an approved article to one or more platforms
- Direct single-platform publishing
- Article status tracking after publish
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.services.publishing import (
    get_twitter_publisher,
    get_bluesky_publisher,
    publish_to_all_platforms,
)
from app.services import database as db

logger = logging.getLogger(__name__)
router = APIRouter()


class PublishRequest(BaseModel):
    """Request to publish an approved article."""
    article_id: str
    platforms: list[str] = ["twitter", "bluesky"]
    custom_text: Optional[str] = None  # Override the generated tweet


class PublishResult(BaseModel):
    """Result of publishing to a platform."""
    platform: str
    success: bool
    post_id: Optional[str] = None
    error: Optional[str] = None
    text: Optional[str] = None


@router.post("/publish", response_model=list[PublishResult])
async def publish_article(request: PublishRequest):
    """
    Publish an approved article to specified platforms.
    
    Fetches the article from the database, uses its generated tweet
    (or custom_text override), and publishes to the requested platforms.
    Updates article status to 'published' on success.
    """
    # Fetch article from DB
    article_uuid = UUID(request.article_id)
    article = await db.get_article(article_uuid)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Use custom text or the AI-generated tweet
    tweet_text = request.custom_text or article.generated_tweet
    if not tweet_text:
        raise HTTPException(
            status_code=400,
            detail="No tweet text available. Generate a tweet first or provide custom_text."
        )

    article_url = article.url

    logger.info(
        f"[PUBLISH] Publishing article '{article.title[:50]}' to {request.platforms}"
    )

    # Publish to requested platforms
    results = await publish_to_all_platforms(
        text=tweet_text,
        article_url=article_url,
        platforms=request.platforms,
    )

    # Check if any platform succeeded
    any_success = any(r["success"] for r in results)
    if any_success:
        # Update article status to published
        try:
            await db.update_article_status(article_uuid, "published")
            logger.info(f"[PUBLISH] Article status updated to 'published'")
        except Exception as e:
            logger.warning(f"[PUBLISH] Failed to update article status: {e}")

    # Log results
    for r in results:
        if r["success"]:
            logger.info(f"[PUBLISH] ✅ {r['platform']}: post_id={r.get('post_id')}")
        else:
            logger.warning(f"[PUBLISH] ❌ {r['platform']}: {r.get('error')}")

    return [
        PublishResult(
            platform=r["platform"],
            success=r["success"],
            post_id=r.get("post_id"),
            error=r.get("error"),
            text=tweet_text,
        )
        for r in results
    ]


@router.post("/publish/twitter")
async def publish_to_twitter(text: str, url: Optional[str] = None):
    """Publish directly to Twitter/X."""
    publisher = get_twitter_publisher()
    result = await publisher.post_tweet(text, url)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result


@router.post("/publish/bluesky")
async def publish_to_bluesky(text: str, url: Optional[str] = None):
    """Publish directly to Bluesky."""
    publisher = get_bluesky_publisher()
    result = await publisher.post(text, url)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result
