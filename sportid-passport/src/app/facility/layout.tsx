'use client';
import NavBar from '@/components/NavBar';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

export default function FacilityLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const navItems = [
    { label: t('dashboard', lang), path: '/facility',           icon: '📊' },
    { label: t('checkIn', lang),   path: '/facility/checkin',   icon: '📷' },
    { label: t('analytics', lang), path: '/facility/analytics', icon: '📈' },
  ];
  return (
    <div className="min-h-screen bg-[#000A0F]">
      <NavBar
        items={navItems}
        title={`ada2ai · ${lang === 'ar' ? 'مدير المنشأة' : 'Facility Manager'}`}
        subtitle={lang === 'ar' ? 'بوابة المدير' : 'Facility Portal'}
        accentColor="text-[#007ABA]"
      />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
