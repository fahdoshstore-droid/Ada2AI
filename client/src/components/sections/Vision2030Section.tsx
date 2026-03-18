import { Target, Zap, Users, TrendingUp } from "lucide-react";

const pillars = [
  {
    icon: <Target size={26} />,
    title: "تطوير المواهب الوطنية",
    desc: "اكتشاف وتطوير اللاعبين السعوديين بدل الاعتماد على الأجانب — تقليل فاتورة الاستيراد الرياضي",
  },
  {
    icon: <Zap size={26} />,
    title: "التحول الرقمي للرياضة",
    desc: "استخدام AI والتقنية لتحويل القطاع الرياضي — يتوافق مع مستهدفات رؤية 2030 الرقمية",
  },
  {
    icon: <Users size={26} />,
    title: "تمكين الشباب السعودي",
    desc: "إعطاء فرصة متساوية لكل موهوب بغض النظر عن موقعه الجغرافي أو خلفيته الاجتماعية",
  },
  {
    icon: <TrendingUp size={26} />,
    title: "جذب الاستثمار الرياضي",
    desc: "بيانات موثوقة وشفافة تجذب المستثمرين المحليين والدوليين وتدعم قرارات الاستثمار",
  },
];

export default function Vision2030Section() {
  return (
    <section id="vision" className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.08 0.02 240) 0%, oklch(0.10 0.04 145 / 0.25) 50%, oklch(0.08 0.02 240) 100%)",
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 reveal">
          <span className="tag-green mb-4">رؤية 2030</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4 mt-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            نتوافق مع
            <span className="neon-text"> رؤية المملكة 2030</span>
          </h2>
          <p
            className="text-white/50 text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            Ada2ai ليس مجرد منصة تقنية — هو مشروع وطني يدعم أهداف المملكة في تطوير القطاع الرياضي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="reveal card-dark rounded-xl p-6 flex items-start gap-4 group hover:neon-border transition-all duration-300"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="p-3 rounded-xl bg-[oklch(0.65_0.2_145/0.1)] text-[oklch(0.65_0.2_145)] flex-shrink-0 group-hover:bg-[oklch(0.65_0.2_145/0.2)] transition-colors">
                {pillar.icon}
              </div>
              <div>
                <h3
                  className="text-white font-bold text-lg mb-2"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {pillar.title}
                </h3>
                <p
                  className="text-white/55 text-sm leading-relaxed"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Vision badge */}
        <div className="text-center reveal">
          <div
            className="inline-flex items-center gap-4 rounded-2xl px-8 py-5"
            style={{
              background: "oklch(0.65 0.2 145 / 0.07)",
              border: "1px solid oklch(0.65 0.2 145 / 0.25)",
            }}
          >
            <div className="text-4xl">🇸🇦</div>
            <div className="text-right">
              <div
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                رؤية المملكة العربية السعودية 2030
              </div>
              <div
                className="neon-text text-sm font-medium mt-1"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                Ada2ai — شريك في تحقيق الأهداف الوطنية
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
