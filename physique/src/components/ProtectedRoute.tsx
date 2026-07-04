import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingState } from "./ui";
import type { Role } from "../lib/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

const MAX_LOADING_MS = 8000;

/** Role-aware home route — sends each role to its dashboard. */
export function roleHome(role: Role | null): string {
  switch (role) {
    case "athlete":
      return "/app/athlete";
    case "coach":
      return "/app/coach";
    case "admin":
      return "/app/admin";
    default:
      return "/auth";
  }
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { userId, loading, role } = useAuth();
  const [tooLong, setTooLong] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTooLong(false);
      return;
    }
    const timer = setTimeout(() => setTooLong(true), MAX_LOADING_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <LoadingState
        label={tooLong ? "Taking longer than usual — check your connection." : "Verifying session…"}
      />
    );
  }

  if (!userId) return <Navigate to="/auth" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return <>{children}</>;
}
