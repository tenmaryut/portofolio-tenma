import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { HUKUM_URL, TOKO_URL } from '../src/config/domain';
import { projects } from '../src/data/projects';
import { caseStudyPaths } from '../src/i18n/routes';
import { notFoundPages } from './helpers';

// Kesiapan repo publik: alamat staging (memuat IP server) tidak boleh tampil sebagai teks terlihat.
// HTML tiap halaman diurai dengan DOMParser; isi <head>, <script>, <style>, dan <template> diabaikan,
// sedangkan teks dan atribut yang bisa terlihat (alt, title, aria-label, placeholder, value) diperiksa.

const denylistPath = process.env.DENYLIST ?? join(homedir(), '.config', 'git', 'denylist-publik');
const denylist = existsSync(denylistPath)
  ? readFileSync(denylistPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((pattern) => new RegExp(pattern, 'i'))
  : [];
const octet = '(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)';
const forbidden = [
  ...denylist,
  // Pola umum, ditulis tanpa alamat sungguhan supaya file ini sendiri lolos denylist.
  new RegExp(`\\b${octet}([.-])${octet}\\1${octet}\\1${octet}\\b`),
  new RegExp(['ss', 'lip'].join(''), 'i'),
];

async function visibleTexts(page: Page, html: string): Promise<string[]> {
  return page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const skip = new Set(['SCRIPT', 'STYLE', 'TEMPLATE']);
    const out: string[] = [];
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) out.push(text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as Element;
      if (skip.has(element.tagName)) return;
      for (const attribute of ['alt', 'title', 'aria-label', 'placeholder', 'value']) {
        const value = element.getAttribute(attribute);
        if (value) out.push(value);
      }
      element.childNodes.forEach(walk);
    };
    walk(doc.body);
    return out;
  }, html);
}

const offending = (texts: string[]) => texts.filter((text) => forbidden.some((pattern) => pattern.test(text)));

test.beforeAll(() => {
  expect(denylist.length, `denylist ${denylistPath}`).toBeGreaterThan(0);
});

test('pemeriksa benar-benar menangkap alamat staging (kontrol positif)', async ({ page }) => {
  const planted = `demo.${['ss', 'lip'].join('')}.io dan 10-0-0-1`;
  const texts = await visibleTexts(
    page,
    `<html><head><title>${planted}</title></head><body><p>aman</p><a href="https://x">${planted}</a><script>"${planted}"</script></body></html>`,
  );
  expect(offending(texts)).toEqual([planted]);
});

test('tidak ada IP server atau alamat staging sebagai teks terlihat di halaman mana pun', async ({ page, request }) => {
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]!).pathname);
  expect(paths.length).toBe(14);

  const problems: string[] = [];
  for (const path of [...paths, notFoundPages.id, notFoundPages.en]) {
    const html = await (await request.get(path)).text();
    for (const text of offending(await visibleTexts(page, html))) problems.push(`${path}: "${text.slice(0, 80)}"`);
  }
  expect(problems).toEqual([]);
});

test('kartu proyek dan studi kasus menautkan repo GitHub publik situs demo', async ({ page }) => {
  const expected = {
    'company-profile-hukum': 'https://github.com/tenmaryut/company-profile-hukum',
    'toko-online-umkm': 'https://github.com/tenmaryut/toko-online-umkm',
  };
  for (const locale of ['id', 'en'] as const) {
    await page.goto(locale === 'id' ? '/proyek/' : '/en/projects/');
    const cardLinks = page.locator('.project-card [data-source-link]');
    await expect(cardLinks).toHaveCount(projects.length);
    for (const project of projects) {
      await expect(page.locator(`.project-card [data-source-link][href="${expected[project.slug]}"]`)).toHaveCount(1);
      await page.goto(caseStudyPaths(project.slug)[locale]);
      await expect(page.locator('dl [data-source-link]')).toHaveAttribute('href', expected[project.slug]);
      await page.goto(locale === 'id' ? '/proyek/' : '/en/projects/');
    }
  }
  // Repo portofolio ini sendiri belum publik, jadi belum boleh ditautkan.
  await page.goto('/');
  await expect(page.locator('a[href*="github.com/tenmaryut/portofolio-tenma"]')).toHaveCount(0);
});

test('tautan demo tetap menuju HUKUM_URL dan TOKO_URL dengan label deskriptif', async ({ page }) => {
  for (const project of projects) {
    await page.goto(caseStudyPaths(project.slug).id);
    // Teks tambahan untuk pembaca layar ada di span sr-only, jadi Chromium bisa menyisipkan spasi sebelum titik dua.
    const link = page.getByRole('link', { name: new RegExp(`^Lihat demo langsung\\s*:\\s*${project.demoBrand}`) });
    await expect(link).toHaveAttribute('href', `${project.slug === 'company-profile-hukum' ? HUKUM_URL : TOKO_URL}/`);
  }
});
