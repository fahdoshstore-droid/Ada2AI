import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, roleDashboard } from '../contexts/AuthContext'
import {
  Trophy,
  Target,
  Search,
  User,
  BarChart3,
  Video,
  Users,
  ClipboardList,
  Star,
  FileCheck,
  Sparkles,
} from 'lucide-react'
import type { UserType } from '../lib/supabase'

interface RoleConfig {
  greeting: string
  subtitle: string
  icon: React.ReactNode
  accent: string
  features: { icon: React.ReactNode; title: string; desc: string }[]
  profilePrompt: string
}

const roleConfigs: Record<UserType, RoleConfig> = {
  player: {
    greeting: 'مرحباً بك يا بطل! 🏆',
    subtitle: 'الهوية الرياضية الخاصة بك جاهزة',
    icon: <Trophy className="w-12 h-12" />,
    accent: 'from-teal-prime to-emerald-400',
    features: [
      {
        icon: <User className="w-6 h-6" />,
        title: 'الهوية الرياضية',
        desc: 'أنشئ ملفك الرياضي الشامل مع التقييمات والإحصائيات',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        title: 'تتبع الأداء',
        desc: 'راقب تطور مهاراتك وتقدمك على المدى الطويل',
      },
      {
        icon: <Video className="w-6 h-6" />,
        title: 'تحليل الفيديو',
        desc: 'احصل على تحليلات ذكية لأدائك من خلال الفيديو',
      },
    ],
    profilePrompt: 'أكمل ملفك الشخصي الرياضي لتظهر للكشافين والمدربين',
  },
  coach: {
    greeting: 'مرحباً بك يا مدرب! 🎯',
    subtitle: 'أدوات إدارة الفريق في انتظارك',
    icon: <Target className="w-12 h-12" />,
    accent: 'from-teal-prime to-scout-blue',
    features: [
      {
        icon: <Users className="w-6 h-6" />,
        title: 'إدارة الفريق',
        desc: 'تنظيم اللاعبين والتشكيلات والخطط بسهولة',
      },
      {
        icon: <ClipboardList className="w-6 h-6" />,
        title: 'تقييم الأداء',
        desc: 'قيّم أداء اللاعبين وأنشئ تقارير مفصلة',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        title: 'التحليلات المتقدمة',
        desc: 'رؤى عميقة حول أداء الفريق واللاعبين',
      },
    ],
    profilePrompt: 'أضف فريقك وابدأ بإدارة اللاعبين والخطط',
  },
  scout: {
    greeting: 'مرحباً بك يا كشاف! 🔍',
    subtitle: 'اكتشف المواهب القادمة',
    icon: <Search className="w-12 h-12" />,
    accent: 'from-scout-blue to-teal-prime',
    features: [
      {
        icon: <Search className="w-6 h-6" />,
        title: 'بحث متقدم',
        desc: 'ابحث عن المواهب حسب الموقع والعمر والمهارات',
      },
      {
        icon: <Star className="w-6 h-6" />,
        title: 'التقييم الذكي',
        desc: 'تقييمات مدعومة بالذكاء الاصطناعي لكل لاعب',
      },
      {
        icon: <FileCheck className="w-6 h-6" />,
        title: 'تقارير مفصلة',
        desc: 'أنشئ وقارن تقارير اللاعبين بشكل احترافي',
      },
    ],
    profilePrompt: 'حدد معايير البحث الخاصة بك للعثور على أفضل المواهب',
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function WelcomePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const userType: UserType = profile?.user_type ?? 'player'
  const config = roleConfigs[userType]
  const dashboardPath = roleDashboard(userType)

  // Auto-redirect after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(dashboardPath, { replace: true })
    }, 8000)
    return () => clearTimeout(timer)
  }, [navigate, dashboardPath])

  const handleStart = () => {
    navigate(dashboardPath, { replace: true })
  }

  const handleSkip = () => {
    navigate(dashboardPath, { replace: true })
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-prime/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-scout-blue/10 rounded-full blur-[128px]" />

      <motion.div
        className="relative w-full max-w-2xl mx-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          {/* Role Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${config.accent} text-ice-white shadow-lg shadow-teal-prime/20 mb-6`}
          >
            {config.icon}
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-gradient-teal arabic-text mb-3">
            {config.greeting}
          </h1>
          <p className="text-ice-muted text-lg arabic-text">
            {config.subtitle}
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {config.features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="glass-card rounded-2xl p-6 text-center group hover:border-teal-prime/40 transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${config.accent} text-ice-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-ice-white font-bold text-base arabic-text mb-2">
                {feature.title}
              </h3>
              <p className="text-ice-muted text-sm arabic-text leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Profile Completion Prompt */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 mb-8 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gold" />
          </div>
          <p className="text-ice-muted text-sm arabic-text leading-relaxed flex-1">
            {config.profilePrompt}
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="text-center">
          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-lg arabic-text hover:shadow-lg hover:shadow-teal-prime/25 transition-all duration-300 active:scale-95"
          >
            ابدأ الآن
          </button>

          {/* Skip Link */}
          <div className="mt-4">
            <button
              onClick={handleSkip}
              className="text-ice-muted text-sm hover:text-ice-white transition-colors arabic-text underline underline-offset-4 decoration-ice-muted/30 hover:decoration-ice-white/50"
            >
              تخطي
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}