/**
 * tRPC Context — Supabase Auth
 *
 * Reads the Authorization: Bearer <token> header and verifies
 * it against Supabase Auth to populate ctx.user (or null for
 * public procedures).
 */
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

// Lazy-initialised Supabase client for server-side token verification
let _supabaseForAuth: ReturnType<typeof createClient> | null = null;

function getSupabaseForAuth() {
  if (!_supabaseForAuth) {
    const url = ENV.supabaseUrl || process.env.SUPABASE_URL || "";
    const key = ENV.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || "";
    if (url && key) {
      _supabaseForAuth = createClient(url, key);
    }
  }
  return _supabaseForAuth;
}

export type AuthUser = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export type TrpcContext = {
  req: any;
  res?: any;
  user: AuthUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions | { req: Request; res?: Response }
): Promise<TrpcContext> {
  let user: AuthUser | null = null;

  try {
    // Extract the Bearer token from the Authorization header
    const authHeader =
      typeof opts.req.headers.get === "function"
        ? (opts.req as any).headers.get("authorization")
        : (opts.req as any).headers?.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const supabase = getSupabaseForAuth();

      if (supabase) {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          user = {
            id: data.user.id,
            email: data.user.email ?? null,
            full_name: data.user.user_metadata?.full_name || null,
          };
        }
      }
    }
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: (opts as any).res,
    user,
  };
}