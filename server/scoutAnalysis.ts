/**
 * Scout Analysis — Ada2ai
 * Uses Anthropic Claude Vision with official SAFF + FIFA scouting standards
 * Returns a structured Arabic scouting report (9 sections)
 */

import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const router = Router();

// ── Anthropic Client ─────────────────────────────────────────────────────────
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey });
}

// ── System Prompt (SAFF + FIFA v2) ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a professional football scout working for an AI scouting platform called Ada2ai, 
using official SAFF (Saudi Arabian Football Federation) and FIFA scouting standards.

Analyze the football player in the uploaded image and produce a structured scouting report 
in Arabic based on FIFA and SAFF evaluation criteria.

You MUST return ONLY a valid JSON object — no markdown fences, no explanation, no extra text before or after the JSON.

The JSON must follow this exact structure:
{
  "reportId": "ADA-XXXXXX",
  "analysisDate": "Arabic date",
  "ageCategory": {
    "label": "تحت 15 / تحت 17 / تحت 20 / أكبر",
    "code": "U15",
    "note": "brief Arabic note"
  },
  "physicalProfile": {
    "bodyType": "نحيف رياضي / قوي / ضخم",
    "heightCategory": "قصير / متوسط / طويل",
    "posture": "Arabic description",
    "fitnessIndex": "Arabic description",
    "balance": 75
  },
  "athleticIndicators": {
    "speed":         { "score": 78, "label": "السرعة القصوى",                    "note": "Arabic" },
    "agility":       { "score": 75, "label": "الرشاقة والتغيير السريع للاتجاه",  "note": "Arabic" },
    "explosiveness": { "score": 72, "label": "الانفجارية والقوة",                "note": "Arabic" },
    "stamina":       { "score": 70, "label": "التحمل واللياقة",                  "note": "Arabic" }
  },
  "technicalIndicators": {
    "ballControl":   { "score": 76, "label": "التحكم بالكرة",              "note": "Arabic" },
    "dribbling":     { "score": 74, "label": "المراوغة ووضعية الجسم",      "note": "Arabic" },
    "firstTouch":    { "score": 72, "label": "اللمسة الأولى والاستقبال",   "note": "Arabic" },
    "coordination":  { "score": 75, "label": "التنسيق الحركي العام",       "note": "Arabic" },
    "vision":        { "score": 70, "label": "الرؤية التكتيكية",           "note": "Arabic" },
    "passing":       { "score": 68, "label": "التمرير",                    "note": "Arabic" },
    "shooting":      { "score": 65, "label": "التسديد",                    "note": "Arabic" }
  },
  "mentalIndicators": {
    "footballIQ":      { "score": 74, "label": "الذكاء الكروي",                   "note": "Arabic" },
    "decisionMaking":  { "score": 72, "label": "اتخاذ القرار",                    "note": "Arabic" },
    "resilience":      { "score": 68, "label": "الصمود النفسي تحت الضغط",         "note": "Arabic" }
  },
  "sportDNA": {
    "RW": 78, "LW": 72, "ST": 68, "CAM": 70,
    "CM": 65, "CDM": 58, "RB": 55, "LB": 52, "CB": 48, "GK": 35
  },
  "saffBenchmark": {
    "meetsStandard": "نعم / يحتاج تطوير / لا",
    "technicalLevel": "Meets Standard",
    "physicalLevel": "Above Standard",
    "benchmarkScore": 72,
    "note": "Arabic note"
  },
  "recommendation": {
    "bestPosition": "جناح أيمن",
    "bestPositionCode": "RW",
    "secondPosition": "مهاجم",
    "secondPositionCode": "ST",
    "suitableAcademies": ["أكاديمية النصر", "أكاديمية الاتحاد"],
    "developmentPlan": "Arabic 3-6 month plan",
    "scoutNote": "Arabic professional recommendation"
  },
  "overallRating": 74,
  "confidence": {
    "percentage": 72,
    "reason": "Arabic explanation"
  }
}

CRITICAL RULES:
- Return ONLY the JSON. No markdown. No text outside JSON.
- Do NOT invent information. Only assess what is clearly visible.
- All scores are integers 0-100.
- All descriptive text must be in Arabic.
- sportDNA values must be integers 0-100.`;

// ── Upload Endpoint ───────────────────────────────────────────────────────────
router.post("/upload", async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body as {
      fileData: string;
      mimeType: string;
      fileName: string;
    };
    if (!fileData || !mimeType) {
      return res.status(400).json({ error: "fileData and mimeType required" });
    }
    const buffer = Buffer.from(fileData, "base64");
    const key = `scout-analysis/${nanoid()}-${fileName || "upload"}`;
    const { url } = await storagePut(key, buffer, mimeType);
    return res.json({ url, key });
  } catch (err) {
    console.error("[Scout Upload]", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

// ── Analysis Endpoint ─────────────────────────────────────────────────────────
router.post("/analyze", async (req, res) => {
  res.setTimeout(60000, () => {
    if (!res.headersSent) res.status(504).json({ error: "Analysis timeout" });
  });

  try {
    const { imageUrl } = req.body as { imageUrl: string };
    if (!imageUrl) return res.status(400).json({ error: "imageUrl is required" });

    console.log("[Scout Analysis] Starting SAFF+FIFA analysis...");
    const anthropic = getAnthropicClient();

    // Fetch image as base64
    let imageSource: Anthropic.Base64ImageSource | Anthropic.URLImageSource;
    try {
      const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
      if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
      const imgBuffer = await imgRes.arrayBuffer();
      const base64Data = Buffer.from(imgBuffer).toString("base64");
      const contentType = imgRes.headers.get("content-type") || "image/jpeg";
      const supported = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const mediaType = supported.includes(contentType) ? contentType : "image/jpeg";
      imageSource = {
        type: "base64",
        media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: base64Data,
      };
      console.log("[Scout Analysis] Image fetched:", imgBuffer.byteLength, "bytes");
    } catch (fetchErr) {
      console.warn("[Scout Analysis] Using URL source:", fetchErr);
      imageSource = { type: "url", url: imageUrl };
    }

    const today = new Date().toLocaleDateString("ar-SA", {
      year: "numeric", month: "long", day: "numeric",
    });
    const reportId = `ADA-${nanoid(6).toUpperCase()}`;

    const claudeResponse = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: imageSource },
            {
              type: "text",
              text: `حلل هذا اللاعب وفق معايير SAFF وFIFA.
Report ID: ${reportId}
Analysis Date: ${today}
أعد JSON فقط بدون أي نص إضافي.`,
            },
          ],
        },
      ],
    });

    const rawText =
      claudeResponse.content[0].type === "text" ? claudeResponse.content[0].text : "";
    console.log("[Scout Analysis] Response length:", rawText.length);

    // Parse JSON — strip markdown fences if present
    let report;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      report = JSON.parse(jsonMatch[0]);
      // Ensure reportId is set
      if (!report.reportId) report.reportId = reportId;
    } catch (parseErr) {
      console.error("[Scout Analysis] JSON parse error:", parseErr);
      console.error("[Scout Analysis] Raw (first 800):", rawText.substring(0, 800));
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw: rawText.substring(0, 500),
      });
    }

    console.log("[Scout Analysis] ✅ Overall rating:", report.overallRating);
    return res.json({ success: true, report, model: "claude-opus-4-5", source: "anthropic" });
  } catch (err: any) {
    console.error("[Scout Analysis] Error:", err?.message || err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err?.message || "Analysis failed" });
    }
  }
});

// ── Health ────────────────────────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "scout-analysis",
    anthropicKeySet: !!process.env.ANTHROPIC_API_KEY,
    model: "claude-opus-4-5",
    prompt: "SAFF+FIFA v2",
  });
});

export function registerScoutAnalysisRoutes(app: import("express").Express) {
  app.use("/api/scout", router);
  console.log("[Scout Analysis] Routes registered at /api/scout (SAFF+FIFA v2 / Anthropic)");
}
