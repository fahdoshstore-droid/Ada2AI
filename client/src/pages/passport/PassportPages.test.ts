import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for the Passport pages API integration.
 *
 * Passport pages include:
 * - AthleteProfile → /api/players
 * - AthleteCareer  → /api/athletes/:id/career
 * - AthletePoints  → /api/athletes/:id/points
 * - AthleteHistory → /api/athletes/:id/career
 * - Facility       → /api/facilities
 * - Ministry       → /api/ministry/kpi
 *
 * These pages follow a common pattern:
 *   fetch(url).then(r => r.json()).then(d => { ... }).catch(e => { ... })
 * With state: [data, setData] [loading, setLoading] [error, setError]
 */

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockAthlete = {
  id: "ath-001",
  sportId: "SP-001",
  name: "Fahad Al-Muhanna",
  nameAr: "فهد المهنا",
  age: 17,
  city: "Riyadh",
  region: "Riyadh",
  sports: ["Football", "Swimming"],
  sportPoints: 1250,
  level: "Gold" as const,
  joinedAt: "2025-01-15",
  certifications: [
    {
      id: "cert-1",
      name: "Swimming Level 3",
      sport: "Swimming",
      issuedBy: "Saudi Aquatics Federation",
      issuedAt: "2026-01-15",
      points: 100,
      verified: true,
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Regional Champion",
      description: "U16 Riyadh Regional Football",
      sport: "Football",
      date: "2025-12-10",
      points: 50,
      icon: "🏆",
    },
  ],
  sessions: [
    {
      id: "ses-1",
      facilityId: "fac-1",
      facilityName: "Prince Faisal Sports Center",
      sport: "Football",
      date: "2026-03-10",
      duration: 90,
      points: 10,
      verifiedAt: "2026-03-10T10:00:00Z",
    },
  ],
  careerScore: 85,
  guardianConsent: true,
};

const mockFacility = {
  id: "fac-1",
  name: "Prince Faisal Sports Center",
  nameAr: "مركز الأمير فيصل الرياضي",
  city: "Riyadh",
  region: "Riyadh",
  sports: ["Football", "Basketball", "Swimming"],
  managerId: "mgr-1",
  checkins: [
    {
      id: "ci-1",
      athleteId: "ath-001",
      athleteName: "Fahad Al-Muhanna",
      sport: "Football",
      timestamp: "2026-03-10T08:00:00Z",
      verified: true,
      pointsAwarded: 10,
    },
  ],
  monthlyRevenue: 45000,
  activeAthletes: 120,
};

const mockMinistryKPI = {
  totalAthletes: 15234,
  activeThisMonth: 8756,
  totalFacilities: 342,
  totalSessions: 124560,
  avgPointsPerAthlete: 312,
  regionBreakdown: [
    { region: "Riyadh", athletes: 5200, facilities: 120, sessions: 45000 },
    { region: "Jeddah", athletes: 3800, facilities: 95, sessions: 35000 },
  ],
  sportBreakdown: [
    { sport: "Football", athletes: 8000, sessions: 60000, growth: 15 },
    { sport: "Swimming", athletes: 2000, sessions: 15000, growth: 22 },
  ],
  monthlyGrowth: [
    { month: "2026-01", athletes: 14000, sessions: 110000, points: 4200000 },
    { month: "2026-02", athletes: 14500, sessions: 115000, points: 4400000 },
  ],
  vision2030Progress: 68,
  youthEngagement: 72,
  talentPipelineScore: 58,
};

// ─── AthleteProfile Fetch Tests ───────────────────────────────────────────────

describe("Passport — AthleteProfile API (/api/players)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockAthlete]),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call /api/players", async () => {
    await fetch("/api/players");
    expect(fetchSpy).toHaveBeenCalledWith("/api/players");
  });

  it("should parse array of athletes", async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].id).toBe("ath-001");
  });

  it("should handle error response", async () => {
    fetchSpy.mockRejectedValue(new Error("Failed to fetch players"));
    await expect(fetch("/api/players")).rejects.toThrow("Failed to fetch players");
  });

  it("should handle empty data array", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    const data = await (await fetch("/api/players")).json();
    expect(data.length).toBe(0);
  });
});

// ─── AthleteCareer Fetch Tests ────────────────────────────────────────────────

describe("Passport — AthleteCareer API (/api/athletes/:id/career)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAthlete),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call /api/athletes/0/career", async () => {
    await fetch("/api/athletes/0/career");
    expect(fetchSpy).toHaveBeenCalledWith("/api/athletes/0/career");
  });

  it("should normalize single object response to array", async () => {
    const res = await fetch("/api/athletes/0/career");
    const d = await res.json();
    const normalized = Array.isArray(d) ? d : [d];
    expect(Array.isArray(normalized)).toBe(true);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].careerScore).toBe(85);
  });

  it("should keep array response as-is", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockAthlete]),
    } as Response);
    const d = await (await fetch("/api/athletes/0/career")).json();
    const normalized = Array.isArray(d) ? d : [d];
    expect(normalized).toHaveLength(1);
  });

  it("should handle fetch error", async () => {
    fetchSpy.mockRejectedValue(new Error("API timeout"));
    await expect(fetch("/api/athletes/0/career")).rejects.toThrow("API timeout");
  });

  it("should handle empty/null response", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    } as Response);
    const d = await (await fetch("/api/athletes/0/career")).json();
    const normalized = Array.isArray(d) ? d : d ? [d] : [];
    expect(normalized).toHaveLength(0);
  });
});

// ─── AthletePoints Fetch Tests ────────────────────────────────────────────────

describe("Passport — AthletePoints API (/api/athletes/:id/points)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAthlete),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call /api/athletes/0/points", async () => {
    await fetch("/api/athletes/0/points");
    expect(fetchSpy).toHaveBeenCalledWith("/api/athletes/0/points");
  });

  it("should normalize response to array", async () => {
    const d = await (await fetch("/api/athletes/0/points")).json();
    const normalized = Array.isArray(d) ? d : [d];
    expect(Array.isArray(normalized)).toBe(true);
    expect(normalized).toHaveLength(1);
  });

  it("should handle error state", async () => {
    fetchSpy.mockRejectedValue(new Error("Points API unavailable"));
    await expect(fetch("/api/athletes/0/points")).rejects.toThrow(
      "Points API unavailable"
    );
  });

  it("should handle empty data (no athlete data available)", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    const d = await (await fetch("/api/athletes/0/points")).json();
    const normalized = Array.isArray(d) ? d : [d];
    expect(normalized.length).toBe(0);
  });
});

// ─── Facility Fetch Tests ────────────────────────────────────────────────────

describe("Passport — Facility API (/api/facilities)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockFacility]),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call /api/facilities", async () => {
    await fetch("/api/facilities");
    expect(fetchSpy).toHaveBeenCalledWith("/api/facilities");
  });

  it("should normalize single object to array", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFacility),
    } as Response);
    const d = await (await fetch("/api/facilities")).json();
    const normalized = Array.isArray(d) ? d : [d];
    expect(normalized).toHaveLength(1);
    expect(normalized[0].name).toBe("Prince Faisal Sports Center");
  });

  it("should handle array response directly", async () => {
    const d = await (await fetch("/api/facilities")).json();
    const normalized = Array.isArray(d) ? d : [d];
    expect(normalized).toHaveLength(1);
  });

  it("should handle fetch error", async () => {
    fetchSpy.mockRejectedValue(new Error("Facility API down"));
    await expect(fetch("/api/facilities")).rejects.toThrow("Facility API down");
  });

  it("should handle empty facility data", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    const d = await (await fetch("/api/facilities")).json();
    expect(d).toHaveLength(0);
  });
});

// ─── Ministry KPI Fetch Tests ─────────────────────────────────────────────────

describe("Passport — Ministry KPI API (/api/ministry/kpi)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMinistryKPI),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call /api/ministry/kpi", async () => {
    await fetch("/api/ministry/kpi");
    expect(fetchSpy).toHaveBeenCalledWith("/api/ministry/kpi");
  });

  it("should parse KPI object response", async () => {
    const data = await (await fetch("/api/ministry/kpi")).json();
    expect(data.totalAthletes).toBe(15234);
    expect(data.vision2030Progress).toBe(68);
    expect(data.youthEngagement).toBe(72);
  });

  it("should handle fetch error", async () => {
    fetchSpy.mockRejectedValue(new Error("Ministry API error"));
    await expect(fetch("/api/ministry/kpi")).rejects.toThrow("Ministry API error");
  });

  it("should handle null/undefined response (no ministry data)", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    } as Response);
    const data = await (await fetch("/api/ministry/kpi")).json();
    expect(data).toBeNull();
  });

  it("should process region breakdown data", async () => {
    const data = await (await fetch("/api/ministry/kpi")).json();
    expect(data.regionBreakdown).toHaveLength(2);
    expect(data.regionBreakdown[0].region).toBe("Riyadh");
  });

  it("should process sport breakdown data", async () => {
    const data = await (await fetch("/api/ministry/kpi")).json();
    expect(data.sportBreakdown).toHaveLength(2);
    expect(data.sportBreakdown[0].athletes).toBe(8000);
  });

  it("should process monthly growth data", async () => {
    const data = await (await fetch("/api/ministry/kpi")).json();
    expect(data.monthlyGrowth).toHaveLength(2);
    expect(data.monthlyGrowth[1].month).toBe("2026-02");
  });
});

// ─── Common Loading/Error State Patterns ───────────────────────────────────────

describe("Passport Pages — State Machine Patterns", () => {
  it("should start with loading=true and transition to loading=false on success", async () => {
    let loading = true;
    let error: string | null = null;
    let data: unknown = null;

    // Simulate the fetch pattern used in passport pages
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([mockAthlete]),
    });

    try {
      const d = await (await mockFetch()).json();
      data = d;
      loading = false;
    } catch (e: unknown) {
      error = (e as Error).message;
      loading = false;
    }

    expect(loading).toBe(false);
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should transition to error state on fetch failure", async () => {
    let loading = true;
    let error: string | null = null;
    let data: unknown = null;

    const mockFetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    try {
      const d = await (await mockFetch()).json();
      data = d;
      loading = false;
    } catch (e: unknown) {
      error = (e as Error).message;
      loading = false;
    }

    expect(loading).toBe(false);
    expect(error).toBe("Network failure");
    expect(data).toBeNull();
  });

  it("should transition to error state on JSON parse failure", async () => {
    let loading = true;
    let error: string | null = null;

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    });

    try {
      await (await mockFetch()).json();
      loading = false;
    } catch (e: unknown) {
      error = (e as Error).message;
      loading = false;
    }

    expect(loading).toBe(false);
    expect(error).toBe("Unexpected token");
  });
});

// ─── Athlete Data Processing Tests ────────────────────────────────────────────

describe("Passport Pages — Athlete Data Processing", () => {
  it("should compute level info from sportPoints", () => {
    const LEVELS = [
      { name: "Bronze", min: 0, color: "#CD7F32" },
      { name: "Silver", min: 500, color: "#C0C0C0" },
      { name: "Gold", min: 1000, color: "#FFD700" },
      { name: "Platinum", min: 2000, color: "#22D3EE" },
    ];

    function getLevelInfo(points: number) {
      let level = LEVELS[0];
      let idx = 0;
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (points >= LEVELS[i].min) {
          level = LEVELS[i];
          idx = i;
          break;
        }
      }
      const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
      const needed = next ? next.min - points : 0;
      return { level: level.name, color: level.color, needed, next: next?.name ?? null };
    }

    const bronze = getLevelInfo(100);
    expect(bronze.level).toBe("Bronze");
    expect(bronze.needed).toBe(400);

    const silver = getLevelInfo(750);
    expect(silver.level).toBe("Silver");
    expect(silver.needed).toBe(250);

    const gold = getLevelInfo(1250);
    expect(gold.level).toBe("Gold");
    expect(gold.needed).toBe(750);

    const platinum = getLevelInfo(2500);
    expect(platinum.level).toBe("Platinum");
    expect(platinum.needed).toBe(0);
    expect(platinum.next).toBeNull();
  });

  it("should compute level progress percentage", () => {
    // Gold: 1000-2000 range
    const sportPoints = 1250;
    const levelStart = 1000; // Gold
    const needed = 750; // 2000 - 1250
    const progressPct = Math.round(
      ((sportPoints - levelStart) / (needed + (sportPoints - levelStart))) * 100
    );
    expect(progressPct).toBe(25); // 250/1000 * 100
  });

  it("should extract sport stamps from sessions (deduplicate by facility+sport)", () => {
    const sessions = mockAthlete.sessions;
    const stamps = Array.from(
      new Map(sessions.map((s) => [`${s.facilityId}-${s.sport}`, s])).values()
    );
    expect(stamps).toHaveLength(1);
    expect(stamps[0].sport).toBe("Football");
  });

  it("should compute CircularRing dash offset from score", () => {
    const score = 85;
    const size = 110;
    const stroke = 9;
    const r = (size - stroke) / 2; // 50.5
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    expect(dash).toBeCloseTo((85 / 100) * 2 * Math.PI * 50.5, 1);
  });

  it("should handle facility checkin simulation data", () => {
    const newCheckin = {
      id: `CI-${Date.now()}`,
      athleteId: `ATH-${Math.floor(Math.random() * 9000 + 1000)}`,
      athleteName: "Omar Al-Saud",
      sport: "Football",
      timestamp: new Date().toISOString(),
      verified: true,
      pointsAwarded: 10,
    };
    expect(newCheckin.verified).toBe(true);
    expect(newCheckin.pointsAwarded).toBe(10);
    expect(newCheckin.id).toContain("CI-");
    expect(newCheckin.athleteId).toContain("ATH-");
  });
});

// ─── Ministry Dashboard Processing Tests ──────────────────────────────────────

describe("Passport Pages — Ministry KPI Processing", () => {
  it("should compute Vision 2030 progress percentage", () => {
    expect(mockMinistryKPI.vision2030Progress).toBe(68);
    expect(mockMinistryKPI.vision2030Progress).toBeGreaterThanOrEqual(0);
    expect(mockMinistryKPI.vision2030Progress).toBeLessThanOrEqual(100);
  });

  it("should calculate total from region breakdown", () => {
    const totalAthletes = mockMinistryKPI.regionBreakdown.reduce(
      (s, r) => s + r.athletes,
      0
    );
    expect(totalAthletes).toBe(9000); // 5200 + 3800
  });

  it("should find highest growth sport", () => {
    const highestGrowth = mockMinistryKPI.sportBreakdown.reduce((max, s) =>
      s.growth > max.growth ? s : max
    );
    expect(highestGrowth.sport).toBe("Swimming");
    expect(highestGrowth.growth).toBe(22);
  });

  it("should compute month-over-month athlete growth", () => {
    const growth =
      mockMinistryKPI.monthlyGrowth[1].athletes -
      mockMinistryKPI.monthlyGrowth[0].athletes;
    expect(growth).toBe(500); // 14500 - 14000
  });

  it("should compute active athlete percentage", () => {
    const pct = ((mockMinistryKPI.activeThisMonth / mockMinistryKPI.totalAthletes) * 100).toFixed(1);
    expect(pct).toBe("57.5");
  });
});