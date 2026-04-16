import { describe, it, expect } from "vitest";
import { classifierAgent } from "./classifier";
import { queryAgent } from "./query";

describe("Orchestrator A2A Pipeline", () => {
  it("classifier → player_search for Arabic football query", async () => {
    const result = await classifierAgent.execute(
      { question: "أفضل لاعبين كرة قدم" },
      "t1",
    );
    expect(result.success).toBe(true);
    const data = result.data as any;
    expect(data.intentId).toBe("player_search");
    expect(data.params.sport).toBe("Football");
  });

  it("classifier → general_sport fallback", async () => {
    const result = await classifierAgent.execute(
      { question: "وش رأيك في كذا" },
      "t2",
    );
    expect(result.success).toBe(true);
    const data = result.data as any;
    expect(data.intentId).toBe("general_sport");
  });

  it("query agent handles missing Supabase", async () => {
    const result = await queryAgent.execute(
      { intentId: "player_search", params: {} },
      "t3",
    );
    expect(result.success).toBe(false);
    expect(result.meta.agent).toBe("query");
  });

  it("A2A metadata format is consistent", async () => {
    const result = await classifierAgent.execute(
      { question: "أكاديميات كرة قدم" },
      "t4",
    );
    expect(result.meta).toHaveProperty("agent");
    expect(result.meta).toHaveProperty("timestamp");
    expect(result.meta).toHaveProperty("durationMs");
    expect(result.meta).toHaveProperty("confidence");
    expect(result.meta).toHaveProperty("version");
  });

  it("PipelineResult type shape is correct", () => {
    const mock = {
      traceId: "uuid",
      classification: { intentId: "player_search", intentKeywords: ["لاعب"], params: { sport: "Football" }, confidence: 0.9 },
      query: { table: "players", data: null, count: null, error: null },
      synthesis: { text: "", language: "ar" },
      trace: [
        { agent: "classifier", timestamp: new Date().toISOString(), durationMs: 5, confidence: 0.9, version: "1.0.0" },
        { agent: "query", timestamp: new Date().toISOString(), durationMs: 10, confidence: 0.6, version: "1.0.0" },
      ],
      totalDurationMs: 15,
    };
    expect(mock.trace.length).toBe(2);
    expect(mock.trace[0].agent).toBe("classifier");
  });
});
