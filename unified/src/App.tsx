import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Auth } from './pages/Auth'
import { AppIndex } from './pages/app/index'
import { AdminDashboard } from './pages/app/AdminDashboard'
import { CoachDashboard } from './pages/app/CoachDashboard'
import { PlayerDashboard } from './pages/app/PlayerDashboard'
import { Rankings } from './pages/app/Rankings'
import { PlayerIntelligence } from './pages/app/PlayerIntelligence'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <AppIndex />
          </ProtectedRoute>
        } />
        <Route path="/app/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/app/coach" element={
          <ProtectedRoute allowedRoles={['coach']}>
            <CoachDashboard />
          </ProtectedRoute>
        } />
        <Route path="/app/player" element={
          <ProtectedRoute allowedRoles={['player']}>
            <PlayerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/app/rankings" element={
          <ProtectedRoute>
            <Rankings />
          </ProtectedRoute>
        } />
        <Route path="/app/intelligence" element={
          <ProtectedRoute>
            <PlayerIntelligence />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}