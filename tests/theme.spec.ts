import { expect, test } from '@playwright/test';
import { ui } from '../src/i18n/ui';

const bodyBackground = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe('sistem memakai mode terang', () => {
  test.use({ colorScheme: 'light' });

  test('tema awal terang, tombol mengganti ke gelap dan pilihan tersimpan antarhalaman', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: ui.id.theme.toggle });

    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const lightBackground = await bodyBackground(page);

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(await bodyBackground(page)).not.toBe(lightBackground);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.goto('/en/about/');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: ui.en.theme.toggle })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: ui.en.theme.toggle }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(await bodyBackground(page)).toBe(lightBackground);
  });

  test('tema tersimpan sudah diterapkan sebelum <body> dirender (tanpa kedipan)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      const observer = new MutationObserver(() => {
        if (document.body) {
          (window as unknown as { themeAtBody?: string }).themeAtBody = document.documentElement.dataset.theme;
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });
    await page.goto('/proyek/');
    expect(await page.evaluate(() => (window as unknown as { themeAtBody?: string }).themeAtBody)).toBe('dark');
  });
});

test.describe('sistem memakai mode gelap', () => {
  test.use({ colorScheme: 'dark' });

  test('tema awal mengikuti sistem (gelap)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: ui.id.theme.toggle })).toHaveAttribute('aria-pressed', 'true');
  });

  test('pilihan terang pengguna mengalahkan preferensi sistem', async ({ page }) => {
    await page.goto('/kontak/');
    await page.getByRole('button', { name: ui.id.theme.toggle }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.goto('/layanan/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
