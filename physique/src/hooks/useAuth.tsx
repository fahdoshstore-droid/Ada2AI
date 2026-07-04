import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Role } from "../lib/types";

interface AuthState {
  userId: string | null;
  email: string | null;
  loading: boolean;
  role: Role | null;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refresh: () => void;
}

const PHYSIQUE_ROLES: ReadonlySet<string> = new Set(["athlete", "coach", "admin"]);
const AUTH_TIMEOUT_MS = 6000;

const AuthContext = createContext<AuthContextValue | null>(null);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

type ProfileRow = { data: { user_type: string | null } | null; error: unknown };

async function fetchRole(userId: string): Promise<Role | null> {
  try {
    const result = await withTimeout<ProfileRow | null>(
      supabase
        .from("profiles")
        .select("user_type")
        .eq("id", userId)
        .maybeSingle() as unknown as Promise<ProfileRow>,
      AUTH_TIMEOUT_MS,
    );
    const userType = result?.data?.user_type ?? null;
    return userType && PHYSIQUE_ROLES.has(userType) ? (userType as Role) : null;
  } catch {
    return null;
  }
}

function toRole(userType: string | null | undefined): Role | null {
  return userType && PHYSIQUE_ROLES.has(userType) ? (userType as Role) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    userId: null,
    email: null,
    loading: true,
    role: null,
  });

  const applySession = useCallback(async (user: User | null) => {
    if (!user) {
      setState({ userId: null, email: null, loading: false, role: null });
      return;
    }
    const role = await fetchRole(user.id);
    setState({ userId: user.id, email: user.email ?? null, loading: false, role });
  }, []);

  const checkAuth = useCallback(async () => {
    const result = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);
    const user = result?.data?.user ?? null;
    await applySession(user);
  }, [applySession]);

  useEffect(() => {
    checkAuth();

    const { data } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setState({ userId: null, email: null, loading: false, role: null });
          return;
        }
        // Optimistic role from JWT raw user metadata; confirm via profiles.
        const meta = toRole(
          (session.user.user_metadata as { user_type?: string } | null)?.user_type,
        );
        setState({
          userId: session.user.id,
          email: session.user.email ?? null,
          loading: false,
          role: meta,
        });
        const confirmed = await fetchRole(session.user.id);
        if (confirmed !== meta) {
          setState((prev) => ({ ...prev, role: confirmed }));
        }
      },
    );

    return () => data.subscription.unsubscribe();
  }, [checkAuth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ userId: null, email: null, loading: false, role: null });
  }, []);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
    checkAuth();
  }, [checkAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signOut, refresh }),
    [state, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
