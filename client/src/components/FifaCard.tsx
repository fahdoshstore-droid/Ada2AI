/**
 * FifaCard — Ada2ai SportID Card
 * Matches the gold hexagonal Ada2ai card design from the reference image.
 * Features: player photo, 6 stats grid, SportID code, real QR code, download as PNG.
 */
import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

export interface FifaCardPlayer {
  name: string;
  nameEn?: string;
  jerseyNumber: number;
  position: string;
  sport: string;
  birthYear: number;
  sportId: string;
  avatar?: string;
  stats: {
    speed: number;
    passing: number;
    shooting: number;
    defense: number;
    skill: number;
    strength: number;
  };
  level?: "Bronze" | "Silver" | "Gold" | "Platinum";
}

// ── Level color palettes ──────────────────────────────────────────────────────
const LEVELS: Record<string, {
  bg: string; border: string; glow: string;
  accent: string; statBg: string; badge: string;
  badgeText: string; label: string;
}> = {
  Gold: {
    bg: "linear-gradient(160deg, #1A0E00 0%, #3D2200 18%, #7A4800 35%, #C8860A 55%, #FFD700 72%, #FFE566 85%, #FFF5B0 100%)",
    border: "#FFD700",
    glow: "0 0 40px rgba(255,215,0,0.55), 0 0 80px rgba(255,215,0,0.2)",
    accent: "#FFD700",
    statBg: "rgba(0,0,0,0.5)",
    badge: "#B8860B",
    badgeText: "#FFD700",
    label: "GOLD",
  },
  Silver: {
    bg: "linear-gradient(160deg, #0D0D1A 0%, #1A1A2E 18%, #2E2E50 35%, #6060A0 55%, #A0A0C8 72%, #D0D0E8 85%, #F0F0F8 100%)",
    border: "#A0A0C8",
    glow: "0 0 40px rgba(160,160,200,0.4), 0 0 80px rgba(160,160,200,0.15)",
    accent: "#C0C0D8",
    statBg: "rgba(0,0,0,0.5)",
    badge: "#505080",
    badgeText: "#C0C0D8",
    label: "SILVER",
  },
  Bronze: {
    bg: "linear-gradient(160deg, #150800 0%, #2A1200 18%, #5A2800 35%, #8B4513 55%, #CD7F32 72%, #E8A060 85%, #F5C888 100%)",
    border: "#CD7F32",
    glow: "0 0 40px rgba(205,127,50,0.45), 0 0 80px rgba(205,127,50,0.15)",
    accent: "#CD7F32",
    statBg: "rgba(0,0,0,0.5)",
    badge: "#7A3A10",
    badgeText: "#E8A060",
    label: "BRONZE",
  },
  Platinum: {
    bg: "linear-gradient(160deg, #000A14 0%, #001828 18%, #002A50 35%, #004A80 55%, #007ABA 72%, #00A89C 85%, #00DCC8 100%)",
    border: "#00DCC8",
    glow: "0 0 40px rgba(0,220,200,0.5), 0 0 80px rgba(0,220,200,0.2)",
    accent: "#00DCC8",
    statBg: "rgba(0,0,0,0.5)",
    badge: "#005A8A",
    badgeText: "#00DCC8",
    label: "PLATINUM",
  },
};

const STAT_LABELS: Record<keyof FifaCardPlayer["stats"], string> = {
  speed: "السرعة",
  passing: "التمرير",
  shooting: "التسديد",
  defense: "الدفاع",
  skill: "المهارة",
  strength: "القوة",
};

interface FifaCardProps {
  player: FifaCardPlayer;
  loading?: boolean;
}

export default function FifaCard({ player, loading = false }: FifaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const level = player.level ?? "Gold";
  const c = LEVELS[level] ?? LEVELS.Gold;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, useCORS: true, allowTaint: true,
        backgroundColor: null, logging: false,
      });
      const link = document.createElement("a");
      link.download = `SportID-${player.sportId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("تم تحميل البطاقة بنجاح!");
    } catch (err) {
      console.error(err);
      toast.error("فشل التحميل، حاول مرة أخرى");
    } finally {
      setDownloading(false);
    }
  };

  const statEntries = Object.entries(player.stats) as [keyof typeof player.stats, number][];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* ── Card ── */}
      <div
        ref={cardRef}
        style={{
          width: 300,
          background: c.bg,
          borderRadius: 20,
          border: `3px solid ${c.border}`,
          boxShadow: c.glow,
          overflow: "hidden",
          position: "relative",
          fontFamily: "'Cairo', 'NotoSansArabic', sans-serif",
          direction: "rtl",
        }}
      >
        {/* Sparkle overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          background: "radial-gradient(ellipse at 35% 15%, rgba(255,255,255,0.14) 0%, transparent 55%)",
        }} />

        {/* Loading shimmer */}
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 20,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Loader2 size={32} className="animate-spin" style={{ color: c.border }} />
          </div>
        )}

        {/* ── Top bar: rating (left) + Ada2ai logo (right) ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "12px 14px 0", position: "relative", zIndex: 2,
        }}>
          {/* Rating + position (right side in RTL = left visually) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
            <span style={{
              fontSize: 56, fontWeight: 900, color: "#fff", lineHeight: 1,
              textShadow: `0 0 20px ${c.accent}99, 2px 2px 0 rgba(0,0,0,0.7)`,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {player.jerseyNumber}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.accent, marginTop: 2 }}>
              {player.position}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1, direction: "ltr", fontFamily: "'Space Grotesk', sans-serif" }}>
              {player.sport === "كرة القدم" ? "⚽" : "🏅"} SA
            </span>
          </div>

          {/* Ada2ai logo + level badge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
            <span style={{
              fontSize: 15, fontWeight: 900, color: "#fff",
              textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
              letterSpacing: 0.5, direction: "ltr",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Ada<span style={{ color: c.accent }}>2</span>ai
            </span>
            <span style={{
              fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20,
              background: c.badge, color: c.badgeText,
              letterSpacing: 1, direction: "ltr",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {c.label}
            </span>
          </div>
        </div>

        {/* ── Player photo ── */}
        <div style={{
          position: "relative", overflow: "hidden",
          margin: "6px 10px 0",
          borderRadius: 10, height: 200,
          border: `1px solid ${c.border}44`,
          boxShadow: `0 0 20px ${c.accent}33`,
        }}>
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={player.name}
              crossOrigin="anonymous"
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center 10%",
                display: "block",
              }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: "rgba(0,0,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 56, color: "rgba(255,255,255,0.2)",
            }}>
              👤
            </div>
          )}
          {/* Bottom gradient fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 70,
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
          }} />
        </div>

        {/* ── Player name ── */}
        <div style={{
          background: "rgba(0,0,0,0.7)",
          padding: "8px 14px 6px",
          textAlign: "center",
          borderTop: `2px solid ${c.border}88`,
        }}>
          <div style={{
            fontSize: 22, fontWeight: 900, color: "#FFFFFF",
            letterSpacing: 0.5,
            fontFamily: "'Cairo', sans-serif",
            textShadow: `0 0 14px ${c.accent}66, 2px 2px 0 rgba(0,0,0,0.8)`,
          }}>
            {player.name}
          </div>
        </div>

        {/* ── Stats grid 3×2 ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          background: "rgba(0,0,0,0.8)",
          borderTop: `1px solid ${c.border}33`,
        }}>
          {statEntries.map(([key, value], i) => (
            <div key={key} style={{
              background: c.statBg,
              padding: "7px 4px",
              textAlign: "center",
              borderLeft: i % 3 !== 2 ? `1px solid ${c.border}22` : "none",
              borderBottom: i < 3 ? `1px solid ${c.border}22` : "none",
            }}>
              <div style={{
                fontSize: 24, fontWeight: 900, color: "#FFFFFF", lineHeight: 1,
                fontFamily: "'Space Grotesk', sans-serif",
                textShadow: `0 0 10px ${c.accent}55`,
              }}>
                {value}
              </div>
              <div style={{
                fontSize: 9, color: c.accent, marginTop: 2,
                fontFamily: "'Cairo', sans-serif", fontWeight: 700,
              }}>
                {STAT_LABELS[key]}
              </div>
            </div>
          ))}
        </div>

        {/* ── SportID + QR footer ── */}
        <div style={{
          background: "rgba(0,0,0,0.85)",
          borderTop: `1px solid ${c.border}44`,
          padding: "8px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          <div>
            <div style={{
              fontSize: 8, color: "rgba(255,255,255,0.35)",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: 1, marginBottom: 2,
            }}>
              SPORT ID
            </div>
            <div style={{
              fontSize: 11, fontWeight: 900, color: c.accent,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: 0.5,
            }}>
              {player.sportId}
            </div>
            <div style={{
              fontSize: 9, color: "rgba(255,255,255,0.3)",
              fontFamily: "'Cairo', sans-serif", marginTop: 2,
            }}>
              مواليد {player.birthYear} • {player.sport}
            </div>
          </div>

          {/* Real QR Code */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: 6, padding: 3,
            border: `1.5px solid ${c.accent}55`,
            flexShrink: 0,
          }}>
            <QRCodeSVG
              value={`https://ada2ai.com/sportid/${player.sportId}`}
              size={50}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="M"
            />
          </div>
        </div>
      </div>

      {/* ── Download button ── */}
      <button
        onClick={handleDownload}
        disabled={downloading || loading}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 28px", borderRadius: 12,
          background: "linear-gradient(135deg, #007ABA, #00DCC8)",
          color: "#000A0F", fontWeight: 900, fontSize: 14,
          border: "none", cursor: downloading ? "not-allowed" : "pointer",
          opacity: downloading ? 0.7 : 1,
          fontFamily: "'Cairo', sans-serif",
          transition: "opacity 0.2s",
          boxShadow: "0 4px 16px rgba(0,220,200,0.3)",
        }}
      >
        {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {downloading ? "جاري التحميل..." : "تحميل البطاقة PNG"}
      </button>
    </div>
  );
}
