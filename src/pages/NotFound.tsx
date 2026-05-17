/**
 * NotFound — Ada2AI
 * 404 page. Shown for any unmatched route.
 */
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowRight } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-navy flex flex-col items-center justify-center px-4"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative glass-card rounded-2xl p-10 max-w-md w-full text-center"
      >
        {/* Big 404 */}
        <div className="text-8xl font-black text-gradient-teal mb-2 select-none">
          404
        </div>

        <h1 className="text-2xl font-bold text-ice-white mb-3 arabic-text">
          الصفحة غير موجودة
        </h1>
        <p className="text-ice-muted text-sm leading-relaxed mb-8 arabic-text">
          الرابط الذي تبحث عنه غير متاح أو تم نقله.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card text-ice-muted text-sm font-medium hover:text-ice-white transition-colors arabic-text"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </button>
        </div>
      </motion.div>
    </div>
  )
}
