# n8n Workflow Configuration

This folder contains n8n workflow exports for TWAX.

## Workflows

### 1. RSS Aggregation (`rss-aggregation.json`)
Fetches articles from 10 tech news RSS feeds every 30 minutes:
- TechCrunch, The Verge, Ars Technica, Wired
- NYT Tech, VentureBeat, MIT Tech Review
- OpenAI Blog, Google Blog, Meta Engineering

**Flow:** Schedule Trigger → Loop Feeds → Read RSS → Transform → Send to Backend

## Import Instructions

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Select `rss-aggregation.json`
4. Update the **Send to Backend** node URL to match your deployment:
   - Local: `http://localhost:8000/api/articles`
   - Production: `https://your-backend.onrender.com/api/articles`
5. **Activate** the workflow

## Environment Variables for n8n

Add these to prevent memory leaks in production:

```
N8N_DEFAULT_BINARY_DATA_MODE=filesystem
N8N_RUNNERS_ENABLED=true
NODE_OPTIONS=--max_old_space_size=4096
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
```

## RSS Feed Sources

| Source | URL | Type |
|--------|-----|------|
| TechCrunch | techcrunch.com/feed | General Tech |
| The Verge | theverge.com/rss | General Tech |
| Ars Technica | arstechnica.com | Deep Tech |
| Wired | wired.com/feed/rss | Tech Culture |
| NYT Tech | nytimes.com | Mainstream |
| VentureBeat | venturebeat.com | AI/ML Focus |
| MIT Tech Review | technologyreview.com | Research |
| OpenAI Blog | openai.com/blog/rss | AI Updates |
| Google Blog | blog.google/rss | Product News |
| Meta Engineering | engineering.fb.com | Engineering |
