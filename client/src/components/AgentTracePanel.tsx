/**
 * AgentTracePanel — A2A Multi-Agent Trace Visualization
 * Shows pipeline: Orchestrator → Classifier → Query → Synthesizer → Voice
 */

import { useState } from "react";
import { Cpu, Target, Activity, Brain, Mic, ChevronDown, ChevronUp, Clock, Zap } from "lucide-react";

export interface AgentTrace {
  agent: string;
  timestamp: string;
  durationMs: number;
  confidence: number;
  version: string;
}

interface AgentTracePanelProps {
  trace: AgentTrace[];
  totalDurationMs?: number;
  lang?: "ar" | "en";
  compact?: boolean;
}

const AGENT_CONFIG: Record<string, { icon: typeof Cpu; color: string; nameAr: string; nameEn: string }> = {
  orchestrator: { icon: Cpu, color: "#A78BFA", nameAr: "المنسّق", nameEn: "Orchestrator" },
  classifier: { icon: Target, color: "#FF6B35", nameAr: "المصنّف", nameEn: "Classifier" },
  query: { icon: Activity, color: "#00D4FF", nameAr: "المستعلم", nameEn: "Query" },
  synthesizer: { icon: Brain, color: "#00FF88", nameAr: "المولّد", nameEn: "Synthesizer" },
  voice: { icon: Mic, color: "#E879F9", nameAr: "الصوت", nameEn: "Voice" },
};

export default function AgentTracePanel({ trace, totalDurationMs, lang = "ar", compact = false }: AgentTracePanelProps) {
  const [expanded, setExpanded] = useState(!compact);
  const isRTL = lang === "ar";

  if (!trace || trace.length === 0) return null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(10, 14, 26, 0.8)", border: "1px solid rgba(0, 212, 255, 0.15)", direction: isRTL ? "rtl" : "ltr" }}
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/5" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center gap-2">
          <Cpu size={14} style={{ color: "#A78BFA" }} />
          <span className="text-xs font-bold" style={{ color: "#A78BFA" }}>
            {isRTL ? "خط أنابيب الوكلاء" : "Agent Pipeline"}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF" }}>
            {trace.length} {isRTL ? "وكلاء" : "agents"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalDurationMs != null && (
            <span className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Clock size={10} /> {totalDurationMs}ms
            </span>
          )}
          {expanded ? <ChevronUp size={14} style={{ color: "rgba(255,255,255,0.4)" }} /> : <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {trace.map((t, i) => {
              const cfg = AGENT_CONFIG[t.agent] || { icon: Zap, color: "#888", nameAr: t.agent, nameEn: t.agent };
              const Icon = cfg.icon as typeof Cpu;
              return (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}40` }}>
                    <Icon size={12} style={{ color: cfg.color }} />
                    <span style={{ color: cfg.color, fontFamily: "'Cairo', sans-serif" }}>{isRTL ? cfg.nameAr : cfg.nameEn}</span>
                    <span className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: t.confidence >= 0.8 ? "rgba(0,255,136,0.1)" : t.confidence >= 0.5 ? "rgba(255,200,0,0.1)" : "rgba(255,100,100,0.1)", color: t.confidence >= 0.8 ? "#00FF88" : t.confidence >= 0.5 ? "#FFC800" : "#FF6464" }}>
                      {Math.round(t.confidence * 100)}%
                    </span>
                    {t.durationMs > 0 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{t.durationMs}ms</span>}
                  </div>
                  {i < trace.length - 1 && <span style={{ color: "rgba(255,255,255,0.15)" }}>→</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
