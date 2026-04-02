'use client';
import NavBar from '@/components/NavBar';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

export default function AthleteLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const navItems = [
    { label: t('passport', lang),    path: '/athlete',         icon: '🪪' },
    { label: t('sportPoints', lang), path: '/athlete/points',  icon: '⭐' },
    { label: t('history', lang),     path: '/athlete/history', icon: '📋' },
    { label: t('career', lang),      path: '/athlete/career',  icon: '🚀' },
  ];
  return (
    <div className="min-h-screen bg-[#000A0F]">
      <NavBar
        items={navItems}
        title={`ada2ai · ${lang === 'ar' ? 'الجواز الرياضي الرقمي' : 'Sport Passport ID'}`}
        subtitle={lang === 'ar' ? 'الجواز الرقمي' : 'Digital Passport'}
        accentColor="text-[#00DCC8]"
      />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
