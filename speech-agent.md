# AI Speech Coach MVP — Build Plan

## Objective

Build a production-quality MVP for an AI-powered speech coaching app for people who stutter. This MVP does **not** diagnose or treat stuttering. It provides AI speech analysis, personalized practice exercises, and progress tracking.

Prioritize clean architecture, modular code, and maintainability. Build only what is described here — no extra features.

## Core Workflow

Authenticate → Record Speech → Upload Audio → Transcribe → Analyze → Generate Practice Lesson → Save Session → View Progress

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Recharts, Axios

**Backend:** FastAPI, SQLAlchemy 2.0, Alembic, Pydantic, OpenAI API (Whisper for transcription, GPT for analysis and lessons)

**Infrastructure:** Supabase for authentication, PostgreSQL hosting, and audio file storage. The backend connects to the Supabase Postgres instance via SQLAlchemy and runs its own Alembic migrations.

## Architecture

```
backend/
  app/
    api/          # thin route handlers only
    services/     # business logic
    ai/           # all OpenAI calls (transcription, analysis, lesson generation)
    models/       # SQLAlchemy models
    schemas/      # Pydantic schemas
    database/     # session, engine, base
    config/       # settings from environment variables
    utils/

frontend/
  src/
    components/
    pages/
    layouts/
    hooks/
    api/          # axios client + typed API functions
    contexts/     # auth context only
    types/
    utils/
```

Rules:
- API routes stay thin; business logic lives in `services/`.
- All AI calls live in `ai/` behind clear interfaces so transcription and analysis providers can be swapped later.
- Never write raw SQL unless absolutely necessary.
- Use environment variables for all secrets and configuration.

## Phase 1 — Foundation

**Backend:** FastAPI app, Supabase Postgres connection via SQLAlchemy, Alembic configured, environment variable management (Pydantic Settings), CORS, basic logging, `GET /health` endpoint.

**Frontend:** Vite + React + TypeScript, Tailwind, React Router, Axios client with base config, one shared app layout, basic reusable UI primitives (Button, Card, Spinner, ErrorMessage).

**Deliverable:** Frontend and backend running and connected.

## Phase 2 — Authentication

Use Supabase Authentication.

- Sign up, login, logout, session persistence, protected routes.
- Backend verifies the Supabase JWT on every request (FastAPI dependency).
- `users` table stores: `id` (matches Supabase auth UID), `email`, `created_at`.
- Users can never access another user's data — enforce ownership checks in every service.

**Deliverable:** Users can authenticate and reach a protected dashboard.

## Phase 3 — Speech Recording

In-browser recorder using MediaRecorder API.

Features: start recording, stop, playback, delete, upload. Show a recording timer and recording status indicator.

Support desktop and mobile browsers (handle Safari's MediaRecorder format quirks — detect supported MIME types rather than hardcoding).

Handle microphone permission denial with a clear message.

**Deliverable:** Users can record and upload audio.

## Phase 4 — Processing Pipeline

One pipeline, triggered by upload (`POST /sessions` with the audio file):

1. Store audio in Supabase Storage; save the path.
2. Transcribe with OpenAI Whisper API; save the transcript.
3. Run AI analysis on the transcript + metadata; save results.
4. Generate a practice lesson from the analysis; save it.
5. Return the completed session.

Each step is a separate service function with a clear interface so any provider can be swapped later. If a step fails, save what succeeded and return a clear error state the frontend can display and retry from.

## Phase 5 — AI Speech Analysis

Analyze each session for:

- Speaking rate (words per minute)
- Long pauses (count)
- Filler words
- Repetitions (repeated words/phrases)
- Overall fluency observations

The AI must return **structured JSON only** — never Markdown, never free-form paragraphs. Validate the response against a Pydantic schema.

```json
{
  "fluency_score": 0-100,
  "speaking_rate": number,
  "pause_count": number,
  "repetitions": [...],
  "filler_words": [...],
  "strengths": [...],
  "recommendations": [...]
}
```

## Phase 6 — Lesson Generation

Generate one practice lesson per session, based on **the current session's analysis only**. (Adaptive lessons using history are a future feature — the schema supports it; do not build it now.)

Each lesson (structured JSON):

- Difficulty level
- Estimated practice time
- Learning objective
- Exercises: word drills, phrase drills, sentence drills, one short paragraph
- Coaching tips

## Phase 7 — Database Schema

```
users
  id (uuid, matches Supabase auth), email, created_at

speech_sessions
  id, user_id (FK), transcript, audio_path, duration, created_at

analysis_results
  id, session_id (FK), fluency_score, speaking_rate, pause_count,
  repetitions (JSONB), filler_words (JSONB), strengths (JSONB),
  recommendations (JSONB), created_at

practice_lessons
  id, session_id (FK), generated_lesson (JSONB), created_at
```

Use JSONB columns for AI output so the schema stays extensible.

## Phase 8 — Dashboard

Display:

- Number of sessions
- Average fluency score
- Fluency score trend chart (Recharts line chart)
- Session history list (links to session detail pages)

Data refreshes automatically after each completed session (TanStack Query invalidation).

## Phase 9 — Session Detail Page

Display for one session:

- Audio playback
- Transcript
- Analysis results (scores, repetitions, fillers, strengths, recommendations)
- Generated lesson

## API Design

```
GET  /health
GET  /users/me
POST /sessions          # upload audio, runs the full pipeline
GET  /sessions          # list current user's sessions
GET  /sessions/{id}     # full session with analysis + lesson
GET  /dashboard         # aggregate stats for current user
```

Auth (signup/login) is handled by the Supabase client on the frontend; the backend only verifies tokens.

## Frontend Components

AudioRecorder, TranscriptCard, AnalysisCard, LessonCard, ProgressChart, StatCard, Navbar, SessionHistory. Keep components small; never duplicate UI logic.

## Error Handling

Handle with meaningful user-facing messages: microphone permission denied, network failure, upload failure, invalid/empty audio, AI request failure, expired auth session.

## Code Standards

- TypeScript everywhere on the frontend; type hints everywhere on the backend.
- Small modular functions; avoid large files.
- Thin routes, logic in services, dependency injection for DB sessions and settings.
- Consistent naming conventions.
- Document major modules with brief docstrings/comments.

## Future-Proofing (design for, do NOT build)

The architecture should allow these later without major refactoring: adaptive lessons using session history, AI conversation mode, therapist dashboard, mobile apps, notifications, daily challenges, achievements, weekly reports, real-time feedback, advanced analytics.

## Constraints

- Build only the MVP described above. No extra features.
- Prefer maintainability over clever code.
- Deployable with minimal configuration changes (all config via environment variables).

