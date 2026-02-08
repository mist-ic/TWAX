"""Gemini AI service for scoring and tweet generation.

Uses the latest google-genai SDK (2026) with native Pydantic structured output.
"""

from google import genai
from google.genai import types

from app.core.config import settings
from app.models import ArticleScore, TweetOutput

# Lazy client initialization
_client = None


def get_client():
    """Get or create Gemini client (lazy initialization)."""
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


SCORING_PROMPT = """You are a tech news curator evaluating articles for a Twitter account focused on AI, ML, and tech news.

Evaluate the following article and provide:
1. Relevance score (1-10): How relevant is this to AI/ML/tech enthusiasts?
2. Newsworthiness score (1-10): How timely and significant is this news?
3. Brief summary (max 280 chars): Key takeaway in one sentence.

Title: {title}

Content:
{content}
"""

TWEET_PROMPT = """You are a tech news curator for X (Twitter). Create an engaging tweet.

Requirements:
- Max 260 characters (leave room for link)
- Highlight the most newsworthy element
- Factual accuracy is critical
- Professional but engaging tone
- No hashtags in the tweet itself (provide separately)
- Provide 1-2 relevant hashtags

Title: {title}

Content:
{content}

{feedback_section}
"""


async def score_article(title: str, content: str) -> ArticleScore:
    """
    Score an article for relevance and newsworthiness using Gemini.
    Uses native Pydantic structured output with google-genai SDK.
    """
    prompt = SCORING_PROMPT.format(title=title, content=content[:2000])
    client = get_client()

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ArticleScore,
        ),
    )

    # Parse the response into Pydantic model
    return response.parsed


async def generate_tweet(
    title: str, content: str, feedback: str | None = None
) -> TweetOutput:
    """
    Generate a tweet for an article using Gemini with native structured output.
    """
    feedback_section = ""
    if feedback:
        feedback_section = f"Previous feedback to incorporate: {feedback}"

    prompt = TWEET_PROMPT.format(
        title=title, content=content[:2000], feedback_section=feedback_section
    )
    client = get_client()

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TweetOutput,
        ),
    )

    return response.parsed
