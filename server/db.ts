/**
 * Supabase Database Client — Ada2AI
 * Uses Supabase for profiles and waitlist.
 *
 * Schema: The `profiles` table has these columns:
 *   id (UUID PK FK→auth.users), email, full_name, user_type
 * The `waitlist` table stores waitlist entries.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

// ─── Supabase Client (lazy singleton) ────────────────────────────────
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!_supabase && (ENV.supabaseUrl || process.env.SUPABASE_URL)) {
    const url = ENV.supabaseUrl || process.env.SUPABASE_URL;
    const key = ENV.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || "";
    if (url && key) {
      _supabase = createClient(url, key);
    }
  }
  return _supabase;
}

// ─── Types ────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  user_type: string | null;
}

export interface InsertProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  user_type?: string | null;
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

// ─── Profile Operations ──────────────────────────────────────────────
export async function upsertProfile(profile: InsertProfile): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("[Database] Cannot upsert profile: Supabase not configured");
    return;
  }

  const row: Record<string, unknown> = {
    id: profile.id,
    email: profile.email ?? null,
    full_name: profile.full_name ?? null,
  };

  if (profile.user_type) {
    row.user_type = profile.user_type;
  } else if (profile.id === ENV.ownerOpenId) {
    row.user_type = "admin";
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("[Database] Failed to upsert profile:", error);
    throw error;
  }
}

export async function getProfileById(id: string): Promise<Profile | undefined> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("[Database] Cannot get profile: Supabase not configured");
    return undefined;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Database] Failed to get profile:", error);
    return undefined;
  }

  return (data as Profile) ?? undefined;
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