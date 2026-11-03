import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  Badge, UserSearch, Dumbbell, Users, TrendingUp,
  Bot, School, Play, ArrowLeft, BarChart3,
  Shield, Zap, Globe, Award, ChevronLeft, Eye
} from 'lucide-react';
import { EASE, GhostNumber, ImageReveal, Letterbox, SplitReveal, Stagger, StaggerItem } from '../components/cinema/Cinema';
import FootageIntel from '../components/cinema/FootageIntel';
import heroSprint from '../assets/cinema/hero-sprint.jpg';
import coachTouchline from '../assets/cinema/coach-touchline.jpg';
import keeperRain from '../assets/cinema/keeper-rain.jpg';
import aerialPitch from '../assets/cinema/aerial-pitch.jpg';

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
    color: 'from-scout-blue to-teal-prime',
    accent: 'teal-prime',
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
  { value: 'اكتشف المواهب', label: 'بالذكاء الاصطناعي', suffix: '' },
  { value: 'تحليل فيديو', label: 'تلقائي بالذكاء الاصطناعي', suffix: '' },
  { value: 'هوية رقمية', label: 'لكل لاعب رياضي', suffix: '' },
  { value: 'منصة سعودية', label: 'متكاملة وموثوقة', suffix: '' },
];

// ─── Hero (full-bleed cinematic) ───
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#000A0F]" aria-label="الواجهة الرئيسية">
      {/* photograph — slow scale + scroll parallax */}
      <motion.div style={reduced ? undefined : { y: imgY }} className="absolute inset-x-0 top-[9svh] -bottom-[4%]">
        <motion.img
          src={heroSprint}
          alt=""
          decoding="async"
          fetchPriority="high"
          initial={reduced ? false : { scale: 1.16 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: 'easeOut' }}
          className="h-full w-full object-cover object-[36%_0%]"
        />
      </motion.div>

      {/* grade: navy falloff + teal floodlight accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F] via-[#000A0F]/25 to-[#000A0F]/55" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#000A0F]/90 via-[#000A0F]/35 to-transparent" />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(55%_50%_at_16%_30%,rgba(0,220,200,0.16),transparent_70%)]"
        animate={reduced ? undefined : { opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="grain-overlay" />
      <Letterbox height="7svh" />

      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-[19svh] sm:px-6 md:pb-[17svh] lg:px-8"
      >
        <div className="max-w-5xl">
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
            className="mb-5 flex items-center gap-3 text-sm font-semibold text-teal-prime"
          >
            <span className="h-px w-10 bg-teal-prime" />
            <span className="arabic-text">الجيل القادم من تحليل المواهب الرياضية</span>
          </motion.div>

          <h1 className="text-[2.6rem] font-black leading-[1.22] tracking-tightest sm:text-6xl md:text-7xl lg:text-[5.75rem]">
            <SplitReveal text="نبني المواهب" immediate delay={0.7} className="block text-ice-white arabic-text" />
            <SplitReveal text="بالذكاء الاصطناعي" immediate delay={1.05} className="block text-teal-prime arabic-text" />
          </h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.6 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-ice-white/75 md:text-lg arabic-text"
          >
            منصة Ada2AI هي المنصة السعودية الرائعة في اكتشاف وتحليل المواهب الرياضية.
            نقدم حلولاً ذكية للكشافين والمدربين والأندية لاكتشاف النجوم قبل الجميع.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.85 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link to="/sport-id" className="btn-primary rounded-xl px-10 py-4 text-lg btn-magnetic">
              <span className="arabic-text">استكشف المنصة</span>
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link to="/video-analysis" className="btn-ghost group rounded-xl px-10 py-4 text-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-prime/15 transition-colors group-hover:bg-teal-prime/25">
                <Play className="ml-0.5 h-5 w-5 text-teal-prime" />
              </div>
              <span className="arabic-text">شاهد كيف تعمل</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* credits strip (inside the lower letterbox zone) */}
      <motion.dl
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.1 }}
        className="absolute inset-x-0 bottom-[7svh] z-10 mx-auto hidden max-w-7xl grid-cols-4 gap-6 border-t border-white/10 px-4 py-4 sm:px-6 md:grid lg:px-8"
      >
        {stats.map((st) => (
          <div key={st.label}>
            <dt className="text-sm font-bold text-ice-white arabic-text">{st.value}</dt>
            <dd className="text-xs text-ice-muted arabic-text">{st.label}</dd>
          </div>
        ))}
      </motion.dl>

      <span className="absolute bottom-[1.6svh] start-4 z-30 text-[10px] tracking-wide text-ice-muted/70 arabic-text sm:start-6 lg:start-8">
        صورة مولّدة بالذكاء الاصطناعي
      </span>

      {/* scroll cue */}
      <div aria-hidden="true" className="absolute bottom-[1.2svh] left-1/2 z-30 h-[5svh] w-px -translate-x-1/2 overflow-hidden bg-white/15">
        <motion.div
          className="h-full w-full bg-teal-prime"
          animate={reduced ? undefined : { y: ['-100%', '100%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </section>
  );
}

// ─── Chapter 01 — Products ───
function ProductsSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-[#000A0F] py-24 md:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#000A0F] to-transparent" />
      <GhostNumber n="01" className="-top-6 start-[-3%]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-3xl md:mb-24">
          <span className="text-label-caps mb-4 inline-block">منتجاتنا الرئيسية</span>
          <h2 className="text-4xl font-black leading-[1.25] tracking-tightest md:text-6xl lg:text-7xl">
            <SplitReveal text="حلول متكاملة" className="block text-teal-prime arabic-text" />
            <SplitReveal text="للعالم الرياضي" delay={0.2} className="block text-ice-white arabic-text" />
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-ice-muted arabic-text">
            أربع منتجات رئيسية مصممة خصيصاً لتلبية احتياجات جميع الأطراف في النظام الرياضي
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Stagger as="ul" gap={0.12} className="lg:col-span-7">
            {mainProducts.map((product, i) => {
              const Icon = product.icon;
              const isHovered = hovered === product.id;
              return (
                <StaggerItem as="li" key={product.id} x={48} y={0} className={i % 2 ? 'lg:ms-10' : ''}>
                  <Link
                    to={product.path}
                    onMouseEnter={() => setHovered(product.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 border-t border-white/10 py-8 transition-colors hover:bg-white/[0.025] md:gap-8 md:py-10"
                  >
                    <span
                      className={`font-display text-5xl font-black leading-none md:text-7xl ${isHovered ? 'text-teal-prime' : 'text-transparent'}`}
                      style={{ WebkitTextStroke: isHovered ? '0px' : '1.5px rgba(238,239,238,0.35)', transition: 'color .4s' }}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${product.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-ice-white md:text-3xl arabic-text">{product.title}</h3>
                      </div>
                      <p className="max-w-xl text-sm leading-relaxed text-ice-muted md:text-base arabic-text">{product.desc}</p>
                      {product.addons.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {product.addons.map((addon) => {
                            const AddonIcon = addon.icon;
                            return (
                              <span key={addon.title} className="inline-flex items-center gap-1.5 border border-white/10 px-2.5 py-1 text-xs text-ice-muted transition-colors group-hover:border-teal-prime/30">
                                <AddonIcon className="h-3 w-3 text-teal-prime" />
                                <span className="arabic-text">{addon.title}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <ChevronLeft className={`mt-2 h-6 w-6 text-teal-prime transition-transform duration-300 ${isHovered ? '-translate-x-2' : ''}`} />
                  </Link>
                </StaggerItem>
              );
            })}
            <li aria-hidden="true" className="border-t border-white/10" />
          </Stagger>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28">
              <ImageReveal
                src={coachTouchline}
                from="side"
                className="aspect-[4/5] w-full"
                imgClassName="object-[22%_50%]"
                caption="صورة مولّدة بالذكاء الاصطناعي"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F]/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-teal-prime/80" />
              </ImageReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Chapter 03 — Features (letterbox break + asymmetric grid) ───
function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-[#000A0F]">
      <div className="relative h-[72svh] min-h-[460px]">
        <ImageReveal src={keeperRain} className="absolute inset-0" imgClassName="object-[68%_50%]" parallax={5} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F] via-[#000A0F]/30 to-[#000A0F]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000A0F]/90 via-[#000A0F]/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[7svh] bg-[#000A0F]" aria-hidden="true" />
        <GhostNumber n="03" className="top-[8svh] end-[-2%]" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-[9svh] sm:px-6 lg:px-8">
          <span className="text-label-caps mb-4 inline-block">لماذا Ada2AI؟</span>
          <h2 className="max-w-3xl text-4xl font-black leading-[1.25] tracking-tightest md:text-6xl lg:text-7xl">
            <SplitReveal text="تقنية متقدمة" className="block text-teal-prime arabic-text" />
            <SplitReveal text="لعالم رياضي أفضل" delay={0.2} className="block text-ice-white arabic-text" />
          </h2>
          <p className="mt-4 max-w-xl text-base text-ice-white/70 md:text-lg arabic-text">
            نستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل الأداء الرياضي بدقة غير مسبوقة
          </p>
        </div>
      </div>
      <span className="absolute end-4 top-[calc(72svh-1.5rem)] z-20 hidden text-[10px] text-ice-muted/70 arabic-text md:block lg:end-8">صورة مولّدة بالذكاء الاصطناعي</span>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-32 lg:px-8">
        <Stagger gap={0.1} className="grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title} y={36} className={`border-t border-white/10 pt-6 ${i % 3 === 1 ? 'lg:mt-12' : i % 3 === 2 ? 'lg:mt-24' : ''}`}>
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-display text-4xl font-black text-transparent" style={{ WebkitTextStroke: '1.5px rgba(0,220,200,0.45)' }} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Icon className="h-6 w-6 text-teal-prime" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-ice-white arabic-text">{feature.title}</h3>
                <p className="leading-relaxed text-ice-muted arabic-text">{feature.desc}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

// ─── Final CTA (cinematic) ───
function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: false, margin: '-10% 0px -10% 0px' });

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#000A0F] py-36 md:py-56" aria-label="ابدأ الآن">
      <ImageReveal src={aerialPitch} className="absolute inset-0" imgClassName="grayscale opacity-45" parallax={6} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#000A0F] via-[#000A0F]/45 to-[#000A0F]" />
      {/* teal lighting accent */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_100%,rgba(0,220,200,0.32),transparent_70%)]"
        animate={reduced || !inView ? { opacity: 0.7 } : { opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-prime to-transparent" aria-hidden="true" />
      <div className="grain-overlay" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="text-label-caps mb-6 inline-block">ابدأ الآن</span>
        <h2 className="max-w-4xl text-5xl font-black leading-[1.22] tracking-tightest md:text-7xl lg:text-8xl">
          <SplitReveal text="اكتشف النجوم" className="block text-ice-white arabic-text" />
          <SplitReveal text="قبل الجميع" delay={0.22} className="block text-teal-prime arabic-text" />
        </h2>
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-ice-white/75 arabic-text"
        >
          انضم إلى المنصة الرائدة في اكتشاف المواهب الرياضية وتطوير الأداء بالمملكة العربية السعودية
        </motion.p>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link to="/login" className="btn-primary rounded-xl px-12 py-4 text-lg btn-magnetic">
            <span className="arabic-text">ابدأ رحلتك المجانية</span>
          </Link>
          <Link to="/rankings" className="btn-ghost rounded-xl px-12 py-4 text-lg">
            <span className="arabic-text">استكشف الترتيب</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Landing Page ───
export default function LandingPage() {
  return (
    <div className="bg-[#000A0F]">
      <HeroSection />
      <ProductsSection />
      <FootageIntel />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
