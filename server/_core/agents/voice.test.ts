/**
 * VoiceAgent Tests — Ada2AI Multi-Agent System
 */
import { describe, it, expect, vi } from "vitest";
import { voiceAgent } from "./voice";
import type { VoiceOutput } from "./types";

// Mock geminiTTS module
vi.mock("../tts/geminiTTS", () => ({
  callGeminiTTS: vi.fn().mockResolvedValue(Buffer.from("fake-pcm-data")),
  pcmToWav: vi.fn().mockReturnValue(Buffer.alloc(100)), // 100-byte fake WAV
  validateVoice: vi.fn((v) => v || "Kore"),
}));

describe("VoiceAgent", () => {
  it("should convert text to WAV audio", async () => {
    const result = await voiceAgent.execute(
      { text: "ألف مبروك يا بطل", voice: "Kore" },
      "test-trace-v1",
    );

    expect(result.success).toBe(true);
    const output = result.data as VoiceOutput;
    expect(output.format).toBe("wav");
    expect(output.sizeBytes).toBeGreaterThan(0);
  });

  it("should use default voice if not specified", async () => {
    const result = await voiceAgent.execute(
      { text: "Hello" },
      "test-trace-v2",
    );
    expect(result.success).toBe(true);
  });

  it("should fail on missing text", async () => {
    const result = await voiceAgent.execute({}, "test-trace-v3");
    expect(result.success).toBe(false);
    expect(result.error).toContain("required");
  });

  it("should fail on empty text", async () => {
    const result = await voiceAgent.execute({ text: "" }, "test-trace-v4");
    expect(result.success).toBe(false);
    expect(result.error).toContain("required");
  });

  it("should include metadata", async () => {
    const result = await voiceAgent.execute(
      { text: "test" },
      "test-trace-v5",
    );
    expect(result.meta.agent).toBe("voice");
    expect(result.meta.version).toBe("1.0.0");
  });
});