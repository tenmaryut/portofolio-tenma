import { expect, test } from '@playwright/test';
import { allPages, isProduction, localeFromPath, notFoundPages, PROD_ORIGIN, toTestedOrigin, trackConsole } from './helpers';

/** Lebar dan tinggi dari header IHDR berkas PNG. */
function pngSize(buffer: Buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

for (const path of allPages) {
  test(`meta SEO, Open Graph, dan data terstruktur: ${path}`, async ({ page, request, baseURL }) => {
    const consoleProblems = trackConsole(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);

    const locale = localeFromPath(path);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(70);

    const description = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(description.length).toBeGreaterThanOrEqual(50);
    expect(description.length).toBeLessThanOrEqual(170);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', PROD_ORIGIN + path);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', PROD_ORIGIN + path);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const image = await request.get(toTestedOrigin(new URL(ogImage!), baseURL!).href);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toContain('image/png');
    expect(pngSize(await image.body())).toEqual({ width: 1200, height: 630 });

    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    const person = jsonLd['@graph'].find((node: { '@type': string }) => node['@type'] === 'Person');
    expect(person).toMatchObject({ name: 'Tenma', sameAs: ['https://github.com/tenmaryut'] });
    expect(person).not.toHaveProperty('email');

    expect(consoleProblems).toEqual([]);
  });
}

test('judul dan deskripsi setiap halaman unik', async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of allPages) {
    await page.goto(path);
    titles.add(await page.title());
    descriptions.add((await page.locator('meta[name="description"]').getAttribute('content')) ?? '');
  }
  expect(titles.size).toBe(allPages.length);
  expect(descriptions.size).toBe(allPages.length);
});

test('robots.txt dan sitemap mencantumkan semua halaman dengan pasangan bahasanya', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${PROD_ORIGIN}/sitemap-index.xml`);

  const index = await (await request.get('/sitemap-index.xml')).text();
  expect(index).toContain(`${PROD_ORIGIN}/sitemap-0.xml`);

  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect(locs.sort()).toEqual(allPages.map((path) => PROD_ORIGIN + path).sort());
  expect(sitemap.match(/hreflang="en"/g)?.length).toBe(allPages.length);
  expect(sitemap).not.toContain('404');
});

test('halaman 404 khusus dengan status 404 dan noindex', async ({ request, page, baseURL }) => {
  const missing = await request.get('/halaman-yang-tidak-ada/');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('Halaman tidak ditemukan');

  await page.goto(notFoundPages.id);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  // Caddy memilih 404 versi Inggris untuk path /en/*; preview lokal Astro hanya mengenal 404 utama.
  if (isProduction(baseURL)) {
    const missingEn = await request.get('/en/page-that-does-not-exist/');
    expect(missingEn.status()).toBe(404);
    expect(await missingEn.text()).toContain('Page not found');
  }
});
