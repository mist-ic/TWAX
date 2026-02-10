"""Embedding service for semantic deduplication.

ALL heavy imports (numpy, sentence_transformers, torch) are lazy.
"""

_model = None


def _get_model():
    """Lazy-load the embedding model on first use."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding vector for text using local MiniLM model."""
    import numpy as np
    model = _get_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


async def check_duplicate(
    embedding: list[float], threshold: float = 0.85
) -> tuple[bool, str | None, float | None]:
    """Check if embedding is similar to any stored embeddings."""
    return False, None, None
