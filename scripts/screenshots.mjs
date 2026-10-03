// Screenshot seluruh halaman (ID dan EN) di 360, 768, dan 1440 px sebagai bukti tampilan responsif,
// plus mode gelap untuk beberapa halaman. Hasilnya di docs/screenshots/<bahasa>/.
//
//   npm run screenshots                     → situs live
//   BASE_URL=http://127.0.0.1:4321 npm run screenshots   → hasil `npm run preview`
import { chromium } from '@playwright/test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PORTOFOLIO_URL } from '../src/config/domain.ts';

const base = (process.env.BASE_URL ?? PORTOFOLIO_URL).replace(/\/$/, '');
const outDir = 'docs/screenshots';
const widths = [360, 768, 1440];
const darkPages = ['/', '/en/', '/proyek/company-profile-hukum/', '/en/projects/company-profile-hukum/'];
const darkWidths = [360, 1440];

const sitemap = await (await fetch(`${base}/sitemap-0.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
paths.push('/404.html', '/en/404/');

/** "/en/projects/toko-online-umkm/" → { lang: "en", name: "projects-toko-online-umkm" } */
function describe(path) {
  const lang = path === '/en/' || path.startsWith('/en/') ? 'en' : 'id';
  const rest = path.replace(/^\/en\//, '/').replace(/\.html$/, '').replace(/^\/|\/$/g, '').replace(/\//g, '-');
  return { lang, name: rest || (lang === 'id' ? 'beranda' : 'home') };
}

rmSync(outDir, { recursive: true, force: true });
const browser = await chromium.launch();
const index = [];

async function capture(path, width, scheme) {
  // Reduced motion: tata letak direkam dalam keadaan akhir (animasinya didokumentasikan di docs/animasi/).
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: scheme,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const { lang, name } = describe(path);
  const file = join(lang, `${name}-${width}${scheme === 'dark' ? '-gelap' : ''}.jpg`);
  mkdirSync(join(outDir, lang), { recursive: true });
  await page.screenshot({ path: join(outDir, file), fullPage: true, type: 'jpeg', quality: 70 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await context.close();
  if (overflow > 0) throw new Error(`${path} melebar ${overflow}px di ${width}px`);
  index.push({ path, width, scheme, file });
}

for (const path of paths) {
  for (const width of widths) await capture(path, width, 'light');
}
for (const path of darkPages) {
  for (const width of darkWidths) await capture(path, width, 'dark');
}
await browser.close();

const rows = index.map((s) => `| \`${s.path}\` | ${s.width} px | ${s.scheme === 'dark' ? 'gelap' : 'terang'} | [${s.file}](${s.file}) |`);
writeFileSync(
  join(outDir, 'README.md'),
  [
    '# Screenshot halaman',
    '',
    `Diambil otomatis dengan Playwright (Chromium, reduced motion agar animasi langsung di keadaan akhir) dari ${base === PORTOFOLIO_URL ? 'situs live (`PORTOFOLIO_URL` di domain.env)' : 'preview lokal'} pada ${new Date().toISOString().slice(0, 10)}, halaman penuh, JPEG kualitas 70.`,
    'Buat ulang dengan `npm run screenshots`. Skrip gagal kalau ada halaman yang memunculkan scroll horizontal.',
    '',
    '| Halaman | Lebar | Mode | File |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n'),
);
console.log(`${index.length} screenshot disimpan di ${outDir}/`);
