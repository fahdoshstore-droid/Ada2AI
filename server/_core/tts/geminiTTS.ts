/**
 * Gemini TTS Handler — Text-to-Speech using Google Gemini 3.1 Flash TTS
 *
 * Converts text (including Arabic) to WAV audio via the Gemini TTS API.
 * Returns PCM 16-bit, 24kHz, mono WAV audio as a streaming response.
 *
 * Voice options: Kore, Puck, Charon, Aoede, Zephyr, Enceladus, etc.
 */

import type { Request, Response } from "express";
import { ENV } from "../env";

// ── Allowed voice names ──────────────────────────────────────────
const ALLOWED_VOICES = [
  "Kore",
  "Puck",
  "Charon",
  "Aoede",
  "Zephyr",
  "Enceladus",
  "Ledas",
  "Orus",
  "Fenrir",
  "Sulafat",
  "Algieba",
  "Achird",
  "Despina",
  "Erinome",
  "Laomedeia",
  "Polyphemus",
  "Rasalgethi",
] as const;

export type GeminiVoice = (typeof ALLOWED_VOICES)[number];

// ── WAV encoding ─────────────────────────────────────────────────
const PCM_SAMPLE_RATE = 24000;
const PCM_BITS_PER_SAMPLE = 16;
const PCM_NUM_CHANNELS = 1;
const PCM_BYTE_RATE = PCM_SAMPLE_RATE * PCM_NUM_CHANNELS * (PCM_BITS_PER_SAMPLE / 8);
const PCM_BLOCK_ALIGN = PCM_NUM_CHANNELS * (PCM_BITS_PER_SAMPLE / 8);
const WAV_HEADER_SIZE = 44;

/**
 * Build a standard 44-byte WAV header for raw PCM data.
 * Format: RIFF, fmt chunk (PCM 16-bit, 24kHz, mono), data chunk.
 */
export function buildWavHeader(pcmDataLength: number): Buffer {
  const header = Buffer.alloc(WAV_HEADER_SIZE);
  let offset = 0;

  // RIFF chunk descriptor
  header.write("RIFF", offset); offset += 4;
  header.writeUInt32LE(36 + pcmDataLength, offset); offset += 4; // file size - 8
  header.write("WAVE", offset); offset += 4;

  // fmt sub-chunk
  header.write("fmt ", offset); offset += 4;
  header.writeUInt32LE(16, offset); offset += 4; // sub-chunk size (16 for PCM)
  header.writeUInt16LE(1, offset); offset += 2;  // audio format (1 = PCM)
  header.writeUInt16LE(PCM_NUM_CHANNELS, offset); offset += 2;
  header.writeUInt32LE(PCM_SAMPLE_RATE, offset); offset += 4;
  header.writeUInt32LE(PCM_BYTE_RATE, offset); offset += 4;
  header.writeUInt16LE(PCM_BLOCK_ALIGN, offset); offset += 2;
  header.writeUInt16LE(PCM_BITS_PER_SAMPLE, offset); offset += 2;

  // data sub-chunk
  header.write("data", offset); offset += 4;
  header.writeUInt32LE(pcmDataLength, offset); offset += 4;

  return header;
}

/**
 * Convert raw PCM audio bytes to a WAV buffer.
 */
export function pcmToWav(pcmBuffer: Buffer): Buffer {
  const header = buildWavHeader(pcmBuffer.length);
  return Buffer.concat([header, pcmBuffer]);
}

// ── Voice validation ─────────────────────────────────────────────
/**
 * Validate and return a safe voice name. Falls back to "Kore" if invalid.
 */
export function validateVoice(voice?: unknown): GeminiVoice {
  if (typeof voice !== "string") return "Kore";
  const capitalised = voice.charAt(0).toUpperCase() + voice.slice(1).toLowerCase();
  if ((ALLOWED_VOICES as readonly string[]).includes(capitalised)) {
    return capitalised as GeminiVoice;
  }
  return "Kore";
}

// ── Request validation ────────────────────────────────────────────
export interface TTSRequestBody {
  text?: unknown;
  voice?: unknown;
  language?: unknown;
}

export function validateTTSRequest(body: TTSRequestBody): {
  valid: true;
  text: string;
  voice: GeminiVoice;
  language?: string;
} | { valid: false; error: string } {
  if (body.text === undefined || body.text === null) {
    return { valid: false, error: "text (string) is required" };
  }
  if (typeof body.text !== "string") {
    return { valid: false, error: "text (string) is required" };
  }

  const text = body.text.trim();
  if (text.length === 0) {
    return { valid: false, error: "text must not be empty" };
  }
  if (text.length > 5000) {
    return { valid: false, error: "text must be 5000 characters or less" };
  }

  const voice = validateVoice(body.voice);

  let language: string | undefined;
  if (body.language && typeof body.language === "string") {
    language = body.language.trim() || undefined;
  }

  return { valid: true, text, voice, language };
}

// ── Gemini API call ───────────────────────────────────────────────
const GEMINI_TTS_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent";

interface GeminiTTSResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          data?: string; // base64-encoded PCM
        };
      }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

/**
 * Call the Gemini TTS API and return the raw PCM audio Buffer.
 */
export async function callGeminiTTS(
  text: string,
  voice: GeminiVoice,
  language?: string,
): Promise<Buffer> {
  const apiKey = ENV.googleApiKey;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }

  // Build prompt with language hint if provided
  const promptText = language
    ? `Please read the following text aloud in ${language}:\n\n${text}`
    : text;

  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  };

  const url = `${GEMINI_TTS_URL}?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (response.status === 429) {
    throw new Error("Gemini TTS rate limit exceeded — please try again later");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Gemini TTS API error: ${response.status} ${response.statusText}${errorBody ? ` — ${errorBody}` : ""}`,
    );
  }

  const data = (await response.json()) as GeminiTTSResponse;

  if (data.error) {
    throw new Error(`Gemini TTS API error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Gemini TTS returned no audio data");
  }

  return Buffer.from(base64Audio, "base64");
}

// ── Express Handler ──────────────────────────────────────────────
/**
 * POST /api/tts
 *
 * Request body:
 *   text     (string, required) — text to synthesize, up to 5000 chars
 *   voice    (string, optional) — voice name, defaults to "Kore"
 *   language (string, optional) — language hint, e.g. "Arabic"
 *
 * Response: audio/wav streaming body
 */
export async function ttsHandler(req: Request, res: Response): Promise<void> {
  try {
    const validation = validateTTSRequest(req.body as TTSRequestBody);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const { text, voice, language } = validation;

    console.log(`[TTS] Generating speech: voice=${voice}, lang=${language || "auto"}, text="${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`);

    const pcmBuffer = await callGeminiTTS(text, voice, language);
    const wavBuffer = pcmToWav(pcmBuffer);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", wavBuffer.length);
    res.setHeader("Cache-Control", "no-cache");

    // Stream the WAV data
    res.write(wavBuffer);
    res.end();

    console.log(`[TTS] Sent ${wavBuffer.length} bytes of WAV audio`);
  } catch (error) {
    console.error("[/api/tts] Error:", error);

    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : "Internal server error";

      // Detect rate limit errors for proper status code
      if (message.includes("rate limit")) {
        res.status(429).json({ error: message });
        return;
      }

      // Detect missing API key
      if (message.includes("not configured")) {
        res.status(503).json({ error: message });
        return;
      }

      // Detect upstream API errors
      if (message.includes("API error")) {
        res.status(502).json({ error: message });
        return;
      }

      res.status(500).json({ error: "TTS generation failed" });
    }
  }
}