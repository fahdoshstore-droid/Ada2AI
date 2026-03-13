/**
 * SCOUT AI — Player Visual Analysis Route
 * Uses Claude (via Forge API) to analyze player images/videos
 * Standards: FIFA Quality Programme + Saudi Football Federation (SAFF)
 */

import { Router } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createPatchedFetch } from "./_core/patchedFetch";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const router = Router();

// ── AI Client ────────────────────────────────────────────────────────────────
function getAIModel() {
  const openai = createOpenAI({
    apiKey: process.env.BUILT_IN_FORGE_API_KEY,
    baseURL: `${process.env.BUILT_IN_FORGE_API_URL}/v1`,
    fetch: createPatchedFetch(fetch),
  });
  return openai.chat("claude-3-5-sonnet-20241022");
}

// ── FIFA/SAFF Scout Prompt ────────────────────────────────────────────────────
const FIFA_SAFF_SYSTEM_PROMPT = `You are an elite football scout certified by FIFA and the Saudi Football Federation (SAFF). 
You work for SCOUT AI — an AI-powered talent discovery platform focused on the Eastern Province of Saudi Arabia.

Your analysis follows:
- FIFA Quality Programme standards (Technical Report 2022)
- Saudi Football Federation youth development framework
- Saudi Pro League scouting criteria
- Vision 2030 Sports Strategy metrics

You analyze football players from images or videos and produce structured scouting reports.
Only infer what is visually reasonable. Do not invent facts.
Always respond in the exact JSON format requested.`;

const FIFA_SAFF_USER_PROMPT = (playerInfo: {
  name?: string;
  age?: string;
  position?: string;
  city?: string;
}) => `Analyze this football player image/video and produce a complete SCOUT AI scouting report.

Player Info (if provided):
- Name: ${playerInfo.name || "Unknown"}
- Age/Category: ${playerInfo.age || "Unknown"}
- Position: ${playerInfo.position || "Unknown"}
- City: ${playerInfo.city || "Eastern Province, Saudi Arabia"}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{
  "reportId": "generate a unique 8-char alphanumeric ID",
  "analysisDate": "today's date in Arabic format e.g. 12 مارس 2026",
  "estimatedAge": {
    "range": "e.g. 15-17",
    "category": "e.g. U17 / U20 / Senior",
    "saff_category": "e.g. ناشئين / شباب / أول"
  },
  "physicalProfile": {
    "bodyType": "lean / athletic / powerful",
    "bodyTypeAr": "نحيف رياضي / رياضي / قوي",
    "heightEstimate": "short / average / tall",
    "heightEstimateAr": "قصير / متوسط / طويل",
    "balance": "score 1-10",
    "posture": "description in Arabic",
    "coordinationIndicators": "description in Arabic"
  },
  "athleticIndicators": {
    "speed": { "score": 0-10, "label": "السرعة", "note": "brief Arabic note" },
    "agility": { "score": 0-10, "label": "الرشاقة", "note": "brief Arabic note" },
    "explosiveness": { "score": 0-10, "label": "الانفجارية", "note": "brief Arabic note" },
    "stamina": { "score": 0-10, "label": "التحمل", "note": "brief Arabic note" }
  },
  "technicalIndicators": {
    "ballControl": { "score": 0-10, "label": "التحكم بالكرة", "note": "brief Arabic note" },
    "dribblingPosture": { "score": 0-10, "label": "وضعية المراوغة", "note": "brief Arabic note" },
    "firstTouch": { "score": 0-10, "label": "اللمسة الأولى", "note": "brief Arabic note" },
    "coordination": { "score": 0-10, "label": "التنسيق الحركي", "note": "brief Arabic note" },
    "passing": { "score": 0-10, "label": "التمرير", "note": "brief Arabic note" },
    "shooting": { "score": 0-10, "label": "التسديد", "note": "brief Arabic note" }
  },
  "tacticalProfile": {
    "positioning": { "score": 0-10, "label": "التمركز", "note": "brief Arabic note" },
    "pressing": { "score": 0-10, "label": "الضغط", "note": "brief Arabic note" },
    "transitionSpeed": { "score": 0-10, "label": "سرعة الانتقال", "note": "brief Arabic note" },
    "decisionMaking": { "score": 0-10, "label": "اتخاذ القرار", "note": "brief Arabic note" }
  },
  "mentalProfile": {
    "focus": { "score": 0-10, "label": "التركيز" },
    "confidence": { "score": 0-10, "label": "الثقة بالنفس" },
    "leadership": { "score": 0-10, "label": "القيادة" }
  },
  "overallRating": 0-100,
  "sportDNA": {
    "RW": 0-100,
    "LW": 0-100,
    "ST": 0-100,
    "CAM": 0-100,
    "CM": 0-100,
    "CDM": 0-100,
    "RB": 0-100,
    "LB": 0-100,
    "CB": 0-100,
    "GK": 0-100
  },
  "bestPosition": "e.g. RW",
  "bestPositionAr": "e.g. جناح أيمن",
  "tacticalHints": "2-3 sentences in Arabic about suitable positions and playing style",
  "strengths": ["strength 1 in Arabic", "strength 2 in Arabic", "strength 3 in Arabic"],
  "developmentAreas": ["area 1 in Arabic", "area 2 in Arabic"],
  "fifaStandardComparison": {
    "technicalLevel": "Below Standard / Meets Standard / Above Standard",
    "physicalLevel": "Below Standard / Meets Standard / Above Standard",
    "saffYouthBenchmark": "percentage 0-100 of SAFF youth benchmark"
  },
  "scoutRecommendation": "2-3 sentences in Arabic — recommendation for academies/scouts",
  "scoutConfidence": 0-100,
  "confidenceNote": "brief Arabic explanation of confidence level"
}`;

// ── Upload Endpoint ───────────────────────────────────────────────────────────
router.post("/upload", async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body as {
      fileData: string; // base64
      mimeType: string;
      fileName: string;
    };

    if (!fileData || !mimeType) {
      return res.status(400).json({ error: "fileData and mimeType required" });
    }

    // Upload to S3
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
  try {
    const { imageUrl, playerInfo } = req.body as {
      imageUrl: string;
      playerInfo?: {
        name?: string;
        age?: string;
        position?: string;
        city?: string;
      };
    };

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const model = getAIModel();

    const { text } = await generateText({
      model,
      system: FIFA_SAFF_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: imageUrl,
            },
            {
              type: "text",
              text: FIFA_SAFF_USER_PROMPT(playerInfo || {}),
            },
          ],
        },
      ],
      maxOutputTokens: 2000,
    });

    // Parse JSON response
    let report;
    try {
      // Extract JSON from response (in case model adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      report = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[Scout Analysis] JSON parse error:", parseErr, "\nRaw:", text);
      return res.status(500).json({ error: "Failed to parse AI response", raw: text });
    }

    return res.json({ success: true, report });
  } catch (err: any) {
    console.error("[Scout Analysis]", err);
    return res.status(500).json({ error: err?.message || "Analysis failed" });
  }
});

export function registerScoutAnalysisRoutes(app: import("express").Express) {
  app.use("/api/scout", router);
}
