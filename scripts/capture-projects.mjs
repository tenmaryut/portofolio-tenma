// Mengambil screenshot asli produk live (TakarLaba, PasalBaru) dan situs demo (hukum, toko) untuk kartu
// proyek dan studi kasus.
// Hasil: src/assets/projects/<slug>-desktop.png (1440×900) dan <slug>-mobile.png (390×844, 2x),
// lalu tanggalnya dicatat di src/data/captures.ts. Situs harus sudah live (HTTP 200).
//
//   npm run capture:projects              → semua proyek
//   npm run capture:projects -- takarlaba → hanya slug tertentu; tanggal proyek lain tetap
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { HUKUM_URL, PASALBARU_URL, TAKARLABA_URL, TOKO_URL } from '../src/config/domain.ts';

const allProjects = [
  { slug: 'takarlaba', url: `${TAKARLABA_URL}/` },
  { slug: 'pasalbaru', url: `${PASALBARU_URL}/` },
  { slug: 'company-profile-hukum', url: `${HUKUM_URL}/` },
  { slug: 'toko-online-umkm', url: `${TOKO_URL}/` },
];
const only = process.argv.slice(2);
const projects = only.length ? allProjects.filter((project) => only.includes(project.slug)) : allProjects;
if (projects.length !== (only.length || allProjects.length)) throw new Error(`Slug tidak dikenal: ${only.join(', ')}`);
const variants = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true },
];

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
mkdirSync('src/assets/projects', { recursive: true });
const browser = await chromium.launch();
// Tanggal proyek yang tidak diambil ulang tetap dipertahankan.
const captured = Object.fromEntries(
  [...readFileSync('src/data/captures.ts', 'utf8').matchAll(/'([a-z-]+)': '(\d{4}-\d{2}-\d{2})'/g)].map((m) => [m[1], m[2]]),
);

for (const project of projects) {
  for (const variant of variants) {
    const context = await browser.newContext({
      viewport: variant.viewport,
      deviceScaleFactor: variant.deviceScaleFactor,
      isMobile: variant.isMobile,
      hasTouch: variant.isMobile,
      colorScheme: 'light',
      // Situs demo kini beranimasi; reduced motion membuat screenshot langsung menangkap keadaan akhir.
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const response = await page.goto(project.url, { waitUntil: 'networkidle' });
    if (response?.status() !== 200) {
      throw new Error(`${project.url} belum live (HTTP ${response?.status()}); screenshot dibatalkan`);
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const file = `src/assets/projects/${project.slug}-${variant.name}.png`;
    await page.screenshot({ path: file });
    console.log(`Disimpan: ${file}`);
    await context.close();
  }
  captured[project.slug] = today;
}
await browser.close();

writeFileSync(
  'src/data/captures.ts',
  `import type { ProjectSlug } from '../i18n/routes';

// Tanggal pengambilan screenshot situs live (YYYY-MM-DD).
// Diperbarui otomatis oleh scripts/capture-projects.mjs.
export const captures: Partial<Record<ProjectSlug, string>> = ${JSON.stringify(Object.fromEntries(allProjects.filter((p) => captured[p.slug]).map((p) => [p.slug, captured[p.slug]])), null, 2).replace(/"([a-z-]+)":/g, "'$1':").replace(/"/g, "'")};
`,
);
console.log(`Tanggal pengambilan (${today}) dicatat di src/data/captures.ts`);
