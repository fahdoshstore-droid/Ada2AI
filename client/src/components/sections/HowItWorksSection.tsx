import { Upload, Cpu, BarChart3, Handshake } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Upload size={26} />,
    title: "ارفع فيديو",
    desc: "كليب 30 ثانية من الجوال يكفي — بدون تحميل تطبيق",
    detail: "PWA يعمل من المتصفح مباشرة",
  },
  {
    number: "02",
    icon: <Cpu size={26} />,
    title: "تحليل AI",
    desc: "يحلل Vision AI الحركة والمهارات تلقائياً",
    detail: "Anthropic Claude Vision",
  },
  {
    number: "03",
    icon: <BarChart3 size={26} />,
    title: "تقرير الأداء",
    desc: "Radar chart + مقارنة عمرية + توصيات تدريبية",
    detail: "معايير FIFA الدولية",
  },
  {
    number: "04",
    icon: <Handshake size={26} />,
    title: "تواصل مع نادي",
    desc: "الكشافون يشوفون ملفك ويتواصلون مباشرة",
    detail: "WhatsApp + Telegram",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 reveal">
          <span className="tag-green mb-4">كيف يعمل</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4 mt-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            أربع خطوات فقط
          </h2>
          <p
            className="text-white/50 text-lg max-w-xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            من الفيديو إلى التعاقد مع النادي — كل شيء رقمي وسريع
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-[4.5rem] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.2_145/0.3)] to-transparent z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <div
                key={i}
                className="reveal card-dark rounded-xl p-6 text-center group hover:neon-border transition-all duration-300 relative z-10"
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                {/* Step number background */}
                <div
                  className="text-5xl font-black mb-3 opacity-8 group-hover:opacity-15 transition-opacity select-none"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "oklch(0.65 0.2 145)",
                    direction: "ltr",
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-[oklch(0.65_0.2_145/0.1)] border border-[oklch(0.65_0.2_145/0.2)] flex items-center justify-center mx-auto mb-4 text-[oklch(0.65_0.2_145)] group-hover:bg-[oklch(0.65_0.2_145/0.2)] transition-colors">
                  {step.icon}
                </div>

                <h3
                  className="text-white font-bold text-lg mb-2"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-white/55 text-sm mb-3 leading-relaxed"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {step.desc}
                </p>
                <span
                  className="text-[oklch(0.65_0.2_145)] text-xs font-medium"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
                >
                  {step.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PWA note */}
        <div className="mt-12 text-center reveal">
          <div className="inline-flex items-center gap-3 card-dark neon-border rounded-full px-6 py-3">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_145)] animate-pulse" />
            <span
              className="text-white/65 text-sm"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              يعمل من المتصفح مباشرة — بدون تحميل تطبيق (PWA)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
