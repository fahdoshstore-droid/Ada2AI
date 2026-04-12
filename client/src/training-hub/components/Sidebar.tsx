import { Brain, LayoutDashboard, Users, Dumbbell, TrendingUp, Trophy, Settings, Sword, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

type Page = "dashboard" | "ai-chat" | "coach" | "players" | "training" | "progress" | "matches" | "settings" | "player-analysis";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: string) => void;
  lang?: "ar" | "en";
}

const navItems = [
  { id: "dashboard", labelAr: "لوحة التحكم", labelEn: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "ai-chat", labelAr: "مساعد AI", labelEn: "AI Assistant", icon: <Brain size={20} /> },
  { id: "coach", labelAr: "لوحة المدرب", labelEn: "Coach Board", icon: <Sword size={20} /> },
  { id: "players", labelAr: "اللاعبون", labelEn: "Players", icon: <Users size={20} /> },
  { id: "player-analysis", labelAr: "تحليل الأداء", labelEn: "Player Analysis", icon: <BarChart3 size={20} /> },
  { id: "training", labelAr: "التدريبات", labelEn: "Training", icon: <Dumbbell size={20} /> },
  { id: "progress", labelAr: "التقدم", labelEn: "Progress", icon: <TrendingUp size={20} /> },
  { id: "matches", labelAr: "المباريات", labelEn: "Matches", icon: <Trophy size={20} /> },
  { id: "settings", labelAr: "الإعدادات", labelEn: "Settings", icon: <Settings size={20} /> },
];

export default function Sidebar({ activePage, onNavigate, lang = "ar" }: SidebarProps) {
  const isRTL = lang === "ar";
  const BackIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0"
      style={{
        width: "220px",
        background: "#0D1220",
        borderLeft: isRTL ? "1px solid rgba(0,220,200,0.10)" : "none",
        borderRight: isRTL ? "none" : "1px solid rgba(0,220,200,0.10)",
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(0,220,200,0.08)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)" }}
        >
          <Brain size={18} color="#fff" />
        </div>
        <div>
          <div className="font-black text-sm text-white" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.05em" }}>
            ada2ai
          </div>
          <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "مركز التدريب" : "Training Hub"}
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-150"
              style={{
                background: isActive ? "rgba(0,220,200,0.10)" : "transparent",
                color: isActive ? "#00DCC8" : "rgba(238,239,238,0.55)",
                borderRight: isRTL ? (isActive ? "3px solid #00DCC8" : "3px solid transparent") : "none",
                borderLeft: !isRTL ? (isActive ? "3px solid #00DCC8" : "3px solid transparent") : "none",
                textAlign: isRTL ? "right" : "left",
                fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
                fontSize: "0.875rem",
                fontWeight: isActive ? 700 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(238,239,238,0.85)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(238,239,238,0.55)";
                }
              }}
            >
              <span style={{ color: isActive ? "#00DCC8" : "rgba(238,239,238,0.4)" }}>{item.icon}</span>
              <span>{lang === "ar" ? item.labelAr : item.labelEn}</span>
            </button>
          );
        })}
      </nav>

      {/* Back to ada2ai */}
      <div style={{ borderTop: "1px solid rgba(0,220,200,0.08)", padding: "12px 20px" }}>
        <a
          href="/"
          className="flex items-center gap-2 text-xs transition-all"
          style={{ color: "rgba(238,239,238,0.35)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#00DCC8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(238,239,238,0.35)"; }}
        >
          <BackIcon size={14} />
          {lang === "ar" ? "العودة إلى ada2ai" : "Back to ada2ai"}
        </a>
      </div>
    </aside>
  );
}
