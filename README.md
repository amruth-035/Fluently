# Fluently

AI-powered speech practice app: record in the browser, get transcription, fluency analysis, and a personalized practice lesson.

**Disclaimer:** This is a practice tool, not medical treatment. For clinical stuttering support (especially for children), consult a licensed speech-language pathologist.

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** (for the frontend)
- A **Supabase** project (Postgres, Auth, Storage)
- An **OpenAI** API key (Whisper + GPT-4o)

## Quick start

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd Fluently
```

Copy the example env files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

See [Environment variables](#environment-variables) below.

### 2. Supabase setup (one time)

In the [Supabase dashboard](https://supabase.com/dashboard):

1. **Database** — note your connection string (prefer the **Session pooler** URI on Windows ARM).
2. **Authentication → Providers** — enable Email (and Google if you want).
3. **Storage** — create a **private** bucket named `recordings`.
4. **API** — copy Project URL, `anon` key, `service_role` key, and JWT secret.

### 3. Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Verify: [http://localhost:8000/health](http://localhost:8000/health) → `{"status":"ok"}`

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Frontend (second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), sign up, and record a session.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase Postgres URI. Use the **Session pooler** host if direct connection fails (common on Windows ARM). URL-encode special characters in the password (`#` → `%23`). |
| `SUPABASE_URL` | Yes | `https://<project>.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Public anon key (same as frontend) |
| `SUPABASE_SERVICE_KEY` | Yes | **Secret** — service role key for Storage uploads. Never expose to the browser. |
| `SUPABASE_STORAGE_BUCKET` | No | Storage bucket name (default: `recordings`) |
| `SUPABASE_JWT_SECRET` | Yes | Legacy JWT secret for token verification fallback |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `CORS_ORIGINS` | No | Comma-separated frontend origins allowed to call the API |

**Local development:**

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Production** — set to your deployed frontend origin(s) only:

```env
CORS_ORIGINS=https://fluently.yourdomain.com
```

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend URL (`http://localhost:8000` locally) |
| `VITE_SUPABASE_URL` | Yes | Same as backend `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon public key |

> Vite only exposes variables prefixed with `VITE_`. Never put secrets (`service_role`, OpenAI key, DB URL) in the frontend `.env`.

## Database migrations

From `backend/` with the venv activated:

```bash
alembic upgrade head          # apply all migrations
alembic current               # show current revision
alembic history               # list migrations
```

After changing SQLAlchemy models, generate a new migration:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## Project structure

```
Fluently/
├── backend/                 # FastAPI API
│   ├── app/
│   │   ├── api/             # HTTP routes (thin handlers)
│   │   ├── services/      # Business logic & pipeline
│   │   ├── ai/              # OpenAI transcription, analysis, lessons
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── database/        # Engine, session, Alembic base
│   │   ├── config/          # Settings from environment variables
│   │   └── utils/           # Logging, API errors, exception handlers
│   └── alembic/             # Migration scripts
├── frontend/                # React + Vite + Tailwind
│   └── src/
│       ├── api/             # Axios client & typed API functions
│       ├── components/      # UI (recorder, cards, charts)
│       ├── hooks/           # TanStack Query hooks
│       ├── pages/           # Route pages
│       └── contexts/        # Auth context (Supabase)
└── speech-agent.md          # Build plan / architecture reference
```

## Core workflow

1. User authenticates via **Supabase Auth** (frontend).
2. User records audio on `/record` → `POST /sessions`.
3. Backend uploads audio to **Supabase Storage**, transcribes with **Whisper**, analyzes with **GPT-4o**, generates a lesson, saves to **Postgres**.
4. User views results on `/sessions/:id` and tracks progress on `/dashboard`.

## Production notes

- Set `CORS_ORIGINS` to your production frontend URL(s) — no wildcards.
- Run the backend with a production ASGI server (e.g. `uvicorn app.main:app --host 0.0.0.0 --port 8000` behind a reverse proxy).
- Build the frontend: `cd frontend && npm run build` — serve the `dist/` folder via Vercel, Netlify, etc.
- Set `VITE_API_URL` to your production API URL at **build time**.
- Keep `SUPABASE_SERVICE_KEY` and `OPENAI_API_KEY` only on the server.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `alembic` not found | Activate the Python venv first |
| DB connection fails on Windows ARM | Use the Supabase **Session pooler** connection string |
| `401` on `/users/me` | Check `SUPABASE_JWT_SECRET`; restart backend after `.env` changes |
| Upload `Field required` | Ensure only one backend runs on port 8000 |
| OpenAI `insufficient_quota` | Add credits at [platform.openai.com](https://platform.openai.com/settings/organization/billing) |

More detail: [backend/README.md](backend/README.md) · [frontend/README.md](frontend/README.md)
