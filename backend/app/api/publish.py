"""Publishing API endpoints for Twitter/X and Bluesky."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.publishing import (
    get_twitter_publisher,
    get_bluesky_publisher,
    publish_to_all_platforms,
)
from app.services import database as db

router = APIRouter()


class PublishRequest(BaseModel):
    """Request to publish a tweet."""
    article_id: str
    platforms: list[str] = ["twitter", "bluesky"]
    custom_text: Optional[str] = None


class PublishResult(BaseModel):
    """Result of publishing to a platform."""
    platform: str
    success: bool
    post_id: Optional[str] = None
    error: Optional[str] = None


@router.post("/publish", response_model=list[PublishResult])
async def publish_article(request: PublishRequest):
    """
    Publish an approved article to specified platforms.
    """
    from uuid import UUID
    
    # Get the article (in real impl, fetch from DB)
    # For now, we'll use custom_text or throw an error
    if not request.custom_text:
        raise HTTPException(
            status_code=400,
            detail="custom_text required (database integration pending)"
        )
    
    results = await publish_to_all_platforms(
        text=request.custom_text,
        platforms=request.platforms
    )
    
    return [
        PublishResult(
            platform=r["platform"],
            success=r["success"],
            post_id=r.get("post_id"),
            error=r.get("error"),
        )
        for r in results
    ]


@router.post("/publish/bluesky")
async def publish_to_bluesky(text: str, url: Optional[str] = None):
    """
    Publish directly to Bluesky.
    """
    publisher = get_bluesky_publisher()
    result = await publisher.post(text, url)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result


@router.post("/publish/twitter")
async def publish_to_twitter(text: str, url: Optional[str] = None):
    """
    Publish directly to Twitter/X.
    """
    publisher = get_twitter_publisher()
    result = await publisher.post_tweet(text, url)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result
