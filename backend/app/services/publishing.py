"""Social media publishing service for Twitter/X and Bluesky."""

import asyncio
from datetime import datetime
from typing import Optional
from uuid import UUID

from twikit import Client as TwikitClient
from atproto import Client as BlueskyClient

from app.core.config import settings


class TwitterPublisher:
    """Twitter/X publisher using Twikit."""
    
    def __init__(self):
        self._client: Optional[TwikitClient] = None
        self._logged_in = False
    
    async def _ensure_logged_in(self):
        """Ensure we're logged in to Twitter."""
        if self._logged_in and self._client:
            return
        
        self._client = TwikitClient()
        # Use cookies if available, otherwise login with credentials
        try:
            self._client.load_cookies('twitter_cookies.json')
            self._logged_in = True
        except Exception:
            # Need to login - this requires manual auth flow first time
            # For now, we'll use the API keys directly
            pass
    
    async def post_tweet(self, text: str, article_url: Optional[str] = None) -> dict:
        """Post a tweet to Twitter/X."""
        await self._ensure_logged_in()
        
        if not self._client:
            raise Exception("Twitter client not initialized. Run manual login first.")
        
        # Add URL if provided
        full_text = text
        if article_url:
            full_text = f"{text}\n\n{article_url}"
        
        # Ensure within character limit
        if len(full_text) > 280:
            full_text = full_text[:277] + "..."
        
        try:
            tweet = await self._client.create_tweet(text=full_text)
            return {
                "platform": "twitter",
                "post_id": tweet.id if tweet else None,
                "success": True,
                "text": full_text,
            }
        except Exception as e:
            return {
                "platform": "twitter",
                "post_id": None,
                "success": False,
                "error": str(e),
            }


class BlueskyPublisher:
    """Bluesky publisher using atproto."""
    
    def __init__(self):
        self._client: Optional[BlueskyClient] = None
        self._logged_in = False
    
    async def _ensure_logged_in(self):
        """Ensure we're logged in to Bluesky."""
        if self._logged_in and self._client:
            return
        
        self._client = BlueskyClient()
        # Run login in thread pool since atproto client is sync
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: self._client.login(
                settings.BLUESKY_HANDLE,
                settings.BLUESKY_PASSWORD
            )
        )
        self._logged_in = True
    
    async def post(self, text: str, article_url: Optional[str] = None) -> dict:
        """Post to Bluesky."""
        await self._ensure_logged_in()
        
        if not self._client:
            raise Exception("Bluesky client not initialized")
        
        # Add URL if provided
        full_text = text
        if article_url:
            full_text = f"{text}\n\n{article_url}"
        
        # Bluesky has 300 character limit
        if len(full_text) > 300:
            full_text = full_text[:297] + "..."
        
        try:
            # Run in thread pool since atproto is sync
            loop = asyncio.get_event_loop()
            post = await loop.run_in_executor(
                None,
                lambda: self._client.send_post(text=full_text)
            )
            return {
                "platform": "bluesky",
                "post_id": post.uri if post else None,
                "success": True,
                "text": full_text,
            }
        except Exception as e:
            return {
                "platform": "bluesky",
                "post_id": None,
                "success": False,
                "error": str(e),
            }


# Singleton instances
_twitter_publisher: Optional[TwitterPublisher] = None
_bluesky_publisher: Optional[BlueskyPublisher] = None


def get_twitter_publisher() -> TwitterPublisher:
    """Get Twitter publisher singleton."""
    global _twitter_publisher
    if _twitter_publisher is None:
        _twitter_publisher = TwitterPublisher()
    return _twitter_publisher


def get_bluesky_publisher() -> BlueskyPublisher:
    """Get Bluesky publisher singleton."""
    global _bluesky_publisher
    if _bluesky_publisher is None:
        _bluesky_publisher = BlueskyPublisher()
    return _bluesky_publisher


async def publish_to_all_platforms(
    text: str,
    article_url: Optional[str] = None,
    platforms: list[str] = None
) -> list[dict]:
    """Publish to multiple platforms at once."""
    if platforms is None:
        platforms = ["twitter", "bluesky"]
    
    results = []
    
    if "twitter" in platforms:
        try:
            twitter = get_twitter_publisher()
            result = await twitter.post_tweet(text, article_url)
            results.append(result)
        except Exception as e:
            results.append({
                "platform": "twitter",
                "success": False,
                "error": str(e),
            })
    
    if "bluesky" in platforms:
        try:
            bluesky = get_bluesky_publisher()
            result = await bluesky.post(text, article_url)
            results.append(result)
        except Exception as e:
            results.append({
                "platform": "bluesky",
                "success": False,
                "error": str(e),
            })
    
    return results
