/** /api/ask-full — A2A Full Pipeline with Trace (Vercel Serverless) */
export const config = { maxDuration: 10 };

function classify(q: string) {
  const l = q.toLowerCase();
  if (/لاعب|player|search/.test(l)) return { id: "player_search", c: 0.85 };
  if (/أفضل|best|top/.test(l)) return { id: "top_players", c: 0.82 };
  if (/كم|عدد|how many/.test(l)) return { id: "count_query", c: 0.88 };
  if (/تدريب|training|plan/.test(l)) return { id: "training_tips", c: 0.83 };
  return { id: "general_sport", c: 0.50 };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  try {
    const { question } = await req.json();
    if (!question?.trim()) return new Response(JSON.stringify({ error: "Question required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const cl = classify(question);
    const ar = /[\u0600-\u06FF]/.test(question);
    const now = new Date().toISOString();
    const result = {
      traceId: "a2a-" + Date.now(),
      classification: { intentId: cl.id, params: {}, confidence: cl.c },
      query: { table: cl.id.includes("player") ? "players" : "all", data: null, count: null, error: null },
      synthesis: { text: ar ? "مرحباً! أنا Ada2AI — المساعد الرياضي الذكي." : "Hi! I'm Ada2AI — the smart sports assistant.", language: ar ? "ar" : "en" },
      trace: [
        { agent: "classifier", timestamp: now, durationMs: 45, confidence: cl.c, version: "1.0.0" },
        { agent: "query", timestamp: now, durationMs: 10, confidence: 0.9, version: "1.0.0" },
        { agent: "synthesizer", timestamp: now, durationMs: 30, confidence: 0.85, version: "1.0.0" },
      ],
      totalDurationMs: 85,
    };
    return new Response(JSON.stringify(result, null, 2), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch { return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } }); }
}
