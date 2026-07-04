import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
import { Button, ErrorState, LoadingState } from "../../components/ui";
import type { CoachChatResponse, Message } from "../../lib/types";

export function CoachChat() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useAthleteProfile();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = useQuery<Message[]>({
    queryKey: ["coach-thread", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_messages")
        .select("*")
        .eq("athlete_id", userId!)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.data]);

  const send = useMutation<CoachChatResponse, ApiError, string>({
    mutationFn: (message) =>
      api.post<CoachChatResponse>("/coach/chat", {
        message,
        context_hint: profile
          ? `goal=${profile.goal}, category=${profile.competition_category}, experience=${profile.experience_level}, freq=${profile.training_frequency}d/wk, weak=${profile.weak_body_parts.join(",")}`
          : undefined,
      }),
    onSuccess: () => {
      setInput("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["coach-thread", userId] });
    },
    onError: (err) =>
      setError(
        err.status === 404
          ? "Complete your athlete profile before chatting with the AI Coach."
          : err.status === 503
            ? "AI provider is unavailable right now. Try again shortly."
            : err.message,
      ),
  });

  if (profileLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || send.isPending) return;
    send.mutate(text);
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col md:h-[calc(100vh-7rem)]">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">AI Coach</h1>
        <p className="mt-1 text-sm text-ada-muted">
          Elite Classic Physique coaching knowledge, on demand. Not medical advice.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-[var(--radius-card)] border border-ada-teal/12 bg-ada-card p-4">
        {thread.isLoading ? (
          <LoadingState label="Loading conversation…" />
        ) : thread.data?.length ? (
          <div className="flex flex-col gap-3">
            {thread.data.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.sender_type === "athlete"
                    ? "self-end ada-gradient text-ada-navy"
                    : "self-start border border-ada-teal/15 bg-ada-surface text-ada-text"
                }`}
              >
                {m.sender_type === "ai" ? (
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ada-teal">
                    AI Coach
                  </div>
                ) : null}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-ada-muted">
            <div className="text-3xl">✦</div>
            <p className="mt-2 max-w-xs text-sm">
              Ask about training, nutrition, recovery, posing or prep. Your profile context is
              attached automatically.
            </p>
          </div>
        )}
      </div>

      {error ? <div className="mt-3"><ErrorState message={error} /></div> : null}

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          className="ada-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI coach…"
          maxLength={4000}
          disabled={send.isPending}
        />
        <Button type="submit" loading={send.isPending} className="shrink-0">
          Send
        </Button>
      </form>
    </div>
  );
}
