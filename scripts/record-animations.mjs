// Merekam animasi utama situs sebagai WebM pendek (Playwright) plus screenshot, ke docs/animasi/.
//
//   npm run record:animations                              → situs live (alamat dari domain.env)
//   BASE_URL=http://127.0.0.1:4321 npm run record:animations → hasil `npm run preview`
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PORTOFOLIO_URL } from '../src/config/domain.ts';

const base = (process.env.BASE_URL ?? PORTOFOLIO_URL).replace(/\/$/, '');
const outDir = 'docs/animasi';
mkdirSync(outDir, { recursive: true });
for (const file of readdirSync(outDir)) {
  if (/\.(webm|png)$/.test(file)) rmSync(join(outDir, file));
}

const browser = await chromium.launch();
const recordings = [];

async function record(name, description, options, steps) {
  const { width = 1280, height = 720, colorScheme = 'light', mobile = false } = options;
  const tmpDir = join(outDir, `.rekam-${name}`);
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme,
    reducedMotion: 'no-preference',
    isMobile: mobile,
    hasTouch: mobile,
    recordVideo: { dir: tmpDir, size: { width, height } },
  });
  const page = await context.newPage();
  await steps(page);
  await page.screenshot({ path: join(outDir, `${name}.png`) });
  const video = page.video();
  await context.close();
  renameSync(await video.path(), join(outDir, `${name}.webm`));
  rmSync(tmpDir, { recursive: true, force: true });
  recordings.push({ name, description, width, height, colorScheme });
  console.log(`Direkam: ${name}.webm`);
}

async function smoothScroll(page, distance, steps = 40) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, distance / steps);
    await page.waitForTimeout(40);
  }
}

await record('hero-beranda', 'Hero beranda: teks muncul bertahap, stabilo tersapu, lalu coretan tinta tergambar.', {}, async (page) => {
  await page.goto(`${base}/`);
  await page.waitForTimeout(2400);
});

await record(
  'hero-ponsel-gelap',
  'Hero versi Inggris di layar ponsel (390 px), mode gelap.',
  { width: 390, height: 844, colorScheme: 'dark', mobile: true },
  async (page) => {
    await page.goto(`${base}/en/`);
    await page.waitForTimeout(2400);
  },
);

await record('scroll-reveal', 'Bagian dan kartu muncul saat di-scroll (CSS scroll-driven animation).', {}, async (page) => {
  await page.goto(`${base}/`);
  await page.waitForTimeout(1600);
  await page.mouse.move(640, 400);
  await smoothScroll(page, 1500, 60);
  await page.waitForTimeout(500);
  await smoothScroll(page, 1300, 50);
  await page.waitForTimeout(700);
});

await record('kartu-proyek', 'Kartu proyek terangkat saat disorot atau difokus, screenshot bergeser ringan.', {}, async (page) => {
  await page.goto(`${base}/proyek/`);
  await page.waitForTimeout(600);
  await smoothScroll(page, 380, 20);
  await page.waitForTimeout(400);
  const cards = page.locator('.project-card');
  await cards.nth(0).hover();
  await page.waitForTimeout(1100);
  await cards.nth(1).hover();
  await page.waitForTimeout(1100);
  await page.mouse.move(640, 40);
  await page.waitForTimeout(600);
  await cards.nth(0).getByRole('link').first().focus();
  await page.waitForTimeout(1100);
});

await record(
  'view-transition',
  'Pindah halaman dengan View Transitions: screenshot kartu berubah menjadi gambar utama studi kasus, lalu kembali.',
  {},
  async (page) => {
    await page.goto(`${base}/proyek/`);
    await page.waitForTimeout(900);
    await page.locator('.project-card').first().getByRole('heading').getByRole('link').click();
    await page.waitForURL(/\/proyek\/company-profile-hukum\/$/);
    await page.waitForTimeout(1500);
    await page.goBack();
    await page.waitForTimeout(1300);
    await page.locator('.project-card').nth(1).getByRole('heading').getByRole('link').click();
    await page.waitForURL(/\/proyek\/toko-online-umkm\/$/);
    await page.waitForTimeout(1500);
  },
);

await record('tema-dan-tautan', 'Micro-interaction: ikon tema berputar, garis bawah tautan tumbuh, panah tombol bergeser.', {}, async (page) => {
  await page.goto(`${base}/`);
  await page.waitForTimeout(1800);
  const toggle = page.locator('[data-theme-toggle]');
  await toggle.click();
  await page.waitForTimeout(900);
  await toggle.click();
  await page.waitForTimeout(900);
  await page.getByRole('link', { name: /^Lihat proyek/ }).hover();
  await page.waitForTimeout(700);
  await smoothScroll(page, 1450, 30);
  await page.waitForTimeout(600);
  await page.getByRole('link', { name: /^Semua proyek/ }).hover();
  await page.waitForTimeout(900);
});

await browser.close();

const rows = recordings.map(
  (r) => `| [${r.name}.webm](${r.name}.webm) | ${r.description} | ${r.width}×${r.height}, ${r.colorScheme === 'dark' ? 'gelap' : 'terang'} | [${r.name}.png](${r.name}.png) |`,
);
writeFileSync(
  join(outDir, 'README.md'),
  [
    '# Rekaman animasi',
    '',
    `Direkam otomatis dengan Playwright (Chromium, reduced motion tidak aktif) dari ${base === PORTOFOLIO_URL ? 'situs live (`PORTOFOLIO_URL` di domain.env)' : 'preview lokal'} pada ${new Date().toISOString().slice(0, 10)}.`,
    'Buat ulang dengan `npm run record:animations`. Screenshot PNG diambil di akhir tiap rekaman.',
    '',
    '| Rekaman | Isi | Ukuran | Screenshot akhir |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n'),
);
console.log(`${recordings.length} rekaman disimpan di ${outDir}/`);
