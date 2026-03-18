import { Check, X } from "lucide-react";

const comparisons = [
  { feature: "التغطية الجغرافية", scoutAI: "كل مدن المملكة", traditional: "المدن الكبرى فقط" },
  { feature: "سرعة التقييم", scoutAI: "دقائق", traditional: "أسابيع — أشهر" },
  { feature: "التكلفة لكل لاعب", scoutAI: "< ر.س 100", traditional: "ر.س 5,000+" },
  { feature: "معايير التقييم", scoutAI: "موحدة — FIFA", traditional: "شخصية — تختلف" },
  { feature: "تتبع التطور", scoutAI: "تلقائي مستمر", traditional: "غير موجود" },
  { feature: "الوصول للأندية", scoutAI: "مباشر — أونلاين", traditional: "يحتاج واسطة" },
];

export default function CompetitiveSection() {
  return (
    <section id="competitive" className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.08 0.02 240) 0%, oklch(0.09 0.02 200 / 0.3) 50%, oklch(0.08 0.02 240) 100%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 reveal">
          <span className="tag-yellow mb-4">الميزة التنافسية</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4 mt-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            Ada2ai مقابل
            <span style={{ color: "oklch(0.65 0.22 25)" }}> الطريقة التقليدية</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto reveal">
          {/* Table header */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div
              className="text-white/35 text-sm text-center py-2"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              المعيار
            </div>
            <div
              className="rounded-xl py-3 text-center font-bold text-sm"
              style={{
                background: "oklch(0.65 0.2 145 / 0.12)",
                border: "1px solid oklch(0.65 0.2 145 / 0.4)",
                color: "oklch(0.65 0.2 145)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Ada2ai
            </div>
            <div
              className="rounded-xl py-3 text-center font-bold text-sm"
              style={{
                background: "oklch(0.65 0.22 25 / 0.08)",
                border: "1px solid oklch(0.65 0.22 25 / 0.25)",
                color: "oklch(0.65 0.22 25)",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              الطريقة التقليدية
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {comparisons.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 items-center">
                <div
                  className="card-dark rounded-lg px-4 py-3 text-white/65 text-sm text-center"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {row.feature}
                </div>
                <div
                  className="rounded-lg px-3 py-3 text-center text-sm font-medium flex items-center justify-center gap-1.5"
                  style={{
                    background: "oklch(0.65 0.2 145 / 0.07)",
                    border: "1px solid oklch(0.65 0.2 145 / 0.18)",
                    color: "oklch(0.65 0.2 145)",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  <Check size={13} className="flex-shrink-0" />
                  <span className="text-xs">{row.scoutAI}</span>
                </div>
                <div
                  className="rounded-lg px-3 py-3 text-center text-sm flex items-center justify-center gap-1.5"
                  style={{
                    background: "oklch(0.65 0.22 25 / 0.05)",
                    border: "1px solid oklch(0.65 0.22 25 / 0.12)",
                    color: "oklch(0.65 0.22 25)",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  <X size={13} className="flex-shrink-0" />
                  <span className="text-xs">{row.traditional}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div
            className="mt-8 rounded-xl p-5 text-center reveal"
            style={{
              background: "oklch(0.65 0.2 145 / 0.07)",
              border: "1px solid oklch(0.65 0.2 145 / 0.25)",
            }}
          >
            <p
              className="text-white/80 text-lg"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              Ada2ai أسرع بـ{" "}
              <span className="neon-text font-bold">100x</span>
              {" "}وأرخص بـ{" "}
              <span className="neon-text font-bold">50x</span>
              {" "}من الطرق التقليدية
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
