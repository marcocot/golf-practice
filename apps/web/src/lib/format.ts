import type { Language } from '@/i18n/translations';

const LOCALES: Record<Language, string> = { en: 'en-US', it: 'it-IT' };

export function localeFor(language: Language): string {
  return LOCALES[language];
}

export function formatDate(value: string | Date, language: Language): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(localeFor(language), { dateStyle: 'medium' }).format(date);
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(localeFor(language)).format(value);
}

export function formatMeters(value: number, language: Language): string {
  return new Intl.NumberFormat(localeFor(language), {
    style: 'unit',
    unit: 'meter',
    unitDisplay: 'short',
  }).format(value);
}
