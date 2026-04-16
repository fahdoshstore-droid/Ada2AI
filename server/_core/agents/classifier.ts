/**
 * Classifier Agent — Ada2AI Multi-Agent System
 *
 * Analyzes user questions and classifies them into intents.
 * Extracts structured parameters (sport, region, playerName, table).
 *
 * A2A Protocol: receives ClassifierInput, returns AgentResponse with ClassifierOutput.
 */

import { classifyIntent, type ClassifyResult } from "../rag/classifier";
import { getIntentById } from "../rag/intents";
import type {
  Agent,
  AgentMetadata,
  AgentName,
  AgentResponse,
  ClassifierInput,
  ClassifierOutput,
} from "./types";

const AGENT_NAME: AgentName = "classifier";
const AGENT_VERSION = "1.0.0";

class ClassifierAgent implements Agent {
  name = AGENT_NAME;

  async execute(input: unknown, traceId: string): Promise<AgentResponse> {
    const start = Date.now();
    const { question } = input as ClassifierInput;

    if (!question || typeof question !== "string") {
      return this.fail("question (string) is required", traceId, start);
    }

    try {
      const result: ClassifyResult = classifyIntent(question);
      const output: ClassifierOutput = {
        intentId: result.intent.id,
        intentKeywords: result.intent.keywords.slice(0, 10),
        params: result.params,
        confidence: this.computeConfidence(result),
      };

      return {
        success: true,
        data: output,
        meta: this.buildMeta(traceId, start, output.confidence),
      };
    } catch (err) {
      return this.fail(
        err instanceof Error ? err.message : "Classification failed",
        traceId,
        start,
      );
    }
  }

  private computeConfidence(result: ClassifyResult): number {
    // If fallback intent → low confidence
    if (result.intent.id === "general_sport") return 0.3;
    // Higher confidence for specific intents with params
    const hasParams = Object.keys(result.params).length > 0;
    return hasParams ? 0.9 : 0.7;
  }

  private buildMeta(
    traceId: string,
    start: number,
    confidence: number,
  ): AgentMetadata {
    return {
      agent: AGENT_NAME,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - start,
      confidence,
      version: AGENT_VERSION,
    };
  }

  private fail(
    error: string,
    traceId: string,
    start: number,
  ): AgentResponse {
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

export const classifierAgent = new ClassifierAgent();