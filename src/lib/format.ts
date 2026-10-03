import type { Locale } from '../i18n/routes';

const intlLocale: Record<Locale, string> = { id: 'id-ID', en: 'en-US' };

/** "2026-10-03" → "3 Oktober 2026" / "October 3, 2026". */
export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(value);
}
