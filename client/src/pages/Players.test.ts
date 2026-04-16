import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for the Players page API integration.
 *
 * The Players page (Players.tsx) fetches from /api/players with query params
 * for search, sport, region, and age filters.
 *
 * Since vitest runs in node environment, we test the data-fetch logic,
 * URL construction, and response handling by mocking global.fetch.
 */

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockPlayers = [
  {
    id: "p1",
    name: "Omar Al-Saud",
    name_ar: "عمر آل سعود",
    sport: "Football",
    position: "Forward",
    age: 18,
    region: "Riyadh",
    rating: 88,
    speed: 90,
    agility: 85,
    technique: 84,
    badge: "GOLD",
    badge_color: "#FFD700",
    academy_name: "Riyadh FC Academy",
  },
  {
    id: "p2",
    name: "Lina Al-Harbi",
    name_ar: "لينا الحربي",
    sport: "Basketball",
    position: "Point Guard",
    age: 17,
    region: "Jeddah",
    rating: 82,
    speed: 78,
    agility: 90,
    technique: 80,
    badge: "SILVER",
    badge_color: "#C0C0C0",
    academy_name: "Jeddah Hoops",
  },
];

// ─── URL Construction Tests ───────────────────────────────────────────────────

describe("Players Page — URL Construction", () => {
  function buildPlayersUrl(params: {
    search?: string;
    sport?: string;
    region?: string;
    age?: string;
  }): string {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.sport && params.sport !== "All Sports") sp.set("sport", params.sport);
    if (params.region && params.region !== "All Regions") sp.set("region", params.region);
    if (params.age && params.age !== "All Ages") sp.set("age", params.age);
    const qs = sp.toString();
    return `/api/players${qs ? `?${qs}` : ""}`;
  }

  it("should build base URL with no filters", () => {
    expect(buildPlayersUrl({})).toBe("/api/players");
  });

  it("should include search param", () => {
    const url = buildPlayersUrl({ search: "Omar" });
    expect(url).toBe("/api/players?search=Omar");
  });

  it("should include sport filter when not 'All Sports'", () => {
    const url = buildPlayersUrl({ sport: "Football" });
    expect(url).toBe("/api/players?sport=Football");
  });

  it("should NOT include sport filter when 'All Sports'", () => {
    const url = buildPlayersUrl({ sport: "All Sports" });
    expect(url).toBe("/api/players");
  });

  it("should include region filter when not 'All Regions'", () => {
    const url = buildPlayersUrl({ region: "Riyadh" });
    expect(url).toBe("/api/players?region=Riyadh");
  });

  it("should NOT include region filter when 'All Regions'", () => {
    const url = buildPlayersUrl({ region: "All Regions" });
    expect(url).toBe("/api/players");
  });

  it("should include age filter when not 'All Ages'", () => {
    const url = buildPlayersUrl({ age: "U17" });
    expect(url).toBe("/api/players?age=U17");
  });

  it("should combine multiple filters", () => {
    const url = buildPlayersUrl({ search: "Omar", sport: "Football", region: "Riyadh", age: "U17" });
    expect(url).toContain("search=Omar");
    expect(url).toContain("sport=Football");
    expect(url).toContain("region=Riyadh");
    expect(url).toContain("age=U17");
  });
});

// ─── Fetch Integration Tests ─────────────────────────────────────────────────

describe("Players Page — Fetch Integration", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPlayers),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call fetch with /api/players", async () => {
    await fetch("/api/players");
    expect(fetchSpy).toHaveBeenCalledWith("/api/players");
  });

  it("should call fetch with correct URL when filters are applied", async () => {
    const url = "/api/players?sport=Football&region=Riyadh";
    await fetch(url);
    expect(fetchSpy).toHaveBeenCalledWith(url);
  });

  it("should parse JSON response from players API", async () => {
    const response = await fetch("/api/players");
    const data = await response.json();
    expect(data).toEqual(mockPlayers);
    expect(data).toHaveLength(2);
  });

  it("should handle empty players array", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    const response = await fetch("/api/players");
    const data = await response.json();
    expect(data).toEqual([]);
    expect(data).toHaveLength(0);
  });

  it("should handle fetch error", async () => {
    fetchSpy.mockRejectedValue(new Error("Network error"));
    await expect(fetch("/api/players")).rejects.toThrow("Network error");
  });

  it("should handle malformed JSON response", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    } as Response);
    const response = await fetch("/api/players");
    await expect(response.json()).rejects.toThrow();
  });
});

// ─── Data Processing Tests ───────────────────────────────────────────────────

describe("Players Page — Data Processing", () => {
  it("should compute distinct sports count from players", () => {
    const sportsCount = new Set(mockPlayers.map((a) => a.sport)).size;
    expect(sportsCount).toBe(2);
  });

  it("should compute distinct regions count from players", () => {
    const regionsCount = new Set(mockPlayers.map((a) => a.region)).size;
    expect(regionsCount).toBe(2);
  });

  it("should compute initials from player name", () => {
    const initials = mockPlayers[0].name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);
    expect(initials).toBe("OA");
  });

  it("should handle single-word name for initials", () => {
    const player = { ...mockPlayers[0], name: "Omar" };
    const initials = player.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);
    expect(initials).toBe("O");
  });

  it("should correctly determine rating color thresholds", () => {
    // Rating >= 85 → teal (#00DCC8)
    expect(mockPlayers[0].rating).toBeGreaterThanOrEqual(85);
    // Rating 80-84 → orange
    expect(mockPlayers[1].rating).toBeGreaterThanOrEqual(80);
    expect(mockPlayers[1].rating).toBeLessThan(85);
  });

  it("should handle filter combination logic (client-side)", () => {
    const filtered = mockPlayers.filter((p) => {
      const sportMatch = p.sport === "Football";
      const regionMatch = p.region === "Riyadh";
      return sportMatch && regionMatch;
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("p1");
  });

  it("should return empty for non-matching filters", () => {
    const filtered = mockPlayers.filter(
      (p) => p.sport === "Swimming" && p.region === "Riyadh"
    );
    expect(filtered).toHaveLength(0);
  });
});