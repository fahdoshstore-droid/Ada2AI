/**
 * ErrorBoundary — Ada2AI
 * Global crash catcher. Prevents white screen on any unhandled error.
 * Integrates with Sentry if configured.
 */
import { Component, type ReactNode, type ErrorInfo } from 'react'
import { captureError } from '../lib/monitoring'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { componentStack: info.componentStack ?? '' })
    console.error('[ErrorBoundary] Caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          dir="rtl"
          className="min-h-screen bg-navy flex flex-col items-center justify-center px-4"
        >
          <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-ice-white mb-2 arabic-text">
              حدث خطأ غير متوقع
            </h2>
            <p className="text-ice-muted text-sm mb-6 arabic-text">
              تعذّر تحميل هذا القسم. جرّب إعادة التحميل أو التواصل مع الدعم إذا استمرت المشكلة.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre className="text-xs text-red-400 bg-red-500/5 rounded-lg p-3 text-left mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-5 py-2.5 rounded-xl glass-card text-ice-muted text-sm font-medium hover:text-ice-white transition-colors arabic-text"
              >
                الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
