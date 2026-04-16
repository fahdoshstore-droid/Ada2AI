/**
 * QueryAgent Tests — Ada2AI Multi-Agent System
 */
import { describe, it, expect, vi } from "vitest";
import { queryAgent } from "./query";
import type { QueryOutput } from "./types";

// Mock getSupabase
vi.mock("../../db", () => ({
  getSupabase: () => null, // No Supabase in test env
}));

describe("QueryAgent", () => {
  it("should handle missing Supabase gracefully", async () => {
    const result = await queryAgent.execute(
      { intentId: "player_search", params: { sport: "Football" } },
      "test-trace-q1",
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Supabase");
  });

  it("should report unknown intent", async () => {
    const result = await queryAgent.execute(
      { intentId: "nonexistent_intent", params: {} },
      "test-trace-q2",
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown intent");
  });

  it("should fail on missing intentId", async () => {
    const result = await queryAgent.execute({ params: {} }, "test-trace-q3");
    expect(result.success).toBe(false);
    expect(result.error).toContain("required");
  });

  it("should include metadata even on failure", async () => {
    const result = await queryAgent.execute(
      { intentId: "nonexistent" },
      "test-trace-q4",
    );
    expect(result.meta.agent).toBe("query");
    expect(result.meta.version).toBe("1.0.0");
  });
});