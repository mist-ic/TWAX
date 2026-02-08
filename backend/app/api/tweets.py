"""Tweet generation API endpoints."""

from fastapi import APIRouter

from app.models import TweetOutput
from app.services.ai import generate_tweet

router = APIRouter()


@router.post("/generate-tweet", response_model=TweetOutput)
async def generate_tweet_endpoint(article_id: str, title: str, content: str):
    """
    Generate a tweet for an article using Gemini AI.
    """
    return await generate_tweet(title, content)


@router.post("/regenerate-tweet", response_model=TweetOutput)
async def regenerate_tweet(article_id: str, title: str, content: str, feedback: str | None = None):
    """
    Regenerate a tweet with optional feedback for improvement.
    """
    return await generate_tweet(title, content, feedback=feedback)
