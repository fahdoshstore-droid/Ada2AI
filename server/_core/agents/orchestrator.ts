/**
 * Orchestrator Agent — Ada2AI Multi-Agent System
 *
 * Central coordinator that chains agents in the A2A pipeline:
 *   1. ClassifierAgent → classifies intent + extracts params
 *   2. QueryAgent → executes Supabase query based on intent
 *   3. SynthesizerAgent → generates natural language response
 *   4. VoiceAgent → converts text to speech (optional)
 *
 * Supports both sync (full response) and stream (text streaming) modes.
 * Provides full observability trace for each pipeline run.
 */

import { randomUUID } from "crypto";
import type { Response } from "express";
import { classifierAgent } from "./classifier";
import { queryAgent } from "./query";
import { synthesizerAgent } from "./synthesizer";
import { voiceAgent } from "./voice";
import type {
  AgentMetadata,
  ClassifierOutput,
  PipelineResult,
  QueryOutput,
  SynthesizerOutput,
  VoiceOutput,
  VoiceInput,
} from "./types";

const AGENT_VERSION = "1.0.0";

class OrchestratorAgent {
  /**
   * Full sync pipeline — runs all agents sequentially and returns final result.
   * If `includeVoice` is true, also runs the VoiceAgent.
   */
  async runPipeline(
    question: string,
    options?: { includeVoice?: boolean; voiceName?: string; language?: string },
  ): Promise<PipelineResult> {
    const pipelineStart = Date.now();
    const traceId = randomUUID();
    const trace: AgentMetadata[] = [];

    // ── Step 1: Classify ────────────────────────────────────────
    console.log(`[Orchestrator] ${traceId} → ClassifierAgent`);
    const classifyResult = await classifierAgent.execute({ question }, traceId);
    trace.push(classifyResult.meta);

    if (!classifyResult.success || !classifyResult.data) {
      return this.buildErrorResult(traceId, trace, pipelineStart, classifyResult.error ?? "Classification failed");
    }

    const classification = classifyResult.data as ClassifierOutput;

    // ── Step 2: Query ───────────────────────────────────────────
    console.log(`[Orchestrator] ${traceId} → QueryAgent (intent: ${classification.intentId})`);
    const queryResult = await queryAgent.execute(
      { intentId: classification.intentId, params: classification.params },
      traceId,
    );
    trace.push(queryResult.meta);

    const queryData = (queryResult.data as QueryOutput) ?? {
      table: "",
      data: null,
      count: null,
      error: queryResult.error ?? "Query failed",
    };

    // ── Step 3: Synthesize ──────────────────────────────────────
    console.log(`[Orchestrator] ${traceId} → SynthesizerAgent`);
    const synthResult = await synthesizerAgent.execute(
      {
        question,
        intentId: classification.intentId,
        intentContext: "",
        params: classification.params,
        queryData,
      },
      traceId,
    );
    trace.push(synthResult.meta);

    if (!synthResult.success || !synthResult.data) {
      return this.buildErrorResult(traceId, trace, pipelineStart, synthResult.error ?? "Synthesis failed");
    }

    const synthesis = synthResult.data as SynthesizerOutput;

    // ── Step 4: Voice (optional) ────────────────────────────────
    let voice: VoiceOutput | undefined;
    if (options?.includeVoice) {
      console.log(`[Orchestrator] ${traceId} → VoiceAgent`);
      const voiceInput: VoiceInput = {
        text: synthesis.text,
        voice: options.voiceName,
        language: options.language,
      };
      const voiceResult = await voiceAgent.execute(voiceInput, traceId);
      trace.push(voiceResult.meta);

      if (voiceResult.success && voiceResult.data) {
        voice = voiceResult.data as VoiceOutput;
      }
    }

    const totalDurationMs = Date.now() - pipelineStart;
    console.log(`[Orchestrator] ${traceId} ✓ Complete in ${totalDurationMs}ms`);

    return {
      traceId,
      classification,
      query: queryData,
      synthesis,
      voice,
      trace,
      totalDurationMs,
    };
  }

  /**
   * Streaming pipeline — runs classifier + query, then streams the synthesizer
   * output directly to the HTTP response.
   */
  async runStreamPipeline(
    question: string,
    res: Response,
  ): Promise<void> {
    const pipelineStart = Date.now();
    const traceId = randomUUID();

    try {
      // Step 1: Classify
      console.log(`[Orchestrator] ${traceId} → ClassifierAgent (stream)`);
      const classifyResult = await classifierAgent.execute({ question }, traceId);

      if (!classifyResult.success || !classifyResult.data) {
        res.status(500).json({ error: classifyResult.error ?? "Classification failed" });
        return;
      }

      const classification = classifyResult.data as ClassifierOutput;

      // Step 2: Query
      console.log(`[Orchestrator] ${traceId} → QueryAgent (stream, intent: ${classification.intentId})`);
      const queryResult = await queryAgent.execute(
        { intentId: classification.intentId, params: classification.params },
        traceId,
      );

      const queryData = (queryResult.data as QueryOutput) ?? {
        table: "",
        data: null,
        count: null,
        error: queryResult.error ?? "Query failed",
      };

      // Step 3: Stream synthesizer output
      console.log(`[Orchestrator] ${traceId} → SynthesizerAgent (streaming)`);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("X-Trace-Id", traceId);
      res.setHeader("X-Intent-Id", classification.intentId);
      res.setHeader("X-Confidence", String(classification.confidence));
      res.setHeader("X-Agent-Version", AGENT_VERSION);

      const stream = await synthesizerAgent.executeStream(
        {
          question,
          intentId: classification.intentId,
          intentContext: "",
          params: classification.params,
          queryData,
        },
        traceId,
      );

      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
        res.end();
      }

      const totalDurationMs = Date.now() - pipelineStart;
      console.log(`[Orchestrator] ${traceId} ✓ Stream complete in ${totalDurationMs}ms`);
    } catch (error) {
      console.error(`[Orchestrator] ${traceId} Error:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  private buildErrorResult(
    traceId: string,
    trace: AgentMetadata[],
    pipelineStart: number,
    error: string,
  ): PipelineResult {
    return {
      traceId,
      classification: { intentId: "error", intentKeywords: [], params: {}, confidence: 0 },
      query: { table: "", data: null, count: null, error },
      synthesis: { text: "", language: "ar" },
      trace,
      totalDurationMs: Date.now() - pipelineStart,
    };
  }
}

export const orchestratorAgent = new OrchestratorAgent();