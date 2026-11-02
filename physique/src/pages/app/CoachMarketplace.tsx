import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { Badge, Button, Card, ErrorState, LoadingState, SectionTitle } from "../../components/ui";
import type { Coach } from "../../lib/types";

export function CoachMarketplace() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const coaches = useQuery<Coach[]>({
    queryKey: ["physique-coach-marketplace"],
    queryFn: async () => {
      const { data, error } = await supabase.from("physique_coaches").select("*").eq("is_accepting_athletes", true).order("is_verified", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Coach[];
    },
  });
  const requests = useQuery<{ coach_id: string; status: string }[]>({
    queryKey: ["physique-coach-requests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("physique_coach_requests").select("coach_id,status").eq("athlete_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
  });
  const request = useMutation({
    mutationFn: async (coachId: string) => {
      const { error } = await supabase.from("physique_coach_requests").insert({ athlete_id: userId, coach_id: coachId, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["physique-coach-requests", userId] }),
  });
  if (coaches.isLoading) return <LoadingState />;
  if (coaches.error) return <ErrorState message="Could not load available coaches." />;
  return <div className="space-y-6"><SectionTitle hint="Coach-led training">استعرض المدربين</SectionTitle><div className="grid gap-4 md:grid-cols-2">{coaches.data?.map((coach) => { const status = requests.data?.find((r) => r.coach_id === coach.coach_id)?.status; return <Card key={coach.coach_id}><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{coach.display_name ?? "Coach"}</h2><p className="mt-2 text-sm text-ada-muted">{coach.bio ?? "Coach-led physique training."}</p></div>{coach.is_verified ? <Badge tone="success">Verified</Badge> : null}</div><Button className="mt-5" onClick={() => request.mutate(coach.coach_id)} disabled={status === "pending" || request.isPending} loading={request.isPending}>{status === "pending" ? "Pending" : "طلب التدريب"}</Button></Card>; })}</div>{request.error ? <ErrorState message="Could not send the request." /> : null}</div>;
}
