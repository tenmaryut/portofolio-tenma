import { expect, test } from '@playwright/test';
import { allPages, isProduction, notFoundPages, PROD_ORIGIN, trackConsole } from './helpers';

// Situs statis di balik proxy https (Tailscale Funnel → Caddy di 127.0.0.1): tidak ada cookie atau
// rate limit yang bergantung pada IP/skema, URL absolut memakai https, redirect relatif, dan tanpa
// mixed content. Bukti tambahan dari server (X-Forwarded-For ke 127.0.0.1:80): scripts/cek-proxy.sh.

const assetPaths = ['/favicon.svg', '/favicon.ico', '/og/id/home.png', '/robots.txt', '/sitemap-index.xml'];

test('tidak ada cookie: tanpa Set-Cookie di semua halaman dan aset, dan tidak ada cookie di browser', async ({ page, request }) => {
  for (const path of [...allPages, notFoundPages.id, notFoundPages.en, ...assetPaths]) {
    const response = await request.get(path);
    expect(response.headersArray().filter((header) => header.name.toLowerCase() === 'set-cookie'), path).toEqual([]);
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Mode gelap' }).click();
  expect(await page.context().cookies()).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe('');
});

test('URL absolut memakai https dari domain.env dan tidak ada mixed content', async ({ page, request }) => {
  expect(PROD_ORIGIN.startsWith('https://')).toBe(true);
  const problems: string[] = [];
  for (const path of [...allPages, notFoundPages.id]) {
    const consoleProblems = trackConsole(page);
    await page.goto(path);
    const insecure = await page.evaluate(() =>
      [...document.querySelectorAll('[href], [src], [srcset], [poster], meta[content]')]
        .flatMap((el) => ['href', 'src', 'srcset', 'poster', 'content'].map((name) => el.getAttribute(name) ?? ''))
        .filter((value) => /(^|[\s,])http:\/\//.test(value)),
    );
    problems.push(...insecure.map((value) => `${path}: ${value}`));
    problems.push(...consoleProblems.filter((message) => /mixed content|insecure/i.test(message)).map((m) => `${path}: ${m}`));
  }
  expect(problems).toEqual([]);

  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].every((match) => match[1]!.startsWith(`${PROD_ORIGIN}/`))).toBe(true);
  expect(await (await request.get('/robots.txt')).text()).toContain(`Sitemap: ${PROD_ORIGIN}/sitemap-index.xml`);
});

test('redirect garis miring akhir relatif, jadi tetap https di balik proxy', async ({ request, baseURL }) => {
  test.skip(!isProduction(baseURL), 'Redirect ini dibuat Caddy; preview lokal Astro tidak melakukannya');
  for (const [from, to] of [
    ['/layanan', '/layanan/'],
    ['/en', '/en/'],
    ['/proyek/toko-online-umkm', '/proyek/toko-online-umkm/'],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    expect(response.headers().location, from).toBe(to);
  }
});
