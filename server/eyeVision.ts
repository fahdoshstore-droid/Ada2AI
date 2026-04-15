/**
 * DHEEB Eye Vision — Vision analysis endpoint (Coach + FactCheck)
 * Uses ai-provider for Anthropic → Ollama fallback
 *
 * POST /api/eye/vision
 * Body: { imageBase64: string, transcript?: string, context: 'coach' | 'factcheck', prompt?: string }
 * Response: { actions: EyeAction[], descriptionAr: string, descriptionEn: string, suggestions: string[] }
 */
import type { Express, Request, Response } from "express";
import { z } from "zod/v4";
import { analyzeVision, getProviderStatus } from "./_core/ai-provider";

// ─── Schemas ──────────────────────────────────────────────────────────

const EyeVisionRequestSchema = z.object({
  imageBase64: z.string().min(1, "Image data is required"),
  transcript: z.string().optional(),
  context: z.enum(["coach", "factcheck"]).default("coach"),
  prompt: z.string().optional(),
  sessionId: z.string().optional(),
});

type EyeVisionRequest = z.infer<typeof EyeVisionRequestSchema>;

// ─── System Prompts ──────────────────────────────────────────────────────

const COACH_SYSTEM_PROMPT = `أنت DHEEB Eye، معلم ذكي يحلل الشاشات التكتكية الرياضية.
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

// ─── API Handler ──────────────────────────────────────────────────────────

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

      // Build system prompt and user message
      const systemPrompt = context === "coach" ? COACH_SYSTEM_PROMPT : FACTCHECK_SYSTEM_PROMPT;
      const userMessage = transcript
        ? (prompt || (context === "coach"
            ? `المدرب يقول: "${transcript}". حلل ما تراه في الصورة.`
            : `تحقق من الادعاءات في هذه الصورة. السياق: "${transcript}"`))
        : (prompt || (context === "coach"
            ? "حلل هذه الشاشة التكتكية. ماذا ترى؟"
            : "استخرج وتحقق من الادعاءات في هذه الصورة."));

      // Call AI provider (Anthropic → Ollama fallback)
      const result = await analyzeVision({
        imageBase64,
        mediaType: "image/png",
        systemPrompt,
        userMessage,
        maxTokens: 4096,
      });

      // Parse JSON from response
      let parsedResponse: Record<string, unknown>;
      try {
        const jsonMatch = result.text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : result.text;
        parsedResponse = JSON.parse(jsonStr.trim());
      } catch {
        parsedResponse = {
          descriptionAr: result.text,
          descriptionEn: result.text,
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
        _meta: { provider: result.provider, model: result.model },
      });

    } catch (error) {
      console.error("[Eye Vision] Error:", error);
      return res.status(500).json({
        error: "Vision analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Health check endpoint
  app.get("/api/eye/health", (_req: Request, res: Response) => {
    const status = getProviderStatus();
    res.json({
      status: "ok",
      vision: status.vision,
      text: status.text,
      provider: status.provider,
      timestamp: new Date().toISOString(),
    });
  });
}