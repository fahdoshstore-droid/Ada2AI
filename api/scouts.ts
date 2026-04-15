/**
 * Scouts API — Vercel Serverless Function
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

export default async function handler(req: Request) {
  const supabase = getSupabase();
  if (!supabase) return new Response(JSON.stringify({ error: "Database not configured" }), { status: 503, headers: { "Content-Type": "application/json" } });

  const url = new URL(req.url);
  const method = req.method;

  try {
    if (method === "GET") {
      let query = supabase.from("scouts").select("*");
      const sport = url.searchParams.get("sport");
      if (sport) query = query.eq("sport", sport);
      const region = url.searchParams.get("region");
      if (region) query = query.eq("region", region);
      const search = url.searchParams.get("search");
      if (search) query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`);
      const { data, error } = await query.order("rating", { ascending: false });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST") {
      const auth = await verifyAuth(req, supabase);
      if (!auth) return new Response(JSON.stringify({ error: "Unauthorized — missing or invalid Authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });

      const body = await req.json();
      const { name, name_ar, sport, region, rating } = body;
      if (!name) return new Response(JSON.stringify({ error: "Scout name is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const { data, error } = await supabase.from("scouts").insert({ name, name_ar, sport: sport || "Football", region, rating: rating || 0 }).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    if (method === "DELETE") {
      const auth = await verifyAuth(req, supabase);
      if (!auth) return new Response(JSON.stringify({ error: "Unauthorized — missing or invalid Authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });

      const id = url.searchParams.get("id");
      if (!id) return new Response(JSON.stringify({ error: "Scout id required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const { error } = await supabase.from("scouts").delete().eq("id", id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { runtime: "edge" };