/**
 * Voice Agent — Ada2AI Multi-Agent System
 *
 * Converts text responses to speech audio using Gemini TTS.
 * Wraps the existing geminiTTS module in the A2A protocol.
 *
 * A2A Protocol: receives VoiceInput, returns AgentResponse with VoiceOutput.
 */

import { callGeminiTTS, pcmToWav, validateVoice, type GeminiVoice } from "../tts/geminiTTS";
import type {
  Agent,
  AgentMetadata,
  AgentName,
  AgentResponse,
  VoiceInput,
  VoiceOutput,
} from "./types";

const AGENT_NAME: AgentName = "voice";
const AGENT_VERSION = "1.0.0";

class VoiceAgent implements Agent {
  name = AGENT_NAME;

  async execute(input: unknown, traceId: string): Promise<AgentResponse> {
    const start = Date.now();
    const { text, voice, language } = input as VoiceInput;

    if (!text || typeof text !== "string") {
      return this.fail("text (string) is required", traceId, start);
    }

    if (text.length === 0) {
      return this.fail("text must not be empty", traceId, start);
    }

    try {
      const safeVoice: GeminiVoice = validateVoice(voice);
      const pcmBuffer = await callGeminiTTS(text, safeVoice, language);
      const wavBuffer = pcmToWav(pcmBuffer);

      const output: VoiceOutput = {
        audioBuffer: wavBuffer,
        format: "wav",
        sizeBytes: wavBuffer.length,
      };

      return {
        success: true,
        data: output,
        meta: this.buildMeta(traceId, start, 0.9),
      };
    } catch (err) {
      return this.fail(
        err instanceof Error ? err.message : "TTS generation failed",
        traceId,
        start,
      );
    }
  }

  private buildMeta(traceId: string, start: number, confidence: number): AgentMetadata {
    return {
      agent: AGENT_NAME,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - start,
      confidence,
      version: AGENT_VERSION,
    };
  }

  private fail(error: string, traceId: string, start: number): AgentResponse {
    return {
      success: false,
      data: null,
      error,
      meta: {
        agent: AGENT_NAME,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - start,
        confidence: 0,
        version: AGENT_VERSION,
      },
    };
  }
}

export const voiceAgent = new VoiceAgent();