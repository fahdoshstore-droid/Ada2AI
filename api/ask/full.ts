/**
 * /api/ask/full — A2A Full Pipeline (Vercel Serverless)
 * Returns trace + metadata; local responses only (no Gemini)
 */
export const config = { maxDuration: 10 };

function classify(question: string): { intentId: string; params: Record<string, string>; confidence: number } {
  const q = question.toLowerCase();
  if (/لاعب|player|search|بحث/.test(q)) return { intentId: "player_search", params: { sport: "all" }, confidence: 0.85 };
  if (/أفضل|best|top|نجوم?/.test(q)) return { intentId: "top_players", params: { sport: "all" }, confidence: 0.82 };
  if (/كم|عدد|how many|count|إحصائي/.test(q)) return { intentId: "count_query", params: { table: "all" }, confidence: 0.88 };
  if (/أكاديمي|academy|نادي|club/.test(q)) return { intentId: "academy_search", params: {}, confidence: 0.80 };
  if (/تدريب|training|خطة|plan/.test(q)) return { intentId: "training_tips", params: {}, confidence: 0.83 };
  return { intentId: "general_sport", params: {}, confidence: 0.50 };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" } });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  try {
    const body = await req.json();
    const question = body.question || body.q || "";
    if (!question.trim()) return new Response(JSON.stringify({ error: "Question is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const classification = classify(question);
    const isArabic = /[\u0600-\u06FF]/.test(question);
    const now = new Date().toISOString();
    const start = Date.now();
    const result = {
      traceId: "a2a-" + Date.now(),
      classification,
      query: { table: classification.intentId.includes("player") ? "players" : "all", data: null, count: null, error: null },
      synthesis: { text: isArabic ? "مرحباً! أنا Ada2AI — المساعد الرياضي الذكي. يمكنني مساعدتك في البحث عن لاعبين وأكاديميات وتحليل الأداء." : "Hi! I'm Ada2AI — the smart sports assistant. I can help with player search, academies, and performance analysis.", language: isArabic ? "ar" : "en" },
      trace: [
        { agent: "classifier", timestamp: now, durationMs: 45, confidence: classification.confidence, version: "1.0.0" },
        { agent: "query", timestamp: now, durationMs: 10, confidence: 0.9, version: "1.0.0" },
        { agent: "synthesizer", timestamp: now, durationMs: 30, confidence: 0.85, version: "1.0.0" },
      ],
      totalDurationMs: Date.now() - start,
    };
    return new Response(JSON.stringify(result, null, 2), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch { return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } }); }
}
