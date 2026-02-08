"""Articles API endpoints."""

from fastapi import APIRouter, HTTPException
from uuid import UUID

from app.models import (
    Article,
    ArticleApproval,
    ArticleInput,
    ArticleStatus,
    DeduplicationRequest,
    DeduplicationResponse,
)
from app.services.ai import score_article, generate_tweet
from app.services.embeddings import check_duplicate, generate_embedding
from app.services import database as db

router = APIRouter()


@router.post("/articles", response_model=Article)
async def process_article(article: ArticleInput):
    """
    Process a new article: check duplicates, score, generate tweet, and save to DB.
    """
    from datetime import datetime

    # Check if URL already exists
    existing = await db.get_article_by_url(article.url)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Article already exists with ID {existing.id}",
        )

    # Generate embedding for deduplication
    embedding = await generate_embedding(f"{article.title} {article.content[:500]}")

    # Check for semantic duplicates
    is_dup, similar_id, sim_score = await check_duplicate(embedding)
    if is_dup:
        raise HTTPException(
            status_code=409,
            detail=f"Duplicate of article {similar_id} (similarity: {sim_score:.2f})",
        )

    # Score and summarize with AI
    score_result = await score_article(article.title, article.content)
    
    # Generate tweet
    tweet_result = await generate_tweet(article.title, article.content)

    # Save to database
    saved = await db.save_article(
        title=article.title,
        url=article.url,
        content=article.content,
        source=article.source,
        published_at=article.published_at,
        relevance_score=score_result.relevance,
        newsworthiness_score=score_result.newsworthiness,
        summary=score_result.summary,
        generated_tweet=tweet_result.tweet,
        hashtags=tweet_result.hashtags,
        embedding=embedding,
    )

    return Article(
        id=str(saved.id),
        title=saved.title,
        url=saved.url,
        content=saved.content,
        source=saved.source,
        published_at=saved.published_at,
        created_at=saved.created_at,
        relevance_score=saved.relevance_score,
        summary=saved.summary,
        generated_tweet=saved.generated_tweet,
        hashtags=saved.hashtags or [],
        embedding=embedding,
        status=ArticleStatus.PENDING,
    )


@router.get("/articles", response_model=list[Article])
async def get_pending_articles(limit: int = 20):
    """
    Get pending articles for moderation.
    """
    articles = await db.get_pending_articles(limit)
    return [
        Article(
            id=str(a.id),
            title=a.title,
            url=a.url,
            content=a.content,
            source=a.source,
            published_at=a.published_at,
            created_at=a.created_at,
            relevance_score=a.relevance_score,
            summary=a.summary,
            generated_tweet=a.generated_tweet,
            hashtags=a.hashtags or [],
            embedding=a.embedding,
            status=ArticleStatus(a.status.value),
        )
        for a in articles
    ]


@router.post("/articles/{article_id}/approve")
async def approve_article(article_id: str, approval: ArticleApproval):
    """
    Approve or reject an article.
    """
    status_map = {
        "approve": ArticleStatus.APPROVED,
        "reject": ArticleStatus.REJECTED,
        "defer": ArticleStatus.DEFERRED,
    }
    
    from app.db.models import ArticleStatus as DBStatus
    db_status = DBStatus(status_map[approval.action].value)
    
    success = await db.update_article_status(
        article_id=UUID(article_id),
        status=db_status,
        edited_tweet=approval.edited_tweet,
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"status": "updated", "article_id": article_id, "action": approval.action}


@router.post("/deduplicate", response_model=DeduplicationResponse)
async def check_deduplication(request: DeduplicationRequest):
    """
    Check if an article is a duplicate of existing articles.
    """
    embedding = await generate_embedding(f"{request.title} {request.content[:500]}")
    is_dup, similar_id, sim_score = await check_duplicate(embedding, request.threshold)

    return DeduplicationResponse(
        is_duplicate=is_dup,
        similar_article_id=similar_id,
        similarity_score=sim_score,
    )
