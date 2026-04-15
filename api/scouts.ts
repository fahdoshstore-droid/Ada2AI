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

export default async function handler(req: Request) {
  const supabase = getSupabase();
  if (!supabase) return new Response(JSON.stringify({ error: "Database not configured" }), { status: 503, headers: { "Content-Type": "application/json" } });

  const url = new URL(req.url);

  try {
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
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { runtime: "edge" };
