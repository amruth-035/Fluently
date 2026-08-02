# Fluently — Backend

FastAPI backend for the Fluently MVP.

## Prerequisites

- Python 3.11+
- A Supabase project (for Postgres; auth and storage come in later phases)

## Setup

1. **Create a virtual environment** (from the `backend/` directory):

   ```bash
   python -m venv .venv
   ```

   Activate it:

   - Windows (PowerShell): `.venv\Scripts\Activate.ps1`
   - macOS/Linux: `source .venv/bin/activate`

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your values:

   | Variable | Where to find it |
   |----------|------------------|
   | `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (URI) |
   | `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
   | `SUPABASE_JWT_SECRET` | Supabase → Project Settings → API → JWT Settings → JWT Secret |
   | `OPENAI_API_KEY` | [OpenAI API keys](https://platform.openai.com/api-keys) |
   | `CORS_ORIGINS` | Comma-separated frontend URLs (default: `http://localhost:5173`) |

## Run the server

From the `backend/` directory (with the venv activated):

```bash
uvicorn app.main:app --reload --port 8000
```

Verify it works:

```bash
curl http://localhost:8000/health
```

Expected response: `{"status":"ok"}`

Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Database migrations (Alembic)

Alembic reads `DATABASE_URL` from your `.env` via Pydantic Settings.

```bash
# Create a new migration (after adding models in a later phase)
alembic revision --autogenerate -m "describe change"

# Apply migrations
alembic upgrade head
```

## Authentication (Phase 2)

After filling in `.env`, run the migration to create the `users` table:

```bash
alembic upgrade head
```

`GET /users/me` requires a valid Supabase JWT in the `Authorization: Bearer <token>` header. Returns `401` without a token or with an invalid/expired one.

Frontend needs these additional env vars (see `frontend/.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

In Supabase dashboard, enable **Email** auth under Authentication → Providers. For local dev, you may want to disable email confirmation under Authentication → Settings.

## Troubleshooting

**Windows on ARM (Surface, etc.):** `psycopg2-binary` may not have a prebuilt wheel. Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and retry, or develop on x64 Windows/macOS/Linux where wheels are available.


```
backend/
  app/
    api/          # Route handlers (thin)
    services/     # Business logic
    ai/           # OpenAI calls
    models/       # SQLAlchemy models
    schemas/      # Pydantic schemas
    database/     # Engine, session, Base
    config/       # Settings from .env
    utils/        # Shared helpers
  alembic/        # Migration scripts
```
