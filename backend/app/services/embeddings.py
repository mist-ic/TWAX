"""Embedding service for semantic deduplication.

NOTE: sentence_transformers/torch are imported lazily to avoid
blocking server startup (torch alone takes 1-3 minutes to load on Windows).
"""

import numpy as np

# Lazy-loaded model instance
_model = None


def _get_model():
    """Lazy-load the embedding model on first use."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def load_embedding_model():
    """Preload the embedding model (optional, called in background)."""
    _get_model()


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding vector for text using local MiniLM model."""
    model = _get_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


async def check_duplicate(
    embedding: list[float], threshold: float = 0.85
) -> tuple[bool, str | None, float | None]:
    """
    Check if embedding is similar to any stored embeddings.
    Returns: (is_duplicate, similar_article_id, similarity_score)
    """
    # TODO: Move to pgvector for production
    return False, None, None


async def store_embedding(article_id: str, embedding: list[float]):
    """Store embedding for future dedup checks. TODO: Move to database."""
    pass
