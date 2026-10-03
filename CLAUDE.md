# portofolio-tenma

Situs portofolio pribadi Tenma (programmer web sampingan, mahasiswa Ilmu Hukum UT) yang menautkan dua proyek demo. Brief dan progress: `/root/tenma-ws/portofolio/brief-portofolio-tenma.md` dan `progress/portofolio-tenma.md`.

## Stack dan perintah
- Astro 7 (output statis) + Tailwind CSS 4 + TypeScript 6 (sengaja v6: `@astrojs/check` belum mendukung TS 7).
- `npm run dev` (port 4321), `npm run build` (astro check + build), `npm test` (Playwright, otomatis `astro preview`), `npm run test:live`, `npm run lighthouse` (skor ≥ 95, CLS ≤ 0.1), `npm run screenshots`, `npm run record:animations`, `npm run capture:projects`, `npm run check:domain`, `npm run deploy` (root; build → `/srv/web/portofolio-tenma` → Caddy).
- Caddy: sumbernya `deploy/portofolio-tenma.caddy.template` (alamat `http://<host dari PORTOFOLIO_URL>` karena mode tunnel, baris pertama blok situs `import gerbang_staging`), dirender ke `/etc/caddy/sites/` oleh skrip deploy. Jangan sentuh file Caddy atau folder proyek lain.
- Mode tunnel: publik lewat Tailscale Funnel (TLS di Funnel), Caddy hanya di localhost dan mempercayai `X-Forwarded-For` dari 127.0.0.1. Situs statis tanpa cookie/rate limit; kalau menambah form atau cookie, pakai IP dari proxy 127.0.0.1 saja, cookie `Secure`, dan jangan bergantung pada header `Tailscale-User-*`. Bukti: `npm run cek:proxy` dan `tests/proxy.spec.ts`.
- Alamat situs hanya dari `/root/tenma-ws/portofolio/domain.env` lewat `src/config/domain.ts`. Jangan menulis alamat staging atau IP server di kode, konten, konfigurasi, maupun file deploy (folder `docs/` dikecualikan); cek dengan `npm run check:domain`.

## Konvensi
- Semua halaman ada dalam ID (default, tanpa prefiks) dan EN (`/en/`, slug diterjemahkan). Tambah halaman: daftarkan di `src/i18n/routes.ts`, meta di `src/data/pages.ts`, isi di `src/components/pages/`, lalu dua rute tipis di `src/pages/`.
- Teks halaman ditulis berdampingan ID/EN di komponen halamannya; teks antarmuka bersama di `src/i18n/ui.ts`.
- Data pribadi hanya di `src/config/profile.ts`. Jangan mengarang data Tenma, klien, testimoni, atau angka. Hasil uji proyek demo (`results` di `src/data/projects.ts`) hanya dari pengukuran nyata.
- CSP memakai hash dari Astro: jangan memakai atribut `style="..."` inline, script/style eksternal dari domain lain, atau directive `transition:name`/`<ClientRouter />` (style-nya tidak ikut di-hash). View Transitions memakai CSS native di `motion.css`.
- Animasi hanya di `src/styles/motion.css`, di dalam `@media (prefers-reduced-motion: no-preference)`, hanya transform/opacity, dan tidak pernah menyembunyikan konten yang menunggu JavaScript. Untuk scroll-driven animation tulis longhand (minifier merusak shorthand + `animation-timeline`).
- `trailingSlash: 'always'`: semua tautan internal diakhiri `/`.
- Whitespace di template dipadatkan ala JSX (`compressHTML: 'jsx'`): tambahkan `{' '}` kalau butuh spasi antar-elemen di baris berbeda.
- Gambar hanya buatan sendiri atau berlisensi jelas; catat di `CREDITS.md`.
- Repo disiapkan untuk publik: jangan menampilkan alamat situs (staging memuat IP server) sebagai teks di halaman, gambar, atau rekaman; pakai label tautan. Sebelum commit artefak (screenshot, laporan, rekaman), jalankan `npm run audit:publik`.
- Sebelum menyatakan selesai: `npm run build`, `npm test`, dan setelah deploy `npm run test:live` serta `npm run lighthouse`.
- Commit lokal dalam Bahasa Indonesia; hook gitleaks tidak boleh dilewati. Repo GitHub dan push hanya dengan persetujuan Tenma.
