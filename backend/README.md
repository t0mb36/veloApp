# VeloApp Backend

FastAPI backend for VeloApp.

## Quick Start

```bash
# Create virtual environment and install dependencies
uv venv && source .venv/bin/activate
uv pip install -e ".[dev]"

# Copy environment file
cp .env.example .env

# Start with Docker
docker compose up -d

# Or run locally (requires PostgreSQL)
uvicorn app.main:app --reload
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/items` - List items
- `POST /api/items` - Create item
- `GET /api/items/{id}` - Get item
- `PATCH /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item
