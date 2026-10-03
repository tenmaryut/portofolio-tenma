// Audit kesiapan repo publik: memastikan IP server dan alamat staging tidak ada di repo, baik sebagai
// teks maupun di dalam gambar dan video.
//   1. git grep pola denylist di seluruh file terlacak.
//   2. OCR (tesseract) setiap gambar terlacak: PNG, JPG, WebP, AVIF, GIF.
//   3. OCR satu frame per detik dari setiap video terlacak (WebM/MP4).
//   4. OCR screenshot yang tertanam di laporan Lighthouse terlacak.
//   5. OCR gambar Open Graph hasil build (dist/og/), karena ikut dipublikasikan di situs.
// Pola dibaca dari ~/.config/git/denylist-publik (di luar repo); untuk OCR dibuat versi longgar
// (pemisah dan huruf mirip) dari pola yang sama. Ringkasan disimpan di docs/audit-publik.txt.
//
//   npm run audit:publik
import { execFile, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { PORTOFOLIO_URL } from '../src/config/domain.ts';

const run = promisify(execFile);
const denylistPath = process.env.DENYLIST ?? join(homedir(), '.config', 'git', 'denylist-publik');
if (!existsSync(denylistPath)) {
  console.error(`Denylist tidak ditemukan: ${denylistPath}`);
  process.exit(2);
}
const patterns = readFileSync(denylistPath, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);

// Versi longgar untuk teks hasil OCR: pemisah bisa terbaca sebagai spasi/koma, huruf l/i/1 tertukar.
const loosen = (pattern) =>
  pattern
    .replaceAll('[.-]', '\\s*[.,\\-_ ]?\\s*')
    .replaceAll('\\.', '\\s*[.,]?\\s*')
    .replace(/l/g, '[l1i|!]')
    .replace(/(?<!\\)s/g, '[s5]');
const ocrPatterns = patterns.map((p) => new RegExp(loosen(p), 'i'));

const tmp = mkdtempSync(join(tmpdir(), 'audit-publik-'));
const report = [];
const log = (line = '') => {
  console.log(line);
  report.push(line);
};
let failures = 0;

log('# Audit repo publik');
log(`Tanggal: ${new Date().toISOString()}`);
log(`Denylist: ${patterns.length} pola dari ${denylistPath.replace(homedir(), '~')}`);

// 0. Kontrol positif: gambar uji berisi alamat dari domain.env harus terdeteksi, membuktikan OCR dan
// pola longgarnya bekerja. Alamatnya sendiri tidak dicetak ke laporan.
log('');
log('## 0. Kontrol positif OCR');
const stagingHost = new URL(PORTOFOLIO_URL).host;
if (patterns.some((pattern) => new RegExp(pattern, 'i').test(stagingHost))) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="220"><rect width="100%" height="100%" fill="#fff"/><text x="40" y="130" font-family="DejaVu Sans, sans-serif" font-size="54" fill="#1b2230">${stagingHost}</text></svg>`;
  const controlFile = join(tmp, 'kontrol.png');
  await sharp(Buffer.from(svg)).png().toFile(controlFile);
  const controlText = await ocr(controlFile);
  const detected = ocrPatterns.some((pattern) => pattern.test(controlText));
  if (!detected) failures++;
  log(detected ? 'Terdeteksi: gambar uji berisi alamat staging dari domain.env ditangkap OCR.' : 'GAGAL: OCR tidak menangkap alamat staging pada gambar uji.');
} else {
  log('Dilewati: alamat di domain.env bukan alamat staging (tidak cocok dengan denylist).');
}

// 1. Teks di semua file terlacak.
log('');
log('## 1. git grep pola denylist (semua file terlacak)');
try {
  const out = execFileSync('git', ['grep', '-n', '-I', '-E', '-f', denylistPath], { encoding: 'utf8' });
  failures += out.trim().split('\n').length;
  log(out.trim());
} catch (error) {
  if (error.status === 1) log(`Bersih: 0 kecocokan di ${execFileSync('git', ['ls-files'], { encoding: 'utf8' }).trim().split('\n').length} file terlacak.`);
  else throw error;
}

// Antrean OCR dengan beberapa proses tesseract paralel.
async function ocr(pngPath) {
  // Satu thread per proses (OMP_THREAD_LIMIT) karena beberapa proses berjalan paralel; diulang kalau
  // prosesnya terhenti dari luar (mis. server sedang sibuk).
  for (let attempt = 1; ; attempt++) {
    try {
      const { stdout } = await run('tesseract', [pngPath, 'stdout', '-l', 'eng'], {
        maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, OMP_THREAD_LIMIT: '1' },
      });
      return stdout.replace(/\s+/g, ' ');
    } catch (error) {
      if (attempt >= 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
}
async function pool(items, worker, size = 6) {
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index], index);
      }
    }),
  );
  return results;
}
/** Ubah ke PNG yang cukup besar untuk OCR; kembalikan daftar potongan (gambar tinggi dipotong-potong). */
async function toOcrPngs(input, name) {
  const image = sharp(input, { limitInputPixels: false });
  const { width = 0, height = 0 } = await image.metadata();
  const scale = width < 1600 ? Math.min(3, 1600 / Math.max(width, 1)) : 1;
  const target = { width: Math.round(width * scale), height: Math.round(height * scale) };
  const resized = await sharp(input, { limitInputPixels: false }).resize(target.width, target.height).png().toBuffer();
  const tile = 4000;
  const outputs = [];
  for (let top = 0; top < target.height; top += tile - 200) {
    const file = join(tmp, `${name}-${top}.png`);
    await sharp(resized, { limitInputPixels: false })
      .extract({ left: 0, top, width: target.width, height: Math.min(tile, target.height - top) })
      .toFile(file);
    outputs.push(file);
    if (top + tile >= target.height) break;
  }
  return outputs;
}
async function checkImages(title, entries) {
  log('');
  log(`## ${title}`);
  const rows = await pool(entries, async ({ label, input }, index) => {
    const files = await toOcrPngs(input, `img${index}-${basename(label).replace(/\W/g, '_')}`);
    const text = (await Promise.all(files.map(ocr))).join(' ');
    const hits = ocrPatterns.filter((p) => p.test(text)).map(String);
    return { label, chars: text.length, hits };
  });
  for (const row of rows) {
    if (row.hits.length) failures++;
    log(`${row.hits.length ? 'TEMUAN' : 'bersih'}  ${row.label}  (${row.chars} karakter OCR)${row.hits.length ? `  ${row.hits.join(', ')}` : ''}`);
  }
  log(`Ringkas: ${rows.length} diperiksa, ${rows.filter((r) => r.hits.length).length} temuan.`);
}

const tracked = (globs) => execFileSync('git', ['ls-files', '--', ...globs], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

// 2. Gambar terlacak.
await checkImages(
  '2. OCR gambar terlacak',
  tracked(['*.png', '*.jpg', '*.jpeg', '*.webp', '*.avif', '*.gif']).map((file) => ({ label: file, input: file })),
);

// 3. Frame video terlacak (1 frame per detik).
const ffmpeg =
  process.env.FFMPEG ??
  (() => {
    const base = join(homedir(), '.cache', 'ms-playwright');
    const dir = existsSync(base) ? readdirSync(base).find((d) => d.startsWith('ffmpeg')) : undefined;
    return dir ? join(base, dir, 'ffmpeg-linux') : 'ffmpeg';
  })();
const frames = [];
for (const video of tracked(['*.webm', '*.mp4'])) {
  const prefix = join(tmp, `video-${basename(video).replace(/\W/g, '_')}`);
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', video, '-r', '1', `${prefix}-%03d.png`]);
  for (const file of readdirSync(tmp).filter((f) => f.startsWith(basename(prefix)) && f.endsWith('.png')).sort()) {
    frames.push({ label: `${video} @ ${Number(file.match(/-(\d+)\.png$/)[1]) - 1} dtk`, input: join(tmp, file) });
  }
}
await checkImages(`3. OCR frame video terlacak (${tracked(['*.webm', '*.mp4']).length} video, 1 frame/detik)`, frames);

// 4. Screenshot di dalam laporan Lighthouse terlacak.
const embedded = [];
for (const reportFile of tracked(['*.report.html'])) {
  const html = readFileSync(reportFile, 'utf8');
  let index = 0;
  for (const match of html.matchAll(/data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]{200,})/g)) {
    embedded.push({ label: `${reportFile} #${index++}`, input: Buffer.from(match[1], 'base64') });
  }
}
await checkImages('4. OCR screenshot di laporan Lighthouse terlacak', embedded);

// 5. Gambar Open Graph hasil build.
const ogFiles = existsSync('dist/og')
  ? readdirSync('dist/og', { recursive: true })
      .filter((f) => String(f).endsWith('.png'))
      .map((f) => ({ label: `dist/og/${f}`, input: join('dist/og', String(f)) }))
  : [];
await checkImages('5. OCR gambar Open Graph hasil build (dist/og)', ogFiles);

rmSync(tmp, { recursive: true, force: true });
log('');
log(failures === 0 ? 'HASIL: BERSIH, tidak ada IP server atau alamat staging.' : `HASIL: ${failures} TEMUAN, perbaiki sebelum publikasi.`);
writeFileSync('docs/audit-publik.txt', `${report.join('\n')}\n`);
process.exit(failures === 0 ? 0 : 1);
