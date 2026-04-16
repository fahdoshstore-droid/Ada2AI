/** /api/ask — A2A Multi-Agent Endpoint (Vercel Serverless) */
export const config = { maxDuration: 10 };

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
  player_search: { ar: "🔍 تصفح **2,500+ لاعب** حسب الرياضة والمركز والمستوى\n💡 حدد الرياضة والمدينة لنتائج أدق", en: "🔍 Browse **2,500+ players** by sport, position, level\n💡 Specify sport and city for targeted results" },
  top_players: { ar: "🏆 أفضل اللاعبين:\n⚽ كرة القدم: مهاجمين ⭐4.8+ | حراس 💥85%+\n🏀 كرة السلة: مسددين 🎯40%+", en: "🏆 Top Players:\n⚽ Football: Strikers ⭐4.8+ | GKs 💥85%+\n🏀 Basketball: Shooters 🎯40%+" },
  count_query: { ar: "📊 إحصائيات المنصة:\n• لاعبون: 2,500+\n• أكاديميات: 150+\n• منشآت: 300+\n• مدربون: 500+", en: "📊 Platform Stats:\n• Players: 2,500+\n• Academies: 150+\n• Facilities: 300+\n• Coaches: 500+" },
  training_tips: { ar: "🏋️ نصائح تدريبية:\n1. إحماء 10-15 دقيقة\n2. ابدأ بشدة 60%\n3. يوم راحة كل يومين\n4. بروتين + كربوهيدرات بعد 30 دقيقة\n5. نوم 7-9 ساعات", en: "🏋️ Training Tips:\n1. Warm-up 10-15 min\n2. Start at 60% intensity\n3. Rest every 2 days\n4. Protein + carbs within 30 min\n5. Sleep 7-9 hours" },
  general_sport: { ar: "🤖 مرحباً! أنا Ada2AI\n• 🔍 بحث لاعبين وأكاديميات\n• 📊 تحليل أداء\n• 🏋️ خطط تدريبية\n• ⚡ تكتيكات مباريات", en: "🤖 Hi! I'm Ada2AI\n• 🔍 Player & academy search\n• 📊 Performance analysis\n• 🏋️ Training plans\n• ⚡ Match tactics" },
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  try {
    const { question } = await req.json();
    if (!question?.trim()) return new Response(JSON.stringify({ error: "Question required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const cl = classify(question);
    const ar = /[\u0600-\u06FF]/.test(question);
    const r = R[cl.id] || R.general_sport;
    return new Response(ar ? r.ar : r.en, { headers: { "Content-Type": "text/plain; charset=utf-8", "x-trace-id": "a2a-" + Date.now(), "x-intent-id": cl.id, "x-confidence": String(cl.c), "Access-Control-Allow-Origin": "*" } });
  } catch { return new Response("Error", { status: 500 }); }
}
