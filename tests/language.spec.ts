import { expect, test } from '@playwright/test';
import { ui } from '../src/i18n/ui';
import { notFoundPages, pagePairs, PROD_ORIGIN } from './helpers';

for (const pair of pagePairs) {
  test(`ganti bahasa ${pair.id} ⇄ ${pair.en}`, async ({ page }) => {
    await page.goto(pair.id);
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    const switchId = page.getByRole('group', { name: ui.id.language.label });
    await expect(switchId.locator('[aria-current="true"]')).toContainText('ID');
    await switchId.getByRole('link', { name: 'EN (English)' }).click();
    await page.waitForURL((url) => url.pathname === pair.en);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    const switchEn = page.getByRole('group', { name: ui.en.language.label });
    await expect(switchEn.locator('[aria-current="true"]')).toContainText('EN');
    await switchEn.getByRole('link', { name: 'ID (Indonesia)' }).click();
    await page.waitForURL((url) => url.pathname === pair.id);
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  });

  test(`tag hreflang menautkan pasangan bahasa ${pair.id}`, async ({ page }) => {
    for (const path of [pair.id, pair.en]) {
      await page.goto(path);
      await expect(page.locator('link[rel="alternate"][hreflang="id"]')).toHaveAttribute('href', PROD_ORIGIN + pair.id);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', PROD_ORIGIN + pair.en);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', PROD_ORIGIN + pair.id);
    }
  });
}

test('halaman 404 memakai bahasanya sendiri', async ({ page }) => {
  await page.goto(notFoundPages.id);
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Halaman tidak ditemukan');

  await page.goto(notFoundPages.en);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});
