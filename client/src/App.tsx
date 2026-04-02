import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";

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

// ── Router ────────────────────────────────────────────────
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      {/* ── Core ── */}
      <Route path="/"             component={Home} />
      <Route path="/product"      component={Product} />

      {/* ── Scouting ── */}
      <Route path="/scouts"       component={Scouts} />
      <Route path="/compare"      component={Compare} />
      <Route path="/players"      component={Players} />
      <Route path="/upload"       component={Upload} />
      <Route path="/demo"         component={Demo} />
      <Route path="/demo-video"   component={DemoVideo} />
      <Route path="/demo/nahda"   component={NahdaDemo} />
      <Route path="/yolo"        component={YOLOAnalysis} />

      {/* ── Platform Tools ── */}
      <Route path="/dashboards"   component={Dashboards} />
      <Route path="/academies"    component={Academies} />
      <Route path="/sport-id"     component={SportID} />
      <Route path="/sportid"      component={SportID} />
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
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
