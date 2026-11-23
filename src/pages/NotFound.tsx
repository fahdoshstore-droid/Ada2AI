/**
 * NotFound — Ada2AI
 * 404 page. Shown for any unmatched route. Floodlight D2: outlined numerals
 * over the pitch-night backdrop, two clear ways out.
 */
import { useNavigate } from 'react-router-dom'
import { Home, ArrowRight } from 'lucide-react'
import { Letterbox } from '../components/cinema/Cinema'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div dir="rtl" className="relative flex min-h-screen items-center overflow-hidden bg-[#000A0F] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_30%,rgba(0,220,200,0.12),transparent_70%)]" aria-hidden="true" />
      <div className="grain-overlay" />
      <Letterbox height="3svh" />

      <div className="relative mx-auto w-full max-w-3xl text-center">
        <p
          className="font-display font-black leading-none text-transparent text-[clamp(7rem,24vw,14rem)]"
          style={{ WebkitTextStroke: '2px rgba(0,220,200,0.7)', direction: 'ltr' }}
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tightest text-ice-white md:text-5xl arabic-text">
          الصفحة غير موجودة
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ice-muted arabic-text">
          الرابط الذي تبحث عنه غير متاح أو تم نقله.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-prime to-scout-blue px-6 py-3 text-sm font-bold text-navy-dark transition-shadow hover:shadow-lg hover:shadow-teal-prime/25 arabic-text"
          >
            <Home className="h-4 w-4" />
            الصفحة الرئيسية
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-ice-muted transition-colors hover:text-ice-white arabic-text"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>
        </div>
      </div>
    </div>
  )
}
