# TWAX

**Tech World Aggregator for X** - AI-powered tech news curation and multi-platform publishing.

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![Cost](https://img.shields.io/badge/cost-%240%2Fmonth-brightgreen)]()
[![Platforms](https://img.shields.io/badge/platforms-X%20%7C%20Bluesky%20%7C%20Mastodon%20%7C%20Threads-blue)]()

## 🚀 What is TWAX?

TWAX automatically aggregates tech news, uses Gemini AI to score and generate tweets, presents them in a Tinder-style swipe UI for human approval, and publishes to multiple platforms.

**5 minutes/day** to maintain an active tech news presence across 4 platforms.

## ✨ Features

- 📰 **Smart Aggregation** - 20+ RSS feeds, Hacker News, HuggingFace Papers
- 🤖 **AI Curation** - Gemini Flash scoring, summarization, tweet generation
- 👆 **Swipe Moderation** - Approve 30 items in under 5 minutes
- 📱 **Multi-Platform** - X, Bluesky, Mastodon, Threads with staggered timing
- 🛡️ **Spam-Safe** - Randomized posting times, platform-specific formatting
- 💰 **Zero Cost** - Free API tiers + GCP credits

## 🏗️ Architecture

```
n8n (Orchestrator) → FastAPI (AI Service) → Neon (Database)
                            ↓
                    Moderation Dashboard (Next.js)
                            ↓
              X / Bluesky / Mastodon / Threads
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Orchestration | n8n |
| Backend | Python + FastAPI |
| AI | Google Gemini 3 Flash |
| Database | Neon (Postgres) |
| Frontend | Next.js |
| Hosting | Render |

## 📊 Posting Strategy

- **5-7 posts/day** (optimal for engagement)
- **Best times:** 9AM-12PM, 3-5PM (Tue-Thu)
- **Staggered:** 15-30 min between platforms
- **Randomized:** ±15 min variance to avoid spam detection

## 🚧 Status

Currently in development - Phase 1 (MVP).

## 📄 License

MIT
