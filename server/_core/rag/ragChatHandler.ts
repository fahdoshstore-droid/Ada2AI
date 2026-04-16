/**
 * RAG Chat Handler — Ada2AI RAG System
 *
 * Orchestrates the full RAG pipeline:
 *   1. Classify the user's question → intent + params
 *   2. Execute the Supabase query defined by the intent
 *   3. Build a context string from the retrieved data
 *   4. Call the LLM (via streamText or Google GenAI SDK) with the context + question
 *   5. Return the text stream for the HTTP response
 */

import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../env";
import { createPatchedFetch } from "../patchedFetch";
import { getSupabase } from "../../db";
import { classifyIntent, type ClassifyResult } from "./classifier";
import type { Intent } from "./intents";

// ─── LLM Provider (multi-provider: google / kimi / ollama / forge / anthropic) ──────────

type LLMModel = ReturnType<ReturnType<typeof createOpenAI>["chat"]> | ReturnType<ReturnType<typeof createAnthropic>["languageModel"]>;

function createLLMModel(): LLMModel {
  const provider = ENV.ragProvider;

  // Google Gemini is handled separately via the native SDK — not here
  if (provider === "google") {
    throw new Error("[RAG] Google provider should use the native GenAI SDK, not createLLMModel()");
  }

  // 2. Kimi / Moonshot AI — OpenAI-compatible, great Arabic support
  if (provider === "kimi") {
    if (!ENV.kimiApiKey) {
      throw new Error("[RAG] KIMI_API_KEY not configured — set it or use RAG_PROVIDER=ollama");
    }
    const kimi = createOpenAI({
      baseURL: ENV.kimiBaseUrl,
      apiKey: ENV.kimiApiKey,
    });
    return kimi.chat(ENV.kimiModel);
  }

  // 3. Ollama (local, free, offline) — uses OpenAI-compatible API at /v1
  if (provider === "ollama") {
    const ollama = createOpenAI({
      baseURL: `${ENV.ollamaBaseUrl}/v1`,
      apiKey: "ollama", // Ollama doesn't require a key
    });
    return ollama.chat(ENV.ollamaModel);
  }

  // 4. Forge (OpenAI-compatible cloud proxy)
  if (provider === "forge") {
    if (!ENV.forgeApiUrl) {
      throw new Error("[RAG] BUILT_IN_FORGE_API_URL not configured — set it or use RAG_PROVIDER=kimi");
    }
    const baseURL = ENV.forgeApiUrl.endsWith("/v1")
      ? ENV.forgeApiUrl
      : `${ENV.forgeApiUrl}/v1`;
    const forge = createOpenAI({
      baseURL,
      apiKey: ENV.forgeApiKey || "unused",
      fetch: createPatchedFetch(fetch),
    });
    return forge.chat("gpt-4o");
  }

  // 5. Anthropic (cloud, direct)
  if (provider === "anthropic") {
    if (!ENV.anthropicApiKey) {
      throw new Error("[RAG] ANTHROPIC_API_KEY not configured — set it or use RAG_PROVIDER=kimi");
    }
    const anthropic = createAnthropic({ apiKey: ENV.anthropicApiKey });
    return anthropic.languageModel("claude-sonnet-4-20250514");
  }

  throw new Error(`[RAG] Unknown RAG_PROVIDER: "${provider}" — use "google", "kimi", "ollama", "forge", or "anthropic"`);
}

// ─── System Prompt ────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Ada2AI, a knowledgeable sports assistant for Saudi Arabia's athletic ecosystem.
You MUST follow these rules:
1. Answer in the SAME LANGUAGE as the user's question (Arabic or English).
2. Base your answer ONLY on the data provided in the context below. Do NOT fabricate information.
3. If the context data is empty or null, say you don't have the information rather than guessing.
4. Be concise and direct — avoid unnecessary filler.
5. When presenting lists or comparisons, use clear formatting.
6. For count questions, just give the number with a brief sentence.`;

// ─── Context Builder ──────────────────────────────────────────────────

function buildContext(
  classification: ClassifyResult,
  data: unknown[] | null,
  count: number | null,
): string {
  const { intent, params } = classification;

  const parts: string[] = [
    `Intent: ${intent.id}`,
    `Context description: ${intent.responseContext}`,
  ];

  if (Object.keys(params).length > 0) {
    parts.push(`Extracted params: ${JSON.stringify(params)}`);
  }

  if (count !== null) {
    parts.push(`Total count: ${count}`);
  }

  if (data && data.length > 0) {
    parts.push(`Data (${data.length} records):`);
    parts.push(JSON.stringify(data, null, 2));
  } else if (data === null || data.length === 0) {
    parts.push("Data: No matching records found.");
  }

  return parts.join("\n");
}

// ─── Google GenAI Streaming Result ────────────────────────────────────

/**
 * Wraps a Google GenAI streaming response into an object that mimics the
 * Vercel AI SDK streamText() result — specifically exposing a `textStream`
 * ReadableStream<string> that the Express route can pipe to the HTTP response.
 */
interface GoogleStreamResult {
  textStream: ReadableStream<string>;
}

async function streamGoogleGenAI(systemPrompt: string, userMessage: string): Promise<GoogleStreamResult> {
  if (!ENV.googleApiKey) {
    throw new Error("[RAG] GOOGLE_API_KEY not configured — set it or use RAG_PROVIDER=kimi");
  }

  const genAI = new GoogleGenerativeAI(ENV.googleApiKey);
  const model = genAI.getGenerativeModel({ model: ENV.googleModel });

  try {
    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      systemInstruction: systemPrompt,
    });

    // Convert the Google SDK async iterable into a Web ReadableStream<string>
    const textStream = new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(text);
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return { textStream };
  } catch (err) {
    // Fallback to non-streaming if streaming fails (e.g., high demand)
    console.warn(`[RAG] Google streaming failed, falling back to non-streaming: ${err instanceof Error ? err.message : String(err)}`);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      systemInstruction: systemPrompt,
    });
    const text = result.response.text();
    
    // Return a simple ReadableStream that emits the full text once
    const textStream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue(text);
        controller.close();
      },
    });
    
    return { textStream };
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────

/**
 * Handle a RAG question: classify, query, build context, stream LLM response.
 * Returns an object with a `textStream` (ReadableStream<string>) that can be
 * piped to an HTTP response.
 */
export async function handleRAGQuestion(question: string) {
  // 1. Classify intent & extract params
  const classification = classifyIntent(question);
  const { intent, params } = classification;

  // 2. Execute the Supabase query
  const supabase = getSupabase();
  let data: unknown[] | null = null;
  let count: number | null = null;
  let queryError: string | null = null;

  if (supabase) {
    try {
      const supabaseQuery = intent.buildQuery(supabase, params);
      const result = await supabaseQuery.execute();
      data = result.data;
      count = result.count;
      if (result.error) queryError = result.error.message;
    } catch (err) {
      queryError = err instanceof Error ? err.message : String(err);
    }
  } else {
    queryError = "Supabase client not available";
  }

  // 3. Build context string
  const context = buildContext(classification, data, count);

  if (queryError) {
    console.warn(`[RAG] Query error for intent "${intent.id}": ${queryError}`);
  }

  // 4. Build the user message combining context + question
  const userMessage = `## Retrieved Data\n${context}\n\n## User Question\n${question}`;

  // 5. Stream LLM response — use native Google GenAI SDK for google provider,
  //    otherwise use the Vercel AI SDK streamText() path
  const provider = ENV.ragProvider;

  if (provider === "google") {
    return streamGoogleGenAI(SYSTEM_PROMPT, userMessage);
  }

  const model = createLLMModel();

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    prompt: userMessage,
  });

  return result;
}