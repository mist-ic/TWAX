"""Articles API endpoints."""

from fastapi import APIRouter, HTTPException

from app.models import (
    Article,
    ArticleApproval,
    ArticleInput,
    ArticleStatus,
    DeduplicationRequest,
    DeduplicationResponse,
)
from app.services.ai import score_article
from app.services.embeddings import check_duplicate, generate_embedding

router = APIRouter()


@router.post("/articles", response_model=Article)
async def process_article(article: ArticleInput):
    """
    Process a new article: score, summarize, and generate embedding.
    """
    import uuid
    from datetime import datetime

    # Generate embedding for deduplication
    embedding = await generate_embedding(f"{article.title} {article.content[:500]}")

    # Check for duplicates
    is_dup, similar_id, sim_score = await check_duplicate(embedding)
    if is_dup:
        raise HTTPException(
            status_code=409,
            detail=f"Duplicate of article {similar_id} (similarity: {sim_score:.2f})",
        )

    # Score and summarize with AI
    score_result = await score_article(article.title, article.content)

    return Article(
        id=str(uuid.uuid4()),
        title=article.title,
        url=article.url,
        content=article.content,
        source=article.source,
        published_at=article.published_at,
        created_at=datetime.utcnow(),
        relevance_score=score_result.relevance,
        summary=score_result.summary,
        embedding=embedding,
        status=ArticleStatus.PENDING,
    )


@router.get("/articles", response_model=list[Article])
async def get_pending_articles(limit: int = 20):
    """
    Get pending articles for moderation.
    """
    # TODO: Implement database query
    return []


@router.post("/articles/{article_id}/approve")
async def approve_article(article_id: str, approval: ArticleApproval):
    """
    Approve or reject an article.
    """
    # TODO: Update database, trigger publishing if approved
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
