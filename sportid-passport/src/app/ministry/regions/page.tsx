'use client';
import { useState } from 'react';
import { mockMinistryKPI } from '@/lib/mock-data';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

const kpi = mockMinistryKPI;

/* ─────────────────────────────────────────────────────────────────────────────
   All 13 Saudi administrative regions.
   Coordinates mapped to a 390 × 280 SVG viewport using:
     x = (lon − 34) / 22 × 360 + 15
     y = (32  − lat) / 16 × 260 + 10
   Athletes for the first 5 come from mock data; the remaining 8 are
   distributed from the "Others" bucket (total 15 150).
───────────────────────────────────────────────────────────────────────────── */
const ALL_REGIONS = [
  { name: 'Riyadh',           nameAr: 'الرياض',          athletes: 28400, x: 218, y: 129, color: '#007ABA', primary: true  },
  { name: 'Makkah',           nameAr: 'مكة المكرمة',     athletes: 22100, x: 103, y: 182, color: '#00DCC8', primary: true  },
  { name: 'Eastern Province', nameAr: 'المنطقة الشرقية', athletes: 16800, x: 273, y: 101, color: '#8B5CF6', primary: true  },
  { name: 'Madinah',          nameAr: 'المدينة المنورة', athletes:  9200, x: 100, y: 132, color: '#06B6D4', primary: true  },
  { name: 'Asir',             nameAr: 'عسير',             athletes:  7100, x: 148, y: 234, color: '#F59E0B', primary: true  },
  { name: 'Qassim',           nameAr: 'القصيم',           athletes:  3200, x: 172, y: 103, color: '#60A5FA', primary: false },
  { name: 'Hail',             nameAr: 'حائل',             athletes:  2400, x: 136, y: 83,  color: '#A78BFA', primary: false },
  { name: 'Jizan',            nameAr: 'جازان',            athletes:  2200, x: 108, y: 256, color: '#34D399', primary: false },
  { name: 'Tabuk',            nameAr: 'تبوك',             athletes:  2100, x: 50,  y: 69,  color: '#C084FC', primary: false },
  { name: 'Najran',           nameAr: 'نجران',            athletes:  1900, x: 178, y: 248, color: '#FB923C', primary: false },
  { name: 'Al Jawf',          nameAr: 'الجوف',            athletes:  1800, x: 105, y: 44,  color: '#38BDF8', primary: false },
  { name: 'Al Baha',          nameAr: 'الباحة',           athletes:  1550, x: 120, y: 206, color: '#4ADE80', primary: false },
  { name: 'Northern Borders', nameAr: 'الحدود الشمالية', athletes:  1300, x: 168, y: 26,  color: '#E879F9', primary: false },
];

const MAX_ATHLETES = Math.max(...ALL_REGIONS.map(r => r.athletes));

function bubbleRadius(athletes: number, min = 6, max = 22) {
  return min + (athletes / MAX_ATHLETES) * (max - min);
}

/* Simplified Saudi Arabia border polygon (clockwise from NW) */
const SA_OUTLINE =
  '23,50 ' +   // Gulf of Aqaba / Jordan border NW
  '68,14 ' +   // Jordan/Iraq border
  '148,24 ' +  // Northern border east
  '235,65 ' +  // Kuwait / NE corner
  '275,91 ' +  // Gulf coast N
  '300,120 ' + // Gulf coast, Qatar area
  '355,155 ' + // UAE border
  '365,200 ' + // SE corner, Oman
  '345,222 ' + // South turn
  '250,252 ' + // South center
  '174,265 ' + // Yemen border
  '140,265 ' + // Jizan coast
  '110,258 ' + // Red Sea S
  '78,192 ' +  // Red Sea, Jeddah area
  '60,148 ' +  // Red Sea center
  '38,100 ' +  // Red Sea N
  '22,68';     // Tabuk/Aqaba coast

/* ── Saudi Arabia Map Component ── */
function SaudiMap({ lang }: { lang: 'en' | 'ar' }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredRegion = ALL_REGIONS.find(r => r.name === hovered);

  return (
    <div className="sport-card p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white">
            {lang === 'ar' ? '🗺️ الخريطة الوطنية' : '🗺️ National Coverage Map'}
          </h2>
          <p className="text-white/30 text-xs mt-0.5">
            {lang === 'ar' ? 'جميع المناطق الـ 13 · الكرة تمثل حجم المشاركين' : 'All 13 regions · bubble size = athlete count'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[#00DCC8] font-black text-lg leading-none">
            {ALL_REGIONS.reduce((s, r) => s + r.athletes, 0).toLocaleString()}
          </div>
          <div className="text-white/30 text-xs">{lang === 'ar' ? 'إجمالي الرياضيين' : 'total athletes'}</div>
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative">
        <svg
          viewBox="0 0 390 280"
          className="w-full rounded-xl"
          style={{ maxHeight: 280, background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <defs>
            <radialGradient id="mapBg" cx="45%" cy="50%" r="55%">
              <stop offset="0%"   stopColor="#007ABA" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000A0F" stopOpacity="0" />
            </radialGradient>
            <filter id="bubbleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background radial glow */}
          <rect width="390" height="280" fill="url(#mapBg)" />

          {/* Subtle lat/lon grid */}
          {[65, 120, 175, 230].map(y => (
            <line key={`h${y}`} x1="15" y1={y} x2="375" y2={y}
              stroke="rgba(255,255,255,0.022)" strokeWidth="0.8" strokeDasharray="5,8" />
          ))}
          {[70, 140, 210, 280, 350].map(x => (
            <line key={`v${x}`} x1={x} y1="15" x2={x} y2="265"
              stroke="rgba(255,255,255,0.022)" strokeWidth="0.8" strokeDasharray="5,8" />
          ))}

          {/* Saudi Arabia country fill */}
          <polygon
            points={SA_OUTLINE}
            fill="rgba(37,99,235,0.055)"
            stroke="none"
          />

          {/* Saudi Arabia border */}
          <polygon
            points={SA_OUTLINE}
            fill="none"
            stroke="rgba(37,99,235,0.28)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Faint connection lines between major regions */}
          {[
            [218, 129, 103, 182],  // Riyadh ↔ Makkah
            [218, 129, 273, 101],  // Riyadh ↔ Eastern
            [218, 129, 172, 103],  // Riyadh ↔ Qassim
            [100, 132, 103, 182],  // Madinah ↔ Makkah
            [172, 103, 136, 83],   // Qassim ↔ Hail
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3,5" />
          ))}

          {/* Region bubbles */}
          {ALL_REGIONS.map(r => {
            const rad   = bubbleRadius(r.athletes);
            const isHov = hovered === r.name;
            return (
              <g
                key={r.name}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(r.name)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Outer glow ring */}
                <circle cx={r.x} cy={r.y} r={rad + 5}
                  fill={r.color}
                  opacity={isHov ? 0.22 : 0.08}
                  style={{ transition: 'opacity 0.2s' }}
                />
                {/* Main bubble */}
                <circle cx={r.x} cy={r.y} r={rad}
                  fill={r.color}
                  opacity={isHov ? 0.90 : 0.62}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="0.8"
                  style={{ transition: 'opacity 0.15s, r 0.15s' }}
                  filter={isHov ? 'url(#softGlow)' : undefined}
                />
                {/* Specular highlight */}
                <circle
                  cx={r.x - rad * 0.28}
                  cy={r.y - rad * 0.28}
                  r={rad * 0.28}
                  fill="white"
                  opacity={isHov ? 0.20 : 0.12}
                />
                {/* Label — only for primary regions or hovered */}
                {(r.primary || isHov) && (
                  <text
                    x={r.x} y={r.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={r.athletes >= 15000 ? 8 : 7}
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {lang === 'ar'
                      ? r.nameAr.split(' ')[0]
                      : r.name.split(' ')[0]}
                  </text>
                )}
              </g>
            );
          })}

          {/* Compass — top right */}
          <g transform="translate(358, 32)">
            <circle cx="0" cy="0" r="13"
              fill="rgba(15,31,58,0.7)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.8"
            />
            <line x1="0" y1="-9" x2="0" y2="9"
              stroke="rgba(255,255,255,0.20)" strokeWidth="0.8" />
            <line x1="-9" y1="0" x2="9" y2="0"
              stroke="rgba(255,255,255,0.20)" strokeWidth="0.8" />
            <text x="0" y="-5"
              textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.45)" fontSize="7"
              fontFamily="Inter, sans-serif" fontWeight="700">
              N
            </text>
          </g>

          {/* Scale bar */}
          <g transform="translate(20, 262)">
            <line x1="0" y1="0" x2="36" y2="0"
              stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
            <line x1="0" y1="-3" x2="0" y2="3"
              stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
            <line x1="36" y1="-3" x2="36" y2="3"
              stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
            <text x="18" y="-6"
              textAnchor="middle"
              fill="rgba(255,255,255,0.25)" fontSize="7"
              fontFamily="Inter, sans-serif">
              ~500 km
            </text>
          </g>
        </svg>

        {/* Hover tooltip */}
        {hoveredRegion && (
          <div className="absolute top-3 left-3 glass rounded-xl px-3 py-2.5 border border-white/12 pointer-events-none z-10"
            style={{ boxShadow: `0 0 20px ${hoveredRegion.color}25` }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: hoveredRegion.color }} />
              <span className="text-white font-semibold text-sm">
                {lang === 'ar' ? hoveredRegion.nameAr : hoveredRegion.name}
              </span>
            </div>
            <div className="font-black text-xl leading-none" style={{ color: hoveredRegion.color }}>
              {hoveredRegion.athletes.toLocaleString()}
            </div>
            <div className="text-white/40 text-xs mt-0.5">
              {lang === 'ar' ? 'رياضي مسجل' : 'registered athletes'}
            </div>
            <div className="text-white/25 text-[10px] mt-1">
              {Math.round((hoveredRegion.athletes / ALL_REGIONS.reduce((s, r) => s + r.athletes, 0)) * 100)}%{' '}
              {lang === 'ar' ? 'من الإجمالي' : 'of national total'}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4 text-[11px] text-white/30">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#007ABA] opacity-70" />
            <span>{lang === 'ar' ? 'أعلى مشاركة' : 'Highest'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white opacity-35" />
            <span>{lang === 'ar' ? 'أقل مشاركة' : 'Lowest'}</span>
          </div>
        </div>
        <span className="text-[11px] text-white/20">
          {lang === 'ar' ? 'حرّك الفأرة للتفاصيل' : 'Hover for details'}
        </span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function RegionsPage() {
  const { lang } = useLang();
  const maxAthletes = Math.max(...kpi.regionBreakdown.map(r => r.athletes));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-white">{t('regionalBreakdown', lang)}</h1>
        <p className="text-white/40 text-sm mt-1">{t('provincesDesc', lang)}</p>
      </div>

      {/* Saudi Arabia Map */}
      <SaudiMap lang={lang} />

      {/* Region cards (detail view) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpi.regionBreakdown.map(r => {
          const pct = Math.round((r.athletes / maxAthletes) * 100);
          const region = ALL_REGIONS.find(ar => ar.name === r.region);
          const color  = region?.color ?? '#00DCC8';
          return (
            <div key={r.region} className="sport-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="text-white font-bold">{r.region}</div>
                  </div>
                  <div className="text-white/40 text-xs mt-0.5 pl-4">{r.facilities} {t('facilities', lang)}</div>
                </div>
                <div className="font-black text-xl" style={{ color }}>{r.athletes.toLocaleString()}</div>
              </div>
              <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}bb, ${color})`,
                }} />
              </div>
              <div className="flex justify-between text-xs text-white/30">
                <span>{r.sessions.toLocaleString()} {t('sessions', lang)}</span>
                <span>{Math.round(r.sessions / r.athletes)} {t('sessPerAthlete', lang)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
