"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api import articles, health, tweets, publish, fetch, admin
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Embedding model loads lazily on first use (torch is slow to import)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="TWAX Backend",
    description="AI-powered tech news curation and tweet generation",
    version="0.1.0",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, tags=["Health"])
app.include_router(articles.router, prefix="/api", tags=["Articles"])
app.include_router(tweets.router, prefix="/api", tags=["Tweets"])
app.include_router(publish.router, prefix="/api", tags=["Publishing"])
app.include_router(fetch.router, prefix="/api", tags=["Fetch"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
