'use client';
import NavBar from '@/components/NavBar';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

export default function MinistryLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const navItems = [
    { label: t('dashboard', lang),         path: '/ministry',         icon: '🏛️' },
    { label: t('regions', lang),           path: '/ministry/regions', icon: '🗺️' },
    { label: t('sportsDisciplines', lang), path: '/ministry/sports',  icon: '⚽' },
  ];
  return (
    <div className="min-h-screen bg-[#000A0F]">
      <NavBar
        items={navItems}
        title={`ada2ai · ${lang === 'ar' ? 'مسؤول الوزارة' : 'Ministry Official'}`}
        subtitle={lang === 'ar' ? 'لوحة التحكم الوطنية' : 'National Dashboard'}
        accentColor="text-purple-400"
      />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
