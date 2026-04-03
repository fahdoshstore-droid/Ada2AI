import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Lang } from './i18n';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({ lang: 'en', toggleLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('sportid-lang') as Lang | null;
    if (saved === 'ar' || saved === 'en') setLang(saved);
  }, []);

  const toggleLang = () => {
    setLang(prev => {
      const next: Lang = prev === 'en' ? 'ar' : 'en';
      localStorage.setItem('sportid-lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} className="contents">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
