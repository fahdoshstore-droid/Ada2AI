export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL || process.env.DATABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // LLM providers
  // Local LLM (Ollama) — free, private, works offline
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "llama3:8b",
  // Which LLM provider to use for RAG: "google" (Gemini, default), "kimi" (Moonshot), "anthropic" (cloud), "forge" (OpenAI-compatible), "ollama" (local)
  ragProvider: process.env.RAG_PROVIDER ?? "google",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20240620",
  // Google Gemini — OpenAI-compatible endpoint
  googleApiKey: process.env.GOOGLE_API_KEY ?? "",
  googleModel: process.env.GOOGLE_MODEL ?? "gemini-1.5-flash",
  // Kimi / Moonshot AI — OpenAI-compatible API
  kimiApiKey: process.env.KIMI_API_KEY ?? "",
  kimiBaseUrl: process.env.KIMI_BASE_URL ?? "https://api.moonshot.cn/v1",
  kimiModel: process.env.KIMI_MODEL ?? "moonshot-v1-8k",
  // Forge / OpenAI-compatible API (kept for LLM proxy support)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  forgeModel: process.env.FORGE_MODEL ?? "gpt-4o",
};