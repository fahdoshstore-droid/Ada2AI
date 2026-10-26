/**
 * YOLO Vision API client — the ONLY place that knows how to reach the
 * Python computer-vision backend (backend/main.py FastAPI).
 *
 * Routing:
 *  - Development: requests go to "/yolo/*" which vite.config.ts proxies
 *    to the local FastAPI (default http://localhost:5001).
 *  - Production:  requests go directly to VITE_YOLO_API_URL (the deployed
 *    YOLO backend origin). CORS is enabled on the backend (main.py).
 *
 * IMPORTANT: This is COMPUTER VISION data (YOLO detection + tracking +
 * heuristic events). It is NOT LLM interpretation. Consumers must label
 * CV-derived values accordingly (see metric provenance in the response).
 */

import { supabase } from "./supabase";

const YOLO_BASE = import.meta.env.VITE_YOLO_API_URL || "/yolo";

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
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
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
