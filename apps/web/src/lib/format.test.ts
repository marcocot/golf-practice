import { describe, expect, it } from 'vitest';
import { formatDate, formatMeters, formatNumber, localeFor } from '@/lib/format';

describe('format', () => {
  it('maps languages to locales', () => {
    expect(localeFor('en')).toBe('en-US');
    expect(localeFor('it')).toBe('it-IT');
  });

  it('formats numbers per locale', () => {
    expect(formatNumber(12345, 'en')).toBe('12,345');
    expect(formatNumber(12345, 'it')).toBe('12.345');
  });

  it('formats meters with a unit', () => {
    expect(formatMeters(120, 'en')).toContain('m');
    expect(formatMeters(120, 'it')).toContain('m');
  });

  it('formats dates per locale from a string or a Date', () => {
    const en = formatDate('2026-03-09T00:00:00.000Z', 'en');
    const it = formatDate('2026-03-09T00:00:00.000Z', 'it');
    expect(en).toContain('2026');
    expect(it).toContain('2026');
    expect(en).not.toBe(it);
    expect(formatDate(new Date('2026-03-09T00:00:00.000Z'), 'en')).toContain('2026');
  });
});
