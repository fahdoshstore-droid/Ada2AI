/**
 * /api/ask/full — A2A Full Pipeline Response (Vercel Serverless)
 * Returns complete trace + metadata for Agenticthon demo
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { maxDuration: 30 };

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

    const isArabic = /[\u0600-\u06FF]/.test(question);
    const lang = isArabic ? "ar" : "en";
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const traceId = "a2a-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const pipelineStart = Date.now();

    // Step 1: Classifier
    const classifyStart = Date.now();
    let classification = { intentId: "general_sport", params: {} as Record<string, string>, confidence: 0.5 };

    if (apiKey) {
      const ai = new GoogleGenerativeAI(apiKey);
      const classifierPrompt = isArabic
        ? `صنّف سؤال المستخدم الرياضي إلى واحدة من الفئات وأرجع JSON فقط:\nالفئات: player_search, top_players, count_query, academy_search, facility_search, match_analysis, training_tips, general_sport\nالسؤال: "${question}"\nأرجع: {"intentId":"...","params":{...},"confidence":0.0-1.0}`
        : `Classify this sports question, return JSON only:\nCategories: player_search, top_players, count_query, academy_search, facility_search, match_analysis, training_tips, general_sport\nQuestion: "${question}"\nReturn: {"intentId":"...","params":{...},"confidence":0.0-1.0}`;

      const classifyResult = await ai.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(classifierPrompt);
      try {
        const jsonMatch = classifyResult.response.text().match(/\{[\s\S]*\}/);
        if (jsonMatch) classification = JSON.parse(jsonMatch[0]);
      } catch {}
    }
    const classifyDuration = Date.now() - classifyStart;

    // Step 2: Query (metadata only in serverless)
    const queryStart = Date.now();
    const queryResult = {
      table: classification.intentId.includes("player") ? "players" :
             classification.intentId.includes("academy") ? "academies" :
             classification.intentId.includes("facility") ? "facilities" : "unknown",
      data: null,
      count: null,
      error: null,
    };
    const queryDuration = Date.now() - queryStart;

    // Step 3: Synthesizer
    const synthStart = Date.now();
    let synthesisText = "";
    if (apiKey) {
      const ai = new GoogleGenerativeAI(apiKey);
      const synthPrompt = isArabic
        ? `أنت مساعد رياضي ذكي. أجب على السؤال التالي بشكل مفيد ومفصل باللغة العربية:\n"${question}"`
        : `You are a smart sports assistant. Answer the following question helpfully in English:\n"${question}"`;

      const synthResult = await ai.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(synthPrompt);
      synthesisText = synthResult.response.text();
    } else {
      synthesisText = isArabic ? "عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً." : "Sorry, AI service is not available.";
    }
    const synthDuration = Date.now() - synthStart;
    const totalDuration = Date.now() - pipelineStart;

    const result = {
      traceId,
      classification,
      query: queryResult,
      synthesis: { text: synthesisText, language: lang },
      trace: [
        { agent: "classifier", timestamp: new Date(classifyStart).toISOString(), durationMs: classifyDuration, confidence: classification.confidence, version: "1.0.0" },
        { agent: "query", timestamp: new Date(queryStart).toISOString(), durationMs: queryDuration, confidence: 0.9, version: "1.0.0" },
        { agent: "synthesizer", timestamp: new Date(synthStart).toISOString(), durationMs: synthDuration, confidence: 0.85, version: "1.0.0" },
      ],
      totalDurationMs: totalDuration,
    };

    return new Response(JSON.stringify(result, null, 2), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error: any) {
    console.error("[/api/ask/full] Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
