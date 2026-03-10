import { Check } from "lucide-react";

const plans = [
  {
    name: "تقارير Premium",
    price: "99",
    unit: "ر.س / تقرير",
    share: "20%",
    desc: "للاعبين وأولياء الأمور",
    features: [
      "تحليل AI متقدم للفيديو",
      "Radar chart مقارنة FIFA",
      "توصيات تدريبية مخصصة",
      "إرسال عبر واتساب",
      "تتبع التطور",
    ],
    highlight: false,
  },
  {
    name: "اشتراك الأكاديميات",
    price: "2,000",
    unit: "ر.س / شهر",
    share: "25%",
    desc: "للأكاديميات الرياضية",
    features: [
      "عرض البرامج والكورسات",
      "استقبال طلبات التسجيل",
      "لوحة تحكم للمدربين",
      "تقارير أداء اللاعبين",
      "تكامل واتساب",
    ],
    highlight: false,
  },
  {
    name: "اشتراك الأندية",
    price: "5,000",
    unit: "ر.س / شهر",
    share: "40%",
    desc: "للأندية الاحترافية",
    features: [
      "وصول كامل لقاعدة المواهب",
      "فلاتر بحث متقدمة",
      "تواصل مباشر مع اللاعبين",
      "تقارير مقارنة تفصيلية",
      "API Integration",
    ],
    highlight: true,
  },
  {
    name: "عمولة التعاقد",
    price: "2-5%",
    unit: "من قيمة الصفقة",
    share: "15%",
    desc: "عند إتمام الانتقال",
    features: [
      "نسبة من صفقات الانتقال",
      "عبر المنصة فقط",
      "شفافية كاملة",
      "توثيق رقمي",
      "دعم قانوني",
    ],
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 reveal">
          <span className="tag-green mb-4">نموذج الأعمال</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4 mt-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            أسعار مرنة لكل
            <span className="neon-text"> مستوى</span>
          </h2>
          <p
            className="text-white/50 text-base"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            نقطة التعادل: الشهر 8 | الإيراد المتوقع السنة الأولى:{" "}
            <span className="neon-text font-bold">ر.س 2.4M</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`reveal rounded-xl p-6 flex flex-col transition-all duration-300 ${
                plan.highlight ? "animate-pulse-green" : "card-dark hover:neon-border"
              }`}
              style={{
                transitionDelay: `${i * 0.1}s`,
                ...(plan.highlight
                  ? {
                      background: "oklch(0.65 0.2 145 / 0.07)",
                      border: "1px solid oklch(0.65 0.2 145 / 0.5)",
                    }
                  : {}),
              }}
            >
              {plan.highlight && (
                <div className="tag-green text-center mb-4 text-xs">الأكثر طلباً</div>
              )}

              <div className="mb-4">
                <h3
                  className="text-white font-bold text-lg mb-1"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {plan.name}
                </h3>
                <p
                  className="text-white/40 text-xs"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {plan.desc}
                </p>
              </div>

              <div className="mb-4">
                <span
                  className="text-3xl font-black neon-text"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
                >
                  {plan.price}
                </span>
                <div
                  className="text-white/45 text-xs mt-1"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {plan.unit}
                </div>
              </div>

              {/* Revenue share */}
              <div
                className="rounded-lg px-3 py-2 mb-5 text-center"
                style={{
                  background: "oklch(0.85 0.18 85 / 0.08)",
                  border: "1px solid oklch(0.85 0.18 85 / 0.18)",
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: "oklch(0.85 0.18 85)", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {plan.share}
                </span>
                <span
                  className="text-white/40 text-xs mr-1"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {" "}من الإيرادات
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Check size={13} className="text-[oklch(0.65_0.2_145)] flex-shrink-0" />
                    <span
                      className="text-white/60 text-sm"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className={`mt-6 w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  plan.highlight ? "btn-primary" : "btn-outline-green"
                }`}
                style={{ fontFamily: "'Tajawal', sans-serif" }}
                onClick={() =>
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                ابدأ الآن
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
