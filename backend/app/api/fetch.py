"""Fetch endpoint — triggers RSS ingestion pipeline on demand."""

import logging
from fastapi import APIRouter

from app.services.rss import fetch_all_feeds
from app.services.ai import score_article, generate_tweet
from app.services.embeddings import generate_embedding
from app.services import database as db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/fetch")
async def trigger_fetch():
    """
    Fetch articles from all RSS feeds, process through AI pipeline, and save.

    This reuses the same logic as POST /api/articles but fetches directly
    from RSS feeds instead of waiting for n8n to push.
    """
    # 1. Fetch all RSS feeds
    raw_articles = await fetch_all_feeds()
    logger.info(f"[FETCH] Got {len(raw_articles)} raw articles from RSS feeds")

    results = {
        "fetched": len(raw_articles),
        "new": 0,
        "duplicates": 0,
        "errors": 0,
        "articles": [],
    }

    # 2. Process each article through the pipeline
    for article in raw_articles:
        try:
            # Dedup check
            existing = await db.get_article_by_url(article.url)
            if existing:
                results["duplicates"] += 1
                continue

            # Score with Gemini
            relevance = None
            newsworthiness = None
            summary = None
            try:
                score_result = await score_article(article.title, article.content)
                relevance = score_result.relevance
                newsworthiness = score_result.newsworthiness
                summary = score_result.summary
                logger.info(
                    f"[FETCH] Scored '{article.title[:60]}': "
                    f"relevance={relevance}, newsworthiness={newsworthiness}"
                )
            except Exception as e:
                logger.warning(f"[FETCH] Scoring failed for '{article.title[:50]}': {e}")

            # Generate tweet if relevant (score >= 6)
            generated_tweet = None
            hashtags = []
            if relevance and relevance >= 6:
                try:
                    tweet_result = await generate_tweet(article.title, article.content)
                    generated_tweet = tweet_result.tweet
                    hashtags = tweet_result.hashtags
                    logger.info(f"[FETCH] Tweet: {generated_tweet}")
                except Exception as e:
                    logger.warning(f"[FETCH] Tweet gen failed: {e}")

            # Generate embedding
            embedding = None
            try:
                embedding = await generate_embedding(
                    f"{article.title} {article.content[:500]}"
                )
            except Exception as e:
                logger.warning(f"[FETCH] Embedding failed: {e}")

            # Save to DB
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

            results["new"] += 1
            results["articles"].append({
                "id": str(saved.id),
                "title": saved.title,
                "source": saved.source,
                "relevance": relevance,
                "newsworthiness": newsworthiness,
                "tweet": generated_tweet,
                "hashtags": hashtags,
            })

        except Exception as e:
            logger.error(f"[FETCH] Error processing '{article.title[:50]}': {e}")
            results["errors"] += 1

    logger.info(
        f"[FETCH] Done: {results['new']} new, "
        f"{results['duplicates']} duplicates, {results['errors']} errors"
    )
    return results
