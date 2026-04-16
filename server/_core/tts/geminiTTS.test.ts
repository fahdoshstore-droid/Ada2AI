/**
 * Tests for Gemini TTS handler
 *
 * Covers:
 * - WAV header generation (correct RIFF, fmt, data chunk fields)
 * - pcmToWav conversion
 * - Request validation (empty text, missing params, too-long text)
 * - Voice name validation
 * - Mocked Gemini API call
 */
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

// ── Mock ENV before importing the module under test ──────────────
vi.mock("../env", () => ({
  ENV: { googleApiKey: "test-api-key-for-vitest" },
}));

import {
  buildWavHeader,
  pcmToWav,
  validateVoice,
  validateTTSRequest,
  callGeminiTTS,
} from "./geminiTTS";

// ── WAV Header Tests ──────────────────────────────────────────────

describe("buildWavHeader", () => {
  it("should produce exactly 44 bytes", () => {
    const header = buildWavHeader(1000);
    expect(header.length).toBe(44);
  });

  it("should start with 'RIFF'", () => {
    const header = buildWavHeader(500);
    expect(header.toString("ascii", 0, 4)).toBe("RIFF");
  });

  it("should contain 'WAVE' at offset 8", () => {
    const header = buildWavHeader(500);
    expect(header.toString("ascii", 8, 12)).toBe("WAVE");
  });

  it("should contain 'fmt ' at offset 12", () => {
    const header = buildWavHeader(500);
    expect(header.toString("ascii", 12, 16)).toBe("fmt ");
  });

  it("should contain 'data' at offset 36", () => {
    const header = buildWavHeader(500);
    expect(header.toString("ascii", 36, 40)).toBe("data");
  });

  it("should encode correct file size (36 + data length)", () => {
    const header = buildWavHeader(12345);
    const fileSize = header.readUInt32LE(4);
    expect(fileSize).toBe(36 + 12345);
  });

  it("should encode fmt chunk size as 16", () => {
    const header = buildWavHeader(100);
    expect(header.readUInt32LE(16)).toBe(16);
  });

  it("should encode audio format as 1 (PCM)", () => {
    const header = buildWavHeader(100);
    expect(header.readUInt16LE(20)).toBe(1);
  });

  it("should encode 1 channel (mono)", () => {
    const header = buildWavHeader(100);
    expect(header.readUInt16LE(22)).toBe(1);
  });

  it("should encode sample rate as 24000", () => {
    const header = buildWavHeader(100);
    expect(header.readUInt32LE(24)).toBe(24000);
  });

  it("should encode byte rate as 48000 (24000 * 1 * 2)", () => {
    const header = buildWavHeader(100);
    expect(header.readUInt32LE(28)).toBe(48000);
  });

  it("should encode block align as 2 (1 channel * 2 bytes)", () => {
    const header = buildWavHeader(100);
    expect(header.readUInt16LE(32)).toBe(2);
  });

  it("should encode bits per sample as 16", () => {
    const header = buildWavHeader(100);
    expect(header.readUInt16LE(34)).toBe(16);
  });

  it("should encode data sub-chunk size correctly", () => {
    const header = buildWavHeader(9999);
    expect(header.readUInt32LE(40)).toBe(9999);
  });

  it("should handle zero-length PCM data", () => {
    const header = buildWavHeader(0);
    expect(header.readUInt32LE(4)).toBe(36);
    expect(header.readUInt32LE(40)).toBe(0);
  });

  it("should handle large PCM data sizes", () => {
    const header = buildWavHeader(10_000_000);
    expect(header.readUInt32LE(4)).toBe(36 + 10_000_000);
    expect(header.readUInt32LE(40)).toBe(10_000_000);
  });
});

// ── pcmToWav Tests ────────────────────────────────────────────────

describe("pcmToWav", () => {
  it("should prepend a 44-byte WAV header to PCM data", () => {
    const pcm = Buffer.alloc(100, 0xab);
    const wav = pcmToWav(pcm);
    expect(wav.length).toBe(44 + 100);
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    // PCM data should be appended after header
    expect(wav.slice(44).equals(pcm)).toBe(true);
  });

  it("should produce a valid WAV for empty PCM", () => {
    const pcm = Buffer.alloc(0);
    const wav = pcmToWav(pcm);
    expect(wav.length).toBe(44);
    expect(wav.readUInt32LE(40)).toBe(0);
  });

  it("should produce correct file size field", () => {
    const pcm = Buffer.alloc(2000);
    const wav = pcmToWav(pcm);
    expect(wav.readUInt32LE(4)).toBe(36 + 2000);
  });
});

// ── Voice Validation Tests ────────────────────────────────────────

describe("validateVoice", () => {
  it("should return 'Kore' for undefined input", () => {
    expect(validateVoice(undefined)).toBe("Kore");
  });

  it("should return 'Kore' for null input", () => {
    expect(validateVoice(null as any)).toBe("Kore");
  });

  it("should return 'Kore' for non-string input", () => {
    expect(validateVoice(123 as any)).toBe("Kore");
  });

  it("should return 'Kore' for unknown voice name", () => {
    expect(validateVoice("UnknownVoice")).toBe("Kore");
  });

  it("should accept valid voice names case-insensitively", () => {
    expect(validateVoice("kore")).toBe("Kore");
    expect(validateVoice("KORE")).toBe("Kore");
    expect(validateVoice("puck")).toBe("Puck");
    expect(validateVoice("CHARON")).toBe("Charon");
    expect(validateVoice("aoede")).toBe("Aoede");
    expect(validateVoice("Zephyr")).toBe("Zephyr");
    expect(validateVoice("enceladus")).toBe("Enceladus");
  });

  it("should correctly capitalise already-valid names", () => {
    expect(validateVoice("Kore")).toBe("Kore");
    expect(validateVoice("Puck")).toBe("Puck");
  });

  it("should reject empty string", () => {
    expect(validateVoice("")).toBe("Kore");
  });
});

// ── Request Validation Tests ──────────────────────────────────────

describe("validateTTSRequest", () => {
  it("should reject missing text field", () => {
    const result = validateTTSRequest({});
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("required");
  });

  it("should reject non-string text", () => {
    const result = validateTTSRequest({ text: 42 });
    expect(result.valid).toBe(false);
  });

  it("should reject empty text", () => {
    const result = validateTTSRequest({ text: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("empty");
  });

  it("should reject whitespace-only text", () => {
    const result = validateTTSRequest({ text: "   " });
    expect(result.valid).toBe(false);
  });

  it("should reject text exceeding 5000 characters", () => {
    const result = validateTTSRequest({ text: "x".repeat(5001) });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("5000");
  });

  it("should accept exactly 5000 characters", () => {
    const result = validateTTSRequest({ text: "x".repeat(5000) });
    expect(result.valid).toBe(true);
  });

  it("should accept valid text with default voice", () => {
    const result = validateTTSRequest({ text: "Hello world" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.text).toBe("Hello world");
      expect(result.voice).toBe("Kore");
      expect(result.language).toBeUndefined();
    }
  });

  it("should accept valid text with custom voice", () => {
    const result = validateTTSRequest({ text: "مرحبا", voice: "Puck" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.text).toBe("مرحبا");
      expect(result.voice).toBe("Puck");
    }
  });

  it("should accept valid text with language hint", () => {
    const result = validateTTSRequest({ text: "Hello", language: "Arabic" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.language).toBe("Arabic");
    }
  });

  it("should ignore empty language string", () => {
    const result = validateTTSRequest({ text: "Hello", language: "  " });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.language).toBeUndefined();
    }
  });

  it("should ignore non-string language", () => {
    const result = validateTTSRequest({ text: "Hello", language: 123 });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.language).toBeUndefined();
    }
  });

  it("should fallback invalid voice to Kore", () => {
    const result = validateTTSRequest({ text: "Hello", voice: "NonExistent" });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.voice).toBe("Kore");
    }
  });

  it("should trim text", () => {
    const result = validateTTSRequest({ text: "  hello  " });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.text).toBe("hello");
    }
  });
});

// ── Mocked Gemini API Tests ──────────────────────────────────────

describe("callGeminiTTS (mocked)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it("should throw if GOOGLE_API_KEY is not set", async () => {
    // The vi.mock at the top sets googleApiKey to a test key.
    // Temporarily modify the mocked object to empty string.
    const { ENV } = await import("../env");
    const savedKey = ENV.googleApiKey;
    ENV.googleApiKey = "";

    try {
      await expect(callGeminiTTS("hello", "Kore")).rejects.toThrow("not configured");
    } finally {
      ENV.googleApiKey = savedKey;
    }
  });

  it("should return PCM buffer on successful API response", async () => {
    // Create a fake PCM audio buffer (silence)
    const fakePcm = Buffer.alloc(4800, 0x00); // 0.1 second of silence at 24kHz 16-bit
    const fakeBase64 = fakePcm.toString("base64");

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: fakeBase64,
                  },
                },
              ],
            },
          },
        ],
      }),
    }) as any;

    const pcm = await callGeminiTTS("مرحبا بالعالم", "Kore", "Arabic");
    expect(pcm).toBeInstanceOf(Buffer);
    expect(pcm.length).toBe(4800);
  });

  it("should throw on 429 rate limit", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      text: vi.fn().mockResolvedValue("Rate limited"),
    }) as any;

    await expect(callGeminiTTS("hello", "Kore")).rejects.toThrow("rate limit");
  });

  it("should throw on other API errors", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: vi.fn().mockResolvedValue("Server error"),
    }) as any;

    await expect(callGeminiTTS("hello", "Kore")).rejects.toThrow("API error");
  });

  it("should throw when no audio data in response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        candidates: [{ content: { parts: [{}] } }],
      }),
    }) as any;

    await expect(callGeminiTTS("hello", "Kore")).rejects.toThrow("no audio data");
  });

  it("should throw on Gemini API error in response body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        error: { message: "Invalid voice", code: 400 },
      }),
    }) as any;

    await expect(callGeminiTTS("hello", "Kore")).rejects.toThrow("Invalid voice");
  });

  it("should include language hint in prompt when provided", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { data: Buffer.alloc(100).toString("base64") } }],
            },
          },
        ],
      }),
    });
    globalThis.fetch = mockFetch as any;

    await callGeminiTTS("سلام", "Kore", "Arabic");

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.contents[0].parts[0].text).toContain("Arabic");
    expect(body.contents[0].parts[0].text).toContain("سلام");
  });

  it("should not include language prefix when no language hint", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { data: Buffer.alloc(100).toString("base64") } }],
            },
          },
        ],
      }),
    });
    globalThis.fetch = mockFetch as any;

    await callGeminiTTS("Hello world", "Puck");

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.contents[0].parts[0].text).toBe("Hello world");
    expect(body.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe("Puck");
  });

  it("should send correct Gemini API URL with key", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { data: Buffer.alloc(100).toString("base64") } }],
            },
          },
        ],
      }),
    });
    globalThis.fetch = mockFetch as any;

    await callGeminiTTS("test", "Kore");

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toContain("generativelanguage.googleapis.com");
    expect(callArgs[0]).toContain("gemini-3.1-flash-tts-preview");
    expect(callArgs[0]).toContain("key=test-api-key-for-vitest");
    expect(callArgs[1].method).toBe("POST");
  });

  it("should send correct generationConfig structure", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { data: Buffer.alloc(100).toString("base64") } }],
            },
          },
        ],
      }),
    });
    globalThis.fetch = mockFetch as any;

    await callGeminiTTS("test", "Aoede");

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.generationConfig.responseModalities).toEqual(["AUDIO"]);
    expect(body.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe("Aoede");
  });
});