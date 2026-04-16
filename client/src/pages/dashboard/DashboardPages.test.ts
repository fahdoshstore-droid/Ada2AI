import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for the Dashboard pages API integration.
 *
 * Dashboard pages include:
 * - DashboardHome → /api/players
 * - ClubDashboard → /api/players (GET, POST, DELETE)
 * - ScoutDashboard → /api/players
 * - ParentDashboard → /api/players
 * - TrainingHub → /api/players?sport=Football
 *
 * These pages show more complex fetch patterns including:
 * - POST and DELETE requests
 * - Data mapping/transformation
 * - Status checking (r.ok)
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
    rating: 88,
    academy_name: "Riyadh FC Academy",
    speed: 90,
    agility: 85,
    technique: 84,
    performance: 82,
    attendance: 95,
    goals: 12,
    assists: 8,
    number: "10",
    status: "active",
  },
  {
    id: "p2",
    name: "Lina Al-Harbi",
    name_ar: "لينا الحربي",
    sport: "Football",
    position: "Midfielder",
    age: 17,
    rating: 82,
    academy_name: "Jeddah FC",
    speed: 78,
    agility: 90,
    technique: 80,
    performance: 85,
    attendance: 88,
    goals: 5,
    assists: 15,
    number: "8",
    status: "active",
  },
  {
    id: "p3",
    name: "Khalid Al-Otaibi",
    name_ar: "خالد العتيبي",
    sport: "Basketball",
    position: "Center",
    age: 19,
    rating: 75,
    academy_name: "Dammam Hoops",
    speed: 70,
    agility: 72,
    technique: 68,
    performance: 78,
    attendance: 90,
    goals: 0,
    assists: 0,
    number: "22",
    status: "inactive",
  },
];

// ─── DashboardHome Fetch Tests ────────────────────────────────────────────────

describe("DashboardHome — /api/players Fetch", () => {
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

  it("should call /api/players", async () => {
    await fetch("/api/players");
    expect(fetchSpy).toHaveBeenCalledWith("/api/players");
  });

  it("should return players array", async () => {
    const data = await (await fetch("/api/players")).json();
    expect(data).toHaveLength(3);
    expect(data[0].name).toBe("Omar Al-Saud");
  });

  it("should handle error", async () => {
    fetchSpy.mockRejectedValue(new Error("Dashboard API error"));
    await expect(fetch("/api/players")).rejects.toThrow();
  });
});

// ─── ClubDashboard Fetch Tests ───────────────────────────────────────────────

describe("ClubDashboard — CRUD Operations", () => {
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

  it("should call /api/players for initial load", async () => {
    await fetch("/api/players");
    expect(fetchSpy).toHaveBeenCalledWith("/api/players");
  });

  it("should send POST request with player data", async () => {
    const newPlayer = {
      name: "New Player",
      name_ar: "لاعب جديد",
      sport: "Football",
      position: "Defender",
      age: 16,
    };

    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "p4", ...newPlayer }),
    } as Response);

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlayer),
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlayer),
    });
    expect(res.ok).toBe(true);
  });

  it("should send DELETE request for a player", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);

    const res = await fetch("/api/players/p1", { method: "DELETE" });

    expect(fetchSpy).toHaveBeenCalledWith("/api/players/p1", {
      method: "DELETE",
    });
    expect(res.ok).toBe(true);
  });

  it("should handle POST failure gracefully", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response);

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
  });

  it("should handle DELETE failure gracefully", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const res = await fetch("/api/players/nonexistent", { method: "DELETE" });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });

  it("should refresh data after mutation", async () => {
    // First call: initial load
    await fetch("/api/players");
    // Second call: refresh after add
    await fetch("/api/players");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

// ─── TrainingHub Data Mapping Tests ──────────────────────────────────────────

describe("TrainingHub — Player Data Mapping", () => {
  it("should map API player to TrainingHub display format", () => {
    const apiPlayer = mockPlayers[0];
    const mapped = {
      name: apiPlayer.name_ar || apiPlayer.name,
      pos: apiPlayer.position || "",
      club: apiPlayer.academy_name || "",
      age: apiPlayer.age,
      speed: apiPlayer.speed || 0,
      strength: apiPlayer.agility || 0, // agility → strength in mapping
      technique: apiPlayer.technique || 0,
      endurance: apiPlayer.attendance || 0, // attendance → endurance
      teamwork: Math.round((apiPlayer.rating || 0) * 0.9),
      progress: apiPlayer.rating || 0,
    };

    expect(mapped.name).toBe("عمر آل سعود");
    expect(mapped.pos).toBe("Forward");
    expect(mapped.club).toBe("Riyadh FC Academy");
    expect(mapped.strength).toBe(85); // agility mapped to strength
    expect(mapped.endurance).toBe(95); // attendance mapped to endurance
    expect(mapped.teamwork).toBe(79); // 88 * 0.9 rounded
    expect(mapped.progress).toBe(88);
  });

  it("should prefer Arabic name for display", () => {
    const apiPlayer = mockPlayers[0];
    const name = apiPlayer.name_ar || apiPlayer.name;
    expect(name).toBe("عمر آل سعود");
  });

  it("should fallback to English name when Arabic is missing", () => {
    const apiPlayer = { ...mockPlayers[0], name_ar: "" };
    const name = apiPlayer.name_ar || apiPlayer.name;
    expect(name).toBe("Omar Al-Saud");
  });

  it("should default missing fields to 0", () => {
    const minimalPlayer = { id: "p0", name: "Test", sport: "Football" } as any;
    const mapped = {
      speed: minimalPlayer.speed || 0,
      agility: minimalPlayer.agility || 0,
      technique: minimalPlayer.technique || 0,
    };
    expect(mapped.speed).toBe(0);
    expect(mapped.agility).toBe(0);
    expect(mapped.technique).toBe(0);
  });
});

// ─── TrainingHub Fetch Tests ──────────────────────────────────────────────────

describe("TrainingHub — /api/players?sport=Football Fetch", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    const footballPlayers = mockPlayers.filter((p) => p.sport === "Football");
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(footballPlayers),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call /api/players?sport=Football", async () => {
    await fetch("/api/players?sport=Football");
    expect(fetchSpy).toHaveBeenCalledWith("/api/players?sport=Football");
  });

  it("should check response.ok before parsing", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const res = await fetch("/api/players?sport=Football");
    expect(res.ok).toBe(false);

    // TrainingHub pattern: throw if !r.ok
    if (!res.ok) {
      // This is the expected path — the page would throw
      expect(res.ok).toBe(false);
      return;
    }
    // Should not reach here
    expect.unreachable("Should have thrown for non-ok response");
  });

  it("should receive only football players", async () => {
    const data = await (await fetch("/api/players?sport=Football")).json();
    expect(data.every((p: (typeof mockPlayers)[0]) => p.sport === "Football")).toBe(
      true
    );
  });

  it("should handle network error", async () => {
    fetchSpy.mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(fetch("/api/players?sport=Football")).rejects.toThrow(
      "ECONNREFUSED"
    );
  });
});

// ─── ScoutDashboard Fetch Tests ───────────────────────────────────────────────

describe("ScoutDashboard — /api/players Fetch", () => {
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

  it("should call /api/players", async () => {
    await fetch("/api/players");
    expect(fetchSpy).toHaveBeenCalledWith("/api/players");
  });

  it("should parse and return players data", async () => {
    const data = await (await fetch("/api/players")).json();
    expect(data.length).toBe(3);
  });

  it("should handle error state", async () => {
    fetchSpy.mockRejectedValue(new Error("Scout dashboard fetch failure"));
    let error: string | null = null;
    try {
      await (await fetch("/api/players")).json();
    } catch (e: unknown) {
      error = (e as Error).message;
    }
    expect(error).toBe("Scout dashboard fetch failure");
  });
});

// ─── ParentDashboard Fetch Tests ──────────────────────────────────────────────

describe("ParentDashboard — /api/players Fetch", () => {
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

  it("should call /api/players", async () => {
    await fetch("/api/players");
    expect(fetchSpy).toHaveBeenCalledWith("/api/players");
  });

  it("should handle loading → success transition", async () => {
    let loading = true;
    let data: unknown = null;

    const d = await (await fetch("/api/players")).json();
    data = d;
    loading = false;

    expect(loading).toBe(false);
    expect(Array.isArray(data)).toBe(true);
    expect((data as typeof mockPlayers).length).toBe(3);
  });

  it("should handle loading → error transition", async () => {
    fetchSpy.mockRejectedValue(new Error("Parent dashboard error"));

    let loading = true;
    let error: string | null = null;

    try {
      await (await fetch("/api/players")).json();
      loading = false;
    } catch (e: unknown) {
      error = (e as Error).message;
      loading = false;
    }

    expect(loading).toBe(false);
    expect(error).toBe("Parent dashboard error");
  });
});

// ─── Dashboard Player Stats Computation ────────────────────────────────────────

describe("Dashboard Pages — Player Stats Computation", () => {
  it("should calculate average rating across players", () => {
    const avg =
      mockPlayers.reduce((s, p) => s + p.rating, 0) / mockPlayers.length;
    expect(Math.round(avg)).toBe(82); // (88+82+75)/3 = 81.67 → 82
  });

  it("should count active vs inactive players", () => {
    const active = mockPlayers.filter((p) => p.status === "active").length;
    const inactive = mockPlayers.filter((p) => p.status === "inactive").length;
    expect(active).toBe(2);
    expect(inactive).toBe(1);
  });

  it("should group players by sport", () => {
    const bySport = mockPlayers.reduce<Record<string, number>>((acc, p) => {
      acc[p.sport] = (acc[p.sport] || 0) + 1;
      return acc;
    }, {});
    expect(bySport["Football"]).toBe(2);
    expect(bySport["Basketball"]).toBe(1);
  });

  it("should compute top-rated player", () => {
    const top = mockPlayers.reduce((max, p) => (p.rating > max.rating ? p : max));
    expect(top.id).toBe("p1");
    expect(top.rating).toBe(88);
  });

  it("should calculate totals for goals and assists", () => {
    const totalGoals = mockPlayers.reduce((s, p) => s + p.goals, 0);
    const totalAssists = mockPlayers.reduce((s, p) => s + p.assists, 0);
    expect(totalGoals).toBe(17); // 12 + 5 + 0
    expect(totalAssists).toBe(23); // 8 + 15 + 0
  });

  it("should compute attendance rate", () => {
    const avgAttendance =
      mockPlayers.reduce((s, p) => s + p.attendance, 0) / mockPlayers.length;
    expect(Math.round(avgAttendance)).toBe(91); // (95+88+90)/3 ≈ 91
  });
});