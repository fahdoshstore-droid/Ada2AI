import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
import { Button, ErrorState, LoadingState } from "../../components/ui";
import { Icon } from "../../components/Icon";

const SUGGESTIONS = [
  "How should I adjust volume this week?",
  "Am I losing weight at the right rate?",
  "Improve my side-delt development",
];

function AIOrb({ size = 44 }: { size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} aria-hidden>
      <span className="absolute inset-0 animate-breathe rounded-full bg-ada-ai/30 blur-md" />
      <span
        className="absolute inset-[10%] rounded-full"
        style={{
          background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85), rgba(183,174,255,0.55) 24%, rgba(0,220,200,0.35) 52%, rgba(10,16,30,0.95) 78%)",
          boxShadow: "inset 0 -6px 16px rgba(0,0,0,0.5), 0 0 24px rgba(139,124,255,0.4)",
        }}
      />
    </span>
  );
}
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
    <div className="flex h-[calc(100dvh-13.5rem)] flex-col md:h-[calc(100vh-8.5rem)]">
      <div className="mb-5 flex items-center gap-4">
        <AIOrb size={52} />
        <div className="min-w-0">
          <h1 className="ada-text-gradient text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[2.1rem]">AI Coach</h1>
          <p className="mt-0.5 text-sm text-ada-muted">
            Elite Classic Physique coaching knowledge, on demand. Not medical advice.
          </p>
        </div>
      </div>

      <div className="ada-glass relative flex-1 overflow-y-auto rounded-[var(--radius-panel)] p-4 sm:p-6">
        {thread.isLoading ? (
          <LoadingState label="Loading conversation…" />
        ) : thread.data?.length ? (
          <div className="flex flex-col gap-4">
            {thread.data.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] animate-rise rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed ${
                  m.sender_type === "athlete"
                    ? "self-end rounded-br-md ada-gradient font-medium text-ada-navy"
                    : "ada-inset self-start rounded-bl-md text-ada-text"
                }`}
              >
                {m.sender_type === "ai" ? (
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#B7AEFF]">
                    <Icon name="sparkle" size={12} /> AI Coach
                  </div>
                ) : null}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-ada-muted">
            <AIOrb size={88} />
            <p className="mt-5 max-w-sm text-sm">
              Ask about training, nutrition, recovery, posing or prep. Your profile context is
              attached automatically.
            </p>
            <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setInput(q)}
                  className="ada-hairline rounded-full bg-white/[0.03] px-3.5 py-2 text-xs text-ada-text-2 transition-colors hover:bg-white/[0.07] hover:text-ada-text"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error ? <div className="mt-3"><ErrorState message={error} /></div> : null}

      <form
        onSubmit={handleSubmit}
        className="ada-glass mt-4 flex items-center gap-2 rounded-full p-1.5 pl-5 transition-shadow focus-within:shadow-[0_0_0_1px_rgba(0,220,200,0.45),0_10px_40px_-10px_rgba(0,220,200,0.45)]"
      >
        <Icon name="sparkle" size={18} className="shrink-0 text-ada-teal" />
        <input
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[0.95rem] text-ada-text outline-none placeholder:text-ada-faint"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI coach…"
          maxLength={4000}
          disabled={send.isPending}
          aria-label="Message the AI coach"
        />
        <Button type="submit" loading={send.isPending} className="shrink-0 px-4" aria-label="Send">
          {send.isPending ? null : <Icon name="send" size={16} />}
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}
