# Ada2AI Adapter

HTTP adapter layer that bridges the frontend with backend services (FastAPI/SportID and Express/Supabase).

## Architecture

```
Frontend → Adapter (port 4000) → FastAPI (port 8000)
                                → Express (port 3000)
```

## Tech Stack

- **Fastify** - HTTP server
- **Axios** - Backend clients
- **Zod** - Validation
- **TypeScript** - Type safety

## API Contract

All responses follow this format:

```typescript
// Success
{ "success": true, "data": {...}, "error": null }

// Error
{ "success": false, "data": null, "error": { "message": "...", "code": "ERROR_CODE" } }
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/players | List all players |
| GET | /api/players/:id | Get player by ID |
| GET | /api/matches | List all matches |
| GET | /api/matches/:id | Get match by ID |
| GET | /api/analysis | List all analyses |
| GET | /api/analysis/:id | Get analysis by ID |
| GET | /api/scouts | List all scouts |
| GET | /api/scouts/:id | Get scout by ID |
| GET | /health | Health check |

## Running

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production
npm run build
npm start
```

Server runs on `http://localhost:4000`.
