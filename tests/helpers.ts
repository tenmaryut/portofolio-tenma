import type { Page } from '@playwright/test';
import { PORTOFOLIO_URL } from '../src/config/domain';
import { allPagePairs, localeFromPath, type Locale } from '../src/i18n/routes';

/** Origin produksi dari domain.env; URL absolut di HTML (canonical, hreflang, og) memakai origin ini. */
export const PROD_ORIGIN = PORTOFOLIO_URL;

/** Semua halaman yang masuk sitemap, ID dan EN. */
export const pagePairs = allPagePairs();
export const allPages = pagePairs.flatMap((pair) => [pair.id, pair.en]);

/** Halaman 404 khusus. Versi EN dilayani Caddy untuk path /en/* yang tidak ada. */
export const notFoundPages: Record<Locale, string> = { id: '/404.html', en: '/en/404/' };

export const isProduction = (baseURL: string | undefined) => !!baseURL && new URL(baseURL).origin === PROD_ORIGIN;

export { localeFromPath };

/** Di layar kecil menu dilipat; buka dulu kalau tombolnya tampil. */
export async function openMenuIfCollapsed(page: Page) {
  const toggle = page.locator('.menu-toggle');
  if ((await toggle.isVisible()) && (await toggle.getAttribute('aria-expanded')) !== 'true') {
    await toggle.click();
  }
}

/** Kumpulkan error/peringatan console, error JavaScript, dan pelanggaran CSP. */
export function trackConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

/** Ubah URL produksi menjadi URL di server yang sedang diuji (preview lokal atau live). */
export function toTestedOrigin(url: URL, baseURL: string): URL {
  const result = new URL(url.href);
  if (result.origin === PROD_ORIGIN) {
    const base = new URL(baseURL);
    result.protocol = base.protocol;
    result.host = base.host;
  }
  return result;
}
