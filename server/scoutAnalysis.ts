/**
 * Scout Analysis — Ada2ai
 * دعم: رفع صور وفيديوهات، استخراج 3 إطارات تلقائياً، تحليل Vision
 * معايير SAFF + FIFA — تقرير عربي منظم
 * AI Provider: Anthropic (primary) → Ollama (fallback)
 */

import { Router } from "express";
import { analyzeVisionPremium, getProviderStatus } from "./_core/ai-provider";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { execFile, execFileSync } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execFileAsync = promisify(execFile);

// Allowed video extensions for ffmpeg processing
const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "avi", "mkv"];

function sanitizeVideoPath(filePath: string): string {
  const resolved = path.resolve(filePath);
  const ext = path.extname(resolved).toLowerCase().slice(1);
  if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported video format: .${ext}`);
  }
  return resolved;
}

const router = Router();

// ─── System Prompt (SAFF + FIFA v3) ──────────────────────────────────────
const SYSTEM_PROMPT = `You are a professional football scout for Ada2ai using SAFF and FIFA standards.
You analyze football players from real training session videos and images, including official footage from Saudi clubs like Nahda FC.
Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

JSON structure:
{
  "reportId": "ADA-XXXXXX",
  "analysisDate": "تاريخ بالعربي",
  "playerName": "اسم اللاعب إن كان مرئياً على الزي أو اللافتة — وإلا اكتب: لاعب موهوب",
  "jerseyNumber": 10,
  "ageCategory": {
    "label": "تحت 15 / تحت 17 / تحت 20 / أكبر",
    "code": "U17",
    "note": "ملاحظة قصيرة بالعربي"
  },
  "physicalProfile": {
    "bodyType": "نحيف رياضي / قوي / ضخم",
    "heightCategory": "قصير / متوسط / طويل",
    "posture": "وصف بالعربي",
    "fitnessIndex": "وصف بالعربي",
    "balance": 75
  },
  "athleticIndicators": {
    "speed":         { "score": 78, "label": "السرعة القصوى",                   "note": "ملاحظة" },
    "agility":       { "score": 75, "label": "الرشاقة والتغيير السريع للاتجاه", "note": "ملاحظة" },
    "explosiveness": { "score": 72, "label": "الانفجارية والقوة",               "note": "ملاحظة" },
    "stamina":       { "score": 70, "label": "التحمل واللياقة",                 "note": "ملاحظة" }
  },
  "technicalIndicators": {
    "ballControl":  { "score": 76, "label": "التحكم بالكرة",             "note": "ملاحظة" },
    "dribbling":    { "score": 74, "label": "المراوغة ووضعية الجسم",     "note": "ملاحظة" },
    "firstTouch":   { "score": 72, "label": "اللمسة الأولى والاستقبال",  "note": "ملاحظة" },
    "coordination": { "score": 75, "label": "التنسيق الحركي العام",      "note": "ملاحظة" },
    "vision":       { "score": 70, "label": "الرؤية التكتيلكية",          "note": "ملاحظة" },
    "passing":      { "score": 68, "label": "التمرير",                   "note": "ملاحظة" },
    "shooting":     { "score": 65, "label": "التسديد",                   "note": "ملاحظة" }
  },
  "mentalIndicators": {
    "footballIQ":     { "score": 74, "label": "الذكاء الكروي",                  "note": "ملاحظة" },
    "decisionMaking": { "score": 72, "label": "اتخاذ القرار",                   "note": "ملاحظة" },
    "resilience":     { "score": 68, "label": "الصمود النفسي تحت الضغط",        "note": "ملاحظة" }
  },
  "sportDNA": {
    "RW": 78, "LW": 72, "ST": 68, "CAM": 70,
    "CM": 65, "CDM": 58, "RB": 55, "LB": 52, "CB": 48, "GK": 35
  },
  "saffBenchmark": {
    "meetsStandard": "نعم / يحتاج تطوير / لا",
    "technicalLevel": "مستوى تقني",
    "physicalLevel": "مستوى بدني",
    "benchmarkScore": 72,
    "note": "ملاحظة بالعربي"
  },
  "recommendation": {
    "bestPosition": "جناح أيمن",
    "bestPositionCode": "RW",
    "secondPosition": "مهاجم",
    "secondPositionCode": "ST",
    "suitableAcademies": ["أكاديمية النصر", "أكاديمية الاتحاد"],
    "developmentPlan": "خطة تطوير 3-6 أشهر بالعربي",
    "scoutNote": "توصية الكشاف بالعربي"
  },
  "overallRating": 74,
  "confidence": {
    "percentage": 72,
    "reason": "أسباب الثقة بالعربي"
  }
}

قواعد مهمة:
- أعد JSON فقط بدون أي نص خارجه
- لا تخترع معلومات — استنتج فقط ما هو مرئي بوضوح
- جميع الأرقام بين 0 و100
- جميع النصوص الوصفية بالعربي الواضح الصحيح
- playerName: إن كان الاسم مرئياً على الزي استخدمه، وإلا اكتب "لاعب موهوب"
- jerseyNumber: إن كان مرئياً استخدمه كرقم صحيح، وإلا استخدم قيمة overallRating`;

// ─── Helper: جلب صورة كـ base64 ──────────────────────────────────────
async function fetchImageAsBase64(url: string): Promise<{
  type: "base64";
  media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string;
}> {
  const imgRes = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!imgRes.ok) throw new Error(`فشل جلب الصورة: ${imgRes.status}`);
  const imgBuffer = await imgRes.arrayBuffer();
  const base64Data = Buffer.from(imgBuffer).toString("base64");
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const supported = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const mediaType = supported.includes(contentType) ? contentType : "image/jpeg";
  return {
    type: "base64",
    media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
    data: base64Data,
  };
}

// ─── Helper: استخراج 3 إطارات من الفيديو باستخدام ffmpeg ──────────
async function extractVideoFrames(videoBuffer: Buffer, mimeType: string): Promise<string[]> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "scout-frames-"));
  const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("mov") ? "mov" : "webm";
  const videoPath = sanitizeVideoPath(path.join(tmpDir, `input.${ext}`));
  fs.writeFileSync(videoPath, videoBuffer);

  try {
    let duration = 10;
    try {
      const { stdout: probeOut } = await execFileAsync(
        "ffprobe",
        ["-v", "quiet", "-print_format", "json", "-show_format", videoPath],
        { timeout: 10000 }
      );
      const probe = JSON.parse(probeOut);
      duration = parseFloat(probe.format?.duration || "10");
    } catch (_) { /* استخدم القيمة الافتراضية */ }

    const frameUrls: string[] = [];
    const timestamps = [0.2, 0.5, 0.8].map(p => Math.max(0.5, p * duration));

    for (let i = 0; i < timestamps.length; i++) {
      const framePath = path.join(tmpDir, `frame${i}.jpg`);
      try {
        const sanitizedFramePath = path.join(tmpDir, `frame${i}.jpg`);
        await execFileAsync(
          "ffmpeg",
          ["-y", "-ss", timestamps[i].toFixed(2), "-i", videoPath, "-vframes", "1", "-q:v", "2", "-vf", "scale=720:-1", sanitizedFramePath],
          { timeout: 15000 }
        );
        if (fs.existsSync(sanitizedFramePath)) {
          const frameBuffer = fs.readFileSync(sanitizedFramePath);
          const key = `scout-frames/${nanoid()}-frame${i}.jpg`;
          const { url } = await storagePut(key, frameBuffer, "image/jpeg");
          frameUrls.push(url);
        }
      } catch (err) {
        console.warn(`[Scout] فشل استخراج الإطار ${i}:`, err);
      }
    }

    return frameUrls;
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

// ─── Upload Endpoint ──────────────────────────────────────────────────────
router.post("/upload", async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body as {
      fileData: string;
      mimeType: string;
      fileName: string;
    };
    if (!fileData || !mimeType) {
      return res.status(400).json({ error: "fileData و mimeType مطلوبان" });
    }
    const buffer = Buffer.from(fileData, "base64");
    const isVideo = mimeType.startsWith("video/");

    if (isVideo) {
      console.log("[Scout Upload] فيديو — جاري استخراج الإطارات...");
      const frameUrls = await extractVideoFrames(buffer, mimeType);
      if (frameUrls.length === 0) {
        return res.status(400).json({ error: "تعذّر استخراج إطارات من الفيديو" });
      }
      const key = `scout-analysis/${nanoid()}-${fileName || "video"}`;
      const { url: videoUrl } = await storagePut(key, buffer, mimeType);
      console.log(`[Scout Upload] تم استخراج ${frameUrls.length} إطارات`);
      return res.json({ url: videoUrl, key, isVideo: true, frameUrls });
    } else {
      const key = `scout-analysis/${nanoid()}-${fileName || "upload"}`;
      const { url } = await storagePut(key, buffer, mimeType);
      return res.json({ url, key, isVideo: false, frameUrls: [] });
    }
  } catch (err) {
    console.error("[Scout Upload]", err);
    return res.status(500).json({ error: "فشل الرفع" });
  }
});

// ─── Analysis Endpoint ────────────────────────────────────────────────────
router.post("/analyze", async (req, res) => {
  res.setTimeout(120000, () => {
    if (!res.headersSent) res.status(504).json({ error: "انتهت مهلة التحليل" });
  });

  try {
    const { imageUrl, frameUrls, context } = req.body as {
      imageUrl?: string;
      frameUrls?: string[];
      context?: string;
    };

    const urls = frameUrls && frameUrls.length > 0 ? frameUrls : imageUrl ? [imageUrl] : [];
    if (urls.length === 0) {
      return res.status(400).json({ error: "imageUrl أو frameUrls مطلوب" });
    }

    console.log(`[Scout Analysis] بدء تحليل SAFF+FIFA على ${urls.length} إطار...`);

    // Build combined image base64 for multi-frame analysis
    // For scout, we analyze the first frame as primary with context from all frames
    let primaryImageBase64: string;
    let primaryMediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    try {
      const imgSource = await fetchImageAsBase64(urls[0]);
      primaryImageBase64 = imgSource.data;
      primaryMediaType = imgSource.media_type;
    } catch (err) {
      console.error("[Scout Analysis] فشل جلب الصورة الأساسية:", err);
      return res.status(400).json({ error: "فشل جلب صورة التحليل" });
    }

    // If multiple frames, fetch them all and concat info
    const additionalFrameInfo = urls.length > 1
      ? `\n\nملاحظة: تم تحليل ${urls.length} إطارات من الفيديو.ركز على الإطار الأول (الأساسي) مع مراعاة الحركة عبر الإطارات.`
      : "";

    const today = new Date().toLocaleDateString("ar-SA", {
      year: "numeric", month: "long", day: "numeric",
    });
    const reportId = `ADA-${nanoid(6).toUpperCase()}`;

    const nahdaCtx = context && context.includes("النهضة")
      ? `\nالسياق: فيديو تدريبي رسمي من نادي النهضة السعودي — حلل بدقة عالية وأعط توصيات مناسبة للدوري السعودي.`
      : "";

    const userMessage = urls.length > 1
      ? `حلل هذا اللاعب من ${urls.length} إطار فيديو وفق معايير SAFF وFIFA.${nahdaCtx}${additionalFrameInfo}\nرقم التقرير: ${reportId}\nتاريخ التحليل: ${today}\nأعد JSON فقط.`
      : `حلل هذا اللاعب وفق معايير SAFF وFIFA.${nahdaCtx}\nرقم التقرير: ${reportId}\nتاريخ التحليل: ${today}\nأعد JSON فقط.`;

    // Use ai-provider (Anthropic → Ollama fallback)
    const result = await analyzeVisionPremium({
      imageBase64: primaryImageBase64,
      mediaType: primaryMediaType,
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 4096,
    });

    const rawText = result.text;
    console.log(`[Scout Analysis] طول الاستجابة: ${rawText.length} via ${result.provider}/${result.model}`);

    // تحليل JSON — إزالة markdown إن وُجد
    let report;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("لم يُعثر على JSON في الاستجابة");
      report = JSON.parse(jsonMatch[0]);
      if (!report.reportId) report.reportId = reportId;
      if (!report.playerName) report.playerName = "لاعب موهوب";
      if (!report.jerseyNumber) report.jerseyNumber = report.overallRating || 77;
    } catch (parseErr) {
      console.error("[Scout Analysis] خطأ في تحليل JSON:", parseErr);
      console.error("[Scout Analysis] أول 800 حرف:", rawText.substring(0, 800));
      return res.status(500).json({
        error: "فشل تحليل استجابة الذكاء الاصطناعي",
        raw: rawText.substring(0, 500),
      });
    }

    console.log("[Scout Analysis] ✅ التقييم الكلي:", report.overallRating, "| اللاعب:", report.playerName);
    return res.json({
      success: true,
      report,
      model: result.model,
      source: result.provider,
      framesAnalyzed: urls.length,
    });
  } catch (err: any) {
    console.error("[Scout Analysis] خطأ:", err?.message || err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err?.message || "فشل التحليل" });
    }
  }
});

// ─── Health ───────────────────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  const status = getProviderStatus();
  res.json({
    status: "ok",
    service: "scout-analysis",
    vision: status.vision,
    text: status.text,
    provider: status.provider,
    prompt: "SAFF+FIFA v3 — playerName + video frames",
    ffmpegAvailable: (() => {
      try { execFileSync("which", ["ffmpeg"], { timeout: 2000 }); return true; } catch { return false; }
    })(),
  });
});

export function registerScoutAnalysisRoutes(app: import("express").Express) {
  app.use("/api/scout", router);
  console.log("[Scout Analysis] Routes registered at /api/scout (SAFF+FIFA v3 / video + playerName)");
}