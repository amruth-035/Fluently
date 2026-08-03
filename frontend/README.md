# Fluently — Frontend

React + Vite + Tailwind UI for Fluently. Full setup instructions live in the [root README](../README.md).

## Quick commands

```bash
npm install
cp .env.example .env              # then edit
npm run dev                       # http://localhost:5173
```

## Environment variables

See [frontend/.env.example](.env.example). All variables must be prefixed with `VITE_`.

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |

## Module overview

| Folder | Responsibility |
|--------|----------------|
| `src/api/` | Axios client, interceptors, typed API calls |
| `src/components/` | Recorder, analysis/lesson cards, charts, UI primitives |
| `src/hooks/` | TanStack Query hooks (sessions, dashboard, auth user) |
| `src/pages/` | Route pages (login, record, dashboard, session detail) |
| `src/contexts/` | Supabase auth state |
| `src/types/` | Shared TypeScript interfaces |

## Production build

```bash
npm run build
```

Set `VITE_API_URL` (and Supabase vars) to production values **before** building. Serve the `dist/` folder from your static host.
