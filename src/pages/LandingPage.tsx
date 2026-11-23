import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  Badge, UserSearch, Dumbbell, Users, Star, Share2, Filter, LayoutGrid, Film,
  Play, ArrowLeft, BarChart3,
  Shield, Zap, Languages, Award, ChevronLeft, Eye
} from 'lucide-react';
import { EASE, GhostNumber, ImageReveal, Letterbox, SplitReveal, Stagger, StaggerItem } from '../components/cinema/Cinema';
import heroSprint from '../assets/cinema/hero-sprint.jpg';
import playerDevelopment from '../assets/cinema/player-development.jpg';
import keeperRain from '../assets/cinema/keeper-rain.jpg';
import aerialPitch from '../assets/cinema/aerial-pitch.jpg';
import sportIdBoots from '../assets/cinema/sport-id-boots.jpg';
import scoutStands from '../assets/cinema/scout-stands.jpg';
import coachTouchline from '../assets/cinema/coach-touchline.jpg';
import stadiumBlueHour from '../assets/cinema/stadium-blue-hour.jpg';
import featureAiTracking from '../assets/cinema/feature-ai-tracking.jpg';
import featureDigitalId from '../assets/cinema/feature-digital-id.jpg';
import featureStatsBall from '../assets/cinema/feature-stats-ball.jpg';
import featureArabicDusk from '../assets/cinema/feature-arabic-dusk.jpg';

// ─── Product Data ───
const mainProducts = [
  {
    id: 'sport-identity',
    image: sportIdBoots,
    imagePosition: '20% 78%',
    icon: Badge,
    title: 'الهوية الرياضية',
    desc: 'بطاقة رقمية لكل لاعب بأسلوب بطاقات اللاعبين، مع تقييم مدربه وتحليل أدائه',
    path: '/sport-id',
    color: 'from-teal-prime to-teal-glow',
    accent: 'teal-prime',
    addons: [
      { title: 'تقييم المدرب', icon: Star, desc: 'أربعة محاور' },
      { title: 'ترتيب المواهب', icon: Award, desc: 'حسب المركز' },
      { title: 'بطاقة قابلة للمشاركة', icon: Share2, desc: 'رابط واحد' },
    ]
  },
  {
    id: 'scout-dashboard',
    image: scoutStands,
    imagePosition: '20% 40%',
    icon: UserSearch,
    title: 'لوحة الكشافين',
    desc: 'اكتشاف ومقارنة المواهب مع تقارير احترافية وتتبع الأداء',
    path: '/scout',
    color: 'from-scout-blue to-scout-light',
    accent: 'scout-blue',
    addons: [
      { title: 'تصفية متقدمة', icon: Filter, desc: 'الاسم والعمر والمركز' },
      { title: 'مقارنة لاعبين', icon: BarChart3, desc: 'جنباً إلى جنب' },
      { title: 'مشاركة ملف اللاعب', icon: Share2, desc: 'رابط مباشر' },
    ]
  },
  {
    id: 'coach-dashboard',
    image: coachTouchline,
    imagePosition: '30% 50%',
    icon: Dumbbell,
    title: 'لوحة المدربين',
    desc: 'تشكيل الفريق وتقييم اللاعبين، مع تحليل المباريات بالفيديو ورصد اللاعبين تلقائياً',
    path: '/coach',
    color: 'from-scout-blue to-teal-prime',
    accent: 'teal-prime',
    addons: [
      { title: 'تشكيل الفريق', icon: LayoutGrid, desc: 'ست خطط وحفظ' },
      { title: 'تقييم اللاعبين', icon: Star, desc: 'أربعة محاور' },
      { title: 'تحليل المباراة بالفيديو', icon: Film, desc: 'رصد اللاعبين' },
    ]
  },
  {
    id: 'organizations-dashboard',
    image: stadiumBlueHour,
    imagePosition: '50% 50%',
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
  { icon: Zap, title: 'تحليل بالذكاء الاصطناعي', image: featureAiTracking, imagePosition: '50% 50%', desc: 'تحليل مباريات فيديو متقدم عبر الرؤية الحاسوبية ونماذج التعلم العميق', wide: true },
  { icon: Shield, title: 'هوية رقمية موثقة', image: featureDigitalId, imagePosition: '35% 50%', desc: 'بطاقة رقمية لكل لاعب تتضمن جميع البيانات والإحصائيات والإنجازات' },
  { icon: BarChart3, title: 'إحصائيات متقدمة', image: featureStatsBall, imagePosition: '80% 60%', desc: 'مؤشرات أداء دقيقة ومقارنات تفصيلية بين اللاعبين' },
  { icon: Languages, title: 'عربية بالكامل', image: featureArabicDusk, imagePosition: '30% 55%', desc: 'واجهة عربية من اليمين لليسار، بمصطلحات المدربين والكشافين' },
  { icon: Eye, title: 'اكتشاف المواهب', image: scoutStands, imagePosition: '20% 40%', desc: 'تصفية ومقارنة اللاعبين حسب المركز والعمر والتقييم في مكان واحد', wide: true },
  { icon: Award, title: 'تقييم احترافي', image: coachTouchline, imagePosition: '30% 50%', desc: 'تقييم المدرب على أربعة محاور: فني، تكتيكي، بدني، وذهني' },
];

const stats = [
  { value: 'اكتشف المواهب', label: 'بالذكاء الاصطناعي', suffix: '' },
  { value: 'تحليل فيديو', label: 'تلقائي بالذكاء الاصطناعي', suffix: '' },
  { value: 'هوية رقمية', label: 'لكل لاعب رياضي', suffix: '' },
  { value: 'منصة سعودية', label: 'متكاملة وموثوقة', suffix: '' },
];

// The telestrator sequence sits below the fold: load it as its own chunk so it never delays the hero.
const FootageIntel = lazy(() => import('../components/cinema/FootageIntel'));

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
      <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F]/90 via-[#000A0F]/5 to-[#000A0F]/20" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#000A0F]/65 via-[#000A0F]/20 to-transparent" />
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

          <h1 className="text-[2.6rem] font-black leading-[1.22] tracking-tightest [text-shadow:0_2px_28px_rgba(0,10,15,0.65)] sm:text-6xl md:text-7xl lg:text-[5.75rem]">
            <SplitReveal text="نبني المواهب" immediate delay={0.7} className="block text-ice-white arabic-text" />
            <SplitReveal text="بالذكاء الاصطناعي" immediate delay={1.05} className="block text-teal-prime arabic-text" />
          </h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.6 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-ice-white/90 [text-shadow:0_1px_16px_rgba(0,10,15,0.8)] md:text-lg arabic-text"
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
                    onFocus={() => setHovered(product.id)}
                    onBlur={() => setHovered(null)}
                    className="group relative grid grid-cols-[auto_1fr_auto] items-start gap-5 overflow-hidden border-t border-white/10 px-3 py-8 transition-colors hover:bg-white/[0.025] md:gap-8 md:py-10"
                  >
                    {/* Row background: always faint on small screens (no side image there), on hover on large screens */}
                    <img
                      src={product.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: product.imagePosition }}
                      className="pointer-events-none absolute inset-0 -z-0 h-full w-full object-cover opacity-25 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-20"
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#000A0F] via-[#000A0F]/85 to-[#000A0F]/50" />
                    <span
                      className={`relative font-display text-5xl font-black leading-none md:text-7xl ${isHovered ? 'text-teal-prime' : 'text-transparent'}`}
                      style={{ WebkitTextStroke: isHovered ? '0px' : '1.5px rgba(238,239,238,0.35)', transition: 'color .4s' }}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative">
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
                    <ChevronLeft className={`relative mt-2 h-6 w-6 text-teal-prime transition-transform duration-300 ${isHovered ? '-translate-x-2' : ''}`} />
                  </Link>
                </StaggerItem>
              );
            })}
            <li aria-hidden="true" className="border-t border-white/10" />
          </Stagger>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28">
              <ImageReveal
                src={playerDevelopment}
                from="side"
                className="aspect-[4/5] w-full"
                imgClassName="object-[24%_50%]"
              >
                {mainProducts.map((product) => (
                  <img
                    key={product.id}
                    src={product.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: product.imagePosition }}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${hovered === product.id ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F]/35 via-transparent to-transparent" />
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F]/90 via-[#000A0F]/5 to-[#000A0F]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000A0F]/70 via-[#000A0F]/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[7svh] bg-[#000A0F]" aria-hidden="true" />
        <GhostNumber n="03" className="top-[8svh] end-[-2%]" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-[9svh] sm:px-6 lg:px-8">
          <span className="text-label-caps mb-4 inline-block">لماذا Ada2AI؟</span>
          <h2 className="max-w-3xl text-4xl font-black leading-[1.25] tracking-tightest [text-shadow:0_2px_26px_rgba(0,10,15,0.7)] md:text-6xl lg:text-7xl">
            <SplitReveal text="تقنية متقدمة" className="block text-teal-prime arabic-text" />
            <SplitReveal text="لعالم رياضي أفضل" delay={0.2} className="block text-ice-white arabic-text" />
          </h2>
          <p className="mt-4 max-w-xl text-base text-ice-white/70 md:text-lg arabic-text">
            نستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل الأداء الرياضي بدقة غير مسبوقة
          </p>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-32 lg:px-8">
        <Stagger gap={0.1} className="grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title} y={36} className={`group relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden border-t border-white/10 p-6 ${i % 3 === 1 ? 'lg:mt-12' : i % 3 === 2 ? 'lg:mt-24' : ''}`}>
                <img
                  src={feature.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: feature.imagePosition }}
                  className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 transition-[opacity,transform] duration-700 group-hover:scale-[1.04] group-hover:opacity-85"
                />
                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#000A0F] via-[#000A0F]/65 to-[#000A0F]/5" />
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
      <ImageReveal src={aerialPitch} className="absolute inset-0" imgClassName="grayscale opacity-80" parallax={6} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#000A0F]/90 via-[#000A0F]/30 to-[#000A0F]/85" />
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
  const { hash } = useLocation();
  // Deep links such as "/#footage-intel" (login page demo button) scroll to their section.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="bg-[#000A0F]">
      <HeroSection />
      <ProductsSection />
      <div id="footage-intel" className="scroll-mt-16">
        <Suspense fallback={<div className="min-h-[1100px] bg-[#000A0F]" aria-hidden="true" />}>
          <FootageIntel />
        </Suspense>
      </div>
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
