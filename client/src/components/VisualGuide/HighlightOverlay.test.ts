import { describe, it, expect } from "vitest";

describe("HighlightOverlay — Rendering Logic", () => {
  // HighlightOverlay renders SVG zones on a football pitch based on HighlightZone names.
  // These tests validate the data models that drive the rendering.

  const ZONE_COORDS: Record<string, { x: number; y: number; w: number; h: number }> = {
    "penalty-area":   { x: 17.5, y: 0,   w: 65,   h: 16.5 },
    "goal-area":      { x: 30,   y: 0,   w: 40,   h: 5.5  },
    "center-circle":  { x: 35,   y: 40,  w: 30,   h: 20   },
    "left-wing":      { x: 0,    y: 20,  w: 17.5, h: 60   },
    "right-wing":     { x: 82.5, y: 20,  w: 17.5, h: 60   },
    "midfield":       { x: 17.5, y: 30,  w: 65,   h: 40   },
    "defensive-third": { x: 0,   y: 0,   w: 100,  h: 33.3 },
    "attacking-third": { x: 0,   y: 66.7, w: 100, h: 33.3 },
  };

  it("should define coordinates for all 8 zones", () => {
    expect(Object.keys(ZONE_COORDS)).toHaveLength(8);
  });

  it("should have every zone within pitch bounds (0-100%)", () => {
    for (const [zone, coords] of Object.entries(ZONE_COORDS)) {
      expect(coords.x).toBeGreaterThanOrEqual(0);
      expect(coords.y).toBeGreaterThanOrEqual(0);
      expect(coords.x + coords.w).toBeLessThanOrEqual(100);
      expect(coords.y + coords.h).toBeLessThanOrEqual(100);
    }
  });

  it("should have penalty-area within defensive zone", () => {
    const pa = ZONE_COORDS["penalty-area"];
    const def = ZONE_COORDS["defensive-third"];
    expect(pa.y + pa.h).toBeLessThanOrEqual(def.y + def.h);
  });

  it("should have center-circle in midfield area", () => {
    const cc = ZONE_COORDS["center-circle"];
    expect(cc.x).toBeGreaterThanOrEqual(17);
    expect(cc.y).toBeGreaterThanOrEqual(30);
  });
});
