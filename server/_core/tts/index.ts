/**
 * TTS module — exports the Gemini TTS Express handler
 */
export { ttsHandler, buildWavHeader, pcmToWav, validateVoice, validateTTSRequest, callGeminiTTS } from "./geminiTTS";
export type { GeminiVoice, TTSRequestBody } from "./geminiTTS";