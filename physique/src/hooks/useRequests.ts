import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type {
  AppNotification,
  CoachRequest,
  CoachingState,
} from "../lib/types";

/**
 * Coaching-request + notification data layer (spec §1–§23).
 *
 * DB is the source of truth for business rules: the `apply_physique_coach_request_event`
 * trigger creates the coach↔athlete relationship and notifications. React only
 * INSERTs (send) and UPDATEs (accept / reject / cancel / mark-read) — never re-implements
 * those rules client-side.
 */

// ── Athlete: coaching state machine (NO_COACH / PENDING / ACCEPTED / REJECTED) ──

export interface MyCoachingState {
  state: CoachingState;
  /** The latest request (pending/rejected/accepted) or null. */
  request: (CoachRequest & { coach_name?: string | null }) | null;
  /** The accepted coach name (when state === ACCEPTED). */
  coachName: string | null;
}

export function useMyCoachingState() {
  const { userId } = useAuth();
  return useQuery<MyCoachingState>({
    queryKey: ["my-coaching-state", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [relRes, reqRes] = await Promise.all([
        supabase
          .from("physique_coach_athletes")
          .select("coach_id, coach:physique_coaches(display_name)")
          .eq("athlete_id", userId!)
          .eq("status", "active")
          .maybeSingle(),
        supabase
          .from("physique_coach_requests")
          .select("*, coach:physique_coaches(display_name)")
          .eq("athlete_id", userId!)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (relRes.error) throw relRes.error;
      if (reqRes.error) throw reqRes.error;

      const rel = relRes.data as
        | { coach_id: string; coach: { display_name: string | null } | null }
        | null;
      const req = reqRes.data as
        | (CoachRequest & { coach: { display_name: string | null } | null })
        | null;

      let state: CoachingState = "NO_COACH";
      if (rel) state = "ACCEPTED";
      else if (req?.status === "pending") state = "PENDING_REQUEST";
      else if (req?.status === "rejected") state = "REJECTED";

      return {
        state,
        request: req
          ? { ...req, coach_name: req.coach?.display_name ?? null }
          : null,
        coachName: rel?.coach?.display_name ?? null,
      };
    },
  });
}

/** Athlete sends a coaching request (status always starts 'pending'). */
export function useSendRequest() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      coachId: string;
      offerId?: string | null;
      message?: string;
    }) => {
      const { error } = await supabase.from("physique_coach_requests").insert({
        athlete_id: userId!,
        coach_id: input.coachId,
        offer_id: input.offerId ?? null,
        message: input.message?.trim() || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-coaching-state", userId] });
    },
  });
}

/** Athlete cancels their own pending request. */
export function useCancelRequest() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("physique_coach_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId)
        .eq("athlete_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-coaching-state", userId] });
    },
  });
}

// ── Coach: pending requests + decisions ──

export interface CoachPendingRequest extends CoachRequest {
  athleteName: string | null;
}

export function useCoachPendingRequests() {
  const { userId } = useAuth();
  return useQuery<CoachPendingRequest[]>({
    queryKey: ["coach-pending-requests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from("physique_coach_requests")
        .select("*")
        .eq("coach_id", userId!)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!requests?.length) return [];

      // Correlate with the "new request" notifications to surface the athlete's
      // identifier (profiles.name is RLS-hidden from coaches for non-assigned
      // athletes, so the trigger's notification body is the only source).
      const ids = requests.map((r) => r.id);
      const { data: notifs } = await supabase
        .from("physique_notifications")
        .select("entity_id, body")
        .eq("recipient_id", userId!)
        .eq("type", "coach_request")
        .in("entity_id", ids);

      const nameMap = new Map<string, string>();
      for (const n of (notifs ?? [])) {
        const name = (n.body ?? "")
          .split(" wants to train with you.")[0]
          .trim();
        if (name) nameMap.set(n.entity_id, name);
      }

      return requests.map((r) => ({
        ...r,
        athleteName: nameMap.get(r.id) ?? null,
      })) as CoachPendingRequest[];
    },
  });
}

/** Coach accepts a request (trigger creates active relationship + notifies athlete). */
export function useAcceptRequest() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("physique_coach_requests")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", requestId)
        .eq("coach_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-pending-requests", userId] });
      qc.invalidateQueries({ queryKey: ["coach-roster", userId] });
    },
  });
}

/** Coach rejects a request (trigger notifies athlete; no relationship created). */
export function useRejectRequest() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { requestId: string; reason?: string }) => {
      const { error } = await supabase
        .from("physique_coach_requests")
        .update({
          status: "rejected",
          rejection_reason: input.reason?.trim() || null,
          responded_at: new Date().toISOString(),
        })
        .eq("id", input.requestId)
        .eq("coach_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-pending-requests", userId] });
    },
  });
}

// ── Notifications ──

export function useNotifications() {
  const { userId } = useAuth();
  return useQuery<AppNotification[]>({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_notifications")
        .select("*")
        .eq("recipient_id", userId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
  });
}

export function useUnreadCount() {
  const { userId } = useAuth();
  return useQuery<number>({
    queryKey: ["unread-count", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("physique_notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", userId!)
        .is("read_at", null);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useMarkRead() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("physique_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("recipient_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", userId] });
      qc.invalidateQueries({ queryKey: ["unread-count", userId] });
    },
  });
}

/** Map a notification type to friendly Arabic UI labels (spec §25). */
export function notificationLabel(n: AppNotification): {
  title: string;
  body: string;
} {
  switch (n.type) {
    case "coach_request": {
      // DB body: "<identifier> wants to train with you."
      const who = (n.body ?? "").replace(/\s*wants to train with you\.?\s*$/i, "").trim();
      return {
        title: "طلب تدريب جديد",
        body: who ? `${who} يريد التدريب معك.` : "يريد التدريب معك.",
      };
    }
    case "coach_request_accepted": {
      const who = (n.body ?? "").replace(/\s*accepted your request\.?\s*$/i, "").trim();
      return {
        title: "تم قبول طلبك 🎉",
        body: who ? `${who} وافق على تدريبك.` : "وافق المدرب على تدريبك.",
      };
    }
    case "coach_request_rejected":
      return {
        title: "تم رفض طلب التدريب",
        body: n.body && n.body.trim() ? n.body : "لم تتم الموافقة على طلبك.",
      };
    case "coach_selection_reminder":
      // DB copy is already Arabic; pass through as-is.
      return { title: n.title, body: n.body ?? "" };
    default:
      return { title: n.title, body: n.body ?? "" };
  }
}
