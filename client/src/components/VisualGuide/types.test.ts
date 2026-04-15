import { describe, it, expect } from "vitest";
import { createFormationGuide, createTrainingGuide, defaultGuideProps, guideColors } from "./types";
import type { GuideStep, GuideSession, VisualGuideProps, GuideLevel } from "./types";

describe("VisualGuide — Types & Defaults", () => {
  it("defaultGuideProps should have sensible Arabic defaults", () => {
    expect(defaultGuideProps).toBeDefined();
    expect(typeof defaultGuideProps).toBe("object");
  });

  it("guideColors should provide theme colors", () => {
    expect(guideColors).toBeDefined();
    expect(typeof guideColors).toBe("object");
  });

  it("should support all GuideLevel values", () => {
    const levels: GuideLevel[] = ["beginner", "intermediate", "advanced"];
    expect(levels).toHaveLength(3);
  });

  it("should support all GuideAction values", () => {
    const actions = ["point", "highlight", "explain", "suggest", "correct", "praise"];
    expect(actions).toHaveLength(6);
  });

  describe("createFormationGuide", () => {
    it("should create a guide session for a formation with defaults", () => {
      const session = createFormationGuide();
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.name).toBeDefined();
      expect(session.steps.length).toBeGreaterThan(0);
      expect(["beginner", "intermediate", "advanced"]).toContain(session.level);
    });

    it("should accept formation and isRTL parameters", () => {
      const session = createFormationGuide("4-3-3", true);
      expect(session).toBeDefined();
      expect(session.steps.length).toBeGreaterThan(0);
    });

    it("should include Arabic messages in every step", () => {
      const session = createFormationGuide();
      for (const step of session.steps) {
        expect(step.messageAr).toBeTruthy();
        expect(typeof step.messageAr).toBe("string");
      }
    });

    it("should include English fallback in every step", () => {
      const session = createFormationGuide();
      for (const step of session.steps) {
        expect(step.messageEn).toBeTruthy();
        expect(typeof step.messageEn).toBe("string");
      }
    });

    it("should have unique IDs for each step", () => {
      const session = createFormationGuide();
      const ids = session.steps.map((s: GuideStep) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("createTrainingGuide", () => {
    it("should create a guide session for training", () => {
      const session = createTrainingGuide();
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.steps.length).toBeGreaterThan(0);
    });

    it("should have Arabic-first content", () => {
      const session = createTrainingGuide();
      for (const step of session.steps) {
        expect(step.messageAr.length).toBeGreaterThan(0);
      }
    });
  });
});
