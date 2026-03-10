import { AlertTriangle, Eye, MapPin, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: <Eye size={28} />,
    title: "اكتشاف عشوائي",
    stat: "85%",
    statLabel: "من المواهب لا تُكتشف أبداً",
    desc: "تعتمد على الحظ والواسطة — لا نظام موحد لاكتشاف اللاعبين الموهوبين",
    borderColor: "oklch(0.65 0.22 25)",
  },
  {
    icon: <AlertTriangle size={28} />,
    title: "تقييم شخصي",
    stat: "0",
    statLabel: "معايير موحدة",
    desc: "كل مدرب يقيّم بطريقته — لا بيانات موضوعية أو مقارنة دولية",
    borderColor: "oklch(0.85 0.18 85)",
  },
  {
    icon: <MapPin size={28} />,
    title: "تغطية محدودة",
    stat: "3",
    statLabel: "مدن فقط تحظى بالاهتمام",
    desc: "الكشافون يركزون على الرياض وجدة — المناطق الأخرى مهملة تماماً",
    borderColor: "oklch(0.65 0.2 145)",
  },
  {
    icon: <TrendingDown size={28} />,
    title: "استثمار ضائع",
    stat: "ملايين",
    statLabel: "تُصرف على أجانب",
    desc: "الأندية تستقطب لاعبين أجانب بينما المواهب المحلية مجهولة ومهدرة",
    borderColor: "oklch(0.65 0.22 25)",
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <span className="tag-red mb-4">المشكلة</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4 mt-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            كيف يُكتشف اللاعب الموهوب اليوم؟
          </h2>
          <p
            className="text-white/50 text-xl max-w-2xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            السعودية فيها{" "}
            <span className="neon-text font-bold">30+ مليون شاب</span>{" "}
            — كم موهبة ضائعة؟
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {problems.map((problem, i) => (
            <div
              key={i}
              className="reveal card-dark rounded-xl p-6 clip-card"
              style={{
                transitionDelay: `${i * 0.1}s`,
                borderRight: `3px solid ${problem.borderColor}`,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{
                    background: `${problem.borderColor.replace("oklch(", "oklch(").replace(")", " / 0.12)")}`,
                    color: problem.borderColor,
                  }}
                >
                  {problem.icon}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {problem.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span
                      className="text-3xl font-black"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: problem.borderColor,
                        direction: "ltr",
                      }}
                    >
                      {problem.stat}
                    </span>
                    <span
                      className="text-white/50 text-sm"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      {problem.statLabel}
                    </span>
                  </div>
                  <p
                    className="text-white/60 text-sm leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {problem.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom highlight */}
        <div className="mt-12 text-center reveal">
          <div className="inline-block card-dark neon-border rounded-xl px-8 py-4">
            <p
              className="text-white/80 text-lg"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              النتيجة:{" "}
              <span className="neon-text font-bold">
                الأندية السعودية تنفق ملايين على أجانب
              </span>{" "}
              بينما المواهب المحلية مجهولة
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
