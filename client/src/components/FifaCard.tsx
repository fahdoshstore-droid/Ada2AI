/**
 * FifaCard — Ada2ai FIFA-UT style SportID card
 * Renders player data in the brand card design and supports download as PNG.
 */
import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface FifaCardPlayer {
  name: string;          // Arabic name
  nameEn?: string;
  jerseyNumber: number;
  position: string;      // Arabic position
  sport: string;         // Arabic sport name
  birthYear: number;
  sportId: string;       // e.g. SA-2009-MB-0010
  avatar?: string;       // URL or undefined → placeholder
  stats: {
    speed: number;       // السرعة
    passing: number;     // التمرير
    shooting: number;    // التسديد
    defense: number;     // الدفاع
    skill: number;       // المهارة
    strength: number;    // القوة
  };
  level?: "Bronze" | "Silver" | "Gold" | "Platinum";
}

const LEVEL_COLORS: Record<string, { border: string; glow: string; gradient: string; badge: string }> = {
  Gold: {
    border: "#FFD700",
    glow: "#FFD70077",
    gradient: "linear-gradient(155deg, #3D2800 0%, #7A5000 20%, #C89000 45%, #FFD700 65%, #FFE566 80%, #FFF0A0 100%)",
    badge: "rgba(184,134,11,0.9)",
  },
  Silver: {
    border: "#A0A0C0",
    glow: "#A0A0C055",
    gradient: "linear-gradient(155deg, #1A1A2A 0%, #2A2A3A 20%, #4A4A6A 45%, #8A8AAA 65%, #C0C0D8 80%, #E8E8F0 100%)",
    badge: "rgba(80,80,112,0.9)",
  },
  Bronze: {
    border: "#CD7F32",
    glow: "#CD7F3266",
    gradient: "linear-gradient(155deg, #2A1000 0%, #5A2800 20%, #8B4513 45%, #CD7F32 65%, #E8A060 80%, #F5C080 100%)",
    badge: "rgba(107,48,16,0.9)",
  },
  Platinum: {
    border: "#00DCC8",
    glow: "#00DCC855",
    gradient: "linear-gradient(155deg, #0A1628 0%, #0D2040 20%, #0A3060 40%, #005A8A 65%, #007ABA 80%, #00A89C 92%, #00DCC8 100%)",
    badge: "rgba(0,122,186,0.9)",
  },
};

const LEVEL_LABELS: Record<string, string> = {
  Gold: "⭐ GOLD — نخبة",
  Silver: "🥈 SILVER — متقدم",
  Bronze: "🥉 BRONZE — ناشئ",
  Platinum: "💎 PLATINUM — نجم",
};

interface FifaCardProps {
  player: FifaCardPlayer;
  /** If true, shows a shimmer loading overlay */
  loading?: boolean;
}

export default function FifaCard({ player, loading = false }: FifaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const level = player.level ?? "Gold";
  const colors = LEVEL_COLORS[level] ?? LEVEL_COLORS.Gold;

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import to keep bundle lean
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `sportid-${player.sportId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("تم تحميل البطاقة بنجاح!");
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل البطاقة، حاول مرة أخرى");
    } finally {
      setDownloading(false);
    }
  }

  const stats = [
    { num: player.stats.speed,    label: "السرعة" },
    { num: player.stats.passing,  label: "التمرير" },
    { num: player.stats.shooting, label: "التسديد" },
    { num: player.stats.defense,  label: "الدفاع" },
    { num: player.stats.skill,    label: "المهارة" },
    { num: player.stats.strength, label: "القوة" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ── Card ── */}
      <div
        ref={cardRef}
        dir="rtl"
        style={{
          width: 280,
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: colors.gradient,
          border: `4px solid ${colors.border}`,
          boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}55`,
          fontFamily: "'Tajawal', 'Cairo', 'NotoAr', sans-serif",
        }}
      >
        {/* Diagonal shine overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, borderRadius: 16,
          background: "repeating-linear-gradient(135deg, transparent 0, transparent 38px, rgba(255,255,255,0.04) 38px, rgba(255,255,255,0.04) 40px)",
        }} />

        {/* Loading shimmer */}
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 20, borderRadius: 16,
            background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Loader2 size={32} className="animate-spin" style={{ color: colors.border }} />
          </div>
        )}

        {/* Top bar: jersey number + logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 14px 0", position: "relative", zIndex: 2 }}>
          {/* Left: jersey + position */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: `0 0 20px ${colors.border}88, 3px 3px 0 rgba(0,0,0,0.6)` }}>
              {player.jerseyNumber}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(0,0,0,0.7)", marginTop: 1 }}>{player.position}</span>
          </div>
          {/* Right: Ada2ai + sport + year */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", textShadow: "2px 2px 6px rgba(0,0,0,0.8)", letterSpacing: 1, direction: "ltr" }}>Ada2ai</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.65)" }}>{player.sport}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)", direction: "ltr" }}>{player.birthYear}</span>
          </div>
        </div>

        {/* Level badge */}
        <div style={{ padding: "4px 14px 0", position: "relative", zIndex: 2 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
            background: colors.badge, color: colors.border, letterSpacing: 1,
            textTransform: "uppercase", direction: "ltr",
          }}>
            {LEVEL_LABELS[level]}
          </span>
        </div>

        {/* Player photo */}
        <div style={{
          position: "relative", overflow: "hidden", margin: "8px 10px 0",
          borderRadius: 8, height: 180,
          border: `1px solid ${colors.border}55`,
          boxShadow: `0 0 15px ${colors.glow}`,
        }}>
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={player.name}
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 48 }}>👤</span>
            </div>
          )}
          {/* Bottom fade */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }} />
        </div>

        {/* Name band */}
        <div style={{
          padding: "8px 12px 6px", textAlign: "center",
          background: "rgba(0,0,0,0.88)", borderTop: `2px solid ${colors.border}aa`,
          position: "relative", zIndex: 2,
        }}>
          <div style={{
            fontSize: 28, fontWeight: 900, color: "#fff",
            textShadow: `0 0 15px ${colors.glow}, 3px 3px 0 rgba(0,0,0,0.7)`,
            lineHeight: 1.1, letterSpacing: 1,
          }}>
            {player.name}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 2, margin: "0 16px", background: `linear-gradient(90deg, transparent, ${colors.border}, ${colors.border}cc, ${colors.border}, transparent)`, opacity: 0.8 }} />

        {/* Stats grid */}
        <div style={{ padding: "6px 8px 5px", background: "rgba(0,0,0,0.85)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center", padding: "5px 2px",
                borderLeft: (i % 3 !== 2) ? `1px solid ${colors.border}33` : "none",
                borderBottom: i < 3 ? `1px solid ${colors.border}22` : "none",
                paddingBottom: i < 3 ? 7 : 5,
                paddingTop: i >= 3 ? 7 : 5,
              }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: `0 0 12px ${colors.glow}, 2px 2px 6px rgba(0,0,0,0.9)` }}>
                  {s.num}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: colors.border, marginTop: 2 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SportID footer */}
        <div style={{
          padding: "6px 12px 8px", background: "rgba(0,0,0,0.92)",
          borderTop: `1px solid ${colors.border}aa`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {/* Mini QR pattern */}
          <div style={{
            width: 36, height: 36, border: `1.5px solid ${colors.border}`, borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: `0 0 6px ${colors.glow}`,
          }}>
            <div style={{
              width: 26, height: 26, background: "#fff", borderRadius: 2,
              display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, padding: 2,
            }}>
              {[1,0,1,0,1, 0,1,0,1,0, 1,0,0,0,1, 0,1,0,1,0, 1,0,1,0,1].map((v, i) => (
                <div key={i} style={{ background: v ? "#000" : "#fff", borderRadius: 0.5 }} />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: colors.border, letterSpacing: 1, direction: "ltr", textTransform: "uppercase" }}>SportID</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: 1.5, direction: "ltr", marginTop: 1 }}>{player.sportId}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>هوية رياضية رقمية موحّدة</div>
          </div>
        </div>
      </div>

      {/* ── Download button ── */}
      <button
        onClick={handleDownload}
        disabled={downloading || loading}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 24px", borderRadius: 12, border: `1.5px solid ${colors.border}66`,
          background: `${colors.badge}`, color: colors.border,
          fontFamily: "'Tajawal', sans-serif", fontSize: 14, fontWeight: 700,
          cursor: downloading ? "not-allowed" : "pointer",
          opacity: downloading ? 0.7 : 1,
          transition: "all 0.2s",
          boxShadow: `0 4px 16px ${colors.glow}`,
        }}
      >
        {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {downloading ? "جاري التحميل..." : "تحميل البطاقة PNG"}
      </button>
    </div>
  );
}
