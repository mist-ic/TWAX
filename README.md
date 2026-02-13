# TWAX

**Tech World Aggregator for X** — A fully autonomous AI content engine that discovers, curates, generates, and publishes tech news across social platforms with zero human intervention.

[![Status](https://img.shields.io/badge/status-live-brightgreen)]()
[![Backend](https://img.shields.io/badge/backend-Railway-blueviolet)](https://twax-production.up.railway.app)
[![AI](https://img.shields.io/badge/AI-Gemini%203%20Flash-orange)]()
[![Database](https://img.shields.io/badge/database-Neon%20PostgreSQL-green)]()
[![Platforms](https://img.shields.io/badge/platforms-X%20%7C%20Bluesky%20%7C%20Mastodon-blue)]()

---

## 🧠 What is TWAX?

TWAX is an **AI-powered autonomous content engine** that runs a tech news media brand with minimal human involvement. It continuously discovers trending articles from 20+ sources, scores them through a proprietary multi-factor relevance algorithm, generates platform-optimized posts with a trained brand voice, and publishes autonomously when confidence thresholds are met — learning from engagement data to improve itself over time.

**The result:** A self-running tech media brand that grows itself.

> **📌 This repository is the open-source community edition.** The production system powering the live brand runs as a private, fully autonomous pipeline. See [Community vs Pro](#-community-vs-pro) below.

---

## ⚡ Core Capabilities

| Capability | Details |
|-----------|---------|
| � **Autonomous Source Discovery** | 20+ tech feeds + Hacker News + HuggingFace Papers, with LangGraph-powered trending topic detection |
| � **Multi-Factor Scoring Algorithm** | Proprietary weighted scoring: relevance, newsworthiness, topic drift detection, audience alignment — not just a simple 1-10 scale |
| ✍️ **Brand Voice Generation** | Fine-tuned prompt chains that maintain consistent brand personality across all posts, with multi-variant A/B generation |
| 🎯 **Semantic Deduplication** | MiniLM-L6-v2 embedding vectors (384-dim) with cosine similarity — catches near-duplicates across sources, not just URL matching |
| 📊 **Engagement-Driven Learning** | Real-time metrics pipeline feeds back into scoring and generation models — the system gets better with every post |
| 🤖 **Confidence-Based Auto-Publishing** | Posts publish automatically when AI confidence exceeds learned thresholds — no human approval bottleneck |
| ⏰ **Adaptive Smart Scheduling** | Audience-aware timing optimization with ±15 min randomization and cross-platform staggering to maximize reach and avoid spam detection |
| 📡 **Multi-Platform Native** | Platform-specific formatting, tone, and timing for X, Bluesky, and Mastodon — not the same post copy-pasted everywhere |
| � **Self-Optimization Loop** | Reward model learns from engagement patterns to continuously improve content quality and posting strategy |
| �️ **Content Strategy Enforcement** | Autonomous 65/25/10 ratio management (curated / original insights / engagement) with drift detection and auto-correction |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│              Autonomous Pipeline (runs continuously)                 │
└──────────┬──────────────────────────────────────────────────────────┘
           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Source Discovery │────▶│  Multi-Factor    │────▶│  Brand Voice     │
│  20+ feeds + HN   │     │  Scoring Engine  │     │  Generation      │
│  + HuggingFace    │     │  (Gemini 3 Flash)│     │  (A/B Variants)  │
└──────────────────┘     └──────────────────┘     └──────┬───────────┘
                                                         │
                                              confidence > threshold?
                                                    ▼           ▼
                                              Auto-Publish    Queue for
                                                    │         Review
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                               Twitter/X        Bluesky        Mastodon
                                    │               │               │
                                    └───────────────┼───────────────┘
                                                    ▼
                                           ┌─────────────────┐
                                           │ Engagement Loop  │
                                           │ Metrics → Model  │
                                           │ → Better Content  │
                                           └─────────────────┘
```

### Pipeline Flow

```
Source Discovery ──▶ Concurrent Fetch ──▶ Semantic Dedup (embedding similarity)
        │                                         │
        │                                 Multi-Factor Score
        │                                    ▼          ▼
        │                              Tweet Gen      Skip
        │                              (A/B variants)
        │                                    │
        └──▶ 384-dim Embedding ──▶ Save ──▶ Confidence Check ──▶ Auto-Publish
                                                │                     │
                                          Below threshold        Above threshold
                                                ▼                     ▼
                                         Dashboard Review       Direct to Platform
                                                │                     │
                                                └─────────┬───────────┘
                                                          ▼
                                                 Engagement Tracking
                                                 → Reward Model Update
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.11 + FastAPI (async) |
| **AI Engine** | Google Gemini 3 Flash — structured JSON output via Pydantic |
| **Embeddings** | sentence-transformers (MiniLM-L6-v2) — local, $0 cost |
| **Database** | Neon PostgreSQL 17 (serverless) |
| **Frontend** | Next.js 15 + React 19 + shadcn/ui + Framer Motion |
| **State** | TanStack Query v5 |
| **Twitter/X** | Twikit (async, no API key required) |
| **Bluesky** | AT Protocol SDK |
| **Backend Hosting** | Railway |
| **Frontend Hosting** | Vercel |

---

## 📁 Project Structure

```
TWAX/
├── backend/                          # FastAPI backend (Python 3.11)
│   ├── app/
│   │   ├── api/
│   │   │   ├── fetch.py             # Full pipeline trigger (Source → AI → DB)
│   │   │   ├── articles.py          # Article CRUD + approve/reject/skip
│   │   │   ├── publish.py           # Multi-platform publishing engine
│   │   │   ├── tweets.py            # Tweet generation + A/B variants
│   │   │   ├── admin.py             # Admin utilities
│   │   │   └── health.py            # Health check
│   │   ├── services/
│   │   │   ├── ai.py                # Gemini 3 Flash (async structured output)
│   │   │   ├── rss.py               # Concurrent source fetcher
│   │   │   ├── embeddings.py        # MiniLM-L6-v2 semantic embeddings
│   │   │   ├── database.py          # Neon PostgreSQL async operations
│   │   │   └── publishing.py        # Twitter + Bluesky + Mastodon clients
│   │   ├── core/config.py           # Pydantic settings loader
│   │   ├── db/models.py             # Article + PublishedTweet dataclasses
│   │   └── models/schemas.py        # Pydantic request/response schemas
│   ├── tests/                        # 33 tests, all passing
│   ├── pyproject.toml
│   └── requirements.txt
├── frontend/                          # Next.js 15 Dashboard
│   ├── src/app/                      # App Router (dashboard, history, settings)
│   ├── src/components/               # Layout, dashboard, shared components
│   ├── src/hooks/                    # Keyboard shortcuts hook
│   └── src/lib/                      # API layer + TanStack Query hooks
├── n8n/                               # Workflow automation
│   └── rss-aggregation.json
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

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fetch` | POST | **Trigger full pipeline** — Sources → AI Scoring → DB |
| `/api/articles` | GET | List articles (filterable by status) |
| `/api/articles` | POST | Process individual article |
| `/api/articles/{id}/approve` | POST | Approve / reject / skip / archive |
| `/api/articles` | DELETE | Reset all articles (admin) |
| `/api/publish` | POST | Publish approved article to platforms |
| `/api/publish/twitter` | POST | Publish to Twitter/X |
| `/api/publish/bluesky` | POST | Publish to Bluesky |
| `/api/generate-tweet` | POST | Generate AI tweet for article |
| `/api/deduplicate` | POST | Check semantic duplicates |
| `/health` | GET | Health check |

**Interactive API Docs:** https://twax-production.up.railway.app/docs

---

## 🎛️ The Dashboard

A **dark editorial command center** built for speed — approve your daily content in under 5 minutes.

- **Day Planner** — Visual timeline of 6 daily posting slots with drag-to-schedule
- **Smart Queue** — AI-ranked article selector with 3 options per slot, inline tweet editing
- **History** — Searchable, filterable archive of all processed articles
- **Settings** — Schedule configuration, platform connections, posting analytics
- **Keyboard Shortcuts** — `A` approve, `S` skip, `R` archive, `E` edit — power-user workflow
- **Mobile-Responsive** — Full Sheet drawer UI on mobile, icon-only actions, overflow containment

---

## 📊 Posting Strategy

| Metric | Value |
|--------|-------|
| Posts per day | 5-7 optimal |
| Best times | 9AM-12PM, 3-5PM UTC |
| Platform stagger | 15-30 min between X → Bluesky → Mastodon |
| Timing variance | ±15 min randomization |
| Content ratio | 65% curated / 25% original / 10% engagement |

---

## � Community vs Pro

This repository is the **open-source community edition** of TWAX — a clean, well-documented implementation of the core pipeline that anyone can fork and build upon.

The **production system (TWAX Pro)** is developed in a private repository and powers the live brand account with proprietary algorithms and fully autonomous operation.

### Feature Comparison

| Capability | Community (this repo) | TWAX Pro (private) |
|-----------|:---:|:---:|
| RSS feed aggregation | ✅ 8 feeds | ✅ 20+ feeds + HN + HuggingFace |
| AI scoring | ✅ Dual scoring (relevance + newsworthiness) | ✅ Multi-factor weighted algorithm with topic drift detection |
| Tweet generation | ✅ Generic prompts | ✅ Proprietary prompt chains with brand voice fine-tuning |
| Semantic dedup | ✅ MiniLM embeddings + URL dedup | ✅ Full cosine similarity with configurable thresholds |
| Dashboard | ✅ Hybrid Dashboard (Day Planner + Smart Queue) | ✅ Analytics command center with revenue tracking |
| Publishing | ✅ Manual approve → publish to X + Bluesky | ✅ Auto-publishing with confidence thresholds |
| Content strategy | ✅ Manual | ✅ Autonomous 65/25/10 ratio enforcement |
| Scheduling | ✅ Manual trigger | ✅ Adaptive cron with audience-aware optimization |
| A/B testing | ❌ | ✅ Multi-variant tweet generation |
| Engagement tracking | ❌ | ✅ Real-time metrics pipeline with feedback loops |
| Self-optimization | ❌ | ✅ Reward model learns from engagement data |
| Human involvement | ~5 min/day | ~0 min/day (fully autonomous with safety rails) |
| Source discovery | ❌ Fixed feeds | ✅ LangGraph agentic trending topic discovery |
| Original content | ❌ Curated only | ✅ AI-generated insights + Imagen 3 images |
| Audience analysis | ❌ | ✅ Follower segmentation with personalized targeting |
| Platform optimization | ❌ Same post | ✅ Platform-specific formatting, tone, and timing |
| Mastodon + Threads | ❌ | ✅ Full integration |

### What You Get With This Repo

The community edition is a **fully functional** AI content curation pipeline:

- ✅ Concurrent RSS fetching from 8 tech news sources
- ✅ Gemini 3 Flash AI scoring with structured Pydantic output
- ✅ Automated tweet generation with hashtags
- ✅ Semantic embedding infrastructure (MiniLM-L6-v2)
- ✅ Neon PostgreSQL with full article lifecycle tracking
- ✅ Beautiful Hybrid Dashboard with keyboard shortcuts and mobile support
- ✅ Multi-platform publishing to X and Bluesky
- ✅ 33 backend tests, all passing
- ✅ Deployed on Railway (backend) + Vercel (frontend) — $0/month

**Fork it, customize the prompts, wire up your own accounts, and you've got a working content engine.**

---

## 🔗 Links

- **Production API:** https://twax-production.up.railway.app
- **API Docs:** https://twax-production.up.railway.app/docs

---

## 📄 License

MIT — free to use, fork, and build upon.
