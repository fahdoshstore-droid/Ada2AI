import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Badge, UserSearch, Dumbbell, Users, TrendingUp,
  Bot, School, Play, ArrowLeft, BarChart3,
  Shield, Zap, Globe, Award, ChevronLeft,
  Sparkles, Cpu, Eye, Target
} from 'lucide-react';

// ─── Product Data ───
const mainProducts = [
  {
    id: 'sport-identity',
    icon: Badge,
    title: 'الهوية الرياضية',
    desc: 'بطاقة FIFA رقمية لكل لاعب مع تقييم شامل وتحليل أداء مستمر',
    path: '/sport-id',
    color: 'from-teal-prime to-teal-glow',
    accent: 'teal-prime',
    addons: [
      { title: 'محرك تطوير الأداء', icon: TrendingUp, desc: 'تحليل تطوري مخصص' },
      { title: 'مساعد افتراضي', icon: Bot, desc: 'دعم ذكي 24/7' },
      { title: 'مركز التطوير', icon: School, desc: 'برامج تدريب متقدمة' },
    ]
  },
  {
    id: 'scout-dashboard',
    icon: UserSearch,
    title: 'لوحة الكشافين',
    desc: 'اكتشاف ومقارنة المواهب مع تقارير احترافية وتتبع الأداء',
    path: '/scout',
    color: 'from-scout-blue to-scout-light',
    accent: 'scout-blue',
    addons: [
      { title: 'محرك تطوير الأداء', icon: TrendingUp, desc: 'تحليل تطوري مخصص' },
      { title: 'مساعد افتراضي', icon: Bot, desc: 'دعم ذكي 24/7' },
      { title: 'مركز التطوير', icon: School, desc: 'برامج تدريب متقدمة' },
    ]
  },
  {
    id: 'coach-dashboard',
    icon: Dumbbell,
    title: 'لوحة المدربين',
    desc: 'إدارة الفريق والتدريبات مع خطط تكتيكية مدعومة بالذكاء الاصطناعي',
    path: '/coach',
    color: 'from-gold to-gold-light',
    accent: 'gold',
    addons: [
      { title: 'محرك تطوير الأداء', icon: TrendingUp, desc: 'تحليل تطوري مخصص' },
      { title: 'مساعد افتراضي', icon: Bot, desc: 'دعم ذكي 24/7' },
      { title: 'مركز التطوير', icon: School, desc: 'برامج تدريب متقدمة' },
    ]
  },
  {
    id: 'organizations-dashboard',
    icon: Users,
    title: 'لوحة المنشآت',
    desc: 'إدارة شاملة للاعبين والمؤسسات الرياضية مع تقارير مفصلة',
    path: '/organizations',
    color: 'from-scout-blue to-teal-prime',
    accent: 'scout-blue',
    addons: []
  },
];

const features = [
  { icon: Zap, title: 'تحليل بالذكاء الاصطناعي', desc: 'تحليل مباريات فيديو متقدم باستخدام تقنيات YOLO ونماذج تعلم عميق', wide: true },
  { icon: Shield, title: 'هوية رقمية موثقة', desc: 'بطاقة رقمية لكل لاعب تتضمن جميع البيانات والإحصائيات والإنجازات' },
  { icon: BarChart3, title: 'إحصائيات متقدمة', desc: 'مؤشرات أداء دقيقة ومقارنات تفصيلية بين اللاعبين' },
  { icon: Globe, title: 'تغطية عالمية', desc: 'قاعدة بيانات واسعة تشمل آلاف اللاعبين حول العالم' },
  { icon: Eye, title: 'كشف المواهب', desc: 'خوارزميات متقدمة لاكتشاف المواهب الواعدة تلقائياً', wide: true },
  { icon: Award, title: 'تقييم احترافي', desc: 'نظام تقييم يعتمد على معايير دولية موثقة من FIFA' },
];

const stats = [
  { value: '50K+', label: 'لاعب مسجل', suffix: '' },
  { value: '1.2M+', label: 'تحليل أداء', suffix: '' },
  { value: '200+', label: 'نادٍ مشترك', suffix: '' },
  { value: '98.7%', label: 'دقة التحليل', suffix: '' },
];

// ─── Animation Variants ───
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

// ─── Count-Up Component ───
function CountUpStat({ value, label, suffix }: { value: string; label: string; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const numericPart = value.replace(/[^0-9.]/g, '');
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const displaySuffix = suffix || value.replace(numericPart, '').replace(prefix, '');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-premium rounded-2xl p-8 text-center card-depth-hover"
    >
      <div className="text-3xl md:text-4xl font-bold font-display tracking-tightest mb-2">
        <span className="text-gradient-hero">{prefix}{isInView ? numericPart : '0'}</span>
        <span className="text-gradient-teal">{displaySuffix}</span>
      </div>
      <div className="text-sm text-ice-muted arabic-text tracking-loose">{label}</div>
    </motion.div>
  );
}

// ─── Hero Section ───
function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      radius: number; opacity: number; pulse: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.01;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dynamicOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 194, 168, ${dynamicOpacity})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 194, 168, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060d18]">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="grain-overlay grain-overlay-animated" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-teal-prime/8 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-scout-blue/6 rounded-full blur-[130px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-glow/3 rounded-full blur-[200px]" />

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 lg:py-48 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-prime/8 border border-teal-prime/15 text-teal-prime text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="arabic-text">الجيل القادم من تحليل المواهب الرياضية</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.9] tracking-tightest mb-8">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="block text-ice-white arabic-text"
            >
              نبني المواهب
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="block text-gradient-shimmer arabic-text mt-2"
            >
              بالذكاء الاصطناعي
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-ice-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed arabic-text"
          >
            منصة Ada2AI هي المنصة السعودية الرائعة في اكتشاف وتحليل المواهب الرياضية.
            نقدم حلولاً ذكية للكشافين والمدربين والأندية لاكتشاف النجوم قبل الجميع.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/sport-id"
              className="btn-primary text-lg px-10 py-4 rounded-xl btn-magnetic"
            >
              <span className="arabic-text">استكشف المنصة</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              to="/video-analysis"
              className="btn-ghost text-lg px-10 py-4 rounded-xl group"
            >
              <div className="w-11 h-11 rounded-full bg-teal-prime/15 flex items-center justify-center group-hover:bg-teal-prime/25 transition-colors">
                <Play className="w-5 h-5 text-teal-prime ml-0.5" />
              </div>
              <span className="arabic-text">شاهد كيف تعمل</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-24 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, i) => (
            <CountUpStat key={stat.label} value={stat.value} label={stat.label} suffix={stat.suffix} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Products Section ───
function ProductsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <section className="relative section-spacing" ref={ref}>
      <div className="absolute inset-0 bg-gradient-radial opacity-20" />
      <div className="grain-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16 md:mb-20"
        >
          <motion.span
            variants={fadeInUp}
            custom={0}
            className="text-label-caps inline-block mb-4"
          >
            منتجاتنا الرئيسية
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            custom={1}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tightest mb-4"
          >
            <span className="text-gradient-teal arabic-text">حلول متكاملة</span>
            <span className="text-ice-white arabic-text"> للعالم الرياضي</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="text-ice-muted text-lg max-w-2xl mx-auto arabic-text"
          >
            أربع منتجات رئيسية مصممة خصيصاً لتلبية احتياجات جميع الأطراف في النظام الرياضي
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {mainProducts.map((product, i) => {
            const Icon = product.icon;
            const isHovered = hoveredProduct === product.id;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Link to={product.path} className="block h-full">
                  <div className={`glass-premium rounded-2xl p-8 lg:p-10 h-full card-depth-hover border border-white/[0.06] ${isHovered ? 'border-teal-prime/30 bg-[#060d18]/95' : ''}`}>
                    <div className="flex items-start gap-5 mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center flex-shrink-0 shadow-lg depth-sm`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-ice-white mb-2 flex items-center gap-2">
                          <span className="arabic-text">{product.title}</span>
                          <ChevronLeft className={`w-4 h-4 text-teal-prime transition-transform duration-300 ${isHovered ? '-translate-x-1' : ''}`} />
                        </h3>
                        <p className="text-ice-muted text-sm arabic-text leading-relaxed">{product.desc}</p>
                      </div>
                    </div>

                    {product.addons.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-white/[0.06]">
                        <p className="text-label-caps mb-4">الإضافات المتاحة</p>
                        <div className="flex flex-wrap gap-2">
                          {product.addons.map((addon) => {
                            const AddonIcon = addon.icon;
                            return (
                              <span
                                key={addon.title}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-ice-muted border border-white/[0.06] transition-all duration-300 hover:border-teal-prime/30 hover:text-ice-white"
                              >
                                <AddonIcon className="w-3 h-3 text-teal-prime" />
                                <span className="arabic-text">{addon.title}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Features Section (Bento Grid) ───
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative section-spacing bg-navy-dark/50" ref={ref}>
      <div className="absolute inset-0 grid-pattern-fine opacity-40" />
      <div className="grain-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16 md:mb-20"
        >
          <motion.span variants={fadeInUp} custom={0} className="text-label-caps inline-block mb-4">
            لماذا Ada2AI؟
          </motion.span>
          <motion.h2 variants={fadeInUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tightest mb-4">
            <span className="text-gradient-teal arabic-text">تقنية متقدمة</span>
            <span className="text-ice-white arabic-text"> لعالم رياضي أفضل</span>
          </motion.h2>
          <motion.p variants={fadeInUp} custom={2} className="text-ice-muted text-lg max-w-2xl mx-auto arabic-text">
            نستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل الأداء الرياضي بدقة غير مسبوقة
          </motion.p>
        </motion.div>

        <div className="bento-grid">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={feature.wide ? 'bento-wide' : ''}
              >
                <div className={`glass-premium rounded-2xl p-8 h-full group card-depth-hover border border-white/[0.06] ${feature.wide ? 'md:flex md:items-start md:gap-6' : ''}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-teal-prime/8 flex items-center justify-center mb-5 group-hover:bg-teal-prime/15 transition-colors duration-300 border border-teal-prime/10 ${feature.wide ? 'md:mb-0 md:flex-shrink-0' : ''}`}>
                    <Icon className="w-7 h-7 text-teal-prime" />
                  </div>
                  <div className={feature.wide ? 'md:flex-1' : ''}>
                    <h3 className="text-xl font-bold text-ice-white mb-3 arabic-text">{feature.title}</h3>
                    <p className="text-ice-muted leading-relaxed arabic-text">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ───
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative section-spacing" ref={ref}>
      <div className="absolute inset-0 bg-[#060d18]" />
      <div className="absolute inset-0 bg-gradient-hero-orb-1" />
      <div className="absolute inset-0 bg-gradient-hero-orb-2" />
      <div className="grain-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative glass-premium rounded-3xl p-10 md:p-16 lg:p-20 overflow-hidden border border-white/[0.06]"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-prime/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-scout-blue/10 rounded-full blur-[120px]" />

          <div className="relative text-center max-w-3xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-label-caps inline-block mb-6"
            >
              ابدأ الآن
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tightest mb-6"
            >
              <span className="text-ice-white arabic-text">اكتشف النجوم </span>
              <span className="text-gradient-shimmer arabic-text">قبل الجميع</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-ice-muted text-lg mb-10 arabic-text leading-relaxed"
            >
              انضم إلى أكثر من 200 نادٍ و50,000 لاعب يثقون بـ Ada2AI في تحليل المواهب وتطوير الأداء الرياضي
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/login"
                className="btn-primary text-lg px-12 py-4 rounded-xl btn-magnetic"
              >
                <span className="arabic-text">ابدأ رحلتك المجانية</span>
              </Link>
              <Link
                to="/rankings"
                className="btn-ghost text-lg px-12 py-4 rounded-xl"
              >
                <span className="arabic-text">استكشف الترتيب</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Landing Page ───
export default function LandingPage() {
  return (
    <div className="bg-[#060d18]">
      <HeroSection />
      <ProductsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}