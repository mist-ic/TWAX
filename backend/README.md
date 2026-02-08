# TWAX Backend

AI service for tech news curation and tweet generation.

## Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -e .

# Run development server
uvicorn app.main:app --reload
```

## Environment Variables

Create `.env` file:

```
GEMINI_API_KEY=your-gcp-api-key
DATABASE_URL=postgresql://...
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/articles` | POST | Process articles |
| `/generate-tweet` | POST | Generate tweet from article |
| `/deduplicate` | POST | Check for duplicates |
