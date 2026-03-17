import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function TeamMembers() {
  const { isRTL, t, lang } = useLanguage();
  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
      <Ada2aiNavbar />
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/governance">
            <div className="flex items-center justify-center gap-2 mb-8 cursor-pointer text-sm"
              style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              <ChevronLeft size={14} className={isRTL ? "rotate-180" : ""} />
              {lang === "ar" ? "العودة إلى الحوكمة" : "Back to Governance"}
            </div>
          </Link>
          <div className="mb-12">
            <span className="badge-pro mb-4 inline-block">{t("gov.team")}</span>
            <h1 className="font-orbitron font-black text-3xl lg:text-4xl mb-4 text-[#EEEFEE]"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
              {lang === "ar" ? "الفريق وراء" : "The People Behind"} <span style={{ color: "#00DCC8" }}>ada2ai</span>
            </h1>
            <p className="text-base max-w-xl mx-auto"
              style={{ color: "rgba(238,239,238,0.65)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit", lineHeight: 1.8 }}>
              {lang === "ar"
                ? "يجمع فريقنا خبرة عميقة في الذكاء الاصطناعي وعلوم الرياضة وتصميم المنتجات والمنظومة الرياضية السعودية لبناء منصة اكتشاف المواهب الرائدة في المملكة."
                : "Our team combines deep expertise in AI, sports science, product design, and the Saudi sports ecosystem to build the Kingdom's leading talent discovery platform."}
            </p>
          </div>

          {/* Placeholder grid — to be filled with actual team members */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ada-card p-6 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(0,220,200,0.08)",
                    border: "2px dashed rgba(0,220,200,0.2)",
                  }}>
                  <Users size={24} style={{ color: "rgba(0,220,200,0.4)" }} />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#EEEFEE] mb-1"
                    style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
                    {lang === "ar" ? "عضو الفريق" : "Team Member"}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {lang === "ar" ? "الدور — قريباً" : "Role — Coming Soon"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs" style={{ color: "rgba(238,239,238,0.3)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar"
              ? "سيتم نشر ملفات الفريق خلال مرحلة الإطلاق الرسمي للمنصة."
              : "Team profiles will be published during the official platform launch phase."}
          </p>
        </div>
      </div>
    </div>
  );
}
