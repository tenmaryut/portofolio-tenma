# Kredit dan lisensi

## Font
- **Fraunces** (judul di situs dan gambar Open Graph) oleh The Fraunces Project Authors (Undercase Type), SIL Open Font License 1.1. Dipakai lewat paket npm `@fontsource-variable/fraunces` dan `@fontsource/fraunces`. https://github.com/undercasetype/Fraunces
- **JetBrains Mono** (teks monospace di gambar Open Graph) oleh JetBrains, SIL Open Font License 1.1, lewat paket npm `@fontsource/jetbrains-mono`. https://github.com/JetBrains/JetBrainsMono
- Teks isi memakai font bawaan sistem pengunjung (tidak diunduh).

## Ikon
- Ikon garis di `src/lib/icons.ts` diadaptasi dari **Lucide** (lisensi ISC). https://lucide.dev — termasuk ikon GitHub versi garis. Nama dan logo GitHub adalah merek milik GitHub, Inc.

## Gambar
- Favicon, ikon Apple, gambar Open Graph, monogram, dan pola "legal pad" dibuat sendiri (SVG/CSS, dan gambar OG dirender saat build dengan satori + sharp).
- Screenshot di `src/assets/projects/` adalah tangkapan layar dua situs demo milik Tenma sendiri (alamat `HUKUM_URL` dan `TOKO_URL` di domain.env), diambil otomatis dengan Playwright. Kredit aset di dalam situs-situs itu tercatat di CREDITS.md proyek masing-masing.
- Cuplikan video di `public/video/` adalah rekaman animasi kedua situs demo, dibuat dengan Playwright oleh proyek masing-masing (`docs/animasi/` di repo mereka); posternya frame terakhir rekaman itu.
- Screenshot di `docs/screenshots/` dan rekaman di `docs/animasi/` adalah tangkapan layar situs ini.

## Perangkat lunak
- Astro (MIT), Tailwind CSS (MIT), `@astrojs/sitemap` (MIT), satori (MPL-2.0), sharp (Apache-2.0), Playwright (Apache-2.0), axe-core (MPL-2.0), Lighthouse (Apache-2.0), TypeScript (Apache-2.0).
