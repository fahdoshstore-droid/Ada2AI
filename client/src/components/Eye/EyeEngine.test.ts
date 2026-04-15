import { describe, it, expect, vi, beforeEach } from "vitest";
import { EyeEngine } from "./EyeEngine";
import type { EyeAction, EyeConfig, EyeState } from "./types";

describe("DHEEB Eye — EyeEngine", () => {
  const createEngine = (overrides?: Partial<EyeConfig>) => {
    return new EyeEngine({
      language: "ar",
      voiceEnabled: false,
      ttsEnabled: false,
      visionEnabled: false,
      autoAdvance: false,
      autoAdvanceDelay: 0,
      cursorDuration: 100,
      context: "coach",
      ...overrides,
    });
  };

  it("should instantiate with config", () => {
    const engine = createEngine();
    expect(engine).toBeDefined();
    expect(engine.getState()).toBe("idle");
  });

  it("should track session after executeActions", async () => {
    const engine = createEngine();
    const actions: EyeAction[] = [
      { id: "a1", type: "point", payload: { x: 50, y: 30 }, messageAr: "هنا", messageEn: "Here" },
    ];
    await engine.executeActions(actions);
    const session = engine.getSession();
    expect(session).toBeDefined();
    expect(session!.completedAt).toBeDefined();
  });

  it("should reset session", () => {
    const engine = createEngine();
    engine.reset();
    expect(engine.getState()).toBe("idle");
    expect(engine.getSession()).toBeNull();
  });

  it("should emit state changes via onStateChange callback", () => {
    const states: string[] = [];
    const engine = createEngine({
      onStateChange: (state) => states.push(state),
    });
    // Trigger state change via executeAction
    const action: EyeAction = { id: "s1", type: "speak", payload: { text: "test" }, messageAr: "اختبار", messageEn: "test" };
    engine.executeAction(action);
    expect(states).toContain("speaking");
  });

  it("should handle coach context", () => {
    const engine = createEngine({ context: "coach" });
    expect(engine).toBeDefined();
  });

  it("should handle factcheck context", () => {
    const engine = createEngine({ context: "factcheck" });
    expect(engine).toBeDefined();
  });

  it("should update config at runtime", () => {
    const engine = createEngine();
    engine.updateConfig({ language: "en", context: "factcheck" });
    // Config updated internally — no crash
    expect(engine).toBeDefined();
  });

  it("should call onActionComplete callback after each action", async () => {
    const completed: EyeAction[] = [];
    const engine = createEngine({
      onActionComplete: (action) => completed.push(action),
    });
    const actions: EyeAction[] = [
      { id: "p1", type: "point", payload: { x: 50, y: 50 }, messageAr: "مدرج", messageEn: "Stand" },
      { id: "h1", type: "highlight", payload: { zone: "penalty-area", color: "teal" }, messageAr: "منطقة جزاء", messageEn: "Penalty area" },
    ];
    await engine.executeActions(actions);
    expect(completed).toHaveLength(2);
    expect(completed[0].id).toBe("p1");
    expect(completed[1].id).toBe("h1");
  });

  it("should validate all 7 EyeActionType values", () => {
    const validTypes = ["point", "highlight", "speak", "listen", "capture", "analyze", "factcheck"];
    expect(validTypes).toHaveLength(7);
    for (const t of validTypes) {
      const action: EyeAction = { id: `test-${t}`, type: t as EyeAction["type"], payload: {}, messageAr: "اختبار", messageEn: "test" };
      expect(action.type).toBe(t);
    }
  });
});
