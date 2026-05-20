import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
  Badge, UserSearch, Dumbbell, Users, TrendingUp, 
  Bot, School, Play, ArrowLeft, BarChart3, 
  Shield, Zap, Globe, Award, ChevronLeft
} from 'lucide-react';

// ─── Product Data ───
const mainProducts = [
  {
    id: 'sport-identity',
    icon: Badge,
    title: 'الهوية الرياضية',
    desc: 'بطاقة FIFA رقمية لكل لاعب مع تقييم شامل وتحليل أداء مستمر',
    path: '/sport-id',
    color: 'from-teal-prime to-teal-light',
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
    addons: []
  },
];

const features = [
  {
    icon: Zap,
    title: 'تحليل بالذكاء الاصطناعي',
    desc: 'تحليل مباريات فيديو متقدم باستخدام تقنيات YOLO ونماذج تعلم عميق',
  },
  {
    icon: Shield,
    title: 'هوية رقمية موثقة',
    desc: 'بطاقة رقمية لكل لاعب تتضمن جميع البيانات والإحصائيات والإنجازات',
  },
  {
    icon: BarChart3,
    title: 'إحصائيات متقدمة',
    desc: 'مؤشرات أداء دقيقة ومقارنات تفصيلية بين اللاعبين',
  },
  {
    icon: Globe,
    title: 'تغطية عالمية',
    desc: 'قاعدة بيانات واسعة تشمل آلاف اللاعبين حول العالم',
  },
  {
    icon: Users,
    title: 'ربط المهتمين',
    desc: 'منصة موحدة تربط بين اللاعبين والمدربين والكشافين والأندية',
  },
  {
    icon: Award,
    title: 'تقييم احترافي',
    desc: 'نظام تقييم يعتمد على معايير دولية موثقة من FIFA',
  },
];

const stats = [
  { value: '50K+', label: 'لاعب مسجل' },
  { value: '1.2M+', label: 'تحليل أداء' },
  { value: '200+', label: 'نادٍ مشترك' },
  { value: '98.7%', label: 'دقة التحليل' },
];

// ─── Animations ───
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="text-center mb-16"
    >
      <motion.span 
        variants={fadeInUp}
        custom={0}
        className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-teal-prime/10 text-teal-prime border border-teal-prime/20 mb-4 arabic-text"
      >
        {badge}
      </motion.span>
      <motion.h2 
        variants={fadeInUp}
        custom={1}
        className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4 leading-tight"
      >
        <span className="text-gradient-teal">{title}</span>
      </motion.h2>
      <motion.p 
        variants={fadeInUp}
        custom={2}
        className="text-ice-muted text-lg max-w-2xl mx-auto arabic-text"
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}

// ─── Hero Section ───
function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number; 
      radius: number; opacity: number;
    }> = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 194, 168, ${p.opacity})`;
        ctx.fill();
      });
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 194, 168, ${0.1 * (1 - dist / 150)})`;
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 bg-gradient-radial z-0" />
      <div className="absolute inset-0 grid-pattern z-0" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-prime/10 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-scout-blue/10 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-prime/10 border border-teal-prime/20 text-teal-prime text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span className="arabic-text">الجيل القادم من تحليل المواهب الرياضية</span>
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-tight mb-6">
            <span className="text-ice-white">نبني المواهب</span>
            <br />
            <span className="text-gradient-teal">بالذكاء الاصطناعي</span>
          </h1>
          
          <p className="text-ice-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed arabic-text">
            منصة Ada2AI هي المنصة السعودية الرائدة في اكتشاف وتحليل المواهب الرياضية. 
            نقدم حلولاً ذكية للكشافين والمدربين والأندية لاكتشاف النجوم قبل الجميع.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/sport-id"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-lg hover:shadow-xl hover:shadow-teal-prime/25 transition-all duration-300 flex items-center gap-2"
            >
              <span className="arabic-text">استكشف المنصة</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link to="/video-analysis" className="group px-8 py-4 rounded-xl border border-teal-prime/30 text-teal-prime font-semibold hover:border-teal-prime/60 hover:bg-teal-prime/5 transition-all duration-300 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-prime/20 flex items-center justify-center group-hover:bg-teal-prime/30 transition-colors">
                <Play className="w-4 h-4 text-teal-prime ml-0.5" />
              </div>
              <span className="arabic-text">شاهد كيف تعمل</span>
            </Link>
          </div>
        </motion.div>
        
        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6">
              <div className="text-2xl md:text-3xl font-bold font-display text-gradient-teal mb-1">{stat.value}</div>
              <div className="text-sm text-ice-muted arabic-text">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Products Section ───
function ProductsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  
  return (
    <section className="relative py-24 lg:py-32" ref={ref}>
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          badge="منتجاتنا الرئيسية"
          title="حلول متكاملة للعالم الرياضي"
          subtitle="أربع منتجات رئيسية مصممة خصيصاً لتلبية احتياجات جميع الأطراف في النظام الرياضي"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainProducts.map((product, i) => {
            const Icon = product.icon;
            const isHovered = hoveredProduct === product.id;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Link to={product.path} className="block h-full">
                  <div className={`glass-card glass-card-hover rounded-2xl p-6 lg:p-8 h-full border-glow ${isHovered ? 'border-teal-prime/40' : ''}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-ice-white mb-1 flex items-center gap-2">
                          <span className="arabic-text">{product.title}</span>
                          <ChevronLeft className="w-4 h-4 text-teal-prime" />
                        </h3>
                        <p className="text-ice-muted text-sm arabic-text leading-relaxed">{product.desc}</p>
                      </div>
                    </div>
                    
                    {product.addons.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-xs text-ice-muted mb-3 arabic-text">الإضافات المتاحة:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.addons.map((addon) => {
                            const AddonIcon = addon.icon;
                            return (
                              <span 
                                key={addon.title}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-ice-muted border border-white/5"
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

// ─── Features Section ───
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <section className="relative py-24 lg:py-32 bg-navy-light/50" ref={ref}>
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          badge="لماذا Ada2AI؟"
          title="تقنية متقدمة لعالم رياضي أفضل"
          subtitle="نستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل الأداء الرياضي بدقة غير مسبوقة"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="glass-card glass-card-hover rounded-2xl p-6 h-full group">
                  <div className="w-12 h-12 rounded-xl bg-teal-prime/10 flex items-center justify-center mb-4 group-hover:bg-teal-prime/20 transition-colors">
                    <Icon className="w-6 h-6 text-teal-prime" />
                  </div>
                  <h3 className="text-lg font-bold text-ice-white mb-2 arabic-text">{feature.title}</h3>
                  <p className="text-sm text-ice-muted leading-relaxed arabic-text">{feature.desc}</p>
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
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <section className="relative py-24 lg:py-32" ref={ref}>
      <div className="absolute inset-0 bg-gradient-radial opacity-40" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative glass-card rounded-3xl p-8 md:p-16 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-prime/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-scout-blue/20 rounded-full blur-[100px]" />
          
          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-6">
              <span className="text-ice-white arabic-text">اكتشف النجوم </span>
              <span className="text-gradient-teal arabic-text">قبل الجميع</span>
            </h2>
            <p className="text-ice-muted text-lg mb-10 arabic-text leading-relaxed">
              انضم إلى أكثر من 200 نادٍ و50,000 لاعب يثقون بـ Ada2AI في تحليل المواهب وتطوير الأداء الرياضي
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="px-10 py-4 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-lg hover:shadow-xl hover:shadow-teal-prime/25 transition-all duration-300 arabic-text">
                ابدأ رحلتك المجانية
              </Link>
              <Link 
                to="/rankings"
                className="px-10 py-4 rounded-xl border border-teal-prime/30 text-teal-prime font-semibold hover:border-teal-prime/60 hover:bg-teal-prime/5 transition-all duration-300 arabic-text"
              >
                استكشف الترتيب
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Landing Page ───
export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <ProductsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
