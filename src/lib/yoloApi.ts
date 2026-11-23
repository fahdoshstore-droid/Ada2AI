/**
 * YOLO Vision API client — the ONLY place that knows how to reach the
 * Python computer-vision backend (backend/main.py FastAPI).
 *
 * Routing:
 *  - Production:  "/api/*" on the same origin (ada2ai.com → Nginx → FastAPI).
 *  - Development: "/api/*" is proxied by vite.config.ts to API_PROXY_TARGET
 *    (default https://ada2ai.com; set http://localhost:5001 for a local backend).
 *  - VITE_YOLO_API_URL overrides the base entirely when set.
 *
 * IMPORTANT: This is COMPUTER VISION data (YOLO detection + tracking +
 * heuristic events). It is NOT LLM interpretation. Consumers must label
 * CV-derived values accordingly (see metric provenance in the response).
 */

// Production is served from ada2ai.com, where Nginx routes /api/ to FastAPI
// on the same origin (the backend's CORS only admits that origin, and the CSP
// connect-src is 'self'). In development, vite.config.ts proxies /api.
const YOLO_BASE = import.meta.env.VITE_YOLO_API_URL || "/api";

export function yoloEndpoint(path: string): string {
  // path is like "/analyze/full" (no /yolo prefix)
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${YOLO_BASE}${clean}`;
}

/** Attach the current Supabase session or configured pilot token. */
export async function yoloFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  // Closed pilot: the backend validates the shared Supabase anon key via
  // SUPABASE_ANON_KEY (string match). A session access JWT would require the
  // cloud project's JWT secret on the backend, which is not configured, so
  // always send the anon key for a stable auth path.
  const token = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

/** Provenance label for a metric, so the UI never presents a guess as a fact. */
export type Provenance =
  | "cv_measured" // directly derived from detection/tracking (position)
  | "cv_derived_uncalibrated" // derived but uncalibrated (speed/distance/accel)
  | "cv_heuristic" // rule-based event heuristic (pass/shot/possession/sprint)
  | "not_available";

export interface MatchSelection {
  matchId: string | number;
}
