# TWAX

**Tech World Aggregator for X** - AI-powered tech news curation and multi-platform social publishing.

[![Status](https://img.shields.io/badge/status-beta-blue)]()
[![Backend](https://img.shields.io/badge/backend-Railway-blueviolet)](https://twax-production.up.railway.app)
[![AI](https://img.shields.io/badge/AI-Gemini%203%20Flash-orange)]()
[![Database](https://img.shields.io/badge/database-Neon%20PostgreSQL-green)]()

## 🚀 What is TWAX?

TWAX automatically aggregates tech news from RSS feeds, uses **Gemini 3 Flash** AI to score relevance, generates platform-optimized posts, presents them in a Tinder-style swipe UI for human approval, and publishes to **Twitter/X** and **Bluesky**.

**5 minutes/day** to maintain an active tech news presence.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📰 **Smart Aggregation** | 10+ tech RSS feeds via n8n workflows |
| 🤖 **AI Curation** | Gemini 3 Flash scoring + tweet generation |
| 🎯 **Deduplication** | Semantic similarity with sentence-transformers |
| 👆 **Swipe UI** | Approve/reject articles with keyboard shortcuts |
| � **Multi-Platform** | Twitter/X + Bluesky publishing |
| 🗄️ **Serverless DB** | Neon PostgreSQL with async SQLAlchemy |

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│    n8n      │────▶│  FastAPI Backend │────▶│    Neon     │
│ (RSS Feeds) │     │   (Railway)      │     │ (PostgreSQL)│
└─────────────┘     └────────┬─────────┘     └─────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Next.js UI     │
                    │   (Moderation)   │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         Twitter/X       Bluesky       (Future)
```

---

## �️ Tech Stack

| Component | Technology | Status |
|-----------|------------|--------|
| **Backend** | Python 3.11 + FastAPI | ✅ Deployed |
| **AI** | Google Gemini 3 Flash | ✅ Working |
| **Embeddings** | sentence-transformers (MiniLM) | ✅ Working |
| **Database** | Neon PostgreSQL 17 | ✅ Connected |
| **Orchestration** | n8n (self-hosted or cloud) | ✅ Configured |
| **Frontend** | Next.js 15 + React 19 | ✅ Working |
| **Hosting** | Railway (backend) | ✅ Live |
| **Twitter** | Twikit library | 🔧 Auth pending |
| **Bluesky** | atproto SDK | ✅ Verified |

---

## 📁 Project Structure

```
TWAX/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/             # REST endpoints
│   │   │   ├── articles.py  # Article processing
│   │   │   ├── tweets.py    # Tweet generation
│   │   │   ├── publish.py   # Social publishing
│   │   │   └── health.py    # Health checks
│   │   ├── services/
│   │   │   ├── ai.py        # Gemini integration
│   │   │   ├── embeddings.py # Sentence transformers
│   │   │   ├── database.py  # Async SQLAlchemy
│   │   │   └── publishing.py # Twitter/Bluesky
│   │   ├── core/
│   │   │   └── config.py    # Pydantic settings
│   │   └── models.py        # Pydantic schemas
│   ├── pyproject.toml
│   ├── requirements.txt     # CPU-only deps for Railway
│   └── railway.json         # Railway config
├── frontend/                # Next.js 15 app
│   ├── app/                 # App router
│   ├── components/          # React components
│   └── package.json
├── n8n/                     # Workflow exports
│   └── rss-aggregation.json # RSS aggregator workflow
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Neon account (free tier)
- Gemini API key (free tier)

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

pip install -e .

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run locally
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
bun install  # or npm install
bun dev      # or npm run dev
```

### Environment Variables

```env
# Required
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgresql+asyncpg://user:pass@host/db?sslmode=require
GEMINI_MODEL=gemini-3-flash-preview

# Social Publishing (optional)
BLUESKY_HANDLE=your-handle.bsky.social
BLUESKY_PASSWORD=your-app-password
TWITTER_BEARER_TOKEN=your-bearer-token
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-secret
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/articles` | POST | Process new articles |
| `/api/articles` | GET | List articles |
| `/api/articles/{id}/approve` | POST | Approve article |
| `/api/generate-tweet` | POST | Generate tweet for article |
| `/api/deduplicate` | POST | Check semantic duplicates |
| `/api/publish/bluesky` | POST | Publish to Bluesky |
| `/api/publish/twitter` | POST | Publish to Twitter |

**API Docs:** https://twax-production.up.railway.app/docs

---

## 🔄 n8n Workflow

The RSS aggregation workflow:
1. Triggers every 30 minutes
2. Fetches from 10 tech RSS feeds
3. Parses and deduplicates articles
4. Sends to backend for AI processing

Import `n8n/rss-aggregation.json` into your n8n instance.

---

## 📊 Posting Strategy

| Metric | Value |
|--------|-------|
| Posts per day | 5-7 optimal |
| Best times | 9AM-12PM, 3-5PM UTC |
| Platform delay | 15-30 min staggered |
| Randomization | ±15 min variance |

---

## 🚧 Roadmap

- [x] Backend API with Gemini 3 Flash
- [x] Neon PostgreSQL integration
- [x] Bluesky publishing (verified)
- [x] Railway deployment
- [x] n8n RSS aggregation
- [ ] Twitter OAuth flow
- [ ] Frontend Vercel deployment
- [ ] Mastodon support
- [ ] Threads support
- [ ] Analytics dashboard

---

## 🔗 Links

- **Production API:** https://twax-production.up.railway.app
- **API Docs:** https://twax-production.up.railway.app/docs
- **Database:** Neon Console

---

## 📄 License

MIT
