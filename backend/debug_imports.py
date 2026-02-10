"""Debug script to find exactly which import hangs the server."""
import sys
import time

def timed_import(name, statement):
    """Import with timing and flush output immediately."""
    sys.stdout.write(f"  [{name}] importing... ")
    sys.stdout.flush()
    start = time.time()
    try:
        exec(statement)
        elapsed = time.time() - start
        sys.stdout.write(f"OK ({elapsed:.1f}s)\n")
    except Exception as e:
        elapsed = time.time() - start
        sys.stdout.write(f"FAILED ({elapsed:.1f}s): {e}\n")
    sys.stdout.flush()

if __name__ == "__main__":
    print("=" * 60)
    print("TWAX Import Diagnostic")
    print("=" * 60)
    sys.stdout.flush()

    # Layer 1: Stdlib
    print("\n--- Layer 1: Standard Library ---")
    sys.stdout.flush()
    timed_import("datetime", "from datetime import datetime")
    timed_import("enum", "from enum import Enum")
    timed_import("uuid", "from uuid import uuid4")

    # Layer 2: Core dependencies
    print("\n--- Layer 2: Core Dependencies ---")
    sys.stdout.flush()
    timed_import("pydantic", "from pydantic import BaseModel")
    timed_import("fastapi", "from fastapi import FastAPI")
    timed_import("sqlalchemy", "import sqlalchemy")
    timed_import("sqlalchemy.ext.asyncio", "from sqlalchemy.ext.asyncio import create_async_engine")
    timed_import("numpy", "import numpy")

    # Layer 3: API/AI dependencies
    print("\n--- Layer 3: API/AI Dependencies ---")
    sys.stdout.flush()
    timed_import("google-genai", "from google import genai")
    timed_import("atproto", "from atproto import Client")
    timed_import("twikit", "from twikit import Client")

    # Layer 4: App modules (one by one)
    print("\n--- Layer 4: App Config ---")
    sys.stdout.flush()
    timed_import("app.core.config", "from app.core.config import settings")

    print("\n--- Layer 5: App Models ---")
    sys.stdout.flush()
    timed_import("app.db.models", "from app.db.models import Article, ArticleStatus")
    timed_import("app.models.schemas", "from app.models.schemas import ArticleInput, TweetOutput")

    # Layer 6: App services
    print("\n--- Layer 6: App Services ---")
    sys.stdout.flush()
    timed_import("app.services.ai", "from app.services.ai import score_article, generate_tweet")
    timed_import("app.services.embeddings", "from app.services.embeddings import generate_embedding")
    timed_import("app.services.database", "from app.services import database")
    timed_import("app.services.publishing", "from app.services.publishing import publish_to_all_platforms")

    # Layer 7: App API routers
    print("\n--- Layer 7: App API Routers ---")
    sys.stdout.flush()
    timed_import("app.api.health", "from app.api import health")
    timed_import("app.api.articles", "from app.api import articles")
    timed_import("app.api.tweets", "from app.api import tweets")
    timed_import("app.api.publish", "from app.api import publish")

    # Layer 8: Main app
    print("\n--- Layer 8: Full App ---")
    sys.stdout.flush()
    timed_import("app.main", "from app.main import app")

    print("\n" + "=" * 60)
    print("DIAGNOSTIC COMPLETE")
    print("=" * 60)
