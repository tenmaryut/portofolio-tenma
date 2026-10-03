// Menyalin cuplikan animasi situs demo (WebM dari docs/animasi/ proyek masing-masing, hanya dibaca)
// ke public/video/, membuat poster WebP dari frame terakhirnya lewat Chromium, lalu mencatat
// metadatanya di src/data/videos.ts. Jalankan setelah putaran animasi proyek demo selesai:
//
//   npm run import:videos
import { chromium } from '@playwright/test';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

/** Rekaman yang dipakai tiap studi kasus (nama file di docs/animasi/ proyeknya). */
const sources = [
  { slug: 'company-profile-hukum', file: '01-hero-beranda.webm' },
  { slug: 'toko-online-umkm', file: '01-tambah-keranjang.webm' },
];

const projectsDir = resolve(process.cwd(), '..');
mkdirSync('public/video', { recursive: true });
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
const browser = await chromium.launch();
const entries = {};

for (const { slug, file } of sources) {
  const source = resolve(projectsDir, slug, 'docs', 'animasi', file);
  if (!file || !existsSync(source)) {
    console.log(`Lewati ${slug}: rekaman belum ada (${source})`);
    continue;
  }
  const target = `public/video/${slug}.webm`;
  copyFileSync(source, target);

  // Putar videonya di Chromium untuk membaca ukuran dan durasi, lalu potret frame terakhir sebagai poster.
  const page = await browser.newPage();
  await page.goto(`file://${resolve(target)}`);
  const video = page.locator('video');
  const meta = await video.evaluate(async (el) => {
    el.muted = true;
    if (el.readyState < 1) await new Promise((r) => el.addEventListener('loadedmetadata', r, { once: true }));
    el.currentTime = Math.max(0, el.duration - 0.15);
    await new Promise((r) => el.addEventListener('seeked', r, { once: true }));
    return { width: el.videoWidth, height: el.videoHeight, duration: el.duration };
  });
  await page.setViewportSize({ width: meta.width, height: meta.height });
  await video.evaluate((el) => {
    el.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;object-fit:contain;background:#fff';
    el.controls = false;
  });
  const png = await page.screenshot();
  await page.close();
  await sharp(png).webp({ quality: 78 }).toFile(`public/video/${slug}-poster.webp`);

  entries[slug] = {
    src: `/video/${slug}.webm`,
    poster: `/video/${slug}-poster.webp`,
    width: meta.width,
    height: meta.height,
    durationSeconds: Math.round(meta.duration * 10) / 10,
    sourceFile: `docs/animasi/${file}`,
    importedOn: today,
  };
  console.log(`Disalin: ${target} (${meta.width}×${meta.height}, ${meta.duration.toFixed(1)} detik) + poster`);
}
await browser.close();

const body = JSON.stringify(entries, null, 2).replace(/"([a-zA-Z-]+)":/g, (_, key) => (/-/.test(key) ? `'${key}':` : `${key}:`)).replace(/"/g, "'");
writeFileSync(
  'src/data/videos.ts',
  `import type { ProjectSlug } from '../i18n/routes';

export interface ProjectVideo {
  src: string;
  poster: string;
  width: number;
  height: number;
  durationSeconds: number;
  /** Asal rekaman di repo proyek demo. */
  sourceFile: string;
  importedOn: string;
}

// Cuplikan animasi situs demo. Diperbarui otomatis oleh scripts/import-demo-videos.mjs.
export const videos: Partial<Record<ProjectSlug, ProjectVideo>> = ${body};
`,
);
console.log('Metadata dicatat di src/data/videos.ts');
