/**
 * Query Agent — Ada2AI Multi-Agent System
 *
 * Executes Supabase database queries based on classified intent.
 * Translates intent + params into SQL-bound queries (never free-form).
 *
 * A2A Protocol: receives QueryInput, returns AgentResponse with QueryOutput.
 */

import { getIntentById } from "../rag/intents";
import { getSupabase } from "../../db";
import type {
  Agent,
  AgentMetadata,
  AgentName,
  AgentResponse,
  QueryInput,
  QueryOutput,
} from "./types";

const AGENT_NAME: AgentName = "query";
const AGENT_VERSION = "1.0.0";

class QueryAgent implements Agent {
  name = AGENT_NAME;

  async execute(input: unknown, traceId: string): Promise<AgentResponse> {
    const start = Date.now();
    const { intentId, params } = input as QueryInput;

    if (!intentId || typeof intentId !== "string") {
      return this.fail("intentId (string) is required", traceId, start);
    }

    const intent = getIntentById(intentId);
    if (!intent) {
      return this.fail(`Unknown intent: ${intentId}`, traceId, start);
    }

    const supabase = getSupabase();
    if (!supabase) {
      const output: QueryOutput = {
        table: "",
        data: null,
        count: null,
        error: "Supabase client not available",
      };
      return {
        success: false,
        data: output,
        error: "Supabase client not available",
        meta: this.buildMeta(traceId, start, 0.1),
      };
    }

    try {
      const supabaseQuery = intent.buildQuery(supabase, params);
      const result = await supabaseQuery.execute();
      const output: QueryOutput = {
        table: supabaseQuery.table,
        data: result.data,
        count: result.count,
        error: result.error?.message ?? null,
      };

      const confidence = result.error ? 0.3 : output.data?.length ? 0.95 : 0.6;

      return {
        success: !result.error,
        data: output,
        meta: this.buildMeta(traceId, start, confidence),
      };
    } catch (err) {
      return this.fail(
        err instanceof Error ? err.message : "Query execution failed",
        traceId,
        start,
      );
    }
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

export const queryAgent = new QueryAgent();