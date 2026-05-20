/**
 * App.tsx — Ada2AI
 * 
 * Changes from original:
 * 1. Added NotFound route (path="*")
 * 2. Added per-route ErrorBoundary wrappers
 * 3. Added /player/:id route (Phase 2)
 * 4. Added /player/onboarding route (Phase 2)
 * 5. Added /player/dashboard route (Phase 2)
 */
import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import './lib/monitoring'

const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const SportID = React.lazy(() => import('./pages/SportID'))
const ScoutDashboard = React.lazy(() => import('./pages/ScoutDashboard'))
const CoachDashboard = React.lazy(() => import('./pages/CoachDashboard'))
const OrganizationsDashboard = React.lazy(() => import('./pages/OrganizationsDashboard'))
const Rankings = React.lazy(() => import('./pages/Rankings'))
const PlayerAnalysis = React.lazy(() => import('./pages/PlayerAnalysis'))
const WelcomePage = React.lazy(() => import('./pages/WelcomePage'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'))

// Phase 2 — Player Loop (active)
const PlayerOnboarding = React.lazy(() => import('./pages/player/Onboarding'))
const PlayerDashboard = React.lazy(() => import('./pages/player/Dashboard'))
const PlayerProfile = React.lazy(() => import('./pages/player/Profile'))
const PlayerUpload = React.lazy(() => import('./pages/player/Upload'))

// Coach tools
const EvaluationForm = React.lazy(() => import('./pages/coach/EvaluationForm'))
const CoachWorkspace = React.lazy(() => import('./pages/coach/Workspace'))

// Admin
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'))

const LoadingSpinner = () => (
  <div className="min-h-screen bg-navy flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
  </div>
)

// Per-route error boundary with route-level reset
const RouteErrorFallback = () => (
  <div
    dir="rtl"
    className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
  >
    <p className="text-ice-muted arabic-text">فشل تحميل هذه الصفحة</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 rounded-lg bg-teal-prime/10 text-teal-prime text-sm arabic-text"
    >
      إعادة التحميل
    </button>
  </div>
)

export default function App() {
  return (
    <>
      <Analytics />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<Layout />}>

            {/* Public */}
            <Route path="/" element={
              <ErrorBoundary fallback={<RouteErrorFallback />}>
                <LandingPage />
              </ErrorBoundary>
            } />
            <Route path="/login" element={
              <ErrorBoundary fallback={<RouteErrorFallback />}>
                <LoginPage />
              </ErrorBoundary>
            } />

            {/* Auth-protected */}
            <Route path="/welcome" element={
              <ProtectedRoute>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <WelcomePage />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/sport-id" element={
              <ProtectedRoute>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <SportID />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/scout" element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <ScoutDashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/coach" element={
              <ProtectedRoute allowedRoles={['coach']}>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <CoachDashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/organizations" element={
              <ProtectedRoute>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <OrganizationsDashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/rankings" element={
              <ProtectedRoute>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <Rankings />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/player-analysis" element={
              <ProtectedRoute>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <PlayerAnalysis />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            {/* Player operational loop */}
            <Route path="/player/onboarding" element={
              <ProtectedRoute allowedRoles={['player']}>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <PlayerOnboarding />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/player/dashboard" element={
              <ProtectedRoute allowedRoles={['player']}>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <PlayerDashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/player/:id" element={
              <ProtectedRoute>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <PlayerProfile />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/player/upload" element={
              <ProtectedRoute allowedRoles={['player']}>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <PlayerUpload />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/coach/evaluate/:playerId" element={
              <ProtectedRoute allowedRoles={['coach']}>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <EvaluationForm />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            <Route path="/coach/workspace" element={
              <ProtectedRoute allowedRoles={['coach']}>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <CoachWorkspace />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            {/* Admin — coach with sport='admin' only */}
            <Route path="/admin" element={
              <AdminRoute>
                <ErrorBoundary fallback={<RouteErrorFallback />}>
                  <AdminDashboard />
                </ErrorBoundary>
              </AdminRoute>
            } />

            {/* Public — Privacy Policy */}
            <Route path="/privacy" element={
              <ErrorBoundary fallback={<RouteErrorFallback />}>
                <PrivacyPolicy />
              </ErrorBoundary>
            } />

            {/* 404 — must be last */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
