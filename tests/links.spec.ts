import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { allPages, notFoundPages, toTestedOrigin } from './helpers';

// Menjelajahi semua halaman dan memeriksa setiap tautan serta aset yang dirujuk:
// <a>, <link>, <img>/<source> (termasuk srcset), <script src>, dan meta og:image/og:url.

interface Reference {
  from: string;
  kind: string;
  url: string;
}

async function collectReferences(page: Page, paths: string[]): Promise<Reference[]> {
  const references: Reference[] = [];
  for (const path of paths) {
    await page.goto(path);
    const found = await page.evaluate(() => {
      const out: { kind: string; url: string }[] = [];
      const add = (kind: string, url: string | null) => out.push({ kind, url: url ?? '' });
      document.querySelectorAll('a').forEach((el) => add('a', el.getAttribute('href')));
      document.querySelectorAll('link[href]').forEach((el) => add(`link[${el.getAttribute('rel')}]`, el.getAttribute('href')));
      document
        .querySelectorAll('img[src], script[src], video[src], source[src]')
        .forEach((el) => add(el.tagName.toLowerCase(), el.getAttribute('src')));
      document.querySelectorAll('video[poster]').forEach((el) => add('video[poster]', el.getAttribute('poster')));
      document.querySelectorAll('img[srcset], source[srcset]').forEach((el) =>
        el
          .getAttribute('srcset')!
          .split(',')
          .forEach((candidate) => add('srcset', candidate.trim().split(/\s+/)[0] ?? '')),
      );
      document
        .querySelectorAll('meta[property="og:image"], meta[property="og:url"]')
        .forEach((el) => add(`meta[${el.getAttribute('property')}]`, el.getAttribute('content')));
      return out;
    });
    references.push(...found.map((ref) => ({ ...ref, from: path })));
  }
  return references;
}

async function statusOf(request: APIRequestContext, cache: Map<string, number>, url: string, follow: boolean) {
  if (!cache.has(url)) {
    let status = 0;
    for (let attempt = 0; attempt < 2 && (status === 0 || status === 429 || status >= 500); attempt++) {
      try {
        const response = await request.get(url, { maxRedirects: follow ? 5 : 0, timeout: 20_000 });
        status = response.status();
      } catch {
        status = 0;
      }
    }
    cache.set(url, status);
  }
  return cache.get(url)!;
}

const pagesToCrawl = [...allPages, notFoundPages.id, notFoundPages.en];

test('semua tautan internal, anchor, dan aset di seluruh halaman valid', async ({ page, request, baseURL }) => {
  test.setTimeout(120_000);
  const references = await collectReferences(page, pagesToCrawl);
  const statuses = new Map<string, number>();
  const anchorTargets = new Map<string, Set<string>>();
  const problems: string[] = [];
  let checked = 0;

  for (const ref of references) {
    if (ref.url === '' || ref.url === '#') {
      problems.push(`${ref.from}: ${ref.kind} tanpa tujuan`);
      continue;
    }
    if (/^(mailto|tel):/.test(ref.url)) continue;

    const url = toTestedOrigin(new URL(ref.url, new URL(ref.from, baseURL)), baseURL!);
    if (url.origin !== new URL(baseURL!).origin) continue; // tautan eksternal: lihat test berikutnya

    const target = new URL(url.href);
    target.hash = '';
    // Tautan internal harus langsung 200 (tanpa redirect), jadi semuanya memakai garis miring akhir yang benar.
    const status = await statusOf(request, statuses, target.href, false);
    checked++;
    if (status !== 200) problems.push(`${ref.from}: ${ref.kind} → ${target.pathname} (HTTP ${status})`);

    if (url.hash) {
      if (!anchorTargets.has(target.pathname)) {
        await page.goto(target.pathname);
        anchorTargets.set(target.pathname, new Set(await page.locator('[id]').evaluateAll((els) => els.map((el) => el.id))));
      }
      const id = decodeURIComponent(url.hash.slice(1));
      if (!anchorTargets.get(target.pathname)!.has(id)) problems.push(`${ref.from}: anchor #${id} tidak ada di ${target.pathname}`);
    }
  }

  expect(problems).toEqual([]);
  expect(checked).toBeGreaterThan(100);
});

test('semua tautan eksternal bisa dibuka', async ({ page, request, baseURL }) => {
  test.skip(!process.env.CHECK_EXTERNAL, 'Jalankan dengan CHECK_EXTERNAL=1 (butuh internet)');
  test.setTimeout(180_000);
  const references = await collectReferences(page, pagesToCrawl);
  const statuses = new Map<string, number>();
  const problems: string[] = [];
  const external = new Map<string, string>();

  for (const ref of references) {
    if (ref.url === '' || /^(mailto|tel|#)/.test(ref.url)) continue;
    const url = toTestedOrigin(new URL(ref.url, new URL(ref.from, baseURL)), baseURL!);
    if (url.origin !== new URL(baseURL!).origin && !external.has(url.href)) external.set(url.href, ref.from);
  }

  for (const [url, from] of external) {
    const status = await statusOf(request, statuses, url, true);
    if (status < 200 || status >= 400) problems.push(`${from}: ${url} (HTTP ${status})`);
  }

  console.log(`Tautan eksternal diperiksa: ${[...external.keys()].join(', ')}`);
  expect(problems).toEqual([]);
  expect(external.size).toBeGreaterThan(0);
});
