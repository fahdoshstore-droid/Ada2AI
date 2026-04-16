import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for the Scouts page API integration.
 *
 * The Scouts page fetches from /api/scouts with query params
 * for search, sport, and region filters. It also supports
 * sorting and a compare feature.
 */

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockScouts = [
  {
    id: "sc1",
    name: "Ahmed Al-Farsi",
    name_ar: "أحمد الفارسي",
    organization: "Saudi Football Federation",
    organization_ar: "الاتحاد السعودي لكرة القدم",
    sport: "Football",
    region: "Riyadh",
    speciality: "Talent ID",
    experience_years: 12,
    verified: true,
    rating: 92,
    reports_count: 145,
  },
  {
    id: "sc2",
    name: "Sara Al-Zahrani",
    name_ar: "سارة الزهراني",
    organization: "National Sports Authority",
    organization_ar: "الهيئة الوطنية للرياضة",
    sport: "Athletics",
    region: "Jeddah",
    speciality: "Performance Analysis",
    experience_years: 8,
    verified: true,
    rating: 87,
    reports_count: 98,
  },
  {
    id: "sc3",
    name: "Khalid Al-Otaibi",
    name_ar: "خالد العتيبي",
    organization: "Eastern Province SC",
    organization_ar: "نادي المنطقة الشرقية",
    sport: "Football",
    region: "Dammam",
    speciality: "Youth Scouting",
    experience_years: 5,
    verified: false,
    rating: 78,
    reports_count: 45,
  },
];

// ─── URL Construction Tests ───────────────────────────────────────────────────

describe("Scouts Page — URL Construction", () => {
  function buildScoutsUrl(params: {
    search?: string;
    sport?: string;
    region?: string;
  }): string {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.sport && params.sport !== "all") sp.set("sport", params.sport);
    if (params.region && params.region !== "all") sp.set("region", params.region);
    const qs = sp.toString();
    return `/api/scouts${qs ? `?${qs}` : ""}`;
  }

  it("should build base URL with no filters", () => {
    expect(buildScoutsUrl({})).toBe("/api/scouts");
  });

  it("should include search param", () => {
    expect(buildScoutsUrl({ search: "Ahmed" })).toBe(
      "/api/scouts?search=Ahmed"
    );
  });

  it("should include sport filter when not 'all'", () => {
    expect(buildScoutsUrl({ sport: "Football" })).toBe(
      "/api/scouts?sport=Football"
    );
  });

  it("should NOT include sport filter when 'all'", () => {
    expect(buildScoutsUrl({ sport: "all" })).toBe("/api/scouts");
  });

  it("should include region filter when not 'all'", () => {
    expect(buildScoutsUrl({ region: "Riyadh" })).toBe(
      "/api/scouts?region=Riyadh"
    );
  });

  it("should NOT include region filter when 'all'", () => {
    expect(buildScoutsUrl({ region: "all" })).toBe("/api/scouts");
  });

  it("should combine multiple filters", () => {
    const url = buildScoutsUrl({
      search: "Ahmed",
      sport: "Football",
      region: "Riyadh",
    });
    expect(url).toContain("search=Ahmed");
    expect(url).toContain("sport=Football");
    expect(url).toContain("region=Riyadh");
  });
});

// ─── Fetch Integration Tests ─────────────────────────────────────────────────

describe("Scouts Page — Fetch Integration", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockScouts),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call fetch with /api/scouts", async () => {
    await fetch("/api/scouts");
    expect(fetchSpy).toHaveBeenCalledWith("/api/scouts");
  });

  it("should parse JSON response from scouts API", async () => {
    const response = await fetch("/api/scouts");
    const data = await response.json();
    expect(data).toEqual(mockScouts);
    expect(data).toHaveLength(3);
  });

  it("should handle empty scouts array", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    const data = await (await fetch("/api/scouts")).json();
    expect(data).toEqual([]);
  });

  it("should handle fetch error", async () => {
    fetchSpy.mockRejectedValue(new Error("Connection refused"));
    await expect(fetch("/api/scouts")).rejects.toThrow("Connection refused");
  });

  it("should handle 500 server error response", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);
    const response = await fetch("/api/scouts");
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});

// ─── Client-Side Filtering Tests ──────────────────────────────────────────────

describe("Scouts Page — Client-Side Filtering", () => {
  type SortKey = "rating" | "experience_years" | "reports_count";
  type SortDir = "asc" | "desc";

  function filterAndSortScouts(
    scouts: typeof mockScouts,
    filters: { search: string; sportFilter: string; regionFilter: string },
    sort: { key: SortKey; dir: SortDir },
    lang: "en" | "ar" = "en"
  ) {
    return scouts
      .filter((s) => {
        const name = lang === "ar" && s.name_ar ? s.name_ar : s.name;
        const searchMatch =
          filters.search === "" ||
          name.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.region.toLowerCase().includes(filters.search.toLowerCase());
        const sportMatch =
          filters.sportFilter === "all" || s.sport === filters.sportFilter;
        const regionMatch =
          filters.regionFilter === "all" || s.region === filters.regionFilter;
        return searchMatch && sportMatch && regionMatch;
      })
      .sort((a, b) => {
        const aVal = a[sort.key];
        const bVal = b[sort.key];
        return sort.dir === "desc" ? bVal - aVal : aVal - bVal;
      });
  }

  it("should return all with default 'all' filters", () => {
    const result = filterAndSortScouts(
      mockScouts,
      { search: "", sportFilter: "all", regionFilter: "all" },
      { key: "rating", dir: "desc" }
    );
    expect(result).toHaveLength(3);
  });

  it("should filter by sport = Football", () => {
    const result = filterAndSortScouts(
      mockScouts,
      { search: "", sportFilter: "Football", regionFilter: "all" },
      { key: "rating", dir: "desc" }
    );
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.sport === "Football")).toBe(true);
  });

  it("should filter by region = Riyadh", () => {
    const result = filterAndSortScouts(
      mockScouts,
      { search: "", sportFilter: "all", regionFilter: "Riyadh" },
      { key: "rating", dir: "desc" }
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sc1");
  });

  it("should filter by search term matching name", () => {
    const result = filterAndSortScouts(
      mockScouts,
      { search: "Ahmed", sportFilter: "all", regionFilter: "all" },
      { key: "rating", dir: "desc" }
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ahmed Al-Farsi");
  });

  it("should search by region name", () => {
    const result = filterAndSortScouts(
      mockScouts,
      { search: "jed", sportFilter: "all", regionFilter: "all" },
      { key: "rating", dir: "desc" }
    );
    expect(result).toHaveLength(1);
    expect(result[0].region).toBe("Jeddah");
  });

  it("should search using Arabic name when lang is ar", () => {
    const result = filterAndSortScouts(
      mockScouts,
      { search: "أحمد", sportFilter: "all", regionFilter: "all" },
      { key: "rating", dir: "desc" },
      "ar"
    );
    expect(result).toHaveLength(1);
  });

  it("should combine sport and region filters", () => {
    const result = filterAndSortScouts(
      mockScouts,
      { search: "", sportFilter: "Football", regionFilter: "Riyadh" },
      { key: "rating", dir: "desc" }
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sc1");
  });
});

// ─── Sorting Tests ────────────────────────────────────────────────────────────

describe("Scouts Page — Sorting", () => {
  type SortKey = "rating" | "experience_years" | "reports_count";
  type SortDir = "asc" | "desc";

  function sortScouts(scouts: typeof mockScouts, key: SortKey, dir: SortDir) {
    return [...scouts].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      return dir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }

  it("should sort by rating descending (default)", () => {
    const result = sortScouts(mockScouts, "rating", "desc");
    expect(result[0].rating).toBe(92);
    expect(result[1].rating).toBe(87);
    expect(result[2].rating).toBe(78);
  });

  it("should sort by rating ascending", () => {
    const result = sortScouts(mockScouts, "rating", "asc");
    expect(result[0].rating).toBe(78);
    expect(result[2].rating).toBe(92);
  });

  it("should sort by experience_years descending", () => {
    const result = sortScouts(mockScouts, "experience_years", "desc");
    expect(result[0].experience_years).toBe(12);
    expect(result[2].experience_years).toBe(5);
  });

  it("should sort by reports_count ascending", () => {
    const result = sortScouts(mockScouts, "reports_count", "asc");
    expect(result[0].reports_count).toBe(45);
    expect(result[2].reports_count).toBe(145);
  });

  it("should toggle sort direction when sorting same key", () => {
    let dir: SortDir = "desc";
    let key: SortKey = "rating";
    // Toggle logic from Scouts component
    const toggleSort = (newKey: SortKey) => {
      if (key === newKey) dir = dir === "desc" ? "asc" : "desc";
      else {
        key = newKey;
        dir = "desc";
      }
    };
    toggleSort("rating"); // same key: desc → asc
    expect(dir).toBe("asc");
    expect(key).toBe("rating");

    toggleSort("rating"); // same key: asc → desc
    expect(dir).toBe("desc");

    toggleSort("experience_years"); // new key: reset to desc
    expect(dir).toBe("desc");
    expect(key).toBe("experience_years");
  });
});

// ─── Compare Feature Tests ────────────────────────────────────────────────────

describe("Scouts Page — Compare Feature", () => {
  function toggleCompare(compareList: string[], id: string): string[] {
    if (compareList.includes(id)) {
      return compareList.filter((x) => x !== id);
    }
    if (compareList.length < 2) {
      return [...compareList, id];
    }
    return compareList; // max 2
  }

  it("should add first scout to compare list", () => {
    const result = toggleCompare([], "sc1");
    expect(result).toEqual(["sc1"]);
  });

  it("should add second scout to compare list", () => {
    const result = toggleCompare(["sc1"], "sc2");
    expect(result).toEqual(["sc1", "sc2"]);
  });

  it("should NOT add third scout (max 2)", () => {
    const result = toggleCompare(["sc1", "sc2"], "sc3");
    expect(result).toEqual(["sc1", "sc2"]);
  });

  it("should remove scout from compare list", () => {
    const result = toggleCompare(["sc1", "sc2"], "sc1");
    expect(result).toEqual(["sc2"]);
  });

  it("should handle toggling same scout off then on", () => {
    let list = toggleCompare([], "sc1");
    expect(list).toEqual(["sc1"]);
    list = toggleCompare(list, "sc1");
    expect(list).toEqual([]);
  });
});

// ─── Stats Computation Tests ──────────────────────────────────────────────────

describe("Scouts Page — Stats Computation", () => {
  it("should compute average rating", () => {
    const avg =
      mockScouts.reduce((s, p) => s + p.rating, 0) / mockScouts.length;
    expect(avg.toFixed(1)).toBe("85.7");
  });

  it("should count unique sports", () => {
    const uniqueSports = new Set(mockScouts.map((s) => s.sport)).size;
    expect(uniqueSports).toBe(2);
  });

  it("should count unique regions", () => {
    const uniqueRegions = new Set(mockScouts.map((s) => s.region)).size;
    expect(uniqueRegions).toBe(3);
  });

  it("should handle empty scouts for avg rating", () => {
    const sc: typeof mockScouts = [];
    const avg = sc.length > 0 ? sc.reduce((s, p) => s + p.rating, 0) / sc.length : 0;
    expect(avg).toBe(0);
  });

  it("should build sport options from data", () => {
    const sports = ["all", ...Array.from(new Set(mockScouts.map((s) => s.sport)))];
    expect(sports).toEqual(["all", "Football", "Athletics"]);
  });

  it("should build region options from data", () => {
    const regions = ["all", ...Array.from(new Set(mockScouts.map((s) => s.region)))];
    expect(regions).toEqual(["all", "Riyadh", "Jeddah", "Dammam"]);
  });

  it("should determine rating color based on threshold", () => {
    // >= 85 → teal (#00DCC8), >= 80 → orange, else default
    const getColor = (r: number) =>
      r >= 85 ? "#00DCC8" : r >= 80 ? "#FFA500" : "#007ABA";
    expect(getColor(92)).toBe("#00DCC8");
    expect(getColor(87)).toBe("#00DCC8");
    expect(getColor(82)).toBe("#FFA500");
    expect(getColor(78)).toBe("#007ABA");
  });
});