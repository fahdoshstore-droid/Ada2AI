'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

interface NavItem { label: string; path: string; icon: string }

interface NavBarProps {
  items: NavItem[];
  title: string;
  subtitle: string;
  accentColor?: string;
}

/* ── ada2ai "A" Logo Mark ── */
function Ada2aiMark({ size = 32 }: { size?: number }) {
  const r = Math.round(size * 0.22);
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="40" height="40" rx={r * 40 / size} fill="url(#logoGrad)" />
      <text
        x="20" y="28"
        textAnchor="middle"
        fontFamily="'Orbitron', monospace"
        fontWeight="900"
        fontSize="22"
        fill="white"
        letterSpacing="-1"
      >A</text>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#007ABA" />
          <stop offset="100%" stopColor="#00DCC8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function NavBar({ items, title, subtitle, accentColor = 'text-[#00DCC8]' }: NavBarProps) {
  const pathname = usePathname();
  const { lang, toggleLang } = useLang();

  return (
    <header className="border-b border-white/5 sticky top-0 z-40 bg-[#000A0F]/92 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Ada2aiMark size={34} />
          <div>
            <div className="font-bold text-white text-sm leading-tight font-orbitron">{title}</div>
            <div className={`text-xs ${accentColor}`}>{subtitle}</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {items.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                pathname === item.path
                  ? 'bg-[#007ABA]/20 text-white font-medium border border-[#007ABA]/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#00DCC8]/30 text-xs transition-all font-medium"
            title="Toggle language"
          >
            <span>🌐</span>
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
          <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            {t('exit', lang)}
          </Link>
        </div>
      </div>
    </header>
  );
}
