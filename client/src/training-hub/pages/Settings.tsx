import { User, Bell, Shield, Globe, ChevronRight, ChevronLeft } from "lucide-react";

interface SettingsProps {
  lang?: "ar" | "en";
}

export default function Settings({ lang = "ar" }: SettingsProps) {
  const isRTL = lang === "ar";
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const sections = [
    {
      titleAr: "الملف الشخصي",
      titleEn: "Profile",
      icon: <User size={18} />,
      color: "#00DCC8",
      itemsAr: ["تعديل المعلومات الشخصية", "تغيير الصورة الشخصية", "تحديث بيانات التواصل"],
      itemsEn: ["Edit personal information", "Change profile picture", "Update contact details"],
    },
    {
      titleAr: "الإشعارات",
      titleEn: "Notifications",
      icon: <Bell size={18} />,
      color: "#007ABA",
      itemsAr: ["إشعارات التدريب", "تنبيهات المباريات", "تقارير الأداء الأسبوعية"],
      itemsEn: ["Training notifications", "Match alerts", "Weekly performance reports"],
    },
    {
      titleAr: "الأمان",
      titleEn: "Security",
      icon: <Shield size={18} />,
      color: "#F59E0B",
      itemsAr: ["تغيير كلمة المرور", "المصادقة الثنائية", "سجل الدخول"],
      itemsEn: ["Change password", "Two-factor authentication", "Login history"],
    },
    {
      titleAr: "اللغة والمنطقة",
      titleEn: "Language & Region",
      icon: <Globe size={18} />,
      color: "#22c55e",
      itemsAr: ["اللغة: العربية", "المنطقة الزمنية: الرياض (UTC+3)", "تنسيق التاريخ"],
      itemsEn: ["Language: English", "Timezone: Riyadh (UTC+3)", "Date format"],
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1"
          style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "الإعدادات" : "Settings"}
        </h1>
        <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "إدارة حسابك وتفضيلاتك" : "Manage your account and preferences"}
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, rgba(0,122,186,0.12), rgba(0,220,200,0.06))", border: "1px solid rgba(0,220,200,0.2)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
          MC
        </div>
        <div>
          <div className="font-bold text-white text-base mb-0.5"
            style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "المدرب محمد" : "Coach Mohammed"}
          </div>
          <div className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "مدرب رئيسي · الفريق الأول" : "Head Coach · First Team"}
          </div>
          <div className="text-xs mt-1" style={{ color: "#00DCC8", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            coach@ada2ai.com
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {sections.map((s, i) => (
          <div key={i} className="rounded-2xl overflow-hidden"
            style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
              <span className="font-bold text-white text-sm"
                style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {isRTL ? s.titleAr : s.titleEn}
              </span>
            </div>
            <div>
              {(isRTL ? s.itemsAr : s.itemsEn).map((item, j) => (
                <button
                  key={j}
                  className="w-full flex items-center justify-between px-5 py-3 text-sm transition-all"
                  style={{
                    color: "rgba(238,239,238,0.65)",
                    borderBottom: j < s.itemsAr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
                    textAlign: isRTL ? "right" : "left",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span>{item}</span>
                  <ArrowIcon size={14} style={{ color: "rgba(238,239,238,0.25)", flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
