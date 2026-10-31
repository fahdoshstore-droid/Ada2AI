import { useState } from "react";
import { Photo } from "../components/Media";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button, ErrorState, LoadingState } from "../components/ui";
import { roleHome } from "../components/ProtectedRoute";
import type { Role } from "../lib/types";

type AuthMode = "login" | "register";
type SignupRole = Extract<Role, "athlete" | "coach">;

export function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [signupRole, setSignupRole] = useState<SignupRole>("athlete");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  const redirectByRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .maybeSingle();
    navigate(roleHome((profile?.user_type as Role | null) ?? null), {
      replace: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        await redirectByRole();
      } else {
        // user_type metadata is read by the handle_new_user trigger to set
        // profiles.user_type. Admin is provisioned server-side only.
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { user_type: signupRole } },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          // Auto-confirmed project → go straight to onboarding.
          navigate("/onboard", { replace: true });
        } else {
          setInfo(
            "Account created. Confirm your email, then sign in to continue.",
          );
          setMode("login");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !error && !info) return <LoadingState label="Authenticating…" />;

  return (
    <div className="grid min-h-screen bg-ada-navy lg:grid-cols-[1.05fr_1fr]">
      {/* ── Brand photography (desktop) ── */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Photo
          name="incline-press-tracking"
          alt="Athlete on the incline dumbbell press with AI form-tracking overlay"
          position="50% 30%"
          priority
          sizes="55vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ada-navy via-ada-navy/20 to-ada-navy/40" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ada-navy" />
        <div className="absolute inset-x-10 bottom-12 max-w-md">
          <span className="ada-eyebrow !text-ada-teal">AI-assisted · Coach-led</span>
          <p className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ada-text">
            Every rep measured. Every decision yours.
          </p>
        </div>
      </aside>

      <div className="relative isolate flex items-center justify-center overflow-hidden px-4 py-10">
        <Photo
          name="incline-press-tracking"
          alt=""
          position="50% 25%"
          sizes="100vw"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30 lg:hidden"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-ada-navy/70 via-ada-navy/90 to-ada-navy lg:hidden" />
        <div aria-hidden className="absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-ada-teal/10 blur-3xl" />
      <div className="ada-glass w-full max-w-md rounded-[var(--radius-panel)] p-7 sm:p-9">
        <Link to="/" className="font-display text-xl font-black tracking-tight text-ada-teal">
          Ada2<span className="text-ada-text">Physique</span>
        </Link>
        <h1 className="mt-5 text-2xl font-bold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-ada-muted">
          {mode === "login"
            ? "Sign in to your coaching platform."
            : "Join as an athlete or coach. Admins are provisioned separately."}
        </p>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
        {info ? (
          <div className="mt-4 rounded-lg border border-ada-success/25 bg-ada-success/10 px-3 py-2 text-sm text-ada-success">
            {info}
          </div>
        ) : null}

        {mode === "register" && (
          <div className="mt-5">
            <span className="ada-label">I am a…</span>
            <div className="grid grid-cols-2 gap-2">
              {(["athlete", "coach"] as SignupRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSignupRole(r)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-semibold capitalize transition ${
                    signupRole === r
                      ? "ada-gradient text-ada-navy"
                      : "border-ada-teal/20 bg-ada-surface text-ada-muted hover:text-ada-text"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label className="ada-label" htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="ada-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="ada-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="ada-input"
              placeholder="At least 6 characters"
            />
          </div>
          <Button type="submit" loading={loading} className="mt-1 w-full py-3">
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
              setInfo(null);
            }}
            className="font-semibold text-ada-teal hover:underline"
          >
            {mode === "login" ? "No account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
