// Mengambil screenshot asli situs demo (hukum dan toko) untuk kartu proyek dan studi kasus.
// Hasil: src/assets/projects/<slug>-desktop.png (1440×900) dan <slug>-mobile.png (390×844, 2x),
// lalu tanggalnya dicatat di src/data/captures.ts. Situs harus sudah live (HTTP 200).
//
//   npm run capture:projects
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { HUKUM_URL, TOKO_URL } from '../src/config/domain.ts';

const projects = [
  { slug: 'company-profile-hukum', url: `${HUKUM_URL}/` },
  { slug: 'toko-online-umkm', url: `${TOKO_URL}/` },
];
const variants = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true },
];

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
mkdirSync('src/assets/projects', { recursive: true });
const browser = await chromium.launch();
const captured = {};

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
export const captures: Partial<Record<ProjectSlug, string>> = ${JSON.stringify(captured, null, 2).replace(/"([a-z-]+)":/g, "'$1':").replace(/"/g, "'")};
`,
);
console.log(`Tanggal pengambilan (${today}) dicatat di src/data/captures.ts`);
