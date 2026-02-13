"""Admin endpoints — destructive operations for maintenance."""

import logging
from fastapi import APIRouter

from app.services import database as db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.delete("/articles")
async def delete_all_articles():
    """Delete all articles from the database. Use with caution."""
    count = await db.delete_all_articles()
    logger.info(f"[ADMIN] Deleted {count} articles")
    return {"deleted": count}
