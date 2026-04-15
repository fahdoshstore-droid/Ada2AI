/**
 * AI Provider — Unified interface for vision + text analysis
 * Strategy: Anthropic Claude (primary) → Ollama local (fallback)
 * 
 * Supports:
 *   - Vision analysis (image + prompt → JSON)
 *   - Text analysis (prompt → JSON)
 * 
 * Environment:
 *   ANTHROPIC_API_KEY — if set, uses Claude (sonnet for vision, opus for scout)
 *   OLLAMA_BASE_URL    — defaults to http://localhost:11434
 *   OLLAMA_VISION_MODEL — defaults to gemma3:4b
 *   OLLAMA_TEXT_MODEL   — defaults to qwen3:14b
 */
import Anthropic from "@anthropic-ai/sdk";

// ─── Types ────────────────────────────────────────────────────────────
export interface VisionRequest {
  /** Base64-encoded image data */
  imageBase64: string;
  /** MIME type of the image */
  mediaType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  /** System prompt */
  systemPrompt: string;
  /** User message (text accompanying the image) */
  userMessage: string;
  /** Max tokens for response */
  maxTokens?: number;
}

export interface TextRequest {
  /** System prompt */
  systemPrompt: string;
  /** User message */
  userMessage: string;
  /** Max tokens for response */
  maxTokens?: number;
}

export interface AIProviderResponse {
  /** Raw text response */
  text: string;
  /** Which provider was used */
  provider: "anthropic" | "ollama";
  /** Which model was used */
  model: string;
}

// ─── Provider Detection ────────────────────────────────────────────────

function hasAnthropicKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function getOllamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL || "http://localhost:11434";
}

function getOllamaVisionModel(): string {
  return process.env.OLLAMA_VISION_MODEL || "gemma3:4b";
}

function getOllamaTextModel(): string {
  return process.env.OLLAMA_TEXT_MODEL || "qwen3:14b";
}

// ─── Anthropic Provider ────────────────────────────────────────────────

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

async function anthropicVision(req: VisionRequest, model: string): Promise<AIProviderResponse> {
  const client = getAnthropicClient();
  const mediaType = req.mediaType || "image/png";

  const response = await client.messages.create({
    model,
    max_tokens: req.maxTokens || 4096,
    system: req.systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: req.imageBase64 } },
          { type: "text", text: req.userMessage },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return {
    text: textBlock && textBlock.type === "text" ? textBlock.text : "",
    provider: "anthropic",
    model,
  };
}

async function anthropicText(req: TextRequest, model: string): Promise<AIProviderResponse> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model,
    max_tokens: req.maxTokens || 4096,
    system: req.systemPrompt,
    messages: [{ role: "user", content: req.userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return {
    text: textBlock && textBlock.type === "text" ? textBlock.text : "",
    provider: "anthropic",
    model,
  };
}

// ─── Ollama Provider ───────────────────────────────────────────────────

async function ollamaVision(req: VisionRequest): Promise<AIProviderResponse> {
  const model = getOllamaVisionModel();
  const baseUrl = getOllamaBaseUrl();

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${req.systemPrompt}\n\n${req.userMessage}`,
      images: [req.imageBase64],
      stream: false,
      options: { num_predict: req.maxTokens || 4096 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama vision error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    text: data.response || "",
    provider: "ollama",
    model,
  };
}

async function ollamaText(req: TextRequest): Promise<AIProviderResponse> {
  const model = getOllamaTextModel();
  const baseUrl = getOllamaBaseUrl();

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${req.systemPrompt}\n\n${req.userMessage}`,
      stream: false,
      options: { num_predict: req.maxTokens || 4096 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama text error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    text: data.response || "",
    provider: "ollama",
    model,
  };
}

// ─── Unified API ───────────────────────────────────────────────────────

/**
 * Analyze an image with a vision-capable model.
 * Uses Anthropic Claude if API key is set, otherwise falls back to Ollama.
 */
export async function analyzeVision(req: VisionRequest): Promise<AIProviderResponse> {
  if (hasAnthropicKey()) {
    try {
      return await anthropicVision(req, "claude-sonnet-4-20250514");
    } catch (err) {
      console.warn("[AI Provider] Anthropic vision failed, falling back to Ollama:", (err as Error).message);
    }
  }
  return ollamaVision(req);
}

/**
 * Analyze text with a text-capable model.
 * Uses Anthropic Claude if API key is set, otherwise falls back to Ollama.
 */
export async function analyzeText(req: TextRequest): Promise<AIProviderResponse> {
  if (hasAnthropicKey()) {
    try {
      return await anthropicText(req, "claude-sonnet-4-20250514");
    } catch (err) {
      console.warn("[AI Provider] Anthropic text failed, falling back to Ollama:", (err as Error).message);
    }
  }
  return ollamaText(req);
}

/**
 * High-quality vision analysis (for scout reports — uses opus if available).
 */
export async function analyzeVisionPremium(req: VisionRequest): Promise<AIProviderResponse> {
  if (hasAnthropicKey()) {
    try {
      return await anthropicVision(req, "claude-opus-4-5-20250514");
    } catch (err) {
      console.warn("[AI Provider] Anthropic opus vision failed, falling back to local:", (err as Error).message);
    }
  }
  // For premium analysis, still use the best local vision model
  return ollamaVision({ ...req, maxTokens: req.maxTokens || 4096 });
}

/**
 * Health check — returns provider status
 */
export function getProviderStatus(): { vision: string; text: string; provider: string } {
  return {
    vision: hasAnthropicKey() ? "claude-sonnet-4" : getOllamaVisionModel(),
    text: hasAnthropicKey() ? "claude-sonnet-4" : getOllamaTextModel(),
    provider: hasAnthropicKey() ? "anthropic" : "ollama",
  };
}