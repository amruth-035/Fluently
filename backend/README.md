# Fluently — Backend

FastAPI API for Fluently. Full setup instructions live in the [root README](../README.md).

## Quick commands

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # Windows
pip install -r requirements.txt
cp .env.example .env              # then edit
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

- Health: [http://localhost:8000/health](http://localhost:8000/health)
- Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment variables

See [backend/.env.example](.env.example) and the [root README env table](../README.md#environment-variables).

## Module overview

| Folder | Responsibility |
|--------|----------------|
| `app/api/` | Thin route handlers — auth, sessions, dashboard, health |
| `app/services/` | Business logic, upload pipeline, storage, dashboard stats |
| `app/ai/` | OpenAI Whisper transcription, GPT analysis, lesson generation |
| `app/models/` | SQLAlchemy ORM tables |
| `app/schemas/` | Pydantic request/response shapes |
| `app/database/` | Engine, session factory, declarative base |
| `app/config/` | `Settings` loaded from environment variables |
| `app/utils/` | Logging, `{detail, code}` error helpers, exception handlers |
| `alembic/` | Database migration scripts |

## Migrations

```bash
alembic upgrade head
alembic revision --autogenerate -m "describe change"
```

## Windows ARM note

If `psycopg2-binary` fails to install, the project uses `pg8000` via `app/database/url.py`. Prefer the Supabase **Session pooler** connection string in `DATABASE_URL`.
