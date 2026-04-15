/**
 * Supabase Database Client — Ada2AI
 * Unified database layer replacing MySQL/Drizzle.
 * Uses Supabase for users, profiles, and waitlist.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

// ─── Supabase Client (lazy singleton) ─────────────────────────────────
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!_supabase && ENV.databaseUrl) {
    // databaseUrl is repurposed as SUPABASE_URL for backward compat
    // but prefer explicit env vars
    const url = process.env.SUPABASE_URL || ENV.databaseUrl;
    const key = process.env.SUPABASE_ANON_KEY || "";
    if (url && key) {
      _supabase = createClient(url, key);
    }
  }
  return _supabase;
}

// ─── Types ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  open_id: string;
  name: string | null;
  email: string | null;
  login_method: string | null;
  role: "user" | "admin";
  last_signed_in: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsertUser {
  open_id: string;
  name?: string | null;
  email?: string | null;
  login_method?: string | null;
  role?: "user" | "admin";
  last_signed_in?: string;
}

export interface WaitlistEntry {
  id?: string;
  name: string;
  email: string;
  role: "athlete" | "scout" | "coach" | "academy" | "federation" | "other";
  sport?: string | null;
  message?: string | null;
  created_at?: string;
}

// ─── User Operations ──────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("[Database] Cannot upsert user: Supabase not configured");
    return;
  }

  const row: Record<string, unknown> = {
    open_id: user.open_id,
    name: user.name ?? null,
    email: user.email ?? null,
    login_method: user.login_method ?? null,
  };

  if (user.role) {
    row.role = user.role;
  } else if (user.open_id === ENV.ownerOpenId) {
    row.role = "admin";
  }

  if (user.last_signed_in) {
    row.last_signed_in = user.last_signed_in;
  }

  // Ensure updated_at is always refreshed
  row.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("users")
    .upsert(row, { onConflict: "open_id" });

  if (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("[Database] Cannot get user: Supabase not configured");
    return undefined;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("open_id", openId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Database] Failed to get user:", error);
    return undefined;
  }

  return (data as User) ?? undefined;
}

// ─── Waitlist Operations ──────────────────────────────────────────────
export async function joinWaitlist(entry: WaitlistEntry): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("[Database] Cannot join waitlist: Supabase not configured");
    return;
  }

  const { error } = await supabase
    .from("waitlist")
    .upsert(
      { name: entry.name, email: entry.email, role: entry.role, sport: entry.sport ?? null, message: entry.message ?? null },
      { onConflict: "email" }
    );

  if (error) {
    console.error("[Database] Failed to join waitlist:", error);
    throw error;
  }
}

export async function getWaitlistCount(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[Database] Failed to get waitlist count:", error);
    return 0;
  }

  return count ?? 0;
}
