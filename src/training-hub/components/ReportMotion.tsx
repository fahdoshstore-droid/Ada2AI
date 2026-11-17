import { useEffect, useMemo, useRef, useState } from 'react';
import { motionModel, formationPoints, type MotionReport } from './motionModel';

export default function ReportMotion({ report }: { report: MotionReport }) {
  const model = useMemo(() => motionModel(report, report.match_id || ''), [report]);
  const timeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const ready = model.teams.length === 2 && model.events.length > 0;
  useEffect(() => {
    if (!playing || !ready) return;
    let frame = 0;
    let last: number | undefined;
    let elapsed = timeRef.current;
    const tick = (now: number) => {
      const delta = last === undefined ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed = Math.min(model.duration, elapsed + delta * speed);
      timeRef.current = elapsed;
      setTime(elapsed);
      if (elapsed >= model.duration) { setPlaying(false); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, ready, speed, model.duration]);

  const half = time <= model.halfEnds[0] ? 1 : 2;
  const clock = half === 1 ? time : time - model.halfEnds[0] + 45;
  const base = half === 1 ? 45 : 90;
  const label = clock > base ? `${base}+${Math.floor(clock - base)}` : `${Math.floor(clock)}`;
  const active = model.events.filter(e => e.at <= time).at(-1);
  const colors = ['#7dd3fc', '#f87171'];
  return <section className="rounded-xl bg-white/5 p-3 sm:p-5 space-y-4 arabic-text" aria-label="عرض الحركة" data-match-id={report.match_id} data-run-id={report.run_id}>
    <h3 className="text-lg font-bold text-ice-white">عرض الحركة</h3>
    <p className="rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold" role="note">محاكاة تكتيكية مبنية على نتائج التحليل — ليست تتبعًا فعليًا لحركة اللاعبين</p>
    <p className="text-xs text-ice-muted">الإحداثيات المعايرة غير متاحة في التقرير. مواضع الرموز وحركتها توضيحية للتشكيلات فقط؛ لا تمثل مسارات اللاعبين أو بناء الهجمات. الألوان للتمييز البصري وليست ألوان قمصان مؤكدة. التوقيت بالدقيقة حسب التقرير، وغير متزامن مع الفيديو.</p>
    {!ready ? <p className="text-gold" role="status">البيانات غير كافية للمحاكاة: يلزم تشكيلتان موثقتان وأحداث مؤقتة محفوظة. لن تُعرض حركة افتراضية.</p> : <>
      <div className="flex flex-wrap gap-4 text-sm">{model.teams.map(([team, shape], i) => <span key={team} style={{ color: colors[i] }}>● {team} · {shape}</span>)}</div>
      <svg viewBox="0 0 105 68" className="w-full rounded-xl bg-emerald-950" role="img" aria-label="ملعب محاكاة تكتيكية؛ رموز بلا هويات مؤكدة">
        <rect x="1" y="1" width="103" height="66" fill="none" stroke="#ffffff66" strokeWidth=".4" />
        <path d="M52.5 1V67M1 14H17V54H1M104 14H88V54H104" fill="none" stroke="#ffffff66" strokeWidth=".4" />
        <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#ffffff66" strokeWidth=".4" />
        {model.teams.flatMap(([team, shape], side) => {
          const possession = model.data?.period_stats?.[half === 1 ? 'FirstHalf' : 'SecondHalf']?.[team]?.possession_pct;
          return formationPoints(shape, side, time, possession).map((point, index) => {
            const key = `${side}-${index}`;
            const description = `${team} — موضع تكتيكي توضيحي؛ الهوية غير مؤكدة`;
            return <g key={key} role="button" tabIndex={0} aria-label={description} onClick={() => setSelected(description)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(description); } }} style={{ cursor: 'pointer' }}>
              <title>{description}</title><circle cx={point.x} cy={point.y} r="2.4" fill="transparent" /><circle cx={point.x} cy={point.y} r="1.3" fill={colors[side]} stroke="white" strokeWidth=".25" />
            </g>;
          });
        })}
      </svg>
      {selected && <p className="text-xs text-ice-muted" role="status">{selected}</p>}
      <div className="flex flex-wrap items-center gap-3 text-sm text-ice-white">
        <button className="rounded-lg bg-teal-prime/20 px-5 py-3 text-teal-prime" onClick={() => { if (time >= model.duration) { timeRef.current = 0; setTime(0); } setPlaying(p => !p); }}>{playing ? 'إيقاف' : 'تشغيل'}</button>
        <label>سرعة العرض <select aria-label="سرعة العرض" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="rounded bg-navy-dark p-2">{[0.5, 1, 2, 4].map(s => <option key={s} value={s}>{s}×</option>)}</select></label>
        <span>الشوط {half} · الدقيقة {label}</span>
      </div>
      <label className="block text-xs text-ice-muted">الشريط الزمني — دقيقة مباراة لكل ثانية عرض عند 1×
        <input dir="ltr" aria-label="الشريط الزمني للمباراة" className="mt-2 w-full accent-teal-prime" type="range" min="0" max={model.duration} step="0.01" value={time} onChange={e => { setPlaying(false); timeRef.current = Number(e.target.value); setTime(timeRef.current); }} />
      </label>
      <p className="text-sm text-ice-white min-h-10">{active ? `آخر حدث محفوظ: ${active.minuteLabel}′ · ${active.kind} · ${active.team || ''} · ${active.player || active.players?.map(p => `${p.name} (${p.direction === 'in' ? 'دخول' : 'خروج'})`).join('، ') || ''}` : 'لم يحن توقيت أول حدث محفوظ.'}</p>
      <div className="max-h-48 overflow-y-auto flex flex-wrap gap-2" aria-label="أحداث التقرير">{model.events.map((event, index) => <button key={index} className={`rounded-lg border p-2 text-xs ${active === event ? 'border-teal-prime text-teal-prime' : 'border-white/10 text-ice-muted'}`} onClick={() => { setPlaying(false); timeRef.current = event.at; setTime(event.at); }} title={event.provenance}>{event.minuteLabel}′ · {event.kind} · {event.team} {event.player}</button>)}</div>
      <p className="text-xs text-ice-muted">مصادر التقرير المحفوظ: {model.data?.sources?.map(s => s.name).join('، ') || 'غير محددة'}. التشكيلة لا تثبت توزيع أسماء اللاعبين على مواضع الملعب. التبديلات تظهر كأحداث دون اختلاق تعيين مكاني. الحركة الجماعية توضيحية، ويؤثر استحواذ الشوط المحفوظ في تمركزها عند توفره.</p>
    </>}
    <p className="text-xs text-ice-muted break-all" dir="ltr">Match: {report.match_id} · Run: {report.run_id || 'غير متاح'}</p>
  </section>;
}
