/**
 * tRPC API — Vercel Serverless Function (minimal)
 * Only handles auth.me (returns null user) and waitlist.join/count
 * Full tRPC server runs on PM2 locally — this is a lightweight Vercel proxy
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

interface TRPCRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

// Parse batch tRPC request
function parseTRPCPath(url: string): { procedure: string; input?: any; isBatch: boolean } {
  const u = new URL(url, "https://placeholder");
  const pathParts = u.pathname.replace("/api/trpc/", "").split(",");
  const isBatch = pathParts.length > 1;
  const procedure = pathParts[0] || "";
  const inputStr = u.searchParams.get("input");
  let input: any = undefined;
  if (inputStr) {
    try { input = JSON.parse(inputStr); } catch {}
  }
  return { procedure, input, isBatch };
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const method = req.method;
  const pathInfo = parseTRPCPath(url.toString());

  try {
    // auth.me — return null user (auth handled locally by PM2)
    if (pathInfo.procedure === "auth.me") {
      return Response.json([{ result: { data: null } }]);
    }

    // auth.logout
    if (pathInfo.procedure === "auth.logout") {
      return Response.json([{ result: { data: { success: true } } }]);
    }

    // waitlist.join (POST)
    if (method === "POST" && pathInfo.procedure === "waitlist.join") {
      const body = await req.json();
      const supabase = getSupabase();
      if (!supabase) return Response.json([{ error: { message: "DB not configured", code: -32603 } }]);

      const { error } = await supabase.from("waitlist").upsert({
        name: body.name || body.name0,
        email: body.email || body.email0,
        role: body.role || body.role0 || "athlete",
        sport: body.sport || body.sport0 || null,
        message: body.message || body.message0 || null,
      }, { onConflict: "email" });

      if (error) return Response.json([{ error: { message: error.message, code: -32603 } }]);
      return Response.json([{ result: { data: { success: true } } }]);
    }

    // waitlist.count
    if (pathInfo.procedure === "waitlist.count") {
      const supabase = getSupabase();
      if (!supabase) return Response.json([{ result: { data: 0 } }]);

      const { count, error } = await supabase.from("waitlist").select("*", { count: "exact", head: true });
      return Response.json([{ result: { data: count ?? 0 } }]);
    }

    // system.*
    if (pathInfo.procedure.startsWith("system.")) {
      return Response.json([{ result: { data: null } }]);
    }

    // voice.transcribe
    if (pathInfo.procedure === "voice.transcribe") {
      return Response.json([{ result: { data: { text: "" } } }]);
    }

    // Unknown procedure — return null
    return Response.json([{ result: { data: null } }]);
  } catch (err: any) {
    return Response.json([{ error: { message: err.message || "Internal error", code: -32603 } }]);
  }
}

export const config = { runtime: "edge" };
