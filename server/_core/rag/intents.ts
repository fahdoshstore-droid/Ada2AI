/**
 * Intent Registry — Ada2AI RAG System
 *
 * Each intent defines:
 *   - id: unique identifier
 *   - keywords: Arabic + English trigger phrases for classification
 *   - examples: sample questions this intent handles
 *   - buildQuery: builds a Supabase query from extracted params (SQL-bound, never free-form)
 *   - responseContext: tells the LLM what data it received
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────

export interface Intent {
  id: string;
  keywords: string[];
  examples: string[];
  buildQuery: (supabase: SupabaseClient, params: Record<string, string>) => SupabaseQuery;
  responseContext: string;
}

/**
 * Return type for buildQuery — either a query to execute
 * or a flag indicating no DB query is needed (general_sport).
 *
 * `execute()` returns a thenable (Supabase's PostgrestFilterBuilder)
 * which resolves to the standard {data, count, error} shape.
 */
export interface SupabaseQuery {
  table: string;
  execute: () => PromiseLike<{ data: unknown[] | null; count: number | null; error: { message: string } | null }>;
}

// ─── Intent Definitions ───────────────────────────────────────────────

export const intents: Intent[] = [
  {
    id: "player_search",
    keywords: [
      "لاعب", "لاعبين", "اللاعبين", "لاعبين كرة", "أبغى لاعبين", "ابحث عن لاعب",
      "player", "players", "find player", "search player", "football players",
      "basketball players", "list players",
    ],
    examples: [
      "أبغى لاعبين كرة قدم في الرياض",
      "find football players in Riyadh",
      "لاعبين كرة سلة",
    ],
    buildQuery: (supabase, params) => {
      let query = supabase.from("players").select("*");
      if (params.sport) query = query.eq("sport", params.sport);
      if (params.region) query = query.eq("region", params.region);
      if (params.search) {
        const pattern = `%${params.search}%`;
        query = query.or(`name.ilike.${pattern},name_ar.ilike.${pattern}`);
      }
      return {
        table: "players",
        execute: () => query,
      } as SupabaseQuery;
    },
    responseContext: "Player search results with names, sports, regions, ratings, and stats.",
  },

  {
    id: "player_stats",
    keywords: [
      "مستوى اللاعب", "إحصائيات اللاعب", "تقيم اللاعب", "وش مستوى",
      "player stats", "player rating", "player level", "player profile",
      "stats for", "rating of",
    ],
    examples: [
      "وش مستوى اللاعب أحمد",
      "player stats for Mohamed",
      "إحصائيات اللاعب خالد",
    ],
    buildQuery: (supabase, params) => {
      let query = supabase.from("players").select("*");
      if (params.playerName) {
        const pattern = `%${params.playerName}%`;
        query = query.or(`name.ilike.${pattern},name_ar.ilike.${pattern}`);
      }
      return {
        table: "players",
        execute: () => query.limit(5),
      } as SupabaseQuery;
    },
    responseContext: "Player statistics including rating, level, points, goals, assists, and attendance.",
  },

  {
    id: "academy_search",
    keywords: [
      "أكاديمية", "أكاديميات", "أكاديمية كرة", "أبغى أكاديمية",
      "academy", "academies", "find academy", "search academy",
    ],
    examples: [
      "أكاديميات في الرياض",
      "academies in Riyadh",
      "أكاديمية كرة قدم",
    ],
    buildQuery: (supabase, params) => {
      let query = supabase.from("academies").select("*");
      if (params.sport) query = query.eq("sport", params.sport);
      if (params.region) query = query.eq("region", params.region);
      if (params.search) {
        const pattern = `%${params.search}%`;
        query = query.or(`name.ilike.${pattern},name_ar.ilike.${pattern}`);
      }
      return {
        table: "academies",
        execute: () => query,
      } as SupabaseQuery;
    },
    responseContext: "Academy search results with names, sports, regions, and cities.",
  },

  {
    id: "scout_search",
    keywords: [
      "كشاف", "كشافين", "كشافة", "أبغى كشاف",
      "scout", "scouts", "find scout", "search scout",
    ],
    examples: [
      "كشافين كرة سلة",
      "basketball scouts",
      "كشاف في الرياض",
    ],
    buildQuery: (supabase, params) => {
      let query = supabase.from("scouts").select("*");
      if (params.sport) query = query.eq("sport", params.sport);
      if (params.region) query = query.eq("region", params.region);
      if (params.search) {
        const pattern = `%${params.search}%`;
        query = query.or(`name.ilike.${pattern},name_ar.ilike.${pattern}`);
      }
      return {
        table: "scouts",
        execute: () => query,
      } as SupabaseQuery;
    },
    responseContext: "Scout search results with names, sports, regions, ratings, and experience.",
  },

  {
    id: "compare_players",
    keywords: [
      "قارن", "مقارنة", "يقارن", "الفرق بين",
      "compare", "comparison", "difference between", "vs",
    ],
    examples: [
      "قارن بين اللاعب أحمد وخالد",
      "compare Mohamed and Ali",
      "الفرق بين اللاعب أ وب",
    ],
    buildQuery: (supabase, params) => {
      // Fetch up to 2 players by name for comparison
      let query = supabase.from("players").select("*");
      if (params.playerName) {
        const pattern = `%${params.playerName}%`;
        query = query.or(`name.ilike.${pattern},name_ar.ilike.${pattern}`);
      }
      if (params.playerName2) {
        const pattern2 = `%${params.playerName2}%`;
        query = query.or(`name.ilike.${pattern2},name_ar.ilike.${pattern2}`);
      }
      return {
        table: "players",
        execute: () => query.limit(10),
      } as SupabaseQuery;
    },
    responseContext: "Player comparison data — stats for both players including ratings, goals, assists, and levels.",
  },

  {
    id: "top_players",
    keywords: [
      "أفضل", "أفضل لاعب", "أفضل لاعبين", "أعلى تقييم", "ممتاز",
      "top player", "top players", "best player", "best players",
      "highest rated", "highest rating",
    ],
    examples: [
      "أفضل لاعبين كرة قدم",
      "top football players",
      "أعلى تقييم",
    ],
    buildQuery: (supabase, params) => {
      let query = supabase.from("players").select("*").order("rating", { ascending: false }).limit(10);
      if (params.sport) query = query.eq("sport", params.sport);
      return {
        table: "players",
        execute: () => query,
      } as SupabaseQuery;
    },
    responseContext: "Top-rated players sorted by rating, including names, sports, ratings, and levels.",
  },

  {
    id: "training_schedule",
    keywords: [
      "تمارين", "تدريب", "تمرين", "جدول التمارين", "تمارين قادمة",
      "training", "trainings", "schedule", "upcoming training",
      "training schedule",
    ],
    examples: [
      "تمارين قادمة",
      "upcoming trainings",
      "جدول التمارين",
    ],
    buildQuery: (supabase, _params) => ({
      table: "trainings",
      execute: () => supabase.from("trainings").select("*").order("date", { ascending: false }),
    }),
    responseContext: "Training schedule with dates, times, titles, and attendance info.",
  },

  {
    id: "count_query",
    keywords: [
      "كم عدد", "كم لاعب", "كم أكاديمية", "كم كشاف",
      "how many", "count", "number of players", "total players",
      "total count",
    ],
    examples: [
      "كم عدد اللاعبين",
      "how many players are there",
      "كم أكاديمية كرة قدم",
    ],
    buildQuery: (supabase, params) => {
      const table = params.table || "players";
      let query = supabase.from(table).select("*", { count: "exact", head: true });
      if (params.sport) query = query.eq("sport", params.sport);
      if (params.region) query = query.eq("region", params.region);
      return {
        table,
        execute: () => query,
      } as SupabaseQuery;
    },
    responseContext: "Count of records matching the query. Use this to answer 'how many' type questions.",
  },

  {
    id: "general_sport",
    keywords: [
      "وش رأيك", "إيش", "ليش", "كيف", "عن", "معلومات عن",
      "what do you think", "tell me about", "explain", "how to",
      "what is", "why", "opinion",
    ],
    examples: [
      "وش رأيك في كذا",
      "tell me about football in Saudi Arabia",
      "كيف أتحسن في كرة القدم",
    ],
    buildQuery: (_supabase, _params) => ({
      table: "",
      execute: async () => ({ data: null, count: null, error: null }),
    }),
    responseContext: "No database data — answering from general sports knowledge.",
  },
];

// ─── Intent Registry (lookup by id) ───────────────────────────────────

export const intentMap = new Map<string, Intent>(
  intents.map((i) => [i.id, i])
);

export function getIntentById(id: string): Intent | undefined {
  return intentMap.get(id);
}

export function getAllIntents(): Intent[] {
  return intents;
}