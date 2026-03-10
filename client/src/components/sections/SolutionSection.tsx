import { Brain, FileText, Users } from "lucide-react";

const features = [
  {
    icon: <Brain size={30} />,
    title: "تحليل AI للفيديو",
    subtitle: "Anthropic Vision AI",
    desc: "يحلل فيديو اللاعب ويقيّم السرعة، المهارات الفنية، والوعي التكتيكي تلقائياً في دقائق",
    badge: "Claude AI",
  },
  {
    icon: <FileText size={30} />,
    title: "تقرير أداء احترافي",
    subtitle: "Sport DNA Report",
    desc: "Radar chart + مقارنة FIFA العمرية + تتبع التطور + تحديد المركز الأنسب + توصيات تدريبية",
    badge: "PDF + واتساب",
  },
  {
    icon: <Users size={30} />,
    title: "ربط مباشر بالأندية",
    subtitle: "Scout Dashboard",
    desc: "الكشافون يتصفحون المواهب بفلاتر ذكية ويتواصلون مع اللاعبين مباشرة — بدون وسيط",
    badge: "Real-time",
  },
];

export default function SolutionSection() {
  return (
    <section id="solution" className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.08 0.02 240) 0%, oklch(0.10 0.03 145 / 0.2) 50%, oklch(0.08 0.02 240) 100%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <div className="order-2 lg:order-1 relative reveal-left">
            <div className="relative rounded-2xl overflow-hidden neon-border">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/scout-ai-analysis-visual-FiZQDU28nLPdy7g5TCZEZz.webp"
                alt="AI Analysis Visual"
                className="w-full h-auto object-cover"
                style={{ minHeight: "300px" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.02_240/0.7)] to-transparent" />

              {/* Floating accuracy badge */}
              <div className="absolute bottom-4 right-4 card-dark neon-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_145)] animate-pulse" />
                  <span
                    className="neon-text font-bold text-sm"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    96.2% Accuracy
                  </span>
                </div>
                <div
                  className="text-white/40 text-xs mt-1"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  مقارنة بالكشافين المحترفين
                </div>
              </div>
            </div>

            {/* Floating radar */}
            <div className="absolute -bottom-6 -left-6 w-28 h-28 opacity-50 animate-float hidden md:block">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/scout-ai-radar-chart-CdYondGKoCAXiLRnM3Pf9H.webp"
                alt="Radar Chart"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Content side */}
          <div className="order-1 lg:order-2 reveal-right">
            <span className="tag-green mb-4">الحل</span>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-4 mt-4 leading-tight"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              منصة ذكاء اصطناعي
              <br />
              <span className="neon-text">لاكتشاف المواهب</span>
            </h2>
            <p
              className="text-white/55 text-lg mb-8 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              Scout AI تجمع بين قوة الذكاء الاصطناعي ومعايير FIFA الدولية لتحليل اللاعبين وربطهم بالأندية مباشرة
            </p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="card-dark rounded-xl p-5 flex items-start gap-4 group hover:neon-border transition-all duration-300"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="p-3 rounded-xl bg-[oklch(0.65_0.2_145/0.1)] text-[oklch(0.65_0.2_145)] flex-shrink-0 group-hover:bg-[oklch(0.65_0.2_145/0.2)] transition-colors">
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3
                        className="text-white font-bold text-lg"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {f.title}
                      </h3>
                      <span className="tag-green text-xs">{f.badge}</span>
                    </div>
                    <p
                      className="text-[oklch(0.65_0.2_145)] text-xs mb-2 font-medium"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
                    >
                      {f.subtitle}
                    </p>
                    <p
                      className="text-white/55 text-sm leading-relaxed"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
