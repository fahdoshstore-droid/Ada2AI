export const ENV = {
  appId: process.env.MANUS_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL || process.env.DATABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Local LLM (Ollama) — free, private, works offline
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "llama3:8b",
  // Which LLM provider to use for RAG: "google" (Gemini, default), "kimi" (Moonshot), "anthropic" (cloud), "forge" (OpenAI-compatible), "ollama" (local)
  ragProvider: process.env.RAG_PROVIDER ?? "google",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  // Google Gemini — OpenAI-compatible endpoint
  googleApiKey: process.env.GOOGLE_API_KEY ?? "",
  googleModel: process.env.GOOGLE_MODEL ?? "gemini-3-flash-preview",
  // Kimi / Moonshot AI — OpenAI-compatible API
  kimiApiKey: process.env.KIMI_API_KEY ?? "",
  kimiBaseUrl: process.env.KIMI_BASE_URL ?? "https://api.moonshot.cn/v1",
  kimiModel: process.env.KIMI_MODEL ?? "moonshot-v1-8k",
};
