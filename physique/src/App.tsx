import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, roleHome } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Onboard } from "./pages/Onboard";
import { AthleteDashboard } from "./pages/app/AthleteDashboard";
import { CoachDashboard } from "./pages/app/CoachDashboard";
import { AdminDashboard } from "./pages/app/AdminDashboard";
import { CoachChat } from "./pages/app/CoachChat";
import { Progress } from "./pages/app/Progress";
import { Programs } from "./pages/app/Programs";
import { ProgramDetail } from "./pages/app/ProgramDetail";
import { TodayWorkout } from "./pages/app/TodayWorkout";
import { CoachWorkouts } from "./pages/app/CoachWorkouts";
import { CoachNutrition } from "./pages/app/CoachNutrition";
import { ProgramBuilder } from "./pages/app/ProgramBuilder";
import { CheckIn } from "./pages/app/CheckIn";
import { CoachCheckIns } from "./pages/app/CoachCheckIns";
import { InjuryPrevention } from "./pages/InjuryPrevention";

/** `/app` index — redirects to the role's dashboard (or /auth if none). */
function AppIndex() {
  const { role, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={roleHome(role)} replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/injury-prevention" element={<InjuryPrevention />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/onboard"
          element={
            <ProtectedRoute>
              <Onboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AppIndex />} />
          <Route
            path="athlete"
            element={
              <ProtectedRoute allowedRoles={["athlete"]}>
                <AthleteDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="coach"
            element={
              <ProtectedRoute allowedRoles={["coach"]}>
                <CoachDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="chat"
            element={
              <ProtectedRoute allowedRoles={["athlete"]}>
                <CoachChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="progress"
            element={
              <ProtectedRoute allowedRoles={["athlete"]}>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="programs"
            element={
              <ProtectedRoute allowedRoles={["coach"]}>
                <Programs />
              </ProtectedRoute>
            }
          />
          <Route
            path="program/:programId"
            element={
              <ProtectedRoute allowedRoles={["athlete", "coach"]}>
                <ProgramDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="workout"
            element={
              <ProtectedRoute allowedRoles={["athlete"]}>
                <TodayWorkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="workouts"
            element={
              <ProtectedRoute allowedRoles={["coach"]}>
                <CoachWorkouts />
              </ProtectedRoute>
            }
          />
          <Route
            path="nutrition"
            element={
              <ProtectedRoute allowedRoles={["coach"]}>
                <CoachNutrition />
              </ProtectedRoute>
            }
          />
          <Route
            path="program-builder/:programId"
            element={
              <ProtectedRoute allowedRoles={["coach"]}>
                <ProgramBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="program-builder/:programId"
            element={
              <ProtectedRoute allowedRoles={["coach"]}>
                <ProgramBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkin"
            element={
              <ProtectedRoute allowedRoles={["athlete"]}>
                <CheckIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkins"
            element={
              <ProtectedRoute allowedRoles={["coach"]}>
                <CoachCheckIns />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
