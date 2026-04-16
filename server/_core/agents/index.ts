/**
 * Multi-Agent System — Ada2AI
 *
 * A2A (Agent-to-Agent) architecture for Agenticthon:
 *   - OrchestratorAgent → coordinates the pipeline
 *   - ClassifierAgent → intent classification + param extraction
 *   - QueryAgent → Supabase database queries
 *   - SynthesizerAgent → LLM response generation
 *   - VoiceAgent → TTS via Gemini
 */

export { orchestratorAgent } from "./orchestrator";
export { classifierAgent } from "./classifier";
export { queryAgent } from "./query";
export { synthesizerAgent } from "./synthesizer";
export { voiceAgent } from "./voice";
export type {
  Agent,
  AgentName,
  AgentMessage,
  AgentResponse,
  AgentMetadata,
  ClassifierInput,
  ClassifierOutput,
  QueryInput,
  QueryOutput,
  SynthesizerInput,
  SynthesizerOutput,
  VoiceInput,
  VoiceOutput,
  PipelineResult,
} from "./types";