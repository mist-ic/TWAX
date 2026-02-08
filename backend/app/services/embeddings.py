"""Embedding service for semantic deduplication."""

import numpy as np
from sentence_transformers import SentenceTransformer

# Global model instance (loaded at startup)
_model: SentenceTransformer | None = None

# In-memory embedding store (TODO: move to database)
_embeddings_store: list[tuple[str, list[float]]] = []


def load_embedding_model():
    """Load the embedding model at application startup."""
    global _model
    _model = SentenceTransformer("all-MiniLM-L6-v2")


async def generate_embedding(text: str) -> list[float]:
    """
    Generate embedding vector for text using local MiniLM model.
    """
    if _model is None:
        load_embedding_model()

    embedding = _model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


async def check_duplicate(
    embedding: list[float], threshold: float = 0.85
) -> tuple[bool, str | None, float | None]:
    """
    Check if embedding is similar to any existing embeddings.

    Returns:
        (is_duplicate, similar_article_id, similarity_score)
    """
    if not _embeddings_store:
        return False, None, None

    query_vec = np.array(embedding)

    for article_id, stored_embedding in _embeddings_store:
        stored_vec = np.array(stored_embedding)

        # Cosine similarity
        similarity = np.dot(query_vec, stored_vec) / (
            np.linalg.norm(query_vec) * np.linalg.norm(stored_vec)
        )

        if similarity >= threshold:
            return True, article_id, float(similarity)

    return False, None, None


async def store_embedding(article_id: str, embedding: list[float]):
    """
    Store embedding for future deduplication checks.
    TODO: Move to database with pgvector.
    """
    _embeddings_store.append((article_id, embedding))
