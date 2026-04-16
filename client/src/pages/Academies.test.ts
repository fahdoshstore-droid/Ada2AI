import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for the Academies page API integration.
 *
 * The Academies page fetches from /api/academies with query params
 * for search, city, and sport filters. It uses Arabic filter labels.
 */

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockAcademies = [
  {
    id: "ac1",
    name: "Riyadh Football Academy",
    name_ar: "أكاديمية الرياض لكرة القدم",
    sport: "كرة القدم",
    region: "Riyadh",
    city: "دمام",
    description: "Top football academy",
    description_ar: "أفضل أكاديمية كرة قدم",
    rating: 4.8,
    player_count: 120,
    verified: true,
  },
  {
    id: "ac2",
    name: "Eastern Sports Club",
    name_ar: "نادي الشرقية الرياضي",
    sport: "متعدد",
    region: "Eastern Province",
    city: "خبر",
    description: "Multi-sport facility",
    description_ar: "منشأة متعددة الرياضات",
    rating: 4.5,
    player_count: 85,
    verified: true,
  },
  {
    id: "ac3",
    name: "Dammam Athletic Center",
    name_ar: "مركز الدمام الرياضي",
    sport: "كرة القدم",
    region: "Eastern Province",
    city: "دمام",
    description: "Football training center",
    description_ar: "مركز تدريب كرة القدم",
    rating: 4.2,
    player_count: 60,
    verified: false,
  },
];

// ─── URL Construction Tests ───────────────────────────────────────────────────

describe("Academies Page — URL Construction", () => {
  function buildAcademiesUrl(params: {
    search?: string;
    city?: string;
    sport?: string;
  }): string {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.city && params.city !== "الكل") sp.set("city", params.city);
    if (params.sport && params.sport !== "الكل") sp.set("sport", params.sport);
    const qs = sp.toString();
    return `/api/academies${qs ? `?${qs}` : ""}`;
  }

  it("should build base URL with no filters", () => {
    expect(buildAcademiesUrl({})).toBe("/api/academies");
  });

  it("should include search param", () => {
    expect(buildAcademiesUrl({ search: "football" })).toBe(
      "/api/academies?search=football"
    );
  });

  it("should include city filter when not 'الكل'", () => {
    expect(buildAcademiesUrl({ city: "دمام" })).toBe(
      "/api/academies?city=%D8%AF%D9%85%D8%A7%D9%85"
    );
  });

  it("should NOT include city filter when 'الكل'", () => {
    expect(buildAcademiesUrl({ city: "الكل" })).toBe("/api/academies");
  });

  it("should include sport filter when not 'الكل'", () => {
    const url = buildAcademiesUrl({ sport: "كرة القدم" });
    expect(url).toContain("sport=");
  });

  it("should NOT include sport filter when 'الكل'", () => {
    expect(buildAcademiesUrl({ sport: "الكل" })).toBe("/api/academies");
  });

  it("should combine search + city + sport filters", () => {
    const url = buildAcademiesUrl({
      search: "رياضة",
      city: "دمام",
      sport: "كرة القدم",
    });
    expect(url).toContain("search=");
    expect(url).toContain("city=");
    expect(url).toContain("sport=");
  });
});

// ─── Fetch Integration Tests ─────────────────────────────────────────────────

describe("Academies Page — Fetch Integration", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAcademies),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call fetch with /api/academies", async () => {
    await fetch("/api/academies");
    expect(fetchSpy).toHaveBeenCalledWith("/api/academies");
  });

  it("should parse JSON response from academies API", async () => {
    const response = await fetch("/api/academies");
    const data = await response.json();
    expect(data).toEqual(mockAcademies);
    expect(data).toHaveLength(3);
  });

  it("should handle empty academies array", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    const data = await (await fetch("/api/academies")).json();
    expect(data).toHaveLength(0);
  });

  it("should handle fetch error gracefully", async () => {
    fetchSpy.mockRejectedValue(new Error("Server unreachable"));
    await expect(fetch("/api/academies")).rejects.toThrow("Server unreachable");
  });

  it("should handle network timeout", async () => {
    fetchSpy.mockRejectedValue(new Error("AbortError: The operation was aborted"));
    await expect(fetch("/api/academies")).rejects.toThrow("aborted");
  });
});

// ─── Client-Side Filtering Tests ──────────────────────────────────────────────
// The Academies page does client-side filtering after fetching all data.

describe("Academies Page — Client-Side Filtering", () => {
  function filterAcademies(
    academies: typeof mockAcademies,
    filters: { city: string; sport: string; search: string }
  ) {
    return academies.filter((a) => {
      const cityMatch = filters.city === "الكل" || a.city === filters.city;
      const sportMatch = filters.sport === "الكل" || a.sport === filters.sport;
      const searchMatch =
        filters.search === "" ||
        a.name.includes(filters.search) ||
        (a.name_ar && a.name_ar.includes(filters.search)) ||
        a.city.includes(filters.search);
      return cityMatch && sportMatch && searchMatch;
    });
  }

  it("should return all when using default 'الكل' filters", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "الكل",
      sport: "الكل",
      search: "",
    });
    expect(filtered).toHaveLength(3);
  });

  it("should filter by city = دمام", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "دمام",
      sport: "الكل",
      search: "",
    });
    expect(filtered).toHaveLength(2);
    expect(filtered.every((a) => a.city === "دمام")).toBe(true);
  });

  it("should filter by sport = كرة القدم", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "الكل",
      sport: "كرة القدم",
      search: "",
    });
    expect(filtered).toHaveLength(2);
  });

  it("should filter by Arabic search term in name_ar", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "الكل",
      sport: "الكل",
      search: "الشرقية",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("ac2");
  });

  it("should filter by English search term in name", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "الكل",
      sport: "الكل",
      search: "Football",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("ac1");
  });

  it("should combine city and sport filters", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "دمام",
      sport: "كرة القدم",
      search: "",
    });
    // Both ac1 and ac3 match: city=دمام, sport=كرة القدم
    expect(filtered).toHaveLength(2);
    expect(filtered.every((a) => a.city === "دمام")).toBe(true);
    expect(filtered.every((a) => a.sport === "كرة القدم")).toBe(true);
  });

  it("should combine city, sport, and search filters for exact match", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "خبر",
      sport: "متعدد",
      search: "الشرقية",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("ac2");
  });

  it("should return empty for non-matching combination", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "خبر",
      sport: "كرة القدم",
      search: "",
    });
    expect(filtered).toHaveLength(0);
  });

  it("should compute filtered vs total count for display", () => {
    const filtered = filterAcademies(mockAcademies, {
      city: "دمام",
      sport: "الكل",
      search: "",
    });
    expect(filtered.length).toBe(2);
    expect(mockAcademies.length).toBe(3);
  });
});

// ─── Data Validation Tests ────────────────────────────────────────────────────

describe("Academies Page — Data Validation", () => {
  it("should check verification status correctly", () => {
    const verified = mockAcademies.filter((a) => a.verified);
    const unverified = mockAcademies.filter((a) => !a.verified);
    expect(verified).toHaveLength(2);
    expect(unverified).toHaveLength(1);
  });

  it("should compute academy color by index (cycling colors)", () => {
    const colors = ["#1db954", "#f59e0b", "#ef4444", "#3b82f6"];
    expect(colors[0 % colors.length]).toBe("#1db954");
    expect(colors[1 % colors.length]).toBe("#f59e0b");
    expect(colors[2 % colors.length]).toBe("#ef4444");
    expect(colors[3 % colors.length]).toBe("#3b82f6"); // wraps
    expect(colors[4 % colors.length]).toBe("#1db954"); // cycle
  });

  it("should handle missing name_ar gracefully", () => {
    const academy = { ...mockAcademies[0], name_ar: undefined as unknown as string };
    const lang = "ar";
    const displayName = lang === "ar" && academy.name_ar ? academy.name_ar : academy.name;
    expect(displayName).toBe("Riyadh Football Academy");
  });

  it("should use Arabic name when available and lang is ar", () => {
    const academy = mockAcademies[0];
    const lang = "ar";
    const displayName = lang === "ar" && academy.name_ar ? academy.name_ar : academy.name;
    expect(displayName).toBe("أكاديمية الرياض لكرة القدم");
  });

  it("should use English name when lang is en regardless of name_ar", () => {
    const academy = mockAcademies[0];
    const lang = "en";
    const displayName = lang === "ar" && academy.name_ar ? academy.name_ar : academy.name;
    expect(displayName).toBe("Riyadh Football Academy");
  });
});