import { describe, it, expect } from "vitest";
import { classifierAgent } from "./classifier";
import type { ClassifierOutput } from "./types";

describe("ClassifierAgent", () => {
  it("classifies Arabic player search with sport+region", async () => {
    const result = await classifierAgent.execute(
      { question: "أبغى لاعبين كرة قدم في الرياض" },
      "t1",
    );
    expect(result.success).toBe(true);
    const out = result.data as ClassifierOutput;
    expect(out.intentId).toBe("player_search");
    expect(out.params.sport).toBe("Football");
    expect(out.params.region).toBe("Riyadh");
  });

  it("classifies 'أفضل لاعبين كرة قدم' as player_search", async () => {
    const result = await classifierAgent.execute(
      { question: "أفضل لاعبين كرة قدم" },
      "t2",
    );
    expect(result.success).toBe(true);
    const out = result.data as ClassifierOutput;
    expect(out.intentId).toBe("player_search");
    expect(out.params.sport).toBe("Football");
  });

  it("classifies English 'how many players' as player_search", async () => {
    const result = await classifierAgent.execute(
      { question: "how many players are there" },
      "t3",
    );
    expect(result.success).toBe(true);
    const out = result.data as ClassifierOutput;
    expect(out.intentId).toBe("player_search");
  });

  it("classifies academy search with sport", async () => {
    const result = await classifierAgent.execute(
      { question: "أكاديميات كرة قدم" },
      "t4",
    );
    expect(result.success).toBe(true);
    const out = result.data as ClassifierOutput;
    expect(out.intentId).toBe("academy_search");
    expect(out.params.sport).toBe("Football");
  });

  it("falls back to general_sport for unknown queries", async () => {
    const result = await classifierAgent.execute(
      { question: "وش رأيك في كذا" },
      "t5",
    );
    expect(result.success).toBe(true);
    const out = result.data as ClassifierOutput;
    expect(out.intentId).toBe("general_sport");
    expect(out.confidence).toBeLessThan(0.5);
  });

  it("fails on missing question", async () => {
    const result = await classifierAgent.execute({}, "t6");
    expect(result.success).toBe(false);
  });

  it("returns valid A2A metadata", async () => {
    const result = await classifierAgent.execute({ question: "test" }, "t7");
    expect(result.meta.agent).toBe("classifier");
    expect(result.meta.timestamp).toBeDefined();
    expect(result.meta.version).toBe("1.0.0");
    expect(typeof result.meta.durationMs).toBe("number");
  });
});
