/**
 * Ada2AI API Layer - Typed Supabase functions
 * DRY - Centralized API calls
 */

import { supabase, type Profile, type Player } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// ─── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, session: data.session, error };
  },

  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { user: data.user, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_, session) => {
      callback(session?.user ?? null);
    });
  },
};

// ─── Profile API ───────────────────────────────────────────────────────────────

export const profileApi = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    return { profile: data as Profile | null, error };
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();
    return { profile: data as Profile | null, error };
  },

  async createProfile(profile: Omit<Profile, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select()
      .single();
    return { profile: data as Profile | null, error };
  },
};

// ─── Players API ────────────────────────────────────────────────────────────────

export const playersApi = {
  async getPlayers(filters?: {
    clubId?: string;
    academyId?: string;
    position?: string;
    sport?: string;
    limit?: number;
  }) {
    let query = supabase.from("players").select("*");

    if (filters?.clubId) query = query.eq("club_id", filters.clubId);
    if (filters?.academyId) query = query.eq("academy_id", filters.academyId);
    if (filters?.position) query = query.eq("position", filters.position);
    if (filters?.sport) query = query.eq("sport", filters.sport);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    return { players: data as Player[] ?? [], error };
  },

  async getPlayer(playerId: string) {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();
    return { player: data as Player | null, error };
  },

  async createPlayer(player: Omit<Player, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("players")
      .insert(player)
      .select()
      .single();
    return { player: data as Player | null, error };
  },

  async updatePlayer(playerId: string, updates: Partial<Player>) {
    const { data, error } = await supabase
      .from("players")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", playerId)
      .select()
      .single();
    return { player: data as Player | null, error };
  },

  async deletePlayer(playerId: string) {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);
    return { error };
  },
};

// ─── Video Analysis API ────────────────────────────────────────────────────────

export const analysisApi = {
  async analyzeVideo(videoUrl: string, options?: {
    teamId?: string;
    sportType?: string;
  }) {
    // TODO: Connect to YOLO backend when deployed
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/analyze/single`, {
      method: "POST",
      body: JSON.stringify({
        video_url: videoUrl,
        team_id: options?.teamId,
        sport_type: options?.sportType || "football",
      }),
    });
    return response.json();
  },

  async analyzeFrame(imageUrl: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/detect/frame`, {
      method: "POST",
    });
    return response.json();
  },
};

// ─── Generic API ───────────────────────────────────────────────────────────────

export async function handleApiError<T>(promise: Promise<{ data: T; error: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    console.error("API Error:", error);
    throw error;
  }
  return data;
}
