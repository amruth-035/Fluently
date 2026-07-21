# Fluently (FluentAI)

Fluently is an AI-powered speech therapist that listens to your voice, identifies where you stutter, and creates personalized lesson plans to help you improve. It generates targeted practice words and custom sentences based on your specific speech patterns, so you can build fluency with focused, real-time feedback.

> Fluently is a practice tool, not medical treatment. For diagnosis or therapy, consult a licensed speech-language pathologist.

## Repo layout

- `frontend/` — React (Vite) + TailwindCSS web app
- `backend/` — FastAPI (Python) API server
- `cli_prototype/` — the original Python CLI learning prototype (kept for reference)

## Running locally

**Backend** (from `backend/`):

```
python -m venv .venv          # first time only
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

Check it works: open http://localhost:8000/health — you should see `{"status":"ok"}`.

**Frontend** (from `frontend/`):

```
npm install                   # first time only
npm run dev
```

Open http://localhost:5173.

## Supabase setup (one-time, manual)

1. Create a free project at https://supabase.com (pick a strong database password and save it).
2. **Auth:** Authentication → Providers → enable **Email**. (Google can be added later.)
3. **Storage:** Storage → New bucket → name it `recordings`, keep it **private**.
4. **Keys:** Project Settings → API → copy the Project URL, `service_role` key, and JWT secret.
5. **Database URL:** Project Settings → Database → Connection string (URI).
6. Copy `backend/.env.example` to `backend/.env` and fill everything in. Never commit `.env`.

You'll also need an OpenAI API key from https://platform.openai.com/api-keys.
