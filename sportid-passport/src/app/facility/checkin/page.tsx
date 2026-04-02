'use client';
import { useState } from 'react';
import { mockAthletes, getLevelInfo } from '@/lib/mock-data';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

type ScanState = 'idle' | 'scanning' | 'success' | 'error';
const sampleAthletes = mockAthletes;

export default function CheckInPage() {
  const { lang } = useLang();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedAthlete, setScannedAthlete] = useState<typeof mockAthletes[0] | null>(null);
  const [manualId, setManualId] = useState('');
  const [logs, setLogs] = useState<Array<{name: string, time: string, sport: string}>>([]);

  async function doScan(athleteIdx = 0) {
    setScanState('scanning');
    setScannedAthlete(null);
    await new Promise(r => setTimeout(r, 2000));
    const athlete = sampleAthletes[athleteIdx % sampleAthletes.length];
    setScannedAthlete(athlete);
    setScanState('success');
    setLogs(prev => [{ name: athlete.name, time: new Date().toLocaleTimeString(), sport: athlete.sports[0] }, ...prev.slice(0, 9)]);
  }

  function handleManualLookup() {
    const idx = manualId === sampleAthletes[1].sportId ? 1 : 0;
    doScan(idx);
    setManualId('');
  }

  const levelInfo = scannedAthlete ? getLevelInfo(scannedAthlete.sportPoints) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sport-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">{t('qrScanner', lang)}</h2>
          <div className={`relative rounded-2xl overflow-hidden border-2 transition-all ${scanState === 'scanning' ? 'border-blue-500/60' : scanState === 'success' ? 'border-green-500/60' : scanState === 'error' ? 'border-red-500/60' : 'border-white/10'} bg-black aspect-square flex items-center justify-center`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-8 h-8 border-2 ${scanState === 'success' ? 'border-green-400' : 'border-white/40'} ${pos.includes('right') ? 'border-l-0' : 'border-r-0'} ${pos.includes('bottom') ? 'border-t-0' : 'border-b-0'}`} />
            ))}
            {scanState === 'scanning' && (
              <>
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" style={{ animation: 'scan 1.5s ease-in-out infinite' }} />
                <div className="text-white/60 text-sm flex flex-col items-center gap-2">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <span>{lang === 'ar' ? 'جارٍ المسح...' : 'Scanning…'}</span>
                </div>
              </>
            )}
            {scanState === 'idle' && (
              <div className="text-white/20 text-center">
                <div className="text-6xl mb-3">📷</div>
                <div className="text-sm">{t('pointCameraDesc', lang)}</div>
              </div>
            )}
            {scanState === 'success' && scannedAthlete && (
              <div className="flex flex-col items-center gap-2 text-center p-4">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl text-white">✓</div>
                <div className="text-white font-bold text-xl">{scannedAthlete.name}</div>
                <div className="text-green-400 text-sm">{t('verifiedIn', lang)}</div>
              </div>
            )}
          </div>
          <style>{`@keyframes scan { 0%,100%{top:10%} 50%{top:85%} }`}</style>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => doScan(0)} disabled={scanState === 'scanning'} className="py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50">
              {scanState === 'scanning' ? t('scanning', lang) : t('scanAthlete1', lang)}
            </button>
            <button onClick={() => doScan(1)} disabled={scanState === 'scanning'} className="py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50">
              {t('scanAthlete2', lang)}
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="text-white/40 text-xs mb-2">{t('manualLookup', lang)}</div>
            <div className="flex gap-2">
              <input value={manualId} onChange={e => setManualId(e.target.value)} placeholder={t('enterNationalId', lang)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-blue-500/50" />
              <button onClick={handleManualLookup} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">{t('search', lang)}</button>
            </div>
          </div>
        </div>
        <div className="sport-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">{t('athleteProfile', lang)}</h2>
          {!scannedAthlete ? (
            <div className="flex flex-col items-center justify-center h-64 text-white/20">
              <div className="text-5xl mb-3">🪪</div>
              <div className="text-sm">{t('scanToView', lang)}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-xl ${scanState === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'}`}>
                <div>
                  <div className="text-white font-bold text-xl">{scannedAthlete.name}</div>
                  <div className="text-white/40 text-sm">{scannedAthlete.id} · {scannedAthlete.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-sm">{t('sportIdVerified', lang)}</div>
                  <div className="text-white/30 text-xs mt-0.5">{t('verifiedIn', lang)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  [t('sportPoints', lang), scannedAthlete.sportPoints.toLocaleString()],
                  [lang === 'ar' ? 'المستوى' : 'Level', levelInfo?.level ?? '-'],
                  [t('age', lang), `${scannedAthlete.age} ${t('years', lang)}`],
                  [t('sports', lang), scannedAthlete.sports.join(', ')],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/5 rounded-xl p-3">
                    <div className="text-white/30 text-xs mb-1">{k}</div>
                    <div className="text-white font-medium text-sm">{v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/40 text-xs mb-1">{t('certifications', lang)}</div>
                {scannedAthlete.certifications.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-1">
                    <span className="text-white text-sm">{c.name}</span>
                    <span className="text-green-400 text-xs">✓ {lang === 'ar' ? 'موثق' : 'Verified'}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#007ABA] to-[#00DCC8] text-white font-bold">{t('confirmCheckin', lang)}</button>
            </div>
          )}
        </div>
      </div>
      {logs.length > 0 && (
        <div className="sport-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">{t('todayLog', lang)}</h2>
          <div className="space-y-2">
            {logs.map((l, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-white text-sm">{l.name}</span>
                  <span className="text-white/30 text-xs">{l.sport}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-xs">+10 pts</span>
                  <span className="text-white/30 text-xs">{l.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
