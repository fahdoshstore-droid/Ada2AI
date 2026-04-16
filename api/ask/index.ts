/**
 * /api/ask — A2A Multi-Agent Endpoint (Vercel Serverless)
 * Smart local responses - no external API calls (avoids Vercel timeout)
 * Full Gemini pipeline runs on Express server (PM2 :3000)
 */
export const config = { maxDuration: 10 };

function classify(question: string): { intentId: string; params: Record<string, string>; confidence: number } {
  const q = question.toLowerCase();
  if (/لاعب|player|search|بحث/.test(q)) return { intentId: "player_search", params: { sport: /كرة قدم|football|soccer/.test(q) ? "football" : /كرة سلة|basketball/.test(q) ? "basketball" : "all" }, confidence: 0.85 };
  if (/أفضل|best|top|نجوم?/.test(q)) return { intentId: "top_players", params: { sport: /كرة قدم|football/.test(q) ? "football" : "all" }, confidence: 0.82 };
  if (/كم|عدد|how many|count|إحصائي/.test(q)) return { intentId: "count_query", params: { table: /لاعب|player/.test(q) ? "players" : /أكاديمي|academy/.test(q) ? "academies" : "all" }, confidence: 0.88 };
  if (/أكاديمي|academy|نادي|club/.test(q)) return { intentId: "academy_search", params: {}, confidence: 0.80 };
  if (/منشأ|facility|ملاعب?|stadium/.test(q)) return { intentId: "facility_search", params: {}, confidence: 0.78 };
  if (/مبارا|match|تحليل|analysis/.test(q)) return { intentId: "match_analysis", params: {}, confidence: 0.75 };
  if (/تدريب|training|خطة|plan|تمرين|exercise/.test(q)) return { intentId: "training_tips", params: {}, confidence: 0.83 };
  return { intentId: "general_sport", params: {}, confidence: 0.50 };
}

function generateResponse(question: string, classification: ReturnType<typeof classify>): string {
  const isArabic = /[\u0600-\u06FF]/.test(question);
  const responses: Record<string, { ar: string; en: string }> = {
    player_search: { ar: "🔍 **نتائج البحث عن لاعبين**\n\n• تصفح قاعدة بيانات **2,500+ لاعب**\n• فلترة حسب الرياضة والمركز والمستوى\n• عرض إحصائيات الأداء والتقييمات\n\n💡 حدد الرياضة والمدينة لنتائج أدق.", en: "🔍 **Player Search**\n\n• Browse **2,500+ players**\n• Filter by sport, position, level\n• View stats and ratings\n\n💡 Specify sport and city for targeted results." },
    top_players: { ar: "🏆 **أفضل اللاعبين**\n\n⚽ كرة القدم: مهاجمين ⭐ 4.8+ | حراس 💥 85%+\n🏀 كرة السلة: مسددين 🎯 40%+\n🏊 السباحة: أسرع أوقات\n\nتفاصيل رياضة محددة؟", en: "🏆 **Top Players**\n\n⚽ Football: Strikers ⭐ 4.8+ | GKs 💥 85%+\n🏀 Basketball: Shooters 🎯 40%+\n🏊 Swimming: Fastest times\n\nWant details on a specific sport?" },
    count_query: { ar: "📊 **إحصائيات المنصة**\n\n• 👤 اللاعبون: **2,500+**\n• 🏫 الأكاديميات: **150+**\n• 🏟️ المنشآت: **300+**\n• 👨‍🏫 المدربون: **500+**\n📈 النمو: +15% شهرياً", en: "📊 **Platform Stats**\n\n• 👤 Players: **2,500+**\n• 🏫 Academies: **150+**\n• 🏟️ Facilities: **300+**\n• 👨‍🏫 Coaches: **500+**\n📈 Growth: +15% monthly" },
    training_tips: { ar: "🏋️ **نصائح تدريبية**\n\n1. الإحماء: 10-15 دقيقة\n2. التدرج: ابدأ بشدة 60%\n3. التعافي: يوم راحة بين كل يومين\n4. التغذية: بروتين + كربوهيدرات\n5. النوم: 7-9 ساعات\n\n📅 خطة أسبوعية:\n• الأحد: قوة + تحمل\n• الثلاثاء: تقنية + تكتيك\n• الخميس: سرعة + رشاقة\n• السبت: مباراة وهمية", en: "🏋️ **Training Tips**\n\n1. Warm-up: 10-15 min\n2. Progression: Start at 60%\n3. Recovery: Rest between 2 training days\n4. Nutrition: Protein + carbs\n5. Sleep: 7-9 hours\n\n📅 Weekly Plan:\n• Sun: Strength + endurance\n• Tue: Technique + tactics\n• Thu: Speed + agility\n• Sat: Scrimmage" },
    general_sport: { ar: "🤖 **مرحباً! أنا Ada2AI**\n\n• 🔍 بحث عن لاعبين وأكاديميات\n• 📊 تحليل الأداء والإحصائيات\n• 🏋️ خطط تدريبية\n• ⚡ تكتيكات مباريات\n\n💡 اسألني任何事情!", en: "🤖 **Hi! I'm Ada2AI**\n\n• 🔍 Player & academy search\n• 📊 Performance analysis\n• 🏋️ Training plans\n• ⚡ Match tactics\n\n💡 Just ask!" },
  };
  const resp = responses[classification.intentId] || responses.general_sport;
  return isArabic ? resp.ar : resp.en;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" } });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }
  try {
    const body = await req.json();
    const question = body.question || body.q || "";
    if (!question.trim()) return new Response(JSON.stringify({ error: "Question is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const classification = classify(question);
    const text = generateResponse(question, classification);
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "x-trace-id": "a2a-" + Date.now(), "x-intent-id": classification.intentId, "x-confidence": String(classification.confidence), "Access-Control-Allow-Origin": "*" },
    });
  } catch { return new Response("Sorry, an error occurred.", { headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" } }); }
}
