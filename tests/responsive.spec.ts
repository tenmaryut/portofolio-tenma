import { expect, test } from '@playwright/test';
import { allPages, notFoundPages } from './helpers';

// Bukti visualnya ada di docs/screenshots/ (npm run screenshots). Test ini memastikan
// tidak ada halaman yang memunculkan scroll horizontal di lebar 360–1440 px.
const widths = [360, 390, 768, 1024, 1280, 1440];

for (const path of [...allPages, notFoundPages.id, notFoundPages.en]) {
  test(`tanpa scroll horizontal di 360–1440 px: ${path}`, async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect.soft(overflow, `lebar ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

test('tombol menu hanya muncul di bawah 768 px', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 767, height: 900 });
  await expect(page.locator('.menu-toggle')).toBeVisible();
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(page.locator('.menu-toggle')).toBeHidden();
  await expect(page.locator('#site-nav')).toBeVisible();
});
