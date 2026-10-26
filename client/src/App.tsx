import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ToastContainer from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// ── Pages ─────────────────────────────────────────────────
import Home          from "./pages/Home";
import Product       from "./pages/Product";
import Scouts        from "./pages/Scouts";
import Compare       from "./pages/Compare";
import Upload        from "./pages/Upload";
import Academies     from "./pages/Academies";
import Demo          from "./pages/Demo";
import DemoVideo      from "./pages/DemoVideo";
import NahdaDemo     from "./pages/NahdaDemo";
import Players       from "./pages/Players";
import Dashboards           from "./pages/Dashboards";
import SportIDPassport from "./pages/SportIDPassport";
import AthleteProfile   from "./pages/passport/AthleteProfile";
import AthleteCareer    from "./pages/passport/AthleteCareer";
import AthleteHistory   from "./pages/passport/AthleteHistory";
import AthletePoints    from "./pages/passport/AthletePoints";
import Facility         from "./pages/passport/Facility";
import FacilityCheckin  from "./pages/passport/FacilityCheckin";
import FacilityAnalytics from "./pages/passport/FacilityAnalytics";
import MinistryPassport from "./pages/passport/Ministry";
import Hub              from "./pages/passport/Hub";
import GovernancePassport from "./pages/passport/Governance";
import Partnerships     from "./pages/passport/Partnerships";
import TrainingHub   from "./pages/TrainingHub";
import Governance    from "./pages/Governance";
import SubGovernance from "./pages/SubGovernance";
import TeamMembers   from "./pages/TeamMembers";
import NotFound      from "./pages/NotFound";
import ModuleDetail  from "./pages/ModuleDetail";
import Rankings      from "./pages/Rankings";
import NafathPage       from "./pages/features/NafathPage";
import QrCheckinPage    from "./pages/features/QrCheckinPage";
import SportPointsPage  from "./pages/features/SportPointsPage";
import MinistryReportPage from "./pages/features/MinistryReportPage";
import YOLOAnalysis   from "./pages/YOLOAnalysis";
import MatchIntelligence from "./pages/MatchIntelligence";
import ScoutIntelligence from "./pages/ScoutIntelligence";
import LoginPage     from "./pages/LoginPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import PlayerProfile from "./pages/dashboard/PlayerProfile";
import VideoUpload from "./pages/dashboard/VideoUpload";
import TeamAnalysis from "./pages/dashboard/TeamAnalysis";
import CoachDashboard from "./training-hub/pages/CoachDashboard";
import ScoutDashboard from "./pages/dashboard/ScoutDashboard";
import ClubDashboard from "./pages/dashboard/ClubDashboard";
import ParentDashboard from "./pages/dashboard/ParentDashboard";

// ── Dashboard Redirect by Role ────────────────────────────
import { useProfile, roleDashboardPaths } from "./hooks/useProfile";

/** /dashboard → redirects to the role-appropriate dashboard */
function DashboardRedirect() {
  const { role, error, retry, loading } = useProfile();

  // Block while the profile is loading; do not redirect automatically.
  if (loading && !role) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading dashboard…</div>
    );
  }

  // No role yet after loading — fall back to player dashboard.
  if (!role) {
    return <Redirect to="/dashboard/player" />;
  }

  const destination = roleDashboardPaths[role] || "/dashboard/player";
  return <Redirect to={destination} />;
}

// ── Router ────────────────────────────────────────────────
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      {/* ── Core ── */}
      <Route path="/"             component={Home} />
      <Route path="/login"        component={LoginPage} />
      <Route path="/product"      component={Product} />

      {/* ── Scouting ── */}
      <Route path="/scouts"       component={Scouts} />
      <Route path="/compare"      component={Compare} />
      <Route path="/players"      component={Players} />
      <Route path="/upload"       component={Upload} />
      <Route path="/demo/nahda"   component={NahdaDemo} />
      <Route path="/demo"         component={Demo} />
      <Route path="/demo-video"   component={DemoVideo} />
      <Route path="/yolo"        component={YOLOAnalysis} />
      <Route path="/match-intelligence" component={MatchIntelligence} />
      <Route path="/scout"        component={ScoutIntelligence} />

      {/* ── Platform Tools ── */}
      <Route path="/dashboards"     component={Dashboards} />
      <Route path="/academies"    component={Academies} />
      <Route path="/sport-id"     component={SportIDPassport} />
      <Route path="/sportid"      component={SportIDPassport} />
      <Route path="/passport"     component={SportIDPassport} />
      <Route path="/passport/athlete"      component={AthleteProfile} />
      <Route path="/passport/athlete/career" component={AthleteCareer} />
      <Route path="/passport/athlete/history" component={AthleteHistory} />
      <Route path="/passport/athlete/points" component={AthletePoints} />
      <Route path="/passport/facility"      component={Facility} />
      <Route path="/passport/facility/checkin" component={FacilityCheckin} />
      <Route path="/passport/facility/analytics" component={FacilityAnalytics} />
      <Route path="/passport/ministry"      component={MinistryPassport} />
      <Route path="/passport/hub"           component={Hub} />
      <Route path="/passport/governance"    component={GovernancePassport} />
      <Route path="/passport/partnerships"  component={Partnerships} />
      <Route path="/training"     component={TrainingHub} />

      {/* ── Governance ── */}
      <Route path="/governance"         component={Governance} />
      <Route path="/governance/sub"     component={SubGovernance} />
      <Route path="/governance/team"    component={TeamMembers} />

      {/* ── Module Detail ── */}
      <Route path="/modules/:slug"  component={ModuleDetail} />

      {/* ── SportID Features ── */}
      <Route path="/features/nafath"          component={NafathPage} />
      <Route path="/features/qr-checkin"      component={QrCheckinPage} />
      <Route path="/features/sport-points"    component={SportPointsPage} />
      <Route path="/features/ministry-report" component={MinistryReportPage} />

      {/* ── Standalone Pages ── */}
      <Route path="/coach">
        {() => (
          <ProtectedRoute allowedRoles={["coach"]}>
            <CoachDashboard />
          </ProtectedRoute>
        )}
      </Route>

      {/* ── Dashboard Routes (Auth-protected, role-gated) ── */}
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/player">
        {() => (
          <ProtectedRoute allowedRoles={["player"]}>
            <PlayerProfile />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/coach">
        {() => (
          <ProtectedRoute allowedRoles={["coach"]}>
            <CoachDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/scout">
        {() => (
          <ProtectedRoute allowedRoles={["scout"]}>
            <ScoutDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/club">
        {() => (
          <ProtectedRoute allowedRoles={["club"]}>
            <ClubDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/parent">
        {() => (
          <ProtectedRoute allowedRoles={["parent"]}>
            <ParentDashboard />
          </ProtectedRoute>
        )}
      </Route>
      {/* Profile / settings / stats — all authenticated roles */}
      <Route path="/dashboard/profile">
        {() => (
          <ProtectedRoute>
            <PlayerProfile />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/settings">
        {() => (
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/stats">
        {() => (
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/videos">
        {() => (
          <ProtectedRoute>
            <VideoUpload />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/team">
        {() => (
          <ProtectedRoute>
            <TeamAnalysis />
          </ProtectedRoute>
        )}
      </Route>

      {/* ── Rankings ── */}
      <Route path="/rankings"          component={Rankings} />

      {/* ── Fallback ── */}
      <Route path="/404"          component={NotFound} />
      <Route                      component={NotFound} />
    </Switch>
    </>
  );
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <ToastContainer />
            <Router />
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}