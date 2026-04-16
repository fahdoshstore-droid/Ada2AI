/**
 * Synthesizer Agent — Ada2AI Multi-Agent System
 *
 * Generates natural language responses by combining:
 *   - User's original question
 *   - Classified intent + context description
 *   - Queried data from Supabase
 *
 * Uses Google Gemini (native SDK) as primary, with multi-provider fallback.
 *
 * A2A Protocol: receives SynthesizerInput, returns AgentResponse with SynthesizerOutput.
 */

import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../env";
import { createPatchedFetch } from "../patchedFetch";
import { getIntentById } from "../rag/intents";
import type {
  Agent,
  AgentMetadata,
  AgentName,
  AgentResponse,
  SynthesizerInput,
  SynthesizerOutput,
  QueryOutput,
} from "./types";

const AGENT_NAME: AgentName = "synthesizer";
const AGENT_VERSION = "1.0.0";

const SYSTEM_PROMPT = `You are Ada2AI, a knowledgeable sports assistant for Saudi Arabia's athletic ecosystem.
You MUST follow these rules:
1. Answer in the SAME LANGUAGE as the user's question (Arabic or English).
2. Base your answer ONLY on the data provided in the context below. Do NOT fabricate information.
3. If the context data is empty or null, say you don't have the information rather than guessing.
4. Be concise and direct — avoid unnecessary filler.
5. When presenting lists or comparisons, use clear formatting.
6. For count questions, just give the number with a brief sentence.`;

class SynthesizerAgent implements Agent {
  name = AGENT_NAME;

  async execute(input: unknown, traceId: string): Promise<AgentResponse> {
    const start = Date.now();
    const { question, intentId, queryData, params } = input as SynthesizerInput;

    if (!question || typeof question !== "string") {
      return this.fail("question (string) is required", traceId, start);
    }

    const intent = getIntentById(intentId);
    const intentContext = intent?.responseContext ?? "General sports query";

    try {
      const context = this.buildContext(intentId, intentContext, params, queryData);
      const userMessage = `## Retrieved Data\n${context}\n\n## User Question\n${question}`;
      const text = await this.generateResponse(userMessage);
      const output: SynthesizerOutput = {
        text,
        language: this.detectLanguage(question),
      };

      return {
        success: true,
        data: output,
        meta: this.buildMeta(traceId, start, 0.85),
      };
    } catch (err) {
      return this.fail(
        err instanceof Error ? err.message : "Synthesis failed",
        traceId,
        start,
      );
    }
  }

  /**
   * Stream version — returns ReadableStream<string> for HTTP streaming
   */
  async executeStream(
    input: unknown,
    traceId: string,
  ): Promise<ReadableStream<string>> {
    const { question, intentId, queryData, params } = input as SynthesizerInput;
    const intent = getIntentById(intentId);
    const intentContext = intent?.responseContext ?? "General sports query";
    const context = this.buildContext(intentId, intentContext, params, queryData);
    const userMessage = `## Retrieved Data\n${context}\n\n## User Question\n${question}`;

    const provider = ENV.ragProvider;

    if (provider === "google") {
      return this.streamGoogleGenAI(userMessage);
    }

    const model = this.createLLMModel();
    const result = streamText({ model, system: SYSTEM_PROMPT, prompt: userMessage });
    return result.textStream;
  }

  private buildContext(
    intentId: string,
    intentContext: string,
    params: Record<string, string>,
    queryData: QueryOutput,
  ): string {
    const parts: string[] = [
      `Intent: ${intentId}`,
      `Context description: ${intentContext}`,
    ];

    if (Object.keys(params).length > 0) {
      parts.push(`Extracted params: ${JSON.stringify(params)}`);
    }

    if (queryData.count !== null) {
      parts.push(`Total count: ${queryData.count}`);
    }

    if (queryData.data && queryData.data.length > 0) {
      parts.push(`Data (${queryData.data.length} records):`);
      parts.push(JSON.stringify(queryData.data, null, 2));
    } else {
      parts.push("Data: No matching records found.");
    }

    if (queryData.error) {
      parts.push(`Query error: ${queryData.error}`);
    }

    return parts.join("\n");
  }

  private async generateResponse(userMessage: string): Promise<string> {
    const provider = ENV.ragProvider;

    if (provider === "google") {
      return this.generateGoogleResponse(userMessage);
    }

    const model = this.createLLMModel();
    const result = streamText({ model, system: SYSTEM_PROMPT, prompt: userMessage });
    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }
    return fullText;
  }

  private async generateGoogleResponse(userMessage: string): Promise<string> {
    if (!ENV.googleApiKey) {
      throw new Error("GOOGLE_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(ENV.googleApiKey);
    const model = genAI.getGenerativeModel({ model: ENV.googleModel });

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        systemInstruction: SYSTEM_PROMPT,
      });
      return result.response.text();
    } catch (err) {
      throw new Error(
        `Google GenAI error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async streamGoogleGenAI(
    userMessage: string,
  ): Promise<ReadableStream<string>> {
    if (!ENV.googleApiKey) {
      throw new Error("GOOGLE_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(ENV.googleApiKey);
    const model = genAI.getGenerativeModel({ model: ENV.googleModel });

    try {
      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        systemInstruction: SYSTEM_PROMPT,
      });

      return new ReadableStream<string>({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) controller.enqueue(text);
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });
    } catch (err) {
      // Fallback to non-streaming
      console.warn(
        `[Synthesizer] Google streaming failed, falling back: ${err instanceof Error ? err.message : String(err)}`,
      );
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        systemInstruction: SYSTEM_PROMPT,
      });
      const text = result.response.text();
      return new ReadableStream<string>({
        start(controller) {
          controller.enqueue(text);
          controller.close();
        },
      });
    }
  }

  private createLLMModel() {
    const provider = ENV.ragProvider;

    if (provider === "kimi") {
      if (!ENV.kimiApiKey) throw new Error("KIMI_API_KEY not configured");
      const kimi = createOpenAI({ baseURL: ENV.kimiBaseUrl, apiKey: ENV.kimiApiKey });
      return kimi.chat(ENV.kimiModel);
    }

    if (provider === "ollama") {
      const ollama = createOpenAI({ baseURL: `${ENV.ollamaBaseUrl}/v1`, apiKey: "ollama" });
      return ollama.chat(ENV.ollamaModel);
    }

    if (provider === "forge") {
      if (!ENV.forgeApiUrl) throw new Error("FORGE_API_URL not configured");
      const baseURL = ENV.forgeApiUrl.endsWith("/v1") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/v1`;
      const forge = createOpenAI({ baseURL, apiKey: ENV.forgeApiKey || "unused", fetch: createPatchedFetch(fetch) });
      return forge.chat("gpt-4o");
    }

    if (provider === "anthropic") {
      if (!ENV.anthropicApiKey) throw new Error("ANTHROPIC_API_KEY not configured");
      const anthropic = createAnthropic({ apiKey: ENV.anthropicApiKey });
      return anthropic.languageModel("claude-sonnet-4-20250514");
    }

    throw new Error(`Unknown RAG_PROVIDER: "${provider}"`);
  }

  private detectLanguage(text: string): string {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? "ar" : "en";
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

export const synthesizerAgent = new SynthesizerAgent();