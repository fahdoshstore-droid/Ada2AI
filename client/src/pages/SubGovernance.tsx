import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, FileText, Lock, BarChart2, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

const policies = [
  {
    icon: <FileText size={20} />,
    title: "Data Governance Framework",
    desc: "All athlete data is stored securely with end-to-end encryption. Data ownership remains with the athlete and their registered academy or federation.",
    status: "Active",
  },
  {
    icon: <Lock size={20} />,
    title: "AI Ethics Policy",
    desc: "Our AI analysis engine is audited regularly for bias. All scoring algorithms are documented and available for federation review upon request.",
    status: "Active",
  },
  {
    icon: <BarChart2 size={20} />,
    title: "Platform Compliance Standards",
    desc: "ada2ai operates in compliance with Saudi data protection regulations and aligns with national sports federation reporting requirements.",
    status: "Active",
  },
  {
    icon: <BookOpen size={20} />,
    title: "Partnership Accountability",
    desc: "All partnership agreements include data sharing protocols, usage limitations, and athlete consent requirements as standard clauses.",
    status: "Active",
  },
];

export default function SubGovernance() {
  const { isRTL, t, lang } = useLanguage();
  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
      <Ada2aiNavbar />
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-3xl mx-auto">
          <Link href="/governance">
            <div className="flex items-center gap-2 mb-8 cursor-pointer text-sm"
              style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              <ChevronLeft size={14} className={isRTL ? "rotate-180" : ""} /> {lang === "ar" ? "العودة إلى الحوكمة" : "Back to Governance"}
            </div>
          </Link>
          <div className="mb-12">
            <span className="badge-verified mb-4 inline-block">{t("gov.sub-gov")}</span>
            <h1 className="font-orbitron font-black text-3xl lg:text-4xl mb-4 text-[#EEEFEE]"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
              {lang === "ar" ? "سياسات" : "Operational"} <span style={{ color: "#00DCC8" }}>{lang === "ar" ? "تشغيلية" : "Policies"}</span>
            </h1>
            <p className="text-base"
              style={{ color: "rgba(238,239,238,0.65)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit", lineHeight: 1.8 }}>
              {lang === "ar"
                ? "يضمن إطار حوكمة ada2ai نشر الذكاء الاصطناعي بشكل مسؤول، وممارسات بيانات شفافة، وعمليات خاضعة للمساءلة عبر جميع وظائف المنصة."
                : "ada2ai's governance framework ensures responsible AI deployment, transparent data practices, and accountable operations across all platform functions."}
            </p>
          </div>
          <div className="flex flex-col gap-5">
            {policies.map((p, i) => (
              <div key={i} className="ada-card p-7 flex items-start gap-5">
                <div className="ada-icon-box flex-shrink-0 mt-0.5">{p.icon}</div>
                <div className="flex-1" style={{ textAlign: isRTL ? "right" : "left" }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-[#EEEFEE]"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}>{p.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(0,220,200,0.1)",
                        color: "#00DCC8",
                        border: "1px solid rgba(0,220,200,0.25)",
                        fontFamily: "'Orbitron', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.6rem",
                        letterSpacing: "0.08em",
                      }}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm"
                    style={{ color: "rgba(238,239,238,0.65)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.7 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
