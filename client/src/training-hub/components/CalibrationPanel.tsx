import { useCallback, useMemo, useState } from 'react';
import { Plus, X, Loader2, Activity } from 'lucide-react';
import { yoloEndpoint, yoloFetch } from '@/lib/yoloApi';

interface Correspondence {
  identifier: number;
  imageX: number | null;
  imageY: number | null;
  pitchX: number | null;
  pitchY: number | null;
}

interface CalibrationPanelProps {
  lang?: 'ar' | 'en';
}

const isRTL = (lang?: 'ar' | 'en') => lang !== 'en';

function isCollinear(points: Array<{ x: number; y: number }>) {
  if (points.length < 3) return true;
  const [a, b, c] = points;
  return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 1e-8;
}

export default function CalibrationPanel({ lang }: CalibrationPanelProps) {
  const isRtl = isRTL(lang);
  const [fittingFrameUrl, setFittingFrameUrl] = useState('');
  const [fittingTimestamp, setFittingTimestamp] = useState(30);
  const [fittingPairs, setFittingPairs] = useState<Correspondence[]>([]);
  const [holdoutPairs, setHoldoutPairs] = useState<Correspondence[]>([]);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [calibrationResult, setCalibrationResult] = useState<{ calibration?: any; error?: string } | null>(null);
  const nextIdentifier = useMemo(() => fittingPairs.length + 1, [fittingPairs]);
  const requiredPairs = 4;

  const handleFittingSourceClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const imageX = (event.clientX - rect.left) / rect.width;
    const imageY = (event.clientY - rect.top) / rect.height;
    setFittingPairs(prev => [...prev, { identifier: nextIdentifier, imageX, imageY, pitchX: null, pitchY: null }]);
  };

  const handlePitchClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const pitchX = ((event.clientX - rect.left) / rect.width) * 105;
    const pitchY = ((event.clientY - rect.top) / rect.height) * 68;
    setFittingPairs(prev => prev.map(pair =>
      pair.pitchX === null && pair.pitchY === null ? { ...pair, pitchX, pitchY } : pair
    ));
  };

  const canSubmitFitting = useMemo(() => {
    if (fittingPairs.length < requiredPairs) return false;
    const points = fittingPairs.map(pair => ({ x: pair.imageX ?? 0, y: pair.imageY ?? 0 }));
    return !isCollinear(points);
  }, [fittingPairs]);

  const canSubmitHoldout = useMemo(() => {
    if (holdoutPairs.length < requiredPairs) return false;
    const points = holdoutPairs.map(pair => ({ x: pair.imageX ?? 0, y: pair.imageY ?? 0 }));
    return !isCollinear(points);
  }, [holdoutPairs]);

  const validateHoldout = useCallback(async () => {
    setValidating(true);
    setValidationError(null);
    setCalibrationResult(null);
    try {
      if (!canSubmitFitting) {
        throw new Error('Need at least 4 non-collinear fitting correspondences');
      }
      if (!canSubmitHoldout) {
        throw new Error('Need at least 4 non-collinear holdout correspondences');
      }
      const payload = [
        ...fittingPairs.map(pair => ({
          image_x: pair.imageX,
          image_y: pair.imageY,
          pitch_x: pair.pitchX,
          pitch_y: pair.pitchY,
          landmark_name: `fitting_point_${pair.identifier}`,
        })),
        ...holdoutPairs.map(pair => ({
          image_x: pair.imageX,
          image_y: pair.imageY,
          pitch_x: pair.pitchX,
          pitch_y: pair.pitchY,
          landmark_name: `holdout_point_${pair.identifier}`,
        })),
      ];
      const response = await yoloFetch(yoloEndpoint('/calibration/manual'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      setCalibrationResult(result);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  }, [canSubmitFitting, canSubmitHoldout, fittingPairs, holdoutPairs]);

  const labels = {
    title: isRtl ? 'معايرة الملعب' : 'Pitch calibration',
    sourceFrame: isRtl ? 'إطار المصدر' : 'Source frame',
    standardPitch: isRtl ? 'ملعب معياري' : 'Standard pitch',
    submit: isRtl ? 'إرسال المعايرة' : 'Submit calibration',
    collecting: isRtl ? 'المقابلات' : 'Correspondences',
    holdout: isRtl ? 'حفظ الاختبار' : 'Holdout',
    remove: isRtl ? 'حذف' : 'Remove',
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0D1220', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Activity size={16} style={{ color: '#00DCC8' }} />
        <h3 className="font-bold text-white text-sm">{labels.title}</h3>
      </div>

      <label className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {labels.sourceFrame}
        <input type="file" accept="video/*,image/*" onChange={event => setFittingFrameUrl(event.target.files?.[0] ? URL.createObjectURL(event.target.files[0]) : '') as undefined} className="hidden" />
      </label>

      <input
        type="range"
        min={30}
        max={40}
        step={0.1}
        value={fittingTimestamp}
        onChange={(event) => setFittingTimestamp(Number(event.target.value))}
        className="w-full mt-2"
      />

      {fittingFrameUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <img src={fittingFrameUrl} alt={labels.sourceFrame} onMouseDown={handleFittingSourceClick} style={{ width: '100%', height: 'auto' }} />
          <div onClick={handlePitchClick} className="relative">
            <svg viewBox="0 0 105 68" style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.2)' }}>
              <rect x="0.5" y="0.5" width="104" height="67" fill="none" stroke="rgba(255,255,255,0.25)" />
              <line x1="52.5" y1="0.5" x2="52.5" y2="67.5" stroke="rgba(255,255,255,0.25)" />
              <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="rgba(255,255,255,0.2)" />
              <rect x="86" y="19.8" width="18.4" height="28.4" fill="none" stroke="rgba(255,255,255,0.18)" />
              <rect x="0.6" y="19.8" width="18.4" height="28.4" fill="none" stroke="rgba(255,255,255,0.18)" />
            </svg>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {labels.collecting}: {fittingPairs.length} / {requiredPairs}
      </div>

      {validationError && (
        <div className="mt-3 p-2 text-xs rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171' }}>
          {validationError}
        </div>
      )}

      {calibrationResult && (
        <pre className="mt-3 text-xs rounded-lg overflow-auto" style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.6)' }}>
          {JSON.stringify(calibrationResult, null, 2)}
        </pre>
      )}

      <button
        onClick={validateHoldout}
        disabled={!canSubmitFitting || !canSubmitHoldout || validating}
        className="mt-4 w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold"
        style={{
          background: canSubmitFitting && canSubmitHoldout ? 'linear-gradient(135deg,#007ABA,#00DCC8)' : 'rgba(255,255,255,0.05)',
          color: canSubmitFitting && canSubmitHoldout ? '#fff' : 'rgba(255,255,255,0.3)',
        }}
      >
        {validating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        {labels.submit}
      </button>
    </div>
  );
}
