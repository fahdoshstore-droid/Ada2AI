import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "../../lib/api";
import { Card, ErrorState, LoadingState, SectionTitle, Stat } from "../../components/ui";
import type { AdminStatsResponse } from "../../lib/types";

export function AdminDashboard() {
  const stats = useQuery<AdminStatsResponse, ApiError>({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<AdminStatsResponse>("/admin/stats"),
    retry: 0,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform analytics</h1>
        <p className="mt-1 text-sm text-ada-muted">
          Live aggregates from the Ada2Physique backend (service-role).
        </p>
      </div>

      {stats.isLoading ? (
        <LoadingState label="Loading platform stats…" />
      ) : stats.error ? (
        <Card>
          <SectionTitle>Admin stats</SectionTitle>
          <ErrorState
            message={`Could not load admin stats (HTTP ${stats.error.status}). ${
              stats.error.status === 401
                ? "Re-authenticate as an admin."
                : stats.error.status === 403
                  ? "Admin access required."
                  : "Ensure the backend is deployed and reachable."
            }`}
          />
        </Card>
      ) : stats.data ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Stat label="Athletes" value={stats.data.athletes} accent />
            <Stat label="Coaches" value={stats.data.coaches} />
            <Stat label="Active assignments" value={stats.data.active_assignments} />
            <Stat label="Programs" value={stats.data.programs} />
            <Stat label="Nutrition plans" value={stats.data.nutrition_plans} />
            <Stat label="Check-ins (30d)" value={stats.data.check_ins_30d} />
            <Stat label="AI reports (30d)" value={stats.data.ai_reports_30d} accent />
          </div>
          <Card>
            <p className="text-sm text-ada-muted">
              All figures are computed server-side by the trusted Ada2Physique enforcer and
              reflect real rows across the <code className="text-ada-teal">physique_*</code>{" "}
              namespace. No mock data.
            </p>
          </Card>
        </>
      ) : null}
    </div>
  );
}
