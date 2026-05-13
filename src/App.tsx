import { Routes, Route } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SportID from './pages/SportID'
import ScoutDashboard from './pages/ScoutDashboard'
import CoachDashboard from './pages/CoachDashboard'
import OrganizationsDashboard from './pages/OrganizationsDashboard'
import VideoAnalysis from './pages/VideoAnalysis'
import Rankings from './pages/Rankings'
import PlayerAnalysis from './pages/PlayerAnalysis'

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sport-id" element={<ProtectedRoute><SportID /></ProtectedRoute>} />
          <Route path="/scout" element={<ProtectedRoute allowedRoles={['scout']}><ScoutDashboard /></ProtectedRoute>} />
          <Route path="/coach" element={<ProtectedRoute allowedRoles={['coach']}><CoachDashboard /></ProtectedRoute>} />
          <Route path="/organizations" element={<ProtectedRoute><OrganizationsDashboard /></ProtectedRoute>} />
          <Route path="/video-analysis" element={<ProtectedRoute><VideoAnalysis /></ProtectedRoute>} />
          <Route path="/rankings" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
          <Route path="/player-analysis" element={<ProtectedRoute><PlayerAnalysis /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}