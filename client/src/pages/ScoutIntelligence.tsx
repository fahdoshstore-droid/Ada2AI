/**
 * Ada2AI Scout Intelligence — Minimal Decision Support Interface
 *
 * 6 views:
 *   1. Player Profile (DNA + role fit)
 *   2. Tactical Fit (role evaluation)
 *   3. Role Analysis (ontology roles)
 *   4. Similar Players (stylistic similarity)
 *   5. Match Intelligence (events + zones)
 *   6. Recommendation Feed (scout recs)
 *
 * NO social features. NO vanity metrics. NO unnecessary charts.
 * Focus: decision support for scouting.
 */

import React, { useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────
interface DNALabel { ar: string; en: string }
interface RoleFit { role: string; role_name: string; fit_score: number; explanations: string[]; key_evidence: string[] }
interface DNATrait { ar: string; en: string; description: string }
interface SimilarPlayer { player_id: number; similarity: number; explanations: string[]; shared_labels: string[] }
interface Recommendation { player_id: number; recommended_role: string; role_name: string; role_fit: number; system_fit: number; overall_score: number; fit_explanation: string[]; risk_factors: string[]; dna_labels: string[] }
interface MatchEvent { event_type: string; timestamp: number; confidence: number }
interface OntologyRole { ar: string; en: string; traits: Record<string, number>; zones: string[] }
interface FeedbackNote { player_id: number; note: string; source?: string }

const API = import.meta.env.VITE_API_URL || "";

// ── API helpers ────────────────────────────────
async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ── Tab Bar ────────────────────────────────────
const TABS = [
  { id: "profile", label: "الملف الشخصي", icon: "👤" },
  { id: "fit", label: "الملاءمة التكتيكية", icon: "🎯" },
  { id: "roles", label: "الأدوار", icon: "⚽" },
  { id: "similar", label: "لاعبون مشابهون", icon: "🔗" },
  { id: "match", label: "ذكاء المباراة", icon: "📊" },
  { id: "recs", label: "التوصيات", icon: "📋" },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Score Bar ──────────────────────────────────
function ScoreBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "#00ff88" : pct >= 40 ? "#fbbf24" : "#ef4444";
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 12 }}>
        <span style={{ color: "#94a3b8" }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ background: "#1e293b", height: 6, borderRadius: 3 }}>
        <div style={{ background: color, height: 6, borderRadius: 3, width: `${pct}%`, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────────
function Badge({ text, color = "#00ff88" }: { text: string; color?: string }) {
  return (
    <span style={{
      background: `${color}20`, color, padding: "2px 8px",
      borderRadius: 4, fontSize: 11, fontWeight: 600, marginRight: 4,
    }}>
      {text}
    </span>
  );
}

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════
export default function ScoutIntelligence() {
  const [tab, setTab] = useState<TabId>("profile");
  const [playerId, setPlayerId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [dnaTraits, setDnaTraits] = useState<Record<string, DNATrait> | null>(null);
  const [roles, setRoles] = useState<Record<string, OntologyRole> | null>(null);
  const [roleFits, setRoleFits] = useState<RoleFit[] | null>(null);
  const [similar, setSimilar] = useState<SimilarPlayer[] | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [events, setEvents] = useState<MatchEvent[] | null>(null);

  // Fetch ontology on mount
  useEffect(() => {
    apiGet<Record<string, DNATrait>>("/intelligence/dna").then(setDnaTraits).catch(() => {});
    apiGet<Record<string, OntologyRole>>("/intelligence/ontology/roles").then(setRoles).catch(() => {});
  }, []);

  // ── Tab Actions ─────────────────────────

  const loadRoleFits = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiPost<{ role: string; rankings: RoleFit[] }>(
        `/intelligence/roles/evaluate/${playerId}`,
        { target_role: "pressing_forward" }
      );
      setRoleFits(res.rankings || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const loadSimilar = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiPost<{ source_id: number; similar: SimilarPlayer[] }>(
        "/intelligence/similarity",
        { source_id: playerId, top_n: 5 }
      );
      setSimilar(res.similar || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const loadRecommendations = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiPost<{ role: string; recommendations: Recommendation[] }>(
        "/intelligence/recommend",
        { club_id: "default", target_role: "transition_winger", top_n: 5 }
      );
      setRecommendations(res.recommendations || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Styles ──────────────────────────────
  const styles: Record<string, React.CSSProperties> = {
    container: { background: "#0a0e1a", color: "#e2e8f0", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", padding: 16 },
    header: { borderBottom: "1px solid #1e293b", marginBottom: 16, paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: 800, color: "#00ff88", marginBottom: 4 },
    subtitle: { fontSize: 12, color: "#64748b" },
    tabBar: { display: "flex", gap: 2, background: "#111827", borderRadius: 8, padding: 3, marginBottom: 16, overflowX: "auto" as const },
    tab: (active: boolean) => ({
      flex: 1, padding: "8px 4px", borderRadius: 6, textAlign: "center" as const, fontSize: 12,
      cursor: "pointer", background: active ? "#00ff8820" : "transparent", color: active ? "#00ff88" : "#64748b",
      fontWeight: active ? 700 : 400, transition: "all 0.2s",
    }),
    card: { background: "#111827", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #1e293b" },
    cardTitle: { fontSize: 14, fontWeight: 700, color: "#00ff88", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 },
    inputRow: { display: "flex", gap: 8, marginBottom: 12, alignItems: "center" },
    input: { background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "6px 10px", color: "#e2e8f0", fontSize: 13, width: 80 },
    btn: { background: "#00ff88", color: "#0a0e1a", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
    btnDisabled: { background: "#334155", color: "#64748b", cursor: "not-allowed" },
    error: { color: "#ef4444", fontSize: 12, marginBottom: 8 },
    empty: { color: "#475569", fontSize: 13, textAlign: "center" as const, padding: 24 },
    evidence: { fontSize: 11, color: "#94a3b8", marginTop: 4, lineHeight: 1.5 },
    risk: { color: "#fbbf24", fontSize: 11, marginTop: 2 },
  };

  // ── Render Tabs ────────────────────────

  const renderProfile = () => (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>👤 الحمض النووي اللاعب — #{playerId}</div>
        <div style={styles.inputRow}>
          <span style={{ fontSize: 12, color: "#64748b" }}>رقم اللاعب:</span>
          <input type="number" style={styles.input} value={playerId} onChange={e => setPlayerId(+e.target.value)} />
        </div>
        {dnaTraits && Object.entries(dnaTraits).map(([key, trait]) => (
          <div key={key} style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{trait.ar}</span>
            <span style={{ fontSize: 10, color: "#475569", marginRight: 8 }}> — {trait.description}</span>
          </div>
        ))}
        {!dnaTraits && <div style={styles.empty}>شغّل /analyze/full أولاً لتحليل اللاعب</div>}
      </div>
    </div>
  );

  const renderFit = () => (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>🎯 تقييم الملاءمة التكتيكية</div>
        <div style={styles.inputRow}>
          <span style={{ fontSize: 12, color: "#64748b" }}>لاعب:</span>
          <input type="number" style={styles.input} value={playerId} onChange={e => setPlayerId(+e.target.value)} />
          <button style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }} onClick={loadRoleFits} disabled={loading}>
            {loading ? "⏳" : "قيّم"}
          </button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        {roleFits ? roleFits.map((fit, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${fit.fit_score >= 0.7 ? "#00ff88" : fit.fit_score >= 0.4 ? "#fbbf24" : "#ef4444"}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{fit.role_name}</div>
            <ScoreBar value={fit.fit_score} label="ملاءمة" />
            {fit.explanations?.map((exp, j) => (
              <div key={j} style={styles.evidence}>{exp}</div>
            ))}
            {fit.key_evidence?.map((ev, j) => (
              <div key={j} style={{ ...styles.evidence, color: "#00ff88" }}>• {ev}</div>
            ))}
          </div>
        )) : <div style={styles.empty}>اضغط "قيّم" لتحليل ملاءمة اللاعب</div>}
      </div>
    </div>
  );

  const renderRoles = () => (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>⚽ الأدوار التكتيكية</div>
        {roles ? Object.entries(roles).map(([id, role]) => (
          <div key={id} style={{ ...styles.card, padding: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{role.ar} <span style={{ color: "#475569", fontWeight: 400, fontSize: 12 }}>({role.en})</span></div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginBottom: 6 }}>
              {role.zones?.map(z => <Badge key={z} text={z} color="#3b82f6" />)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
              {Object.entries(role.traits || {}).map(([t, w]) => (
                <Badge key={t} text={`${t}: ${w}`} color="#fbbf24" />
              ))}
            </div>
          </div>
        )) : <div style={styles.empty}>جاري تحميل الأدوار...</div>}
      </div>
    </div>
  );

  const renderSimilar = () => (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>🔗 لاعبون مشابهون أسلوبياً</div>
        <div style={styles.inputRow}>
          <span style={{ fontSize: 12, color: "#64748b" }}>لاعب مصدر:</span>
          <input type="number" style={styles.input} value={playerId} onChange={e => setPlayerId(+e.target.value)} />
          <button style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }} onClick={loadSimilar} disabled={loading}>
            {loading ? "⏳" : "ابحث"}
          </button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        {similar ? similar.map((s, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${s.similarity >= 0.7 ? "#00ff88" : s.similarity >= 0.4 ? "#fbbf24" : "#64748b"}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              لاعب #{s.player_id} <span style={{ color: s.similarity >= 0.7 ? "#00ff88" : "#fbbf24", fontWeight: 600 }}>
                — {Math.round(s.similarity * 100)}%
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginBottom: 6 }}>
              {s.shared_labels?.map(l => <Badge key={l} text={l} color="#3b82f6" />)}
            </div>
            {s.explanations?.map((exp, j) => (
              <div key={j} style={styles.evidence}>{exp}</div>
            ))}
          </div>
        )) : <div style={styles.empty}>اضغط "ابحث" لإيجاد لاعبين مشابهين</div>}
      </div>
    </div>
  );

  const renderMatch = () => (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>📊 ذكاء المباراة</div>
        <div style={styles.empty}>شغّل تحليل فيديو كامل (/analyze/full) ثم عُد هنا لرؤية الأحداث والمناطق التكتيكية</div>
      </div>
    </div>
  );

  const renderRecs = () => (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>📋 توصيات الكشافة</div>
        <button style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }} onClick={loadRecommendations} disabled={loading}>
          {loading ? "⏳" : "حمّل التوصيات"}
        </button>
        {error && <div style={styles.error}>{error}</div>}
        {recommendations ? recommendations.map((rec, i) => (
          <div key={i} style={{ ...styles.card, marginTop: 12, borderLeft: "3px solid #fbbf24" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              لاعب #{rec.player_id} — {rec.role_name}
            </div>
            <ScoreBar value={rec.role_fit} label="ملاءمة الدور" />
            <ScoreBar value={rec.system_fit} label="ملاءمة النظام" />
            <ScoreBar value={rec.overall_score} label="التقييم الشامل" />
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, margin: "8px 0" }}>
              {rec.dna_labels?.map(l => <Badge key={l} text={l} color="#00ff88" />)}
            </div>
            {rec.fit_explanation?.map((e, j) => (
              <div key={j} style={{ ...styles.evidence, color: "#00ff88" }}>✅ {e}</div>
            ))}
            {rec.risk_factors?.map((r, j) => (
              <div key={j} style={styles.risk}>⚠️ {r}</div>
            ))}
          </div>
        )) : <div style={styles.empty}>اضغط "حمّل" لعرض التوصيات</div>}
      </div>
    </div>
  );

  const tabRenderers: Record<TabId, () => JSX.Element> = {
    profile: renderProfile,
    fit: renderFit,
    roles: renderRoles,
    similar: renderSimilar,
    match: renderMatch,
    recs: renderRecs,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🧠 ذكاء الكشافة</div>
        <div style={styles.subtitle}>Ada2AI Sports Intelligence — décision support</div>
      </div>

      <div style={styles.tabBar}>
        {TABS.map(t => (
          <div key={t.id} style={styles.tab(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </div>
        ))}
      </div>

      {tabRenderers[tab]()}
    </div>
  );
}