/**
 * DHEEB Eye Vision — Claude Vision endpoint for screen analysis
 *
 * POST /api/eye/vision
 * Body: { imageBase64: string, transcript?: string, context: 'coach' | 'factcheck', prompt?: string }
 * Response: { actions: EyeAction[], descriptionAr: string, descriptionEn: string, suggestions: string[] }
 */
import Anthropic from "@anthropic-ai/sdk";
import type { Express, Request, Response } from "express";
import { z } from "zod/v4";

// ── Schemas ──────────────────────────────────────────────────────────────────

const EyeVisionRequestSchema = z.object({
  imageBase64: z.string().min(1, "Image data is required"),
  transcript: z.string().optional(),
  context: z.enum(["coach", "factcheck"]).default("coach"),
  prompt: z.string().optional(),
  sessionId: z.string().optional(),
});

type EyeVisionRequest = z.infer<typeof EyeVisionRequestSchema>;

// ── System Prompts ───────────────────────────────────────────────────────────

const COACH_SYSTEM_PROMPT = `أنت DHEEB Eye، معلم ذكي يحلل الشاشات التكتيكية الرياضية.
أنت ترى لقطة شاشة وتسمع ما يقوله المدرب بالعربي.

حلل ما تراه وأجب بـ JSON فقط بالهيكل التالي:
{
  "descriptionAr": "وصف عربي لما تراه",
  "descriptionEn": "English description of what you see",
  "actions": [
    {
      "id": "action-1",
      "type": "point" | "highlight" | "speak",
      "payload": {
        "targetSelector": "[data-role='DEF']" أو null,
        "x": 50,
        "y": 70,
        "zone": "defensive-third" أو null,
        "color": "teal" | "red" | "green" | "yellow"
      },
      "messageAr": "الشرح بالعربي",
      "messageEn": "English explanation"
    }
  ],
  "suggestionsAr": ["اقتراح ١", "اقتراح ٢"],
  "suggestionsEn": ["Suggestion 1", "Suggestion 2"]
}

القواعد:
- actions يمكن أن تحتوي على point (يشير لمكان)، highlight (يلوّن منطقة)، أو speak (ينطق شرح)
- payload.x و payload.y هي نسب مئوية (0-100) من حجم الشاشة
- targetSelector هو CSS selector اختياري (يفضّل على x/y)
- zone هو اسم منطقة الملعب: penalty-area, goal-area, center-circle, left-wing, right-wing, midfield, defensive-third, attacking-third
- أجب بالعربي أولاً
- كن مختصراً ومباشراً`;

const FACTCHECK_SYSTEM_PROMPT = `أنت DHEEB Eye، مدقق معلومات ذكي يحلل لقطات الشاشة.
أنت تبحث عن ادعاءات في الصورة وتقيّم صحتها.

حلل ما تراه وأجب بـ JSON فقط بالهيكل التالي:
{
  "descriptionAr": "وصف عربي للمحتوى",
  "descriptionEn": "English description of content",
  "actions": [
    {
      "id": "claim-1",
      "type": "factcheck",
      "payload": {
        "claim": "الادعاء المستخرج",
        "verdict": "verified" | "false" | "misleading" | "unverified",
        "confidence": 0.85,
        "bbox": { "x": 10, "y": 20, "w": 30, "h": 5 }
      },
      "messageAr": "هذا الادعاء غير صحيح",
      "messageEn": "This claim is false"
    }
  ],
  "suggestionsAr": ["اقتراح ١"],
  "suggestionsEn": ["Suggestion 1"]
}

القواعد:
- كل ادعاء في الصورة يجب أن يكون action من نوع factcheck
- bbox هي نسب مئوية لموقع الادعاء في الصورة
- verdict: verified (صحيح)، false (خاطئ)، misleading (مضلل)، unverified (غير موثق)
- confidence من 0 إلى 1
- أجب بالعربي أولاً`;

// ── API Handler ──────────────────────────────────────────────────────────────

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

export function registerEyeVisionRoutes(app: Express): void {
  app.post("/api/eye/vision", async (req: Request, res: Response) => {
    try {
      // Validate request
      const parsed = EyeVisionRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: parsed.error.issues,
        });
      }

      const { imageBase64, transcript, context, prompt, sessionId } = parsed.data;

      // Determine media type (default to png)
      const mediaType = "image/png";

      // Build messages
      const systemPrompt = context === "coach" ? COACH_SYSTEM_PROMPT : FACTCHECK_SYSTEM_PROMPT;

      const userContent: Anthropic.MessageParam[] = [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            ...(transcript
              ? [
                  {
                    type: "text" as const,
                    text: prompt || (context === "coach"
                      ? `المدرب يقول: "${transcript}". حلل ما تراه في الصورة.`
                      : `تحقق من الادعاءات في هذه الصورة. السياق: "${transcript}"`),
                  },
                ]
              : [
                  {
                    type: "text" as const,
                    text: prompt || (context === "coach"
                      ? "حلل هذه الشاشة التكتيكية. ماذا ترى؟"
                      : "استخرج وتحقق من الادعاءات في هذه الصورة."),
                  },
                ]),
          ],
        },
      ];

      // Call Claude Vision
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: userContent,
      });

      // Extract text response
      const textBlock = response.content.find((block) => block.type === "text");
      const responseText = textBlock && textBlock.type === "text" ? textBlock.text : "";

      // Parse JSON from response (Claude may wrap in markdown code blocks)
      let parsedResponse: Record<string, unknown>;
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
        parsedResponse = JSON.parse(jsonStr.trim());
      } catch {
        // If JSON parsing fails, return the raw text as description
        parsedResponse = {
          descriptionAr: responseText,
          descriptionEn: responseText,
          actions: [],
          suggestions: [],
          suggestionsAr: [],
        };
      }

      // Ensure actions have proper structure
      const actions = Array.isArray(parsedResponse.actions) ? parsedResponse.actions : [];
      const sanitizedActions = actions.map((action: Record<string, unknown>, i: number) => ({
        id: (action.id as string) || `eye-${Date.now()}-${i}`,
        type: action.type || "speak",
        payload: action.payload || {},
        messageAr: (action.messageAr as string) || (action.messageEn as string) || "",
        messageEn: (action.messageEn as string) || (action.messageAr as string) || "",
      }));

      return res.json({
        descriptionAr: parsedResponse.descriptionAr || parsedResponse.description || "",
        descriptionEn: parsedResponse.descriptionEn || parsedResponse.description || "",
        actions: sanitizedActions,
        suggestions: parsedResponse.suggestions || parsedResponse.suggestionsEn || [],
        suggestionsAr: parsedResponse.suggestionsAr || parsedResponse.suggestions || [],
        sessionId,
      });

    } catch (error) {
      console.error("[Eye Vision] Error:", error);

      // Handle Anthropic API errors specifically
      if (error instanceof Anthropic.APIError) {
        return res.status(error.status || 500).json({
          error: "Vision API error",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Vision analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Health check endpoint
  app.get("/api/eye/health", (_req: Request, res: Response) => {
    const hasApiKey = !!(process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY);
    res.json({
      status: "ok",
      vision: hasApiKey ? "configured" : "missing_api_key",
      timestamp: new Date().toISOString(),
    });
  });
}