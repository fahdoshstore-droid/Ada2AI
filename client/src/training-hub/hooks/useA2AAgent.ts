/**
 * useA2AAgent — Hook for A2A Multi-Agent Pipeline
 * Connects to /api/ask (streaming) and /api/ask/full (with trace)
 */

import { useState, useRef, useCallback } from "react";

export interface AgentTraceItem {
  agent: string;
  timestamp: string;
  durationMs: number;
  confidence: number;
  version: string;
}

export interface A2AResponse {
  text: string;
  trace?: AgentTraceItem[];
  totalDurationMs?: number;
  intentId?: string;
  language?: string;
  error?: string;
}

export interface UseA2AAgentReturn {
  ask: (question: string) => Promise<A2AResponse>;
  askFull: (question: string) => Promise<A2AResponse>;
  streamingText: string;
  isLoading: boolean;
  lastTrace: AgentTraceItem[] | null;
  lastDuration: number | null;
  lastIntent: string | null;
  error: string | null;
  abort: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "";

export function useA2AAgent(): UseA2AAgentReturn {
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastTrace, setLastTrace] = useState<AgentTraceItem[] | null>(null);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [lastIntent, setLastIntent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(async (question: string): Promise<A2AResponse> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setStreamingText("");
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      // Extract trace from headers
      const traceId = res.headers.get("x-trace-id");
      const intentId = res.headers.get("x-intent-id");
      const confidence = res.headers.get("x-confidence");
      if (intentId) setLastIntent(intentId);

      // Read streaming body
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingText(accumulated);
      }

      // Build trace from headers if available
      const trace: AgentTraceItem[] = traceId ? [
        { agent: "orchestrator", timestamp: new Date().toISOString(), durationMs: 0, confidence: 1, version: "1.0.0" },
        { agent: "classifier", timestamp: new Date().toISOString(), durationMs: 0, confidence: Number(confidence) || 0.8, version: "1.0.0" },
        { agent: "query", timestamp: new Date().toISOString(), durationMs: 0, confidence: 0.9, version: "1.0.0" },
        { agent: "synthesizer", timestamp: new Date().toISOString(), durationMs: 0, confidence: 0.85, version: "1.0.0" },
      ] : [];

      if (trace.length > 0) setLastTrace(trace);
      setStreamingText("");

      return {
        text: accumulated,
        trace: trace.length > 0 ? trace : undefined,
        intentId: intentId || undefined,
      };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { text: "", error: "aborted" };
      }
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      return { text: "", error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const askFull = useCallback(async (question: string): Promise<A2AResponse> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/ask/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (data.trace) setLastTrace(data.trace);
      if (data.totalDurationMs) setLastDuration(data.totalDurationMs);
      if (data.classification?.intentId) setLastIntent(data.classification.intentId);

      return {
        text: data.synthesis?.text || "",
        trace: data.trace,
        totalDurationMs: data.totalDurationMs,
        intentId: data.classification?.intentId,
        language: data.synthesis?.language,
      };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { text: "", error: "aborted" };
      }
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      return { text: "", error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setStreamingText("");
  }, []);

  return { ask, askFull, streamingText, isLoading, lastTrace, lastDuration, lastIntent, error, abort };
}
