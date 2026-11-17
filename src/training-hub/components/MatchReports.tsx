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

export default function MatchReports({ matches, lang = 'ar' }: Props) {
  const isRTL = lang !== 'en';
  const requestRef = useRef(0);
  const [showMotion, setShowMotion] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [report, setReport] = useState<MatchReport | null>(null);
  const [state, setState] = useState<State>('not_loaded');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
              {match.home_team || 'Unknown'} vs {match.away_team || 'Unknown'}
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
          خطأ في ربط التقرير بالمباراة. تم إبطال العرض.
        </div>
      )}

      {state === 'auth_failed' && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-4 text-sm text-red-400 arabic-text">
          فشل المصادقة. لا يمكن عرض التقرير.
        </div>
      )}

      {state === 'backend_failed' && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-4 text-sm text-red-400 arabic-text">
          تعذّر جلب التقرير. {errorMessage}
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
              التقرير المرتبط بالمباراة الصحيحة
            </div>
            <div className="mt-2 text-xs text-ice-muted arabic-text">
              Match ID: {report.match_id || '-'} {report.run_id ? ` · Run ID: ${report.run_id}` : ''}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">حالة المعايرة</div>
              <div className={`font-display font-bold text-lg ${calibrated ? 'text-teal-prime' : 'text-gold'}`}>
                {calibrated ? 'معايرة صالحة' : 'معايرة غير مصرح بها'}
              </div>
              <div className="text-xs text-ice-muted mt-1">
                {report.calibration?.label || report.calibration?.status || 'not_validated'}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">هوية اللاعب</div>
              <div className={`font-display font-bold text-lg ${identityConfirmed ? 'text-teal-prime' : 'text-gold'}`}>
                {identityConfirmed ? 'مؤكدة' : 'غير مؤكدة'}
              </div>
              <div className="text-xs text-ice-muted mt-1">
                {report.data_quality?.track_id_note || 'track_id ≠ player_id'}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">مصدر التتبع</div>
              <div className="font-display font-bold text-lg text-teal-prime">
                {report.data_quality?.positioning_evidence?.status || 'غير متاح'}
              </div>
              <div className="text-xs text-ice-muted mt-1">
                {report.data_quality?.positioning_evidence?.note || 'بيانات تحليل محفوظة'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">عدد المسارات</div>
              <div className="font-display font-bold text-xl text-ice-white">{tracking?.person_tracks ?? 0}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">متوسط ثقة التتبع</div>
              <div className="font-display font-bold text-xl text-ice-white">{tracking?.mean_detection_confidence ?? 0}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-ice-muted arabic-text">عدد الأحداث</div>
              <div className="font-display font-bold text-xl text-ice-white">{report.event_provenance?.total_events ?? 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-bold text-ice-white mb-3 arabic-text">توزيع الأحداث</h3>
              {eventCounts.length ? (
                eventCounts.map(([level, count]) => (
                  <div key={`${level}-${count}`} className="flex justify-between text-sm text-ice-muted">
                    <span>{level}</span>
                    <span>{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-ice-muted text-xs arabic-text">لا توجد أحداث محفوظة.</p>
              )}
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-bold text-ice-white mb-3 arabic-text">بيانات جودة التتبع</h3>
              <div className="text-sm text-ice-muted arabic-text">
                مسار التتبع: {tracking?.mean_frames_visible ?? '-'}
                {tracking?.provenance ? ` · ${tracking.provenance}` : ''}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-4 text-sm text-ice-muted arabic-text">
            {report.data_quality?.positioning_evidence?.note || 'هذا التقرير مستخرج من تحليل محفوظ. لا يعني ذلك توفر بيانات إعادة العرض.'}
          </div>
        </div>
      )}
    </section>
  );
}
