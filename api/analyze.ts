/**
 * Scout Analysis API - Serverless Version for Vercel
 * Uses Anthropic Claude Vision for athlete analysis
 * CORS restricted to allowed origins only; auth via Supabase Bearer token
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Allowed Origins ────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://ada2ai.vercel.app",
  "http://localhost:3002",
  "http://localhost:3000",
];

function getOrigin(req: any): string | undefined {
  return req.headers?.origin || req.headers?.Origin || undefined;
}

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function setCORsHeaders(req: any, res: any): void {
  const origin = getOrigin(req);
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // If origin not allowed, no Access-Control-Allow-Origin header is set
  // — browser will block the response
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

// ── Auth ───────────────────────────────────────────────────────────────

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function verifyAuth(req: any): Promise<{ user: any } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const { data, error } = await (supabase.auth as any).getUser(token);
  if (error || !data.user) return null;
  return { user: data.user };
}

// ── Anthropic API Key ──────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function analyzeAthlete(imageData: string, imageMimeType: string = "image/jpeg") {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const prompt = `You are a professional sports scout AI for the Ada2ai platform. Analyze this athlete image/video frame and provide a comprehensive assessment.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):

{
  "reportId": "ADA-XXXXXX",
  "analysisDate": "YYYY-MM-DD in Arabic format",
  "playerName": "Player name if visible on jersey/sign, otherwise 'رياضي موهوب'",
  "jerseyNumber": 10,
  "ageCategory": {
    "label": "U15 or U17 or U20 or Senior",
    "code": "U15/U17/U20/Senior",
    "note": "Age estimate note in Arabic"
  },
  "sportType": "football",
  "physicalProfile": {
    "bodyType": "athletic/slim/strong/muscular",
    "heightCategory": "short/average/tall",
    "posture": "posture description in Arabic",
    "fitnessIndex": "fitness description in Arabic",
    "balance": 75
  },
  "athleticIndicators": {
    "speed": { "score": 75, "label": "Speed/Maximum Velocity", "note": "Assessment note in Arabic" },
    "agility": { "score": 72, "label": "Agility", "note": "Assessment note in Arabic" },
    "strength": { "score": 70, "label": "Strength", "note": "Assessment note in Arabic" },
    "endurance": { "score": 78, "label": "Endurance", "note": "Assessment note in Arabic" }
  },
  "technicalIndicators": {
    "technique": { "score": 80, "label": "Technique", "note": "Assessment note in Arabic" },
    "ballControl": { "score": 82, "label": "Ball Control", "note": "Assessment note in Arabic" },
    "shooting": { "score": 75, "label": "Shooting", "note": "Assessment note in Arabic" },
    "passing": { "score": 78, "label": "Passing", "note": "Assessment note in Arabic" }
  },
  "mentalIndicators": {
    "decisionMaking": { "score": 74, "label": "Decision Making", "note": "Assessment note in Arabic" },
    "teamwork": { "score": 80, "label": "Teamwork", "note": "Assessment note in Arabic" },
    "leadership": { "score": 68, "label": "Leadership", "note": "Assessment note in Arabic" },
    "pressureHandling": { "score": 72, "label": "Pressure Handling", "note": "Assessment note in Arabic" }
  },
  "sportDNA": {
    "attacking": 75,
    "defending": 65,
    "creativity": 80,
    "physical": 70
  },
  "saffBenchmark": {
    "meetsStandard": "above/below/at",
    "technicalLevel": "Technical level in Arabic",
    "physicalLevel": "Physical level in Arabic",
    "benchmarkScore": 72,
    "note": "Benchmark note in Arabic"
  },
  "recommendation": {
    "bestPosition": "Position name in Arabic",
    "bestPositionCode": "FW/MF/DF/GK",
    "secondPosition": "Second position in Arabic",
    "secondPositionCode": "FW/MF/DF/GK",
    "suitableAcademies": ["Academy 1", "Academy 2", "Academy 3"],
    "developmentPlan": "Development plan in Arabic",
    "scoutNote": "Scout note in Arabic"
  },
  "overallRating": 76,
  "confidence": {
    "percentage": 85,
    "reason": "Reason for confidence in Arabic"
  }
}

Analyze the athlete carefully considering:
1. Body type, height, and physical build
2. Apparent age and developmental stage
3. Sport-specific posture and positioning
4. Athletic indicators visible in the image
5. Any jersey number or identifying information
6. Overall athletic potential and recommendation

Return ONLY the JSON object.`;

  try {
    const result = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageMimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: imageData,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const responseText = result.content[0].type === "text" ? result.content[0].text : "";
    
    // Parse JSON response
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const report = JSON.parse(jsonStr);
      return report;
    } else {
      throw new Error("Failed to parse JSON from response");
    }
  } catch (error) {
    console.error("Anthropic API error:", error);
    throw error;
  }
}

// For Vercel serverless - export handler
export default async function handler(req: any, res: any) {
  // CORS headers — restricted to allowed origins
  setCORsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth check — require valid Supabase Bearer token
  const auth = await verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized — missing or invalid Authorization header" });
  }

  try {
    const { imageData, mimeType } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: "imageData is required" });
    }

    const report = await analyzeAthlete(imageData, mimeType || "image/jpeg");

    return res.status(200).json({ report });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return res.status(500).json({ 
      error: error.message || "Analysis failed",
      details: "Check server logs for more information"
    });
  }
}