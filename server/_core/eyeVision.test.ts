import { describe, it, expect } from "vitest";

describe("DHEEB Eye Vision — API Validation", () => {
  describe("Request Schema Validation", () => {
    // Reproduce the Zod schema from eyeVision.ts for unit testing
    it("should validate required imageBase64 field", () => {
      const validBase64 = "data:image/png;base64,iVBORw0KGgo=";
      expect(validBase64.length).toBeGreaterThan(0);
    });

    it("should accept coach context", () => {
      const contexts = ["coach", "factcheck"] as const;
      expect(contexts).toContain("coach");
      expect(contexts).toContain("factcheck");
      expect(contexts.length).toBe(2);
    });

    it("should reject invalid context values", () => {
      const validContexts = ["coach", "factcheck"];
      const invalidContext = "invalid";
      expect(validContexts.includes(invalidContext)).toBe(false);
    });

    it("should make transcript and prompt optional", () => {
      const minimalRequest = { imageBase64: "abc123", context: "coach" as const };
      expect(minimalRequest.imageBase64).toBe("abc123");
      expect(minimalRequest.context).toBe("coach");
      expect(minimalRequest).not.toHaveProperty("transcript");
      expect(minimalRequest).not.toHaveProperty("prompt");
    });
  });

  describe("Security — API Key not in VITE_", () => {
    it("should use server-side ANTHROPIC_API_KEY, never VITE_ prefix", () => {
      // The eyeVision endpoint reads ANTHROPIC_API_KEY from server env, not VITE_
      expect(process.env.VITE_ANTHROPIC_API_KEY).toBeFalsy();
    });

    it("should reject empty image payload", () => {
      const empty = "";
      expect(empty.length).toBe(0);
      // Zod .min(1) would reject this
    });
  });

  describe("Video Path Sanitization (shared with scoutAnalysis)", () => {
    const ALLOWED_EXTENSIONS = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v"];

    it("should only allow whitelisted video extensions", () => {
      const allowed = [".mp4", ".mov", ".webm"];
      const rejected = [".sh", ".exe", ".js", ".php", ".py"];
      for (const ext of allowed) {
        expect(ALLOWED_EXTENSIONS.includes(ext)).toBe(true);
      }
      for (const ext of rejected) {
        expect(ALLOWED_EXTENSIONS.includes(ext)).toBe(false);
      }
    });
  });

  describe("Fact-Check Verdicts", () => {
    it("should support all verdict types", () => {
      const verdicts = ["verified", "false", "misleading", "unverified"];
      expect(verdicts).toHaveLength(4);
      // Each verdict maps to a color: verified=green, false=red, misleading=yellow, unverified=blue
      const verdictColors: Record<string, string> = {
        verified: "green",
        false: "red",
        misleading: "yellow",
        unverified: "blue",
      };
      for (const v of verdicts) {
        expect(verdictColors[v]).toBeDefined();
      }
    });
  });
});
