"""Articles API endpoints — receives articles from n8n, scores, generates tweets, stores in DB."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.models import (
    ArticleInput,
    ArticleScore,
    ArticleStatus,
    TweetOutput,
)
from app.services.ai import score_article, generate_tweet
from app.services.embeddings import generate_embedding
from app.services import database as db

router = APIRouter()


@router.post("/articles")
async def process_article(article: ArticleInput):
    """
    Process a new article from n8n RSS aggregation.
    1. Dedup by URL
    2. Score with Gemini
    3. Generate tweet if relevant
    4. Save to Neon DB
    """
    # 1. Check if URL already exists
    existing = await db.get_article_by_url(article.url)
    if existing:
        return {
            "status": "duplicate",
            "message": f"Article already exists with ID {existing.id}",
            "id": str(existing.id),
        }

    # 2. Score the article with Gemini
    relevance = None
    newsworthiness = None
    summary = None
    try:
        score_result = await score_article(article.title, article.content)
        relevance = score_result.relevance
        newsworthiness = score_result.newsworthiness
        summary = score_result.summary
    except Exception as e:
        print(f"[WARN] Scoring failed for '{article.title[:50]}': {e}")

    # 3. Generate tweet if article is relevant (score >= 6)
    generated_tweet = None
    hashtags = []
    if relevance and relevance >= 6:
        try:
            tweet_result = await generate_tweet(article.title, article.content)
            generated_tweet = tweet_result.tweet
            hashtags = tweet_result.hashtags
        except Exception as e:
            print(f"[WARN] Tweet generation failed: {e}")

    # 4. Generate embedding for dedup
    embedding = None
    try:
        embedding = await generate_embedding(f"{article.title} {article.content[:500]}")
    except Exception as e:
        print(f"[WARN] Embedding failed: {e}")

    # 5. Save to database
    saved = await db.save_article(
        title=article.title,
        url=article.url,
        content=article.content[:10000],
        source=article.source,
        published_at=article.published_at,
        relevance_score=relevance,
        newsworthiness_score=newsworthiness,
        summary=summary,
        generated_tweet=generated_tweet,
        hashtags=hashtags,
        embedding=embedding,
    )

    return {
        "status": "created",
        "id": str(saved.id),
        "title": saved.title,
        "source": saved.source,
        "relevance_score": relevance,
        "newsworthiness_score": newsworthiness,
        "generated_tweet": generated_tweet,
        "hashtags": hashtags,
    }


@router.get("/articles")
async def list_articles(
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
):
    """Get articles, optionally filtered by status."""
    articles = await db.get_articles_by_status(status or "all", limit)

    return [
        {
            "id": str(a.id),
            "title": a.title,
            "url": a.url,
            "source": a.source,
            "relevance_score": a.relevance_score,
            "newsworthiness_score": a.newsworthiness_score,
            "summary": a.summary,
            "generated_tweet": a.generated_tweet,
            "hashtags": a.hashtags or [],
            "status": a.status or "pending",
            "created_at": str(a.created_at),
        }
        for a in articles
    ]


@router.post("/articles/{article_id}/approve")
async def approve_article(article_id: str, action: str, edited_tweet: Optional[str] = None):
    """Approve, reject, or defer an article."""
    from uuid import UUID

    valid_actions = {"approve": "approved", "reject": "rejected", "defer": "deferred"}
    if action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Use: {list(valid_actions.keys())}")

    success = await db.update_article_status(
        article_id=UUID(article_id),
        status=valid_actions[action],
        edited_tweet=edited_tweet,
    )

    if not success:
        raise HTTPException(status_code=404, detail="Article not found")

    return {"status": "updated", "article_id": article_id, "action": action}
