# Ada2AI — Deployment (Vercel)

## Overview

Ada2AI deploys to Vercel as a monorepo-style project: a static React SPA + serverless API functions. The build is done locally and deployed as a prebuilt artifact.

## Build & Deploy Commands

```bash
# Step 1: Build the React frontend
cd client && npx vite build

# Step 2: Build for Vercel and deploy (prebuilt mode)
vercel build --prod && vercel deploy --prebuilt --prod
```

**⚠️ NEVER use `vercel --prod`** — this tells Vercel to build from the Git repo, which does not match our local build. Always use the two-step `vercel build --prod && vercel deploy --prebuilt --prod` flow.

## Vercel Configuration

The `vercel.json` at repo root defines:

- **Build command**: `vite build`
- **Output directory**: `dist/public`
- **Install command**: `pnpm install`
- **Rewrites**:
  - `/api/:path*` → serverless functions (no rewrite)
  - `/((?!api/).*)` → `index.html` (SPA fallback)
- **Security headers**: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy on all routes

## Environment Variables (Vercel)

Set these in Vercel Dashboard → Project → Settings → Environment Variables.

**Required**:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL (e.g. `https://ujjmhqpyehymaavkawiv.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (public, for server-side client init) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude-powered features |

**LLM Providers** (at least one recommended):

| Variable | Default | Description |
|----------|---------|-------------|
| `RAG_PROVIDER` | `google` | LLM provider: `google`, `anthropic`, `kimi`, `forge`, `ollama` |
| `GOOGLE_API_KEY` | — | Google Gemini API key |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL (local only) |
| `OLLAMA_MODEL` | `llama3:8b` | Ollama model name |
| `KIMI_API_KEY` | — | Moonshot/Kimi API key |
| `KIMI_BASE_URL` | `https://api.moonshot.cn/v1` | Kimi API base URL |
| `KIMI_MODEL` | `moonshot-v1-8k` | Kimi model name |

**Optional**:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Database connection string (alternative to Supabase) |
| `BUILT_IN_FORGE_API_URL` | OpenAI-compatible API URL |
| `BUILT_IN_FORGE_API_KEY` | Forge API key |
| `FORGE_MODEL` | Default `gpt-4o` |

**Client-side** (prefixed with `VITE_`):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Same Supabase URL for the browser |
| `VITE_SUPABASE_ANON_KEY` | Same anon key for the browser |
| `VITE_GOOGLE_MAPS_KEY` | Optional Google Maps API key |

## Supabase Project

- **Project ref**: `ujjmhqpyehymaavkawiv`
- **Dashboard**: `https://supabase.com/dashboard/project/ujjmhqpyehymaavkawiv`
- **Database**: PostgreSQL with RLS enabled on all tables
- **Auth**: GoTrue (Supabase Auth) with email/password

## Build Troubleshooting

1. **TypeScript errors**: Run `npx tsc --noEmit` locally before deploying
2. **Missing env vars**: Vercel build will fail if required vars are missing
3. **Vite build fails**: Check `client/vite.config.ts` for path aliases and ensure `@/` resolves correctly
4. **API 404s**: Verify `vercel.json` rewrites route `/api/*` to serverless functions