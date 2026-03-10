const techStack = [
  {
    name: "Anthropic Vision AI",
    desc: "تحليل الفيديو والصور بالذكاء الاصطناعي",
    category: "AI Core",
    color: "oklch(0.65 0.2 145)",
  },
  {
    name: "FIFA Age Benchmarks",
    desc: "معايير دولية حقيقية لكل فئة عمرية",
    category: "Data",
    color: "oklch(0.85 0.18 85)",
  },
  {
    name: "React PWA",
    desc: "تطبيق ويب يعمل على أي جوال بدون تحميل",
    category: "Frontend",
    color: "oklch(0.65 0.2 200)",
  },
  {
    name: "Real-time WebSocket",
    desc: "تحديثات لحظية وإشعارات فورية",
    category: "Backend",
    color: "oklch(0.65 0.2 145)",
  },
  {
    name: "Node.js Backend",
    desc: "خادم سريع وقابل للتوسع",
    category: "Infrastructure",
    color: "oklch(0.7 0.15 120)",
  },
  {
    name: "WhatsApp / Telegram Bot",
    desc: "تنبيهات وتواصل عبر المنصات الشائعة",
    category: "Integration",
    color: "oklch(0.65 0.2 145)",
  },
];

const architectureLayers = [
  { label: "المستخدم", items: ["لاعب", "ولي أمر", "كشاف", "أكاديمية"] },
  { label: "الواجهة", items: ["React PWA", "Arabic RTL", "Mobile-first"] },
  { label: "الذكاء الاصطناعي", items: ["Claude Vision", "FIFA Benchmarks", "Radar Analysis"] },
  { label: "البيانات", items: ["Supabase DB", "Video Storage", "Real-time"] },
];

export default function TechSection() {
  return (
    <section id="tech" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 reveal">
          <span className="tag-green mb-4">التقنية</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4 mt-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            مبني على أحدث
            <span className="neon-text"> تقنيات الذكاء الاصطناعي</span>
          </h2>
          <div className="inline-flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_145)] animate-pulse" />
            <span
              className="neon-text font-bold text-lg"
              style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
            >
              96.2% Accuracy
            </span>
            <span
              className="text-white/50 text-sm"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              مقارنة بتقييم الكشافين المحترفين
            </span>
          </div>
        </div>

        {/* Tech cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16 max-w-5xl mx-auto">
          {techStack.map((tech, i) => (
            <div
              key={i}
              className="reveal card-dark rounded-xl p-5 group hover:neon-border transition-all duration-300"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-xs px-2 py-1 rounded font-semibold"
                  style={{
                    background: `${tech.color.replace("oklch(", "oklch(").replace(")", " / 0.12)")}`,
                    color: tech.color,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {tech.category}
                </span>
                <div
                  className="w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity mt-1"
                  style={{ background: tech.color }}
                />
              </div>
              <h3
                className="text-white font-bold text-base mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
              >
                {tech.name}
              </h3>
              <p
                className="text-white/50 text-sm"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {tech.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Architecture diagram */}
        <div className="max-w-4xl mx-auto reveal">
          <h3
            className="text-center text-white/60 text-base mb-6"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            هيكل المنصة المعماري
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {architectureLayers.map((layer, i) => (
              <div key={i} className="card-dark rounded-xl p-4 neon-border">
                <div
                  className="text-[oklch(0.65_0.2_145)] text-xs font-bold mb-3 text-center"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {layer.label}
                </div>
                <div className="space-y-2">
                  {layer.items.map((item, j) => (
                    <div
                      key={j}
                      className="bg-[oklch(0.65_0.2_145/0.07)] rounded px-2 py-1.5 text-center text-white/65 text-xs"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
