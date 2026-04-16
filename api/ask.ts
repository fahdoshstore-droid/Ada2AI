/** /api/ask — A2A Multi-Agent Endpoint (Vercel Serverless) */
function classify(q: string) {
  const l = q.toLowerCase();
  if (/لاعب|player|search|بحث/.test(l)) return { id: "player_search", c: 0.85 };
  if (/أفضل|best|top|نجوم?/.test(l)) return { id: "top_players", c: 0.82 };
  if (/كم|عدد|how many|count/.test(l)) return { id: "count_query", c: 0.88 };
  if (/أكاديمي|academy|نادي/.test(l)) return { id: "academy_search", c: 0.80 };
  if (/تدريب|training|خطة|plan/.test(l)) return { id: "training_tips", c: 0.83 };
  if (/مبارا|match|تحليل/.test(l)) return { id: "match_analysis", c: 0.75 };
  return { id: "general_sport", c: 0.50 };
}

const R: Record<string, { ar: string; en: string }> = {
  player_search: { ar: "🔍 تصفح 2,500+ لاعب حسب الرياضة والمركز والمستوى", en: "🔍 Browse 2,500+ players by sport, position, level" },
  top_players: { ar: "🏆 أفضل اللاعبين: ⚽ مهاجمين ⭐4.8+ | 🏀 مسددين 🎯40%+", en: "🏆 Top Players: ⚽ Strikers ⭐4.8+ | 🏀 Shooters 🎯40%+" },
  count_query: { ar: "📊 لاعبون: 2,500+ | أكاديميات: 150+ | منشآت: 300+", en: "📊 Players: 2,500+ | Academies: 150+ | Facilities: 300+" },
  training_tips: { ar: "🏋️ إحماء 10-15 دقيقة | ابدأ بشدة 60% | يوم راحة كل يومين", en: "🏋️ Warm-up 10-15 min | Start 60% | Rest every 2 days" },
  general_sport: { ar: "🤖 مرحباً! أنا Ada2AI — المساعد الرياضي الذكي", en: "🤖 Hi! I'm Ada2AI — smart sports assistant" },
};

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
import { createClient } from "@supabase/supabase-js";

async function verifyAuth(req: Request): Promise<{ user: any } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  
  const supabase = createClient(url, key);
  const { data, error } = await (supabase.auth as any).getUser(token);
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
    if (!question?.trim()) return new Response(JSON.stringify({ error: "Question required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    const cl = classify(question);
    const ar = /[\u0600-\u06FF]/.test(question);
    const r = R[cl.id] || R.general_sport;
    return new Response(ar ? r.ar : r.en, { headers: { "Content-Type": "text/plain; charset=utf-8", "x-intent-id": cl.id, "x-confidence": String(cl.c), ...corsHeaders } });
  } catch { return new Response(JSON.stringify({ error: "Internal" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }); }
}

export const config = { runtime: "edge" };
