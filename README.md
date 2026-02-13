# TWAX

**Tech World Aggregator for X** — AI-powered tech news curation and multi-platform social media publishing.

[![Status](https://img.shields.io/badge/status-beta-blue)]()
[![Backend](https://img.shields.io/badge/backend-Railway-blueviolet)](https://twax-production.up.railway.app)
[![AI](https://img.shields.io/badge/AI-Gemini%203%20Flash-orange)]()
[![Database](https://img.shields.io/badge/database-Neon%20PostgreSQL-green)]()

## 🚀 What is TWAX?

TWAX automatically aggregates tech news from RSS feeds, uses **Gemini 3 Flash** AI to score relevance and newsworthiness, generates platform-optimized tweets, presents them in a **Hybrid Dashboard** (Day Planner + Smart Queue) for human review, and publishes approved posts to **Twitter/X** and **Bluesky**.

**5 minutes/day** to maintain an active, AI-curated tech news presence across multiple platforms.

> **📌 Note:** This is the **open-source community edition** of TWAX. The production system — [**TWAX Pro**](#-twax-pro-private) — runs as a private, fully autonomous pipeline with proprietary AI algorithms. See [below](#-twax-pro-private) for details.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📰 **Smart Aggregation** | 8 tech RSS feeds fetched concurrently via async pipeline |
| 🤖 **AI Curation** | Gemini 3 Flash dual scoring (relevance + newsworthiness) with structured JSON output |
| ✍️ **Tweet Generation** | AI-generated, Pydantic-validated tweets with hashtags — constrained to platform limits |
| 🎯 **Deduplication** | URL-based filtering + semantic similarity infrastructure (MiniLM-L6-v2 embeddings) |
| 🎛️ **Hybrid Dashboard** | Day Planner timeline + Smart Queue — approve 6 articles in <5 min |
| ⌨️ **Keyboard Shortcuts** | A=Approve, S=Skip, R=Archive, E=Edit — power-user workflow |
| 📱 **Mobile-Responsive** | Full mobile support with Sheet drawers, icon-only actions, overflow containment |
| 📡 **Multi-Platform Publishing** | Twitter/X (Twikit) + Bluesky (AT Protocol) with link-in-reply pattern |
| 🗄️ **Serverless DB** | Neon PostgreSQL 17 with async operations |
| 🔐 **Auth** | Password-based middleware authentication |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  POST /api/fetch  (or Dashboard button)          │
└──────────┬──────────────────────────────────────────────────────┘
           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  RSS Fetcher     │────▶│  Gemini 3 Flash  │────▶│  Neon PG 17  │
│  8 feeds, async  │     │  Score + Tweet    │     │  Articles DB │
└──────────────────┘     └──────────────────┘     └──────┬───────┘
                                                         │
                                                ┌────────▼────────┐
                                                │  Next.js 15 UI  │
                                                │  Human Review    │
                                                └────────┬────────┘
                                                         │
                                          ┌──────────────┼──────────────┐
                                          ▼              ▼              ▼
                                     Twitter/X       Bluesky       Mastodon
```

### Pipeline Flow

```
RSS Feeds (8) ──▶ Concurrent Fetch ──▶ URL Dedup ──▶ Gemini Score (1-10)
     │                                                      │
     │                                              relevance ≥ 6?
     │                                                 ▼          ▼
     │                                           Tweet Gen      Skip
     │                                                │
     └──▶ MiniLM Embedding (384-dim) ──▶ Save to DB ──▶ Dashboard Review
                                                              │
                                                        Approve ──▶ Publish
```

---

## 🛠️ Tech Stack

| Component | Technology | Status |
|-----------|------------|--------|
| **Backend** | Python 3.11 + FastAPI | ✅ Deployed |
| **AI** | Google Gemini 3 Flash (async client) | ✅ Working |
| **Embeddings** | sentence-transformers (MiniLM-L6-v2) | ✅ Working |
| **Database** | Neon PostgreSQL 17 (serverless) | ✅ Connected |
| **Frontend** | Next.js 15 + React 19 + shadcn/ui | ✅ Complete |
| **Animation** | Framer Motion 11 | ✅ Complete |
| **State** | TanStack Query v5 | ✅ Complete |
| **Hosting** | Railway (backend) + Vercel (frontend) | ✅ Live |
| **Twitter/X** | Twikit (async) | ✅ Integrated |
| **Bluesky** | atproto SDK | ✅ Integrated |

---

## 📁 Project Structure

```
TWAX/
├── backend/                          # FastAPI backend (Python 3.11)
│   ├── app/
│   │   ├── api/
│   │   │   ├── fetch.py             # Full pipeline trigger (RSS → AI → DB)
│   │   │   ├── articles.py          # Article CRUD + approve/reject/skip
│   │   │   ├── publish.py           # Multi-platform publishing
│   │   │   ├── tweets.py            # Tweet generation endpoint
│   │   │   ├── admin.py             # Admin utilities
│   │   │   └── health.py            # Health check
│   │   ├── services/
│   │   │   ├── ai.py                # Gemini 3 Flash (async structured output)
│   │   │   ├── rss.py               # Concurrent RSS fetcher (8 feeds)
│   │   │   ├── embeddings.py        # MiniLM-L6-v2 sentence embeddings
│   │   │   ├── database.py          # Neon PostgreSQL async operations
│   │   │   └── publishing.py        # Twitter + Bluesky publish clients
│   │   ├── core/config.py           # Pydantic settings loader
│   │   ├── db/models.py             # Article + PublishedTweet dataclasses
│   │   └── models/schemas.py        # Pydantic request/response schemas
│   ├── tests/                        # 33 tests, all passing
│   ├── pyproject.toml
│   ├── requirements.txt              # CPU-only deps for Railway
│   └── railway.json
├── frontend/                          # Next.js 15 + React 19 + shadcn/ui
│   ├── src/app/                      # App Router (dashboard, history, settings)
│   ├── src/components/               # Layout, dashboard, shared components
│   ├── src/hooks/                    # Keyboard shortcuts hook
│   ├── src/lib/                      # API layer + TanStack Query hooks
│   └── package.json
├── n8n/                               # Workflow automation exports
│   └── rss-aggregation.json
├── Research/                          # Architecture docs + research
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Neon account (free tier)
- Gemini API key (free tier)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac

pip install -e .

cp .env.example .env          # Edit with your credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
bun install    # or npm install
bun dev        # or npm run dev
```

### Environment Variables

```env
# Required
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgresql+asyncpg://user:pass@host/db?sslmode=require
GEMINI_MODEL=gemini-3-flash-preview

# Social Publishing
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
| `/api/fetch` | POST | **Trigger full pipeline** — RSS → Gemini AI → DB |
| `/api/articles` | GET | List articles (filterable by status) |
| `/api/articles` | POST | Process individual article |
| `/api/articles/{id}/approve` | POST | Approve / reject / skip / archive |
| `/api/articles` | DELETE | Reset all articles (admin) |
| `/api/publish` | POST | Publish approved article to platforms |
| `/api/publish/twitter` | POST | Publish directly to Twitter/X |
| `/api/publish/bluesky` | POST | Publish directly to Bluesky |
| `/api/generate-tweet` | POST | Generate AI tweet for article |
| `/api/deduplicate` | POST | Check semantic duplicates |

**Interactive API Docs:** https://twax-production.up.railway.app/docs

---

## 📊 Posting Strategy

Based on [platform research](Research/refinedqueries.md) for tech news accounts:

| Metric | Value |
|--------|-------|
| Posts per day | 5-7 optimal |
| Best times | 9AM-12PM, 3-5PM UTC |
| Platform stagger | 15-30 min between X → Bluesky |
| Timing variance | ±15 min randomization |
| Content ratio | 65% curated / 25% original / 10% engagement |

---

## 🚧 Roadmap

### ✅ Complete
- [x] FastAPI backend with async Gemini 3 Flash integration
- [x] Neon PostgreSQL 17 with full article schema
- [x] RSS aggregation pipeline (8 feeds, concurrent)
- [x] AI scoring (dual: relevance + newsworthiness)
- [x] AI tweet generation with Pydantic-enforced structure
- [x] Semantic embedding infrastructure (MiniLM-L6-v2)
- [x] Railway deployment
- [x] 33/33 backend tests passing
- [x] Hybrid Dashboard (Day Planner + Smart Queue)
- [x] Inline tweet editor with character counter
- [x] Keyboard shortcuts (A/S/R/E)
- [x] Mobile-responsive UI with Sheet drawers
- [x] History page with status filters
- [x] Settings page with schedule display
- [x] Framer Motion animations throughout
- [x] Password authentication middleware
- [x] Fetch Articles pipeline trigger from dashboard
- [x] Twitter/X publishing (Twikit integration)
- [x] Bluesky publishing (AT Protocol)

### 🔧 In Progress (Community Edition)
- [ ] n8n workflow automation for scheduled fetching
- [ ] Mastodon API integration
- [ ] Threads API integration
- [ ] Analytics dashboard with engagement metrics

---

## 🔒 TWAX Pro (Private)

The production version of TWAX — **TWAX Pro** — is developed in a private repository and powers the live [@twax](https://x.com/) brand account. It extends this open-source foundation with proprietary systems designed for **fully autonomous, zero-intervention operation**.

### What makes TWAX Pro different

| Capability | Community (this repo) | TWAX Pro (private) |
|-----------|:---:|:---:|
| RSS feed aggregation | ✅ 8 feeds | ✅ 20+ feeds + Hacker News + HuggingFace Papers |
| AI scoring | ✅ Basic 1-10 | ✅ Multi-factor weighted algorithm with topic drift detection |
| Tweet generation | ✅ Generic prompts | ✅ Proprietary prompt chain with brand voice fine-tuning |
| Content strategy | ❌ Manual | ✅ Autonomous 65/25/10 ratio enforcement |
| Publishing | ✅ Manual approve → post | ✅ Auto-publishing with confidence thresholds |
| Scheduling | ❌ Manual trigger | ✅ Adaptive cron with audience-aware timing optimization |
| A/B testing | ❌ | ✅ Multi-variant tweet generation with engagement-driven selection |
| Engagement tracking | ❌ Schema only | ✅ Real-time metrics pipeline with feedback loops |
| Self-optimization | ❌ | ✅ Reward model that learns from engagement data to improve scoring |
| Human involvement | ~5 min/day | ~0 min/day (fully autonomous with safety rails) |
| Source discovery | ❌ Fixed feeds | ✅ LangGraph agentic source discovery — finds trending topics automatically |
| Content generation | ❌ Curated only | ✅ AI-generated original insights + image generation (Imagen 3) |
| Audience analysis | ❌ | ✅ Follower segmentation with personalized content targeting |
| Platform optimization | ❌ Same post everywhere | ✅ Platform-specific formatting, tone, and timing per network |
| Dashboard | ✅ Review & approve | ✅ Analytics command center with revenue tracking |

### The Vision

TWAX Pro is built as a **self-running startup** — an autonomous content engine that:

1. **Discovers** trending tech topics and breaking news in real-time
2. **Evaluates** content through a proprietary multi-stage scoring algorithm that adapts based on audience engagement patterns
3. **Generates** platform-optimized posts with brand-consistent voice, iterating through multiple variants
4. **Publishes** autonomously when confidence exceeds learned thresholds, with smart timing based on historical engagement data
5. **Learns** from every post — engagement metrics feed back into the scoring and generation models, continuously improving content quality
6. **Scales** across platforms with zero human intervention — the system handles X, Bluesky, Mastodon, and Threads simultaneously with platform-specific optimization

The goal: **a fully autonomous tech media brand that grows itself.**

---

## 🔗 Links

- **Production API:** https://twax-production.up.railway.app
- **API Docs:** https://twax-production.up.railway.app/docs
- **Database:** Neon Console

---

## 📄 License

MIT — free to use, fork, and build upon for your own social media automation needs.
