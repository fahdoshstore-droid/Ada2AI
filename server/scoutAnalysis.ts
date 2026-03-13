/**
 * SCOUT AI — Player Visual Analysis Route
 * Uses Claude (via Forge API) to analyze player images
 * Standards: FIFA Quality Programme + Saudi Football Federation (SAFF)
 */

import { Router } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const router = Router();

// ── AI Client ────────────────────────────────────────────────────────────────
function getAIModel() {
  const openai = createOpenAI({
    apiKey: process.env.BUILT_IN_FORGE_API_KEY,
    baseURL: `${process.env.BUILT_IN_FORGE_API_URL}/v1`,
  });
  return openai.chat("claude-3-5-sonnet-20241022");
}

// ── Compact FIFA/SAFF Scout Prompt ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an elite FIFA-certified football scout for SCOUT AI platform in Saudi Arabia's Eastern Province.
Analyze player images using FIFA Quality Programme + Saudi Football Federation (SAFF) standards.
Only infer what is visually reasonable. Respond ONLY with valid JSON, no markdown fences.`;

function buildUserPrompt(playerInfo: {
  name?: string; age?: string; position?: string; city?: string;
}) {
  const today = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  return `Analyze this football player. Player: ${playerInfo.name || "Unknown"}, Age: ${playerInfo.age || "Unknown"}, Position: ${playerInfo.position || "Unknown"}, City: ${playerInfo.city || "Eastern Province SA"}.

Return ONLY this JSON structure (fill in realistic values based on what you can see, no markdown fences):
{"reportId":"${nanoid(8)}","analysisDate":"${today}","estimatedAge":{"range":"15-17","category":"U17","saff_category":"ناشئين"},"physicalProfile":{"bodyType":"athletic","bodyTypeAr":"رياضي","heightEstimate":"average","heightEstimateAr":"متوسط","balance":7,"posture":"Arabic description","coordinationIndicators":"Arabic description"},"athleticIndicators":{"speed":{"score":7,"label":"السرعة","note":"Arabic note"},"agility":{"score":7,"label":"الرشاقة","note":"Arabic note"},"explosiveness":{"score":7,"label":"الانفجارية","note":"Arabic note"},"stamina":{"score":6,"label":"التحمل","note":"Arabic note"}},"technicalIndicators":{"ballControl":{"score":7,"label":"التحكم بالكرة","note":"Arabic note"},"dribblingPosture":{"score":7,"label":"وضعية المراوغة","note":"Arabic note"},"firstTouch":{"score":6,"label":"اللمسة الأولى","note":"Arabic note"},"coordination":{"score":7,"label":"التنسيق","note":"Arabic note"},"passing":{"score":6,"label":"التمرير","note":"Arabic note"},"shooting":{"score":6,"label":"التسديد","note":"Arabic note"}},"tacticalProfile":{"positioning":{"score":7,"label":"التمركز","note":"Arabic note"},"pressing":{"score":6,"label":"الضغط","note":"Arabic note"},"transitionSpeed":{"score":7,"label":"سرعة الانتقال","note":"Arabic note"},"decisionMaking":{"score":6,"label":"اتخاذ القرار","note":"Arabic note"}},"mentalProfile":{"focus":{"score":7,"label":"التركيز"},"confidence":{"score":7,"label":"الثقة"},"leadership":{"score":6,"label":"القيادة"}},"overallRating":72,"sportDNA":{"RW":75,"LW":70,"ST":65,"CAM":68,"CM":60,"CDM":55,"RB":50,"LB":48,"CB":45,"GK":30},"bestPosition":"RW","bestPositionAr":"جناح أيمن","tacticalHints":"Arabic 2-3 sentences about tactical profile","strengths":["Arabic strength 1","Arabic strength 2","Arabic strength 3"],"developmentAreas":["Arabic area 1","Arabic area 2"],"fifaStandardComparison":{"technicalLevel":"Meets Standard","physicalLevel":"Above Standard","saffYouthBenchmark":72},"scoutRecommendation":"Arabic 2-3 sentences scout recommendation","scoutConfidence":68,"confidenceNote":"Arabic explanation of confidence level"}`;
}

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
  // Set a 55-second timeout on the response
  res.setTimeout(55000, () => {
    if (!res.headersSent) {
      res.status(504).json({ error: "Analysis timeout" });
    }
  });

  try {
    const { imageUrl, playerInfo } = req.body as {
      imageUrl: string;
      playerInfo?: { name?: string; age?: string; position?: string; city?: string };
    };

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    console.log("[Scout Analysis] Starting analysis for:", playerInfo?.name || "Unknown");
    console.log("[Scout Analysis] Image URL:", imageUrl.substring(0, 80));

    const model = getAIModel();

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image" as const, image: new URL(imageUrl) },
            { type: "text" as const, text: buildUserPrompt(playerInfo || {}) },
          ],
        },
      ],
      maxOutputTokens: 1500,
    });

    console.log("[Scout Analysis] Got response, length:", text.length);

    // Parse JSON response — strip markdown fences if present
    let report;
    try {
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      report = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[Scout Analysis] JSON parse error:", parseErr);
      console.error("[Scout Analysis] Raw response:", text.substring(0, 500));
      return res.status(500).json({ error: "Failed to parse AI response", raw: text.substring(0, 200) });
    }

    console.log("[Scout Analysis] Success! Overall rating:", report.overallRating);
    return res.json({ success: true, report });

  } catch (err: any) {
    console.error("[Scout Analysis] Error:", err?.message || err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err?.message || "Analysis failed" });
    }
  }
});

// ── Health Check ──────────────────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "scout-analysis" });
});

export function registerScoutAnalysisRoutes(app: import("express").Express) {
  app.use("/api/scout", router);
  console.log("[Scout Analysis] Routes registered at /api/scout");
}
