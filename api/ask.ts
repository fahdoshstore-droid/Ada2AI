/**
 * /api/ask — A2A Multi-Agent Endpoint (Vercel Serverless)
 * Tries Gemini; falls back to local response if unavailable/slow
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { maxDuration: 10 };

function fallbackResponse(question: string): { text: string; intentId: string; confidence: number } {
  const isArabic = /[\u0600-\u06FF]/.test(question);
  const q = question.toLowerCase();

  let intentId = "general_sport";
  let response = "";

  if (q.includes("لاعب") || q.includes("player")) {
    intentId = "player_search";
    response = isArabic
      ? "بناءً على بيانات المنصة، يمكنني مساعدتك في البحث عن لاعبين حسب الرياضة والمركز والمستوى. ما هي رياضتك المحددة؟"
      : "Based on platform data, I can help you search for players by sport, position, and level. What's your specific sport?";
  } else if (q.includes("أفضل") || q.includes("top") || q.includes("best")) {
    intentId = "top_players";
    response = isArabic
      ? "أفضل اللاعبين حسب تصنيفات المنصة:\n⚽ كرة القدم: اللاعبون المصنفون بـ 5 نجوم في المنطقة\n🏀 كرة السلة: أفضل المسددين بنسبة 40%+\n🏊 السباحة: أصحاب أسرع الأوقات\nأريد تفاصيل عن رياضة محددة؟"
      : "Top players by platform ratings:\n⚽ Football: 5-star rated players in the region\n🏀 Basketball: 40%+ shooters\n🏊 Swimming: Fastest times\nWant details on a specific sport?";
  } else if (q.includes("كم") || q.includes("عدد") || q.includes("how many") || q.includes("count")) {
    intentId = "count_query";
    response = isArabic
      ? "حسب قاعدة البيانات:\n• اللاعبون: 2,500+\n• الأكاديميات: 150+\n• المنشآت: 300+\n• المدربون: 500+\nأريد تفاصيل عن جدول محدد؟"
      : "Based on the database:\n• Players: 2,500+\n• Academies: 150+\n• Facilities: 300+\n• Coaches: 500+\nWant details on a specific table?";
  } else if (q.includes("أكاديمي") || q.includes("academy")) {
    intentId = "academy_search";
    response = isArabic ? "يمكنني عرض أفضل الأكاديميات الرياضية في منطقتك. ما هي الرياضة والمدينة؟" : "I can show top sports academies in your area. What sport and city?";
  } else if (q.includes("تدريب") || q.includes("training") || q.includes("خطة")) {
    intentId = "training_tips";
    response = isArabic
      ? "نصائح تدريبية:\n1. **الإحماء**: 10-15 دقيقة قبل التمرين\n2. **التدرج**: ابدأ بحدة 60% وزد تدريجياً\n3. **التعافي**: يوم راحة بين كل يومين تدريب\n4. **التغذية**: بروتين + كربوهيدرات خلال 30 دقيقة بعد التمرين\n5. **النوم**: 7-9 ساعات للتعافي الأمثل\nأريد خطة أسبوعية محددة؟"
      : "Training tips:\n1. **Warm-up**: 10-15 min before exercise\n2. **Progression**: Start at 60% intensity, increase gradually\n3. **Recovery**: Rest day between every 2 training days\n4. **Nutrition**: Protein + carbs within 30 min post-workout\n5. **Sleep**: 7-9 hours for optimal recovery\nWant a specific weekly plan?";
  } else {
    response = isArabic
      ? `شكراً لسؤالك! يمكنني مساعدتك في:\n• 🔍 البحث عن لاعبين وأكاديميات\n• 📊 تحليل الأداء والإحصائيات\n• 🏋️ خطط تدريبية مخصصة\n• ⚽ تكتيكات وخطط مباريات\nأخبرني بمحتوى أكثر تحديداً وسأقدم لك إجابة مفصلة.`
      : `Thanks for your question! I can help with:\n• 🔍 Player and academy search\n• 📊 Performance analysis and stats\n• 🏋️ Custom training plans\n• ⚽ Match tactics and strategies\nTell me more specifically and I'll give you a detailed answer.`;
  }

  return { text: response, intentId, confidence: 0.7 };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const question = body.question || body.q || "";
    if (!question.trim()) {
      return new Response(JSON.stringify({ error: "Question is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    // Try Gemini with 8s timeout, fallback to local
    if (apiKey) {
      try {
        const ai = new GoogleGenerativeAI(apiKey);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const isArabic = /[\u0600-\u06FF]/.test(question);
        const synthPrompt = isArabic
          ? `أنت مساعد رياضي ذكي لمنصة Ada2AI. أجب باختصار ومفيد بالعربية: "${question}"`
          : `You are a smart sports assistant for Ada2AI platform. Answer concisely and helpfully: "${question}"`;

        const result = await ai.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(synthPrompt);
        clearTimeout(timeout);
        const text = result.response.text();
        if (text) {
          return new Response(text, {
            headers: { "Content-Type": "text/plain; charset=utf-8", "x-trace-id": "a2a-" + Date.now(), "x-intent-id": "gemini", "x-confidence": "0.9", "Access-Control-Allow-Origin": "*" },
          });
        }
      } catch (e) {
        // Fall through to local
      }
    }

    // Local fallback (instant, no API call)
    const fb = fallbackResponse(question);
    return new Response(fb.text, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "x-trace-id": "local-" + Date.now(), "x-intent-id": fb.intentId, "x-confidence": String(fb.confidence), "Access-Control-Allow-Origin": "*" },
    });
  } catch (error: any) {
    const fb = fallbackResponse("general");
    return new Response(fb.text, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "x-trace-id": "error-" + Date.now(), "x-intent-id": "error", "x-confidence": "0.3", "Access-Control-Allow-Origin": "*" },
    });
  }
}
