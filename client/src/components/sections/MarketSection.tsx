import { useEffect, useRef, useState } from "react";

const marketData = [
  {
    label: "TAM",
    title: "السوق الكلي",
    value: "$940M",
    desc: "سوق تقنيات الرياضة في الشرق الأوسط",
    widthPct: 100,
  },
  {
    label: "SAM",
    title: "السوق المتاح",
    value: "$120M",
    desc: "منصات اكتشاف المواهب في السعودية والخليج",
    widthPct: 68,
  },
  {
    label: "SOM",
    title: "السوق المستهدف",
    value: "$15M",
    desc: "أكاديميات وأندية السعودية — السنة الأولى",
    widthPct: 38,
  },
];

const keyStats = [
  { value: "30M+", label: "شاب سعودي" },
  { value: "200+", label: "نادي وأكاديمية" },
  { value: "0", label: "منافس محلي مباشر" },
  { value: "2030", label: "رؤية المملكة" },
];

export default function MarketSection() {
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setAnimated(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="market" ref={sectionRef} className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.08 0.02 240) 0%, oklch(0.09 0.025 200 / 0.4) 50%, oklch(0.08 0.02 240) 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-8">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/scout-ai-map-bg-2A27mtRRKGdYZbayMnChsA.webp"
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.07 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 reveal">
          <span className="tag-green mb-4">حجم السوق</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4 mt-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            فرصة ضخمة في سوق
            <span className="neon-text"> غير مستغل</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Market funnel */}
          <div className="space-y-4 reveal-left">
            {marketData.map((m, i) => (
              <div key={i} className="relative">
                <div
                  className="rounded-xl p-5 transition-all duration-1000"
                  style={{
                    background: `oklch(0.65 0.2 145 / ${0.06 + i * 0.06})`,
                    border: `1px solid oklch(0.65 0.2 145 / ${0.2 + i * 0.15})`,
                    width: animated ? `${m.widthPct}%` : "20%",
                    minWidth: "200px",
                    transitionDelay: `${i * 0.2}s`,
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: "oklch(0.65 0.2 145 / 0.2)",
                            color: "oklch(0.65 0.2 145)",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {m.label}
                        </span>
                        <span
                          className="text-white/70 text-sm"
                          style={{ fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {m.title}
                        </span>
                      </div>
                      <p
                        className="text-white/45 text-xs"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {m.desc}
                      </p>
                    </div>
                    <span
                      className="text-xl font-black text-white flex-shrink-0"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
                    >
                      {m.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-4 reveal-right">
            {keyStats.map((stat, i) => (
              <div
                key={i}
                className="card-dark neon-border rounded-xl p-6 text-center"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div
                  className="stat-number text-3xl md:text-4xl mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-white/50 text-sm"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
