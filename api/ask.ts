/**
 * /api/ask — A2A Multi-Agent Endpoint (Vercel Edge)
 *
 * Integrated with the full Agentic pipeline (Classifier → Query → Synthesizer).
 *
 * TODO: Add per-IP/per-user rate limiting for production.
 *       The Express server has rate limiting in server/_core/auth.ts,
 *       but this edge function currently has none.
 */
import { orchestratorAgent } from "../server/_core/agents/orchestrator";
import { createClient } from "@supabase/supabase-js";

// ── Input Validation ──────────────────────────────────────────
const MAX_QUESTION_LENGTH = 2000;

// ── Allowed Origins ────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://ada2ai.vercel.app",
  "http://localhost:3002",
  "http://localhost:3000",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || req.headers.get("Origin") || "";
  const baseHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
  if (isOriginAllowed(origin)) {
    baseHeaders["Access-Control-Allow-Origin"] = origin;
  }
  return baseHeaders;
}

// ── Auth ───────────────────────────────────────────────────────
async function verifyAuth(req: Request): Promise<{ user: any } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  
  const supabase = createClient(url, key);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user };
}

export default async function handler(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
  
  // Auth check — require valid Supabase Bearer token
  const auth = await verifyAuth(req);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  try {
    const { question } = await req.json();
    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: "Question required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (typeof question !== "string" || question.length > MAX_QUESTION_LENGTH) {
      return new Response(JSON.stringify({ error: "Invalid question format" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Call the full orchestrator pipeline
    const stream = await orchestratorAgent.getStreamResponse(question);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...corsHeaders,
      }
    });
  } catch (err: any) {
    console.error("[/api/ask] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}

export const config = {
  runtime: "edge",
};
