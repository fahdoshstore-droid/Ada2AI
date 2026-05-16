import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
// Monitoring init — safe no-op if DSNs not configured
import './lib/monitoring'

const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const SportID = React.lazy(() => import('./pages/SportID'))
const ScoutDashboard = React.lazy(() => import('./pages/ScoutDashboard'))
const CoachDashboard = React.lazy(() => import('./pages/CoachDashboard'))
const OrganizationsDashboard = React.lazy(() => import('./pages/OrganizationsDashboard'))
const VideoAnalysis = React.lazy(() => import('./pages/VideoAnalysis'))
const Rankings = React.lazy(() => import('./pages/Rankings'))
const PlayerAnalysis = React.lazy(() => import('./pages/PlayerAnalysis'))

const LoadingSpinner = () => (
  <div className="min-h-screen bg-navy flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <>
      <Analytics />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sport-id" element={<ProtectedRoute><SportID /></ProtectedRoute>} />
            <Route path="/scout" element={<ProtectedRoute allowedRoles={['scout']}><ScoutDashboard /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute allowedRoles={['coach']}><CoachDashboard /></ProtectedRoute>} />
            <Route path="/organizations" element={<ProtectedRoute><OrganizationsDashboard /></ProtectedRoute>} />
            <Route path="/video-analysis" element={<ProtectedRoute><VideoAnalysis /></ProtectedRoute>} />
            <Route path="/rankings" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
            <Route path="/player-analysis" element={<ProtectedRoute><PlayerAnalysis /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}