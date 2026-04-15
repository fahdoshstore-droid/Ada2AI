import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /** Route to navigate to when clicked. Defaults to "/" */
  fallbackRoute?: string;
  /** Optional additional class names */
  className?: string;
}

export default function BackButton({ fallbackRoute = "/", className = "" }: BackButtonProps) {
  const [, navigate] = useLocation();

  // Detect RTL from document direction
  const isRTL = typeof document !== "undefined" && document.dir === "rtl";

  return (
    <button
      onClick={() => navigate(fallbackRoute)}
      className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/10 ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#00DCC8",
      }}
    >
      <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
      رجوع
    </button>
  );
}