import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { getMessages, type Locale, type Messages } from '../i18n';

interface LocaleContextValue {
  locale: Locale;
  toggleLocale: () => void;
  t: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem('textdiff-locale');
    if (stored === 'en' || stored === 'zh') return stored;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  });

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === 'en' ? 'zh' : 'en';
      localStorage.setItem('textdiff-locale', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useMemo(() => getMessages(locale), [locale]);
  const value = useMemo(() => ({ locale, toggleLocale, t }), [locale, toggleLocale, t]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
