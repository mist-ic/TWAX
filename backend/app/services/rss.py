"""RSS feed fetching service.

Fetches articles from configured tech news RSS feeds using httpx + feedparser.
"""

import asyncio
import logging
from datetime import datetime, timezone

import feedparser
import httpx

from app.models import ArticleInput

logger = logging.getLogger(__name__)

# RSS feeds to fetch (from n8n config)
RSS_FEEDS = [
    {"name": "TechCrunch", "url": "https://techcrunch.com/feed/"},
    {"name": "The Verge", "url": "https://www.theverge.com/rss/index.xml"},
    {"name": "Ars Technica", "url": "https://feeds.arstechnica.com/arstechnica/index"},
    {"name": "Wired", "url": "https://www.wired.com/feed/rss"},
    {"name": "VentureBeat", "url": "https://venturebeat.com/feed/"},
    {"name": "MIT Tech Review", "url": "https://www.technologyreview.com/feed/"},
    {"name": "OpenAI Blog", "url": "https://openai.com/blog/rss.xml"},
    {"name": "Google Blog", "url": "https://blog.google/rss/"},
]

# Max articles per feed to avoid overwhelming Gemini
MAX_PER_FEED = 5


async def fetch_single_feed(
    client: httpx.AsyncClient, feed: dict
) -> list[ArticleInput]:
    """Fetch and parse a single RSS feed."""
    name = feed["name"]
    url = feed["url"]
    articles = []

    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()

        parsed = feedparser.parse(response.text)
        entries = parsed.entries[:MAX_PER_FEED]

        logger.info(f"[RSS] {name}: {len(parsed.entries)} entries, taking {len(entries)}")

        for entry in entries:
            title = entry.get("title", "").strip()
            link = entry.get("link", "").strip()
            # Try different content fields
            content = ""
            if entry.get("content"):
                content = entry.content[0].get("value", "")
            elif entry.get("summary"):
                content = entry.get("summary", "")
            elif entry.get("description"):
                content = entry.get("description", "")

            if not title or not link:
                continue

            # Parse published date
            published_at = None
            if entry.get("published_parsed"):
                try:
                    published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                except Exception:
                    pass

            articles.append(
                ArticleInput(
                    title=title,
                    url=link,
                    content=content[:5000] if content else title,
                    source=name,
                    published_at=published_at,
                )
            )

    except httpx.HTTPStatusError as e:
        logger.warning(f"[RSS] {name}: HTTP error {e.response.status_code}")
    except httpx.RequestError as e:
        logger.warning(f"[RSS] {name}: Request error: {e}")
    except Exception as e:
        logger.warning(f"[RSS] {name}: Unexpected error: {e}")

    return articles


async def fetch_all_feeds() -> list[ArticleInput]:
    """Fetch articles from all configured RSS feeds concurrently."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        tasks = [fetch_single_feed(client, feed) for feed in RSS_FEEDS]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    all_articles = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.warning(f"[RSS] {RSS_FEEDS[i]['name']}: Failed: {result}")
        else:
            all_articles.extend(result)

    logger.info(f"[RSS] Total articles fetched: {len(all_articles)} from {len(RSS_FEEDS)} feeds")
    return all_articles
