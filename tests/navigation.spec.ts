import { expect, test } from '@playwright/test';
import { projects } from '../src/data/projects';
import { caseStudyPaths, locales, routes, type RouteKey } from '../src/i18n/routes';
import { ui } from '../src/i18n/ui';
import { openMenuIfCollapsed } from './helpers';

const navKeys: RouteKey[] = ['projects', 'services', 'about', 'contact'];

for (const locale of locales) {
  const t = ui[locale];

  test(`navigasi utama membuka setiap halaman (${locale})`, async ({ page }) => {
    await page.goto(routes.home[locale]);
    const nav = page.getByRole('navigation', { name: t.nav.label });

    for (const key of navKeys) {
      await openMenuIfCollapsed(page);
      await nav.getByRole('link', { name: t.nav[key], exact: true }).click();
      await page.waitForURL((url) => url.pathname === routes[key][locale]);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      await openMenuIfCollapsed(page);
      await expect(nav.getByRole('link', { name: t.nav[key], exact: true })).toHaveAttribute('aria-current', 'page');
    }

    await page.getByRole('banner').getByRole('link', { name: /^Tenma/ }).click();
    await page.waitForURL((url) => url.pathname === routes.home[locale]);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test(`navigasi bawah menautkan semua halaman (${locale})`, async ({ page }) => {
    await page.goto(routes.about[locale]);
    const footerNav = page.getByRole('navigation', { name: locale === 'id' ? 'Navigasi bawah' : 'Footer navigation' });
    for (const key of ['home', ...navKeys] as RouteKey[]) {
      await expect(footerNav.getByRole('link', { name: t.nav[key], exact: true })).toHaveAttribute('href', routes[key][locale]);
    }
  });

  test(`kartu proyek → studi kasus → proyek berikutnya (${locale})`, async ({ page }) => {
    const [first, second] = projects;
    await page.goto(routes.projects[locale]);
    await page.getByRole('heading', { level: 2, name: first!.name[locale] }).getByRole('link').click();
    await page.waitForURL((url) => url.pathname === caseStudyPaths(first!.slug)[locale]);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(first!.name[locale]);

    await page.getByRole('link', { name: new RegExp(second!.name[locale].replace(/[+]/g, '\\+')) }).last().click();
    await page.waitForURL((url) => url.pathname === caseStudyPaths(second!.slug)[locale]);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(second!.name[locale]);

    await page.getByRole('link', { name: locale === 'id' ? 'Kembali ke semua proyek' : 'Back to all projects' }).click();
    await page.waitForURL((url) => url.pathname === routes.projects[locale]);
  });
}

test('tautan "langsung ke konten" memindahkan fokus ke konten utama', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: ui.id.skipLink });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#konten')).toBeFocused();
});

test('menu di layar kecil bisa dibuka dan ditutup', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Menu lipat hanya ada di layar kecil');
  await page.goto('/');
  // Namanya berubah (Buka/Tutup menu), jadi tombol dicari lewat aria-controls.
  const toggle = page.locator('button[aria-controls="site-nav"]');
  const nav = page.locator('#site-nav');

  await expect(toggle).toHaveAccessibleName(ui.id.nav.openMenu);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAccessibleName(ui.id.nav.closeMenu);
  await expect(nav).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('di layar lebar navigasi selalu tampil tanpa tombol menu', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Khusus layar lebar');
  await page.goto('/');
  await expect(page.locator('.menu-toggle')).toBeHidden();
  await expect(page.locator('#site-nav')).toBeVisible();
});
