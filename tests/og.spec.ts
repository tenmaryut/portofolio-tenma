import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import { ogEntries } from '../src/data/pages';

// Font yang gagal dibaca satori tidak membuat build gagal: setiap huruf diam-diam menjadi kotak kosong,
// sementara PNG-nya tetap lolos cek ukuran di seo.spec.ts (terjadi sejak awal sampai 9 Okt 2026 karena
// override fflate 0.8). Karena itu teks gambar dibaca ulang dengan OCR tesseract, alat yang juga
// dipakai `npm run audit:publik`. Satu thread per proses lebih cepat untuk gambar sekecil ini.
const ocr = (png: Buffer) =>
  execFileSync('tesseract', ['stdin', 'stdout', '-l', 'eng'], {
    input: png,
    encoding: 'utf8',
    env: { ...process.env, OMP_THREAD_LIMIT: '1' },
  });

/** Huruf kecil, angka, dan spasi saja, supaya tanda baca dan pindah baris tidak ikut dibandingkan. */
const words = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

for (const entry of ogEntries()) {
  test(`teks gambar OG terbaca: ${entry.path}`, async ({ request }) => {
    const image = await request.get(`/og/${entry.path}.png`);
    expect(image.status()).toBe(200);
    const text = words(ocr(await image.body()));
    // Judul memakai Fraunces, teks lainnya JetBrains Mono.
    expect(text).toContain(words(entry.title));
    expect(text).toContain('github com tenmaryut');
  });
}
