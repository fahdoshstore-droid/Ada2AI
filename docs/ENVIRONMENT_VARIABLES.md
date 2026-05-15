# Ada2AI — Environment Variables

All environment variables are defined in `server/_core/env.ts`. Required variables must be set in both local `.env` and Vercel project settings.

## Required Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `SUPABASE_URL` | Server + Client | Supabase project URL (`https://ujjmhqpyehymaavkawiv.supabase.co`) |
| `SUPABASE_ANON_KEY` | Server + Client | Supabase anonymous/public key |
| `ANTHROPIC_API_KEY` | Server only | Anthropic API key for Claude features |

**Client-side equivalents** (must also be set for the SPA):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL`, exposed to browser |
| `VITE_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY`, exposed to browser |

## LLM Provider Variables

The app supports multiple LLM providers selected via `RAG_PROVIDER`:

| Variable | Default | Description |
|----------|---------|-------------|
| `RAG_PROVIDER` | `google` | Which LLM to use: `google`, `anthropic`, `kimi`, `forge`, `ollama` |
| `ANTHROPIC_API_KEY` | — | Required when `RAG_PROVIDER=anthropic` |
| `ANTHROPIC_MODEL` | `claude-3-5-sonnet-20240620` | Anthropic model ID |
| `GOOGLE_API_KEY` | — | Required when `RAG_PROVIDER=google` |
| `GOOGLE_MODEL` | `gemini-1.5-flash` | Google Gemini model ID |
| `KIMI_API_KEY` | — | Moonshot API key |
| `KIMI_BASE_URL` | `https://api.moonshot.cn/v1` | Kimi API endpoint |
| `KIMI_MODEL` | `moonshot-v1-8k` | Kimi model name |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3:8b` | Ollama model name |
| `BUILT_IN_FORGE_API_URL` | — | OpenAI-compatible API URL |
| `BUILT_IN_FORGE_API_KEY` | — | Forge API key |
| `FORGE_MODEL` | `gpt-4o` | Forge model name |

## Optional Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Alternative database connection string |
| `NODE_ENV` | `production` or `development` (affects `ENV.isProduction`) |
| `OWNER_OPEN_ID` | Owner identifier for admin features |
| `VIDEO_DB_API_KEY` | VideoDB API key for video generation |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps API key for the browser |
| `CORS_ORIGIN` | CORS origin override for Python backend (default: `localhost:3000`) |
| `PORT` | Server port (default: 3000) |

## ❌ DEPRECATED Variables (Safe to Remove)

All `MANUS_*`, `FORGE_*` (non-BUILT_IN), and `OAUTH_*` variables are **deprecated and can be removed**:

- `MANUS_APP_ID`
- `MANUS_*` (any Manus-prefixed variable)
- `FORGE_*` (replaced by `BUILT_IN_FORGE_*`)
- `OAUTH_SERVER_URL`
- `OAUTH_*` (any OAuth-prefixed variable)

## Environment Files in the Project

| File | Purpose |
|------|---------|
| `.env.example` | Template — copy to `.env` and fill in values |
| `.env` | Local development (gitignored) |
| `.env.vercel` | Vercel-specific overrides |
| `client/.env` | Client-side env vars (VITE_*) |
| `client/.env.local` | Local overrides for client |
| `client/.env.prod` | Production client vars |

**⚠️ Never commit `.env` files containing real secrets.** The `.gitignore` includes `.env` patterns.