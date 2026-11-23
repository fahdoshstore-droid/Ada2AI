import { useRef } from 'react';
import OwnSportIdentity from '../components/coach/OwnSportIdentity';
import PageHeader from '../components/cinema/PageHeader';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Badge, Shield, BarChart3, Eye, QrCode, TrendingUp, Share2 } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'بطاقة رقمية موحدة',
    desc: 'بطاقة رقمية لكل لاعب تجمع بياناته وتقييماته في مكان واحد',
  },
  {
    icon: BarChart3,
    title: 'إحصائيات اللاعب',
    desc: 'السرعة والتمرير والتسديد وغيرها، بجانب الأهداف والمباريات',
  },
  {
    icon: Shield,
    title: 'رقم هوية ثابت',
    desc: 'رقم هوية رياضية لكل لاعب، وعلامة توثيق حين تتحقق المنصة من بياناته',
  },
  {
    icon: Eye,
    title: 'ظهور أمام الكشافين',
    desc: 'يظهر ملف اللاعب في لوحة الكشافين وترتيب المواهب على المنصة',
  },
  {
    icon: TrendingUp,
    title: 'تتبع التطور',
    desc: 'تقييمات المدرب محفوظة بتاريخها، فيُرى تطور اللاعب من تقييم إلى آخر',
  },
  {
    icon: Share2,
    title: 'ملف قابل للمشاركة',
    desc: 'رابط واحد لملف اللاعب يُرسل إلى الأندية والكشافين',
  },
];

export default function SportID() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  
  return (
    <div>
      <PageHeader
        eyebrow="المنتج الرئيسي"
        icon={Badge}
        titleTop="الهوية"
        titleBottom="الرياضية"
        description="بطاقة رقمية لكل لاعب تجمع بياناته وتقييم مدربه وتحليل أدائه، ويمكن مشاركتها مع الأندية والكشافين."
      >
        <button onClick={() => navigate('/player/onboarding')} className="btn-primary mt-8 rounded-xl px-8 py-4 arabic-text">
          احصل على هويتك الرياضية
        </button>
      </PageHeader>

      {/* The signed-in account's own Sport ID — real data, or an honest empty state. */}
      <section className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <OwnSportIdentity />
      </section>

      {/* Features Grid */}
      <section className="relative py-24" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="tracking-tightest text-3xl md:text-4xl font-black text-gradient-teal mb-4 arabic-text">مميزات الهوية الرياضية</h2>
            <p className="text-ice-muted text-lg max-w-2xl mx-auto arabic-text">
              كل ما يحتاجه اللاعب لبناء ملفه الرياضي الاحترافي
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="glass-card glass-card-hover rounded-2xl p-6 h-full">
                    <div className="w-12 h-12 rounded-xl bg-teal-prime/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-teal-prime" />
                    </div>
                    <h3 className="text-lg font-bold text-ice-white mb-2 arabic-text">{f.title}</h3>
                    <p className="text-sm text-ice-muted leading-relaxed arabic-text">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Player Card Preview */}
      <section className="relative py-24 bg-navy-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="tracking-tightest text-3xl md:text-4xl font-black mb-6">
                <span className="text-gradient-teal arabic-text">بطاقة اللاعب الذكية</span>
              </h2>
              <p className="text-ice-muted text-lg leading-relaxed mb-8 arabic-text">
                كل بطاقة تحتوي على بيانات شاملة تشمل المعلومات الشخصية، الإحصائيات، 
                التقييمات، الإنجازات، والفيديوهات. يمكن مشاركة البطاقة بسهولة مع الأندية والكشافين.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md overflow-hidden border border-white/10 bg-[#000A0F]">
                <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_80%_0%,rgba(0,220,200,0.16),transparent_70%)]" aria-hidden="true" />
                <div className="grain-overlay" />
                <div className="relative p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs font-semibold text-teal-prime">
                      <span className="h-px w-8 bg-teal-prime" />
                      <span className="arabic-text">الهوية الرياضية · جناح</span>
                    </div>
                    <span className="rounded-full border border-gold/50 px-2.5 py-0.5 text-[10px] text-gold arabic-text">مثال توضيحي</span>
                  </div>
                  <h3 className="text-5xl font-black leading-[1.15] tracking-tightest">
                    <span className="block text-ice-white arabic-text">عبدالله</span>
                    <span className="block text-teal-prime arabic-text">ناصر</span>
                  </h3>
                  <div className="mt-6 h-px bg-teal-prime/40" />
                  <div className="mt-6 flex items-end gap-8">
                    <div>
                      <p className="text-[11px] text-ice-muted arabic-text">التقييم العام</p>
                      <span className="font-display text-7xl font-black leading-none text-teal-prime">78</span>
                    </div>
                    {[{ l: 'أهداف', v: 12 }, { l: 'صناعة', v: 9 }, { l: 'مباريات', v: 24 }].map(x => (
                      <div key={x.l}>
                        <p className="text-[11px] text-ice-muted arabic-text">{x.l}</p>
                        <span className="font-display text-3xl font-bold leading-none text-ice-white">{x.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3">
                    {[['فني', 81], ['السرعة', 84], ['تكتيكي', 74], ['التمرير', 76], ['بدني', 79], ['التسديد', 71]].map(([l, v]) => (
                      <div key={l as string}>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-ice-muted arabic-text">{l}</span>
                          <span className="font-bold text-teal-prime">{v}</span>
                        </div>
                        <div className="mt-1 h-1 bg-white/5">
                          <div className="h-full bg-teal-prime" style={{ width: `${v}%`, marginInlineStart: 'auto' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-7 border-t border-white/10 pt-4 text-[11px] tracking-wide text-ice-muted" dir="ltr">ADA2AI · SPORT ID · SID-2026-00001</p>
                  <p className="mt-1 text-[11px] text-ice-muted/80 arabic-text">لاعب وأرقام توضيحية لشكل البطاقة، وليست بيانات لاعب حقيقي.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
