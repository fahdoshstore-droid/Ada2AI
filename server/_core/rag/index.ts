/**
 * Ada2AI RAG System — Barrel Export
 *
 * Re-exports the public API of the RAG module:
 *   - Intents & types
 *   - Intent classifier
 *   - RAG chat handler
 */

// Intent registry & types
export { intents, intentMap, getIntentById, getAllIntents } from "./intents";
export type { Intent, SupabaseQuery } from "./intents";

// Classifier
export { classifyIntent } from "./classifier";
export type { ClassifyResult } from "./classifier";

// RAG chat handler
export { handleRAGQuestion } from "./ragChatHandler";