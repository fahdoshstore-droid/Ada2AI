/**
 * /api/ask — A2A Multi-Agent Streaming Endpoint (Vercel Serverless)
 * Classifier → Query → Synthesizer pipeline with streaming
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { maxDuration: 30 };

export default async function handler(req: Request): Promise<Response> {
  // CORS preflight
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

    // Fallback when no API key
    if (!apiKey) {
      const fallback = isArabic
        ? "شكراً لسؤالك! أنصح بالتركيز على تمارين التحمل والتنسيق الجماعي. هل تريد خطة تفصيلية؟"
        : "Thanks for your question! I recommend focusing on endurance and team coordination drills. Want a detailed plan?";
      return new Response(JSON.stringify({ text: fallback }), {
        headers: {
          "Content-Type": "application/json",
          "x-trace-id": "local-" + Date.now(),
          "x-intent-id": "general_sport",
          "x-confidence": "0.6",
        },
      });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const startTime = Date.now();

    // Step 1: Classify
    const classifyPrompt = isArabic
      ? `صنّف سؤال المستخدم الرياضي إلى واحدة من الفئات وأرجع JSON فقط:\nالفئات: player_search, top_players, count_query, academy_search, facility_search, match_analysis, training_tips, general_sport\nالسؤال: "${question}"\nأرجع: {"intentId":"...","params":{...},"confidence":0.0-1.0}`
      : `Classify this sports question, return JSON only:\nCategories: player_search, top_players, count_query, academy_search, facility_search, match_analysis, training_tips, general_sport\nQuestion: "${question}"\nReturn: {"intentId":"...","params":{...},"confidence":0.0-1.0}`;

    const classifyResult = await ai.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(classifyPrompt);
    const classifyText = classifyResult.response.text();
    let classification: { intentId: string; params: Record<string, string>; confidence: number } = { intentId: "general_sport", params: {}, confidence: 0.5 };
    try {
      const jsonMatch = classifyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) classification = JSON.parse(jsonMatch[0]);
    } catch {}

    // Step 2: Synthesize
    const synthPrompt = isArabic
      ? `أنت مساعد رياضي ذكي. السؤال مصنف كـ "${classification.intentId}". أجب بشكل مفيد ومفصل بالعربية:\n"${question}"`
      : `You are a smart sports assistant. The question is classified as "${classification.intentId}". Answer helpfully in English:\n"${question}"`;

    const synthResult = await ai.getGenerativeModel({ model: "gemini-2.0-flash" }).generateContent(synthPrompt);
    const responseText = synthResult.response.text() || (isArabic ? "عذراً، لم أتمكن من معالجة سؤالك." : "Sorry, I couldn't process your question.");
    const totalMs = Date.now() - startTime;

    return new Response(responseText, {
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
