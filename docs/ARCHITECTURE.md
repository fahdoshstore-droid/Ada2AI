# Ada2AI — System Architecture

## Overview

Ada2AI is an Arabic sports AI platform. Supabase Auth is the **single authentication source**. The app is deployed on Vercel as serverless functions + a static React SPA.

## High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Browser (SPA)                      │
│              Vite + React (client/src)              │
│   ┌────────────┐  ┌───────────┐  ┌──────────────┐ │
│   │ AuthContext │  │  Pages    │  │  tRPC Client │ │
│   │  (Supabase)│  │ (Routes)  │  │    Hooks     │ │
│   └─────┬──────┘  └─────┬─────┘  └──────┬───────┘ │
└─────────┼───────────────┼───────────────┼──────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────────────────────────────────────────────┐
│              Vercel Edge / Serverless                │
│                                                      │
│  api/*handlers          │    api/trpc/[trpc].ts      │
│  (REST, Bearer auth)    │    (tRPC, context auth)    │
│  players.ts             │    appRouter → routers     │
│  academies.ts           │    createContext()          │
│  scouts.ts              │      └→ supabase.auth      │
│  …                      │         .getUser(token)    │
└────────────┬───────────────────────────┬────────────┘
             │                           │
             ▼                           ▼
┌─────────────────────────────────────────────────────┐
│                  Supabase                            │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│   │   Auth   │  │ Database │  │    Storage        │ │
│   │ (GoTrue) │  │(Postgres)│  │  (avatars, etc.) │ │
│   └──────────┘  └──────────┘  └──────────────────┘ │
│              RLS policies on every table             │
└─────────────────────────────────────────────────────┘
```

## Frontend — Vite + React

- **Location**: `client/src/`
- **Entry**: `client/src/main.tsx` → `App.tsx`
- **Routing**: React Router in `App.tsx`
- **Auth state**: `AuthContext.tsx` wraps the app, provides `useAuth()` hook
- **API calls**: Direct Supabase client for data; tRPC hooks for server procedures
- **Build**: `cd client && npx vite build` → outputs to `dist/`

## Backend — Two Layers

### 1. Vercel Serverless Functions (`api/`)

Plain REST handlers, one file per resource. Each handler:
- Creates its own Supabase client
- Verifies auth via `Authorization: Bearer <token>` → `supabase.auth.getUser(token)`
- Returns JSON

Files: `ask.ts`, `analyze.ts`, `players.ts`, `academies.ts`, `scouts.ts`, `trainings.ts`, `facilities.ts`, `ministry/kpi.ts`, `sportid/`, `players/`

### 2. tRPC Router (`server/`)

Type-safe API using tRPC on Vercel Edge runtime.
- **Entry**: `api/trpc/[trpc].ts` → `server/routers.ts` → `appRouter`
- **Context**: `server/_core/context.ts` — extracts Bearer token, verifies with `supabase.auth.getUser()`, populates `ctx.user`
- **Procedures**: Authenticated procedures check `ctx.user`; public procedures allow anonymous access

## Auth — Supabase Auth Only

- **Single source of truth**: Supabase Auth (GoTrue)
- **Client**: `AuthContext.tsx` manages session via `supabase.auth.onAuthStateChange`
- **Server**: Both `api/*` and tRPC verify Bearer tokens via `supabase.auth.getUser(token)`
- **Profile creation**: Database trigger `handle_new_user` auto-inserts a `profiles` row on signup
- **No custom JWT**: Tokens are Supabase-issued JWTs

## Database — Supabase PostgreSQL

- **Project ID**: `ujjmhqpyehymaavkawiv`
- **Schema**: See `supabase-schema.sql` (canonical) and `docs/DATABASE_SCHEMA.md`
- **RLS**: Enabled on all tables; policies enforce owner-only writes and public reads where appropriate
- **Triggers**: `on_auth_user_created` → `handle_new_user()` (auto profile), `trg_profiles_updated_at` (auto timestamp)

## Key Directories

| Path | Purpose |
|------|---------|
| `client/src/` | React SPA (pages, components, contexts, hooks) |
| `client/src/contexts/` | AuthContext, DemoAuthContext |
| `client/src/lib/` | Supabase client init, shared libs |
| `api/` | Vercel serverless REST handlers |
| `server/` | tRPC routers, core modules |
| `server/_core/` | Auth, env, context, AI providers |
| `shared/` | Shared types between client and server |
| `supabase/migrations/` | Database migration SQL files |