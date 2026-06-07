import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  type Language,
  LANGUAGES,
  type TranslationKey,
  translations,
} from '@/i18n/translations';
import { formatDate, formatMeters, formatNumber } from '@/lib/format';

const STORAGE_KEY = 'golf.lang';

function readLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return LANGUAGES.find((language) => language === stored) ?? DEFAULT_LANGUAGE;
}

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  formatDate: (value: string | Date) => string;
  formatNumber: (value: number) => string;
  formatMeters: (value: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readLanguage);

  const setLanguage = useCallback((next: Language) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLanguageState(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language][key],
      formatDate: (input) => formatDate(input, language),
      formatNumber: (input) => formatNumber(input, language),
      formatMeters: (input) => formatMeters(input, language),
    }),
    [language, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
