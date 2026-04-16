/**
 * Trainings API — Vercel Serverless Function
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
      const { data, error } = await supabase.from("trainings").select("*").order("date", { ascending: false });
      if (error) {
        // Table may not exist — return empty array
        console.warn("[Trainings] Query error (table may not exist):", error.message);
        return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST") {
      const auth = await verifyAuth(req, supabase);
      if (!auth) return new Response(JSON.stringify({ error: "Unauthorized — missing or invalid Authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });

      const body = await req.json();
      const { title, titleEn, date, time, maxAttendance } = body;
      if (!title) return new Response(JSON.stringify({ error: "Training title is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const { data, error } = await supabase.from("trainings").insert({ title, titleEn: titleEn || title, date, time, attendance: [], maxAttendance: maxAttendance || 25 }).select().single();
      if (error) return new Response(JSON.stringify({ error: "Failed to create training" }), { status: 500, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export const config = { runtime: "edge" };