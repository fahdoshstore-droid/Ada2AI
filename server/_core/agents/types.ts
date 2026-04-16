/**
 * Multi-Agent Types — Ada2AI Agentic Architecture
 *
 * Defines the A2A (Agent-to-Agent) communication protocol:
 *   - AgentMessage: input payload sent between agents
 *   - AgentResponse: output payload returned by each agent
 *   - AgentMetadata: observability + tracing data
 */

// ── Core Types ──────────────────────────────────────────────────

export type AgentName =
  | "orchestrator"
  | "classifier"
  | "query"
  | "synthesizer"
  | "voice";

export interface AgentMetadata {
  agent: AgentName;
  timestamp: string;
  durationMs: number;
  confidence: number; // 0-1
  version: string;
}

export interface AgentMessage {
  /** Unique ID for tracing this message across agents */
  traceId: string;
  /** Which agent sent this message */
  from: AgentName;
  /** Which agent should receive this message */
  to: AgentName;
  /** The payload — type varies by target agent */
  payload: unknown;
  /** Metadata from previous agent in the chain */
  previousMeta?: AgentMetadata;
}

export interface AgentResponse {
  success: boolean;
  data: unknown;
  meta: AgentMetadata;
  /** If failed, human-readable error */
  error?: string;
}

// ── Agent-Specific Payloads ─────────────────────────────────────

/** Payload for ClassifierAgent */
export interface ClassifierInput {
  question: string;
  language?: string;
}

export interface ClassifierOutput {
  intentId: string;
  intentKeywords: string[];
  params: Record<string, string>;
  confidence: number;
}

/** Payload for QueryAgent */
export interface QueryInput {
  intentId: string;
  params: Record<string, string>;
}

export interface QueryOutput {
  table: string;
  data: unknown[] | null;
  count: number | null;
  error: string | null;
}

/** Payload for SynthesizerAgent */
export interface SynthesizerInput {
  question: string;
  intentId: string;
  intentContext: string;
  params: Record<string, string>;
  queryData: QueryOutput;
}

export interface SynthesizerOutput {
  text: string;
  language: string;
}

/** Payload for VoiceAgent */
export interface VoiceInput {
  text: string;
  voice?: string;
  language?: string;
}

export interface VoiceOutput {
  audioBuffer: Buffer;
  format: "wav";
  sizeBytes: number;
}

// ── Orchestrator Pipeline Result ────────────────────────────────

export interface PipelineResult {
  traceId: string;
  classification: ClassifierOutput;
  query: QueryOutput;
  synthesis: SynthesizerOutput;
  voice?: VoiceOutput;
  /** Full trace of all agent responses for observability */
  trace: AgentMetadata[];
  totalDurationMs: number;
}

// ── Agent Interface ─────────────────────────────────────────────

export interface Agent {
  name: AgentName;
  execute(input: unknown, traceId: string): Promise<AgentResponse>;
}