import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

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
import Dashboards    from "./pages/Dashboards";
import SportID       from "./pages/SportID";
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
import NafathPage       from "./pages/features/NafathPage";
import QrCheckinPage    from "./pages/features/QrCheckinPage";
import SportPointsPage  from "./pages/features/SportPointsPage";
import MinistryReportPage from "./pages/features/MinistryReportPage";
import YOLOAnalysis   from "./pages/YOLOAnalysis";
import LoginPage     from "./pages/LoginPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import PlayerProfile from "./pages/dashboard/PlayerProfile";
import VideoUpload from "./pages/dashboard/VideoUpload";

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

      {/* ── Platform Tools ── */}
      <Route path="/dashboards"   component={Dashboards} />
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

      {/* ── Dashboard ── */}
      <Route path="/dashboard"         component={DashboardHome} />
      <Route path="/dashboard/profile"  component={PlayerProfile} />
      <Route path="/dashboard/settings" component={DashboardHome} />
      <Route path="/dashboard/stats"   component={DashboardHome} />
      <Route path="/dashboard/videos"   component={VideoUpload} />

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
        <ThemeProvider defaultTheme="dark">
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
