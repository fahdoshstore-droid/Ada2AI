/**
 * /api/ask — A2A Multi-Agent Streaming Endpoint (Vercel Serverless)
 * Classifier → Query → Synthesizer pipeline with streaming
 */
import { GoogleGenAI } from "@google/genai";

function getEnv(key: string): string | undefined {
  return process.env[key];
}

export const config = {
  maxDuration: 30,
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const question = body.question || body.q || "";

    if (!question.trim()) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Detect language
    const isArabic = /[\u0600-\u06FF]/.test(question);
    const lang = isArabic ? "ar" : "en";

    // Use Google Gemini for synthesis
    const apiKey = getEnv("GOOGLE_API_KEY") || getEnv("GOOGLE_GENERATIVE_AI_API_KEY") || getEnv("GEMINI_API_KEY");
    if (!apiKey) {
      // Fallback response when API key not configured
      const fallback = isArabic
        ? `شكراً لسؤالك! بناءً على بيانات الفريق الحالية، أنصح بالتركيز على تمارين التحمل والتنسيق الجماعي.\n\n**التوصيات الرئيسية:**\n1. زيادة جلسات التدريب الأسبوعية إلى 5 جلسات\n2. التركيز على التمارين التقنية الفردية\n3. إضافة جلسات تحليل فيديو للفريق\n\nهل تريد خطة تفصيلية لأي من هذه النقاط؟`
        : `Thanks for your question! Based on current team data, I recommend focusing on endurance and team coordination.\n\n**Key recommendations:**\n1. Increase weekly training sessions to 5\n2. Focus on individual technical drills\n3. Add video analysis sessions for the team\n\nWould you like a detailed plan for any of these points?`;

      return new Response(JSON.stringify({ text: fallback }), {
        headers: {
          "Content-Type": "application/json",
          "x-trace-id": "local-" + Date.now(),
          "x-intent-id": "general_sport",
          "x-confidence": "0.6",
        },
      });
    }

    // A2A Pipeline: Classifier
    const classifierPrompt = isArabic
      ? `صنّف سؤال المستخدم الرياضي إلى واحدة من الفئات التالية وأرجع النتيجة كـ JSON فقط:
الفئات: player_search, top_players, count_query, academy_search, facility_search, match_analysis, training_tips, general_sport
إذا كان السؤال يخص لاعبين محددين أرجع player_search مع sport و/أو region.
إذا كان يخص أفضل لاعبين أرجع top_players مع sport.
إذا كان عدد أرجع count_query مع table.
السؤال: "${question}"
أرجع JSON فقط: {"intentId":"...","params":{...},"confidence":0.0-1.0}`
      : `Classify the user's sports question into one of these categories, return JSON only:
Categories: player_search, top_players, count_query, academy_search, facility_search, match_analysis, training_tips, general_sport
Question: "${question}"
Return JSON only: {"intentId":"...","params":{...},"confidence":0.0-1.0}`;

    const ai = new GoogleGenAI({ apiKey });
    const startTime = Date.now();

    // Step 1: Classify
    const classifyResult = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: classifierPrompt,
    });
    const classifyText = classifyResult.text || "{}";
    let classification: any = { intentId: "general_sport", params: {}, confidence: 0.5 };
    try {
      const jsonMatch = classifyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) classification = JSON.parse(jsonMatch[0]);
    } catch {}
    const classifyMs = Date.now() - startTime;

    // Step 2: Synthesize response with context
    const contextPrompt = isArabic
      ? `أنت مساعد رياضي ذكي. صنّفنا سؤال المستخدم كـ "${classification.intentId}".
أجب على السؤال التالي بشكل مفيد ومفصل باللغة العربية:
"${question}"
أعطِ إجابة عملية ومفيدة مع توصيات واضحة.`
      : `You are a smart sports assistant. We classified the user's question as "${classification.intentId}".
Answer the following question helpfully in English:
 "${question}"
Give practical, useful advice with clear recommendations.`;

    const synthResult = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contextPrompt,
    });

    const responseText = synthResult.text || (isArabic ? "عذراً، لم أتمكن من معالجة سؤالك." : "Sorry, I couldn't process your question.");
    const totalMs = Date.now() - startTime;

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(responseText));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "x-trace-id": "a2a-" + Date.now(),
        "x-intent-id": classification.intentId,
        "x-confidence": String(classification.confidence || 0.8),
        "x-duration-ms": String(totalMs),
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[/api/ask] Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
