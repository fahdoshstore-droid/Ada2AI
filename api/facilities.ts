/**
 * Facilities API — Vercel Serverless Function
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function verifyAuth(req: Request, supabase: SupabaseClient): Promise<{ user: any } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const { data, error } = await (supabase.auth as any).getUser(token);
  if (error || !data.user) return null;
  return { user: data.user };
}

// Mock data fallback (facilities table may not exist yet in Supabase)
const mockFacilities = [
  {
    id: 'FAC-001',
    name: 'Prince Faisal Sports Center',
    nameAr: 'مركز الأمير فيصل الرياضي',
    city: 'Jeddah',
    region: 'Makkah',
    sports: ['Football', 'Basketball', 'Tennis', 'Swimming'],
    managerId: 'MGR-001',
    monthlyRevenue: 485000,
    activeAthletes: 1247,
    checkins: [],
  },
  {
    id: 'FAC-002',
    name: 'Riyadh Aquatic Center',
    nameAr: 'مركز الرياض المائي',
    city: 'Riyadh',
    region: 'Riyadh',
    sports: ['Swimming', 'Water Polo'],
    managerId: 'MGR-002',
    monthlyRevenue: 320000,
    activeAthletes: 680,
    checkins: [],
  },
  {
    id: 'FAC-003',
    name: 'Al-Ittihad Sports Hall',
    nameAr: 'قاعة الاتحاد الرياضية',
    city: 'Jeddah',
    region: 'Makkah',
    sports: ['Basketball', 'Volleyball'],
    managerId: 'MGR-003',
    monthlyRevenue: 210000,
    activeAthletes: 520,
    checkins: [],
  },
  {
    id: 'FAC-004',
    name: 'Dammam Athletics Track',
    nameAr: 'مضمار الدمام لألعاب القوى',
    city: 'Dammam',
    region: 'Eastern Province',
    sports: ['Athletics'],
    managerId: 'MGR-004',
    monthlyRevenue: 150000,
    activeAthletes: 390,
    checkins: [],
  },
  {
    id: 'FAC-005',
    name: 'Eastern Sports Complex',
    nameAr: 'مجمع الشرق الرياضي',
    city: 'Dammam',
    region: 'Eastern Province',
    sports: ['Volleyball', 'Basketball', 'Football'],
    managerId: 'MGR-005',
    monthlyRevenue: 290000,
    activeAthletes: 750,
    checkins: [],
  },
];

export default async function handler(req: Request) {
  const supabase = getSupabase();
  if (!supabase) return new Response(JSON.stringify({ error: "Database not configured" }), { status: 503, headers: { "Content-Type": "application/json" } });

  const url = new URL(req.url);
  const method = req.method;

  try {
    if (method === "GET") {
      // Check if this is a single-facility request: /api/facilities?id=FAC-001
      const id = url.searchParams.get("id");
      if (id) {
        const { data, error } = await supabase.from("facilities").select("*").eq("id", id).maybeSingle();
        if (error) {
          // Table may not exist — fall back to mock data
          const mock = mockFacilities.find(f => f.id === id);
          if (!mock) return new Response(JSON.stringify({ error: "Facility not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
          return new Response(JSON.stringify(mock), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        if (!data) return new Response(JSON.stringify({ error: "Facility not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      // List facilities with optional filters
      let query = supabase.from("facilities").select("*");
      const region = url.searchParams.get("region");
      if (region) query = query.eq("region", region);
      const city = url.searchParams.get("city");
      if (city) query = query.eq("city", city);
      const sport = url.searchParams.get("sport");
      if (sport) query = query.contains("sports", [sport]);
      const { data, error } = await query;
      if (error) {
        // Table may not exist — fall back to mock data
        let results = mockFacilities;
        if (region) results = results.filter(f => f.region === region);
        if (city) results = results.filter(f => f.city === city);
        if (sport) results = results.filter(f => f.sports.includes(sport));
        return new Response(JSON.stringify(results), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST") {
      const auth = await verifyAuth(req, supabase);
      if (!auth) return new Response(JSON.stringify({ error: "Unauthorized — missing or invalid Authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });

      const body = await req.json();
      const { name, nameAr, city, region, sports, managerId, monthlyRevenue, activeAthletes } = body;
      if (!name) return new Response(JSON.stringify({ error: "Facility name is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const { data, error } = await supabase.from("facilities").insert({ name, nameAr, city, region, sports, managerId, monthlyRevenue, activeAthletes }).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    if (method === "DELETE") {
      const auth = await verifyAuth(req, supabase);
      if (!auth) return new Response(JSON.stringify({ error: "Unauthorized — missing or invalid Authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });

      const id = url.searchParams.get("id");
      if (!id) return new Response(JSON.stringify({ error: "Facility id required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const { error } = await supabase.from("facilities").delete().eq("id", id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { runtime: "edge" };