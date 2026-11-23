import { useCallback, useRef, useState } from 'react';
import { FileText, Loader2, Activity } from 'lucide-react';
import FootballTrackLinks from './FootballTrackLinks';
import MatchReplay from './MatchReplay';
import type { MotionReport } from './motionModel';
import { yoloEndpoint, yoloFetch } from '@/lib/yoloApi';

interface MatchOption {
  id: string;
  home_team?: string | null;
  away_team?: string | null;
  match_date?: string | null;
  competition?: string | null;
}

interface MatchReport extends MotionReport {
  status: string;
  match_id: string | null;
  run_id?: string | null;
  calibration?: {
    calibrated?: boolean;
    label?: string;
    status?: string;
    note?: string;
  };
  event_provenance?: {
    total_events?: number;
    provenance_counts?: Record<string, number>;
  };
  data_quality?: {
    calibrated?: boolean;
    player_identity_confirmed?: boolean;
    track_id_note?: string;
    positioning_evidence?: { status?: string; note?: string };
    tracking_quality?: {
      person_tracks?: number;
      mean_detection_confidence?: number;
      mean_frames_visible?: number;
      provenance?: string;
    };
  };
  processing_time_seconds?: number;
}

interface Props {
  matches: MatchOption[];
  lang?: 'ar' | 'en';
}

type State =
  | 'not_loaded'
  | 'loading'
  | 'loaded'
  | 'not_available'
  | 'identity_mismatch'
  | 'auth_failed'
  | 'backend_failed';

/** Server event-source keys in plain Arabic; unknown keys fall back to a generic label. */
function eventSourceLabel(key: string): string {
  const k = key.toLowerCase();
  if (k.includes('coach') || k.includes('manual')) return 'سجّلها المدرب';
  if (k.includes('confirm') || k.includes('verified')) return 'مؤكدة';
  if (k.includes('heuristic') || k.includes('inferred') || k.includes('estimat')) return 'تقدير تلقائي';
  if (k.includes('detect') || k.includes('cv') || k.includes('vision')) return 'رصد تلقائي';
  return 'مصدر آخر';
}

export default function MatchReports({ matches, lang = 'ar' }: Props) {
  const isRTL = lang !== 'en';
  const requestRef = useRef(0);
  const [showMotion, setShowMotion] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [report, setReport] = useState<MatchReport | null>(null);
  const [state, setState] = useState<State>('not_loaded');
  const [, setErrorMessage] = useState<string | null>(null);

  const loadReport = useCallback(async (matchId: string) => {
    setSelectedMatchId(matchId);
    const request = ++requestRef.current;
    setShowMotion(false);
    setReport(null);
    setErrorMessage(null);
    setState('not_loaded');
    if (!matchId) return;
    setState('loading');
    try {
      const response = await yoloFetch(yoloEndpoint(`/intelligence/match/${encodeURIComponent(matchId)}`));
      let payload: MatchReport | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      if (request !== requestRef.current) return;
      if (response.status === 401) {
        setState('auth_failed');
        return;
      }
      if (!response.ok) {
        setState('backend_failed');
        setErrorMessage(payload?.status || `HTTP ${response.status}`);
        return;
      }
      if (payload?.match_id !== matchId && payload?.status === 'success') {
        setState('identity_mismatch');
        return;
      }
      if (!payload || payload.status !== 'success') {
        setState('not_available');
        return;
      }
      setReport(payload);
      setState('loaded');
    } catch (err) {
      if (request !== requestRef.current) return;
      setState('backend_failed');
      setErrorMessage(err instanceof Error ? err.message : 'backend request failed');
    }
  }, []);


  const calibrated = !!report?.calibration?.calibrated || !!report?.data_quality?.calibrated;
  const identityConfirmed = !!report?.data_quality?.player_identity_confirmed;
  const eventCounts = Object.entries(report?.event_provenance?.provenance_counts || {});
  const tracking = report?.data_quality?.tracking_quality;
  const rawConfidence = tracking?.mean_detection_confidence;
  const confidencePct = typeof rawConfidence === 'number'
    ? `${Math.round(rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence)}٪`
    : null;

  return (
    <section dir={isRTL ? 'rtl' : 'ltr'} className="glass-card rounded-2xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-5">
        <FileText className="w-5 h-5 text-teal-prime" />
        <h2 className="text-lg font-bold text-ice-white arabic-text">تقارير تحليل المباريات</h2>
      </div>

      <div className="mb-5">
        <select
          value={selectedMatchId}
          onChange={event => void loadReport(event.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-ice-white text-sm arabic-text focus:outline-none focus:ring-2 focus:ring-teal-prime/40"
        >
          <option value="">— اختر مباراة محللة —</option>
          {matches.map(match => (
            <option key={match.id} value={match.id}>
              {match.home_team || '؟'} × {match.away_team || '؟'}
              {match.competition ? ` · ${match.competition}` : ''}
              {match.match_date ? ` · ${match.match_date}` : ''}
            </option>
          ))}
        </select>
      </div>

      {state === 'loading' && (
        <div className="flex items-center gap-2 text-ice-muted arabic-text">
          <Loader2 className="w-4 h-4 animate-spin" />
          جاري تحميل التقرير المحفوظ...
        </div>
      )}

      {!selectedMatchId && state === 'not_loaded' && (
        <div className="text-ice-muted text-sm arabic-text">
          اختر مباراة لعرض تقريرها المحفوظ داخل لوحة المدرب.
        </div>
      )}

      {state === 'not_available' && (
        <div className="rounded-xl bg-gold/10 border border-gold/20 p-4 text-sm text-gold arabic-text">
          لا يوجد تقرير تحليل محفوظ بنجاح لهذه المباراة.
        </div>
      )}

      {state === 'identity_mismatch' && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-4 text-sm text-red-400 arabic-text">
          التقرير المحفوظ لا يخص هذه المباراة، فلم نعرضه.
        </div>
      )}

      {state === 'auth_failed' && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-4 text-sm text-red-400 arabic-text">
          انتهت صلاحية الدخول. سجّل الدخول من جديد.
        </div>
      )}

      {state === 'backend_failed' && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-4 text-sm text-red-400 arabic-text">
          تعذّر تحميل التقرير. تأكد أن خدمة تحليل الفيديو تعمل ثم حاول مرة أخرى.
        </div>
      )}

      {report && state === 'loaded' && (
        <div className="space-y-6">
          <button type="button" onClick={() => setShowMotion(value => !value)} aria-expanded={showMotion} className="rounded-xl bg-teal-prime/20 px-5 py-3 text-teal-prime font-bold arabic-text">{showMotion ? 'إغلاق عرض الحركة' : 'عرض الحركة'}</button>
          {showMotion && <>
            <MatchReplay key={`${report.match_id}:${report.run_id}`} lang={lang} savedReport={report} />
            <FootballTrackLinks matchId={selectedMatchId} />
          </>}

          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-teal-prime arabic-text">
              <Activity className="w-4 h-4" />
              تقرير محفوظ لهذه المباراة
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">ضبط الملعب</div>
              <div className={`font-display font-bold text-lg ${calibrated ? 'text-teal-prime' : 'text-gold'}`}>
                {calibrated ? 'مضبوط' : 'غير مضبوط بعد'}
              </div>
              <div className="text-xs text-ice-muted mt-1 arabic-text">
                {calibrated ? 'المسافات والسرعات محسوبة بالمتر.' : 'لا تُحسب المسافات والسرعات قبل ضبط الملعب.'}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">أسماء اللاعبين</div>
              <div className={`font-display font-bold text-lg ${identityConfirmed ? 'text-teal-prime' : 'text-gold'}`}>
                {identityConfirmed ? 'محدَّدة' : 'غير محدَّدة'}
              </div>
              <div className="text-xs text-ice-muted mt-1 arabic-text">
                الأرقام مؤقتة حتى يحدد المدرب من هو كل لاعب.
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">مواقع اللاعبين</div>
              <div className={`font-bold text-lg arabic-text ${calibrated ? 'text-teal-prime' : 'text-gold'}`}>
                {calibrated ? 'على الملعب' : 'على الصورة فقط'}
              </div>
              <div className="text-xs text-ice-muted mt-1 arabic-text">
                مأخوذة من فيديو المباراة.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">لاعبون ظهروا في الفيديو</div>
              <div className="font-display font-bold text-xl text-ice-white">{tracking?.person_tracks ?? 0}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">وضوح الرصد</div>
              <div className="font-display font-bold text-xl text-ice-white">{confidencePct ?? '—'}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">لقطات مسجّلة</div>
              <div className="font-display font-bold text-xl text-ice-white">{report.event_provenance?.total_events ?? 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-bold text-ice-white mb-3 arabic-text">مصدر اللقطات المسجّلة</h3>
              {eventCounts.length ? (
                eventCounts.map(([level, count]) => (
                  <div key={`${level}-${count}`} className="flex justify-between text-sm text-ice-muted">
                    <span className="arabic-text">{eventSourceLabel(level)}</span>
                    <span>{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-ice-muted text-xs arabic-text">لا توجد لقطات مسجّلة.</p>
              )}
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-bold text-ice-white mb-3 arabic-text">ظهور اللاعبين</h3>
              <div className="text-sm text-ice-muted arabic-text">
                {tracking?.mean_frames_visible != null
                  ? `يظهر اللاعب في المتوسط في ${Math.round(tracking.mean_frames_visible)} لقطة.`
                  : 'غير متاح.'}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-4 text-sm text-ice-muted arabic-text">
            هذا التقرير من تحليل محفوظ للفيديو. الأرقام تقريبية، ولا تُعرض المسافات والسرعات قبل ضبط الملعب.
          </div>
        </div>
      )}
    </section>
  );
}
