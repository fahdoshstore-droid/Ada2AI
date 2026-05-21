/**
 * main.tsx — Ada2AI
 * Root entry point.
 * 
 * Changes from original:
 * 1. Added QueryClientProvider (TanStack React Query)
 * 2. Added ErrorBoundary at root level
 * 3. Switched to BrowserRouter (vercel.json rewrites verified — SPA fallback works)
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { queryClient } from './lib/queryClient'
import './index.css'
import App from './App.tsx'

// Production env validation — log missing vars, don't crash
const REQUIRED_ENV = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]
REQUIRED_ENV.forEach(key => {
  if (!import.meta.env[key]) {
    console.error(`[Ada2AI] Missing required env var: ${key}`)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
        {/* DevTools only in development — tree-shaken in production build */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
