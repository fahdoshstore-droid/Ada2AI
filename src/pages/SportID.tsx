import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Badge, Shield, BarChart3, Globe, QrCode, TrendingUp, FileText, Award } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'بطاقة رقمية موحدة',
    desc: 'بطاقة FIFA رقمية لكل لاعب تحتوي على جميع البيانات والإحصائيات',
  },
  {
    icon: BarChart3,
    title: 'إحصائيات شاملة',
    desc: 'تتبع الأداء عبر المباريات مع مؤشرات دقيقة ومفصلة',
  },
  {
    icon: Shield,
    title: 'توثيق آمن',
    desc: 'بيانات مشفرة وموثقة بمعايير أمان عالمية',
  },
  {
    icon: Globe,
    title: 'رؤية عالمية',
    desc: 'ظهور اللاعب في قاعدة بيانات عالمية للكشافين والأندية',
  },
  {
    icon: TrendingUp,
    title: 'تتبع التطور',
    desc: 'متابعة التقدم والتطور عبر الزمن مع رسوم بيانية تفاعلية',
  },
  {
    icon: FileText,
    title: 'تقارير احترافية',
    desc: 'تقارير مفصلة يمكن مشاركتها مع الأندية والكشافين',
  },
];

export default function SportID() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-prime/10 rounded-full blur-[128px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-prime/10 border border-teal-prime/20 text-teal-prime text-sm font-medium mb-6">
              <Badge className="w-4 h-4" />
              <span className="arabic-text">المنتج الرئيسي</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-teal arabic-text">الهوية الرياضية</span>
            </h1>
            <p className="text-ice-muted text-lg md:text-xl leading-relaxed mb-8 arabic-text">
              بطاقة FIFA رقمية شاملة لكل لاعب. احصل على هويتك الرياضية الموثقة 
              مع تقييم شامل وتحليل أداء مستمر يتتبع تطورك في كل مباراة.
            </p>
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold hover:shadow-xl hover:shadow-teal-prime/25 transition-all arabic-text">
              احصل على هويتك الرياضية
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-teal mb-4 arabic-text">مميزات الهوية الرياضية</h2>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="text-gradient-teal arabic-text">بطاقة اللاعب الذكية</span>
              </h2>
              <p className="text-ice-muted text-lg leading-relaxed mb-8 arabic-text">
                كل بطاقة تحتوي على بيانات شاملة تشمل المعلومات الشخصية، الإحصائيات، 
                التقييمات، الإنجازات، والفيديوهات. يمكن مشاركة البطاقة بسهولة مع الأندية والكشافين.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'تقييم FIFA الرسمي', value: '86/100' },
                  { label: 'المباريات المحللة', value: '47' },
                  { label: 'دقة التمرير', value: '92%' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between glass-card rounded-xl p-4">
                    <span className="text-ice-muted text-sm arabic-text">{stat.label}</span>
                    <span className="text-teal-prime font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-prime/20 to-scout-blue/20 rounded-3xl blur-2xl" />
                <div className="relative glass-card rounded-3xl p-8 glow-teal">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-ice-white arabic-text">أحمد المحمدي</h3>
                      <p className="text-teal-prime text-sm">وسط مهاجم</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'السرعة', value: '88' },
                      { label: 'التمرير', value: '92' },
                      { label: 'اللياقة', value: '85' },
                      { label: 'التسديد', value: '79' },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-gradient-teal">{s.value}</div>
                        <div className="text-xs text-ice-muted arabic-text">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-ice-muted">ID: AD-2026-8842</span>
                    <span className="text-xs text-teal-prime font-semibold">موثق</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
