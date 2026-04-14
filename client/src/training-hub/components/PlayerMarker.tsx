import { type PlayerRole, type PitchPlayer } from "../pages/CoachDashboard.types";

const roleColors: Record<PlayerRole, { bg: string; border: string; labelAr: string; label: string }> = {
  GK:   { bg: "#F59E0B", border: "#F59E0B", labelAr: "حارس مرمى", label: "GK" },
  DEF:  { bg: "#3B82F6", border: "#3B82F6", labelAr: "مدافع", label: "DEF" },
  MID:  { bg: "#22C55E", border: "#22C55E", labelAr: "وسط", label: "MID" },
  FWD:  { bg: "#EF4444", border: "#EF4444", labelAr: "مهاجم", label: "FWD" },
};

interface PlayerMarkerProps {
  player: PitchPlayer;
  isSelected: boolean;
  isRTL: boolean;
  font: string;
  onStartDrag: (e: React.MouseEvent | React.TouchEvent, id: number) => void;
  onDoubleClick: (id: number) => void;
}

export default function PlayerMarker({
  player,
  isSelected,
  isRTL,
  font,
  onStartDrag,
  onDoubleClick,
}: PlayerMarkerProps) {
  const rc = roleColors[player.role];
  const isLinked = !!player.linkedPlayerId;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 20 : 10,
        cursor: "grab",
        userSelect: "none",
      }}
      onMouseDown={e => onStartDrag(e, player.id)}
      onTouchStart={e => onStartDrag(e, player.id)}
      onDoubleClick={() => onDoubleClick(player.id)}
    >
      {player.hasWarning && (
        <div className="absolute -top-2 -end-1 text-yellow-400" style={{ fontSize: "9px", zIndex: 21 }}>⚠</div>
      )}
      {isLinked && (
        <div className="absolute -top-2 start-0 text-teal-400" style={{ fontSize: "8px", zIndex: 21 }}>✓</div>
      )}
      <div
        className="absolute -top-2.5 start-1/2 -translate-x-1/2 text-white font-black rounded-full px-1"
        style={{
          fontSize: "7px",
          background: "#0A0E1A",
          border: `1px solid ${rc.border}`,
          whiteSpace: "nowrap",
          zIndex: 21,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {player.rating}
      </div>
      <div
        className="flex items-center justify-center font-black rounded-full border-2 transition-transform"
        style={{
          width: isSelected ? "34px" : "30px",
          height: isSelected ? "34px" : "30px",
          background: rc.bg,
          borderColor: isSelected ? "#fff" : isLinked ? "#00DCC8" : rc.border,
          color: "#fff",
          fontSize: "11px",
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: isSelected ? `0 0 12px ${rc.bg}` : isLinked ? "0 0 8px rgba(0,220,200,0.4)" : `0 2px 8px rgba(0,0,0,0.4)`,
          transform: isSelected ? "scale(1.1)" : "scale(1)",
        }}
      >
        {player.number}
      </div>
      <div
        className="mt-0.5 px-1 rounded text-white text-center"
        style={{
          fontSize: "6.5px",
          background: "rgba(0,0,0,0.7)",
          fontFamily: font,
          whiteSpace: "nowrap",
          maxWidth: "44px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {isRTL ? player.nameAr : player.nameEn}
      </div>
    </div>
  );
}