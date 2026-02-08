# n8n Workflow Configuration

This folder contains n8n workflow exports for TWAX.

## Workflows

1. **rss-aggregation.json** - Fetches articles from RSS feeds
2. **ai-processing.json** - Sends articles to FastAPI for scoring
3. **publish-approved.json** - Posts approved tweets to platforms

## Setup

1. Import workflows into your n8n instance
2. Configure credentials:
   - FastAPI Backend (HTTP Request node)
   - X (Twitter) OAuth
   - Bluesky credentials
   - Mastodon credentials

## Environment Variables for n8n

```
N8N_DEFAULT_BINARY_DATA_MODE=filesystem
N8N_RUNNERS_ENABLED=true
NODE_OPTIONS=--max_old_space_size=4096
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
```

These prevent memory leaks in production.
