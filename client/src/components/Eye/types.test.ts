import { describe, it, expect } from "vitest";
import { DEFAULT_EYE_CONFIG } from "./types";
import type { EyeAction, EyeConfig, CursorPoint, HighlightZone, FactCheckVerdict } from "./types";

describe("DHEEB Eye — Types & Config", () => {
  it("DEFAULT_EYE_CONFIG should have correct defaults", () => {
    expect(DEFAULT_EYE_CONFIG.language).toBe("ar");
    expect(DEFAULT_EYE_CONFIG.voiceEnabled).toBe(true);
    expect(DEFAULT_EYE_CONFIG.ttsEnabled).toBe(true);
    expect(DEFAULT_EYE_CONFIG.visionEnabled).toBe(true);
    expect(DEFAULT_EYE_CONFIG.autoAdvance).toBe(true);
    expect(DEFAULT_EYE_CONFIG.autoAdvanceDelay).toBe(2000);
    expect(DEFAULT_EYE_CONFIG.cursorDuration).toBe(3000);
    expect(DEFAULT_EYE_CONFIG.context).toBe("coach");
  });

  it("should support RTL Arabic as default language", () => {
    expect(DEFAULT_EYE_CONFIG.language).toBe("ar");
  });

  it("should support all EyeActionType values", () => {
    const types: EyeAction["type"][] = ["point", "highlight", "speak", "listen", "capture", "analyze", "factcheck"];
    expect(types).toHaveLength(7);
  });

  it("should support CursorPoint with percent coordinates", () => {
    const point: CursorPoint = { x: 50, y: 30 };
    expect(point.x).toBe(50);
    expect(point.y).toBe(30);
  });

  it("should support CursorPoint with CSS selectors", () => {
    const point: CursorPoint = { x: 0, y: 0, targetSelector: "[data-role='GK']" };
    expect(point.targetSelector).toBe("[data-role='GK']");
  });

  it("should support all HighlightZone values", () => {
    const zones: HighlightZone[] = [
      "penalty-area", "goal-area", "center-circle", "left-wing",
      "right-wing", "midfield", "defensive-third", "attacking-third",
    ];
    expect(zones).toHaveLength(8);
  });

  it("should support FactCheckVerdict values", () => {
    const verdicts: FactCheckVerdict[] = ["verified", "false", "misleading", "unverified"];
    expect(verdicts).toHaveLength(4);
  });

  it("should construct valid EyeConfig overrides", () => {
    const customConfig: EyeConfig = {
      ...DEFAULT_EYE_CONFIG,
      language: "en",
      voiceEnabled: false,
      context: "factcheck",
    };
    expect(customConfig.language).toBe("en");
    expect(customConfig.context).toBe("factcheck");
  });
});
