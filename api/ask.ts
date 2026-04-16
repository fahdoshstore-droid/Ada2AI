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

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" } });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  try {
    const { question } = await req.json();
    if (!question?.trim()) return new Response(JSON.stringify({ error: "Question required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const cl = classify(question);
    const ar = /[\u0600-\u06FF]/.test(question);
    const r = R[cl.id] || R.general_sport;
    return new Response(ar ? r.ar : r.en, { headers: { "Content-Type": "text/plain; charset=utf-8", "x-intent-id": cl.id, "x-confidence": String(cl.c), "Access-Control-Allow-Origin": "*" } });
  } catch { return new Response(JSON.stringify({ error: "Internal" }), { status: 500, headers: { "Content-Type": "application/json" } }); }
}

export const config = { runtime: "edge" };
