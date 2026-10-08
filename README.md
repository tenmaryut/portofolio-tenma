# portofolio-tenma

Situs portofolio pribadi Tenma, mahasiswa Ilmu Hukum yang baru memulai kerja sampingan sebagai programmer web. Situs ini juga menautkan dua proyek demo: company profile kantor hukum dan toko online UMKM.

- Live: alamat `PORTOFOLIO_URL` di `/root/tenma-ws/portofolio/domain.env` (Indonesia di `/`, English di `/en/`)
- Stack: Astro 7 (statis) + Tailwind CSS 4 + TypeScript, dilayani Caddy
- Status: live; lihat `/root/tenma-ws/portofolio/progress/portofolio-tenma.md`

## Menjalankan di komputer lokal

Butuh Node.js 22.12 atau lebih baru, dan file `domain.env` berisi alamat ketiga situs (lihat bagian "Pindah domain"; contoh di `domain.env.example`).

```bash
npm install
npm run dev        # http://localhost:4321, berubah otomatis saat file disimpan
```

## Mengisi data profil

Semua data pribadi yang tampil di situs ada di `src/config/profile.ts`. Yang belum diisi bertanda `TODO(Tenma)` dan bernilai `null`; selama itu, situs menyembunyikannya atau menampilkan "segera tersedia" tanpa tautan palsu. Lihat daftarnya dengan:

```bash
npm run todo
```

Setelah mengisi, build dan deploy ulang (lihat di bawah).

## Struktur

| Lokasi | Isi |
| --- | --- |
| `src/config/profile.ts` | Data profil (nama, foto, email, WhatsApp, kota, GitHub) |
| `src/i18n/routes.ts` | Peta rute ID/EN; dipakai pengalih bahasa, hreflang, sitemap, dan test |
| `src/i18n/ui.ts` | Teks antarmuka bersama (navigasi, tombol, footer) |
| `src/data/projects.ts` | Isi studi kasus dan hasil uji proyek demo |
| `src/data/services.ts` | Daftar layanan |
| `src/data/pages.ts` | Judul, deskripsi, dan teks gambar Open Graph tiap halaman |
| `src/components/pages/` | Isi halaman (dipakai rute ID dan EN) |
| `src/pages/` | Rute: `/`, `/proyek/`, `/layanan/`, `/tentang/`, `/kontak/`, dan padanannya di `/en/` |
| `src/assets/projects/` | Screenshot asli situs demo (`npm run capture:projects`) |
| `tests/` | Test Playwright |
| `scripts/` | Deploy, Lighthouse, screenshot |
| `deploy/portofolio-tenma.caddy` | Konfigurasi Caddy situs ini |
| `docs/screenshots/`, `docs/lighthouse/` | Bukti tampilan responsif dan hasil Lighthouse |

## Test

```bash
npm run build      # astro check (tipe) + astro build
npm test           # Playwright terhadap hasil build (menjalankan `astro preview` otomatis)
```

Test mencakup navigasi, ganti bahasa, mode gelap, semua tautan internal dan anchor, meta SEO dan Open Graph, data terstruktur, tidak ada scroll horizontal di 360–1440 px, serta aksesibilitas WCAG 2.2 AA dengan axe (mode terang dan gelap), di layar desktop 1440 px dan ponsel 360 px. Teks setiap gambar Open Graph dibaca ulang dengan OCR (`tests/og.spec.ts`), jadi `tesseract` (paket `tesseract-ocr`) harus terpasang.

Override `fflate` di `package.json` sengaja ditahan di `~0.7.5` (versi yang sudah ditambal). satori memanggil `inflateSync(data, out)` dengan gaya API 0.7. Di fflate 0.8, argumen kedua berubah menjadi objek opsi, sehingga font WOFF terbaca kosong dan semua huruf gambar OG menjadi kotak.

Variasi:

```bash
npm run test:live                                       # uji situs live dari PORTOFOLIO_URL, termasuk tautan eksternal
CHECK_EXTERNAL=1 npm test                               # preview lokal + tautan eksternal (butuh internet)
npm run lighthouse                                      # Lighthouse mobile beranda + studi kasus, gagal kalau skor < 95
npm run screenshots                                     # screenshot semua halaman ke docs/screenshots/
npm run capture:projects                                # screenshot asli situs hukum & toko untuk kartu proyek
npm run record:animations                               # rekaman WebM animasi utama ke docs/animasi/
npm run import:videos                                   # salin cuplikan WebM situs demo (docs/animasi/ mereka) ke public/video/
npm run check:domain                                    # pastikan tidak ada alamat staging/IP di luar docs/
npm run audit:publik                                    # audit rilis publik: git grep + OCR gambar, video, laporan, gambar OG
npm run cek:proxy                                       # bukti aman di balik proxy: cookie, URL https, redirect, X-Forwarded-For
```

## Rilis publik

Repo ini disiapkan untuk dipublikasikan. Alamat staging memuat IP server, jadi:

- Halaman tidak pernah menampilkan alamat situs demo sebagai teks; tautannya memakai label seperti "Lihat demo langsung" dan bilah browser di screenshot memakai nama demo (`tests/publik.spec.ts` memeriksa teks terlihat semua halaman dengan parser HTML).
- Laporan Lighthouse disamarkan otomatis dengan `samarkan-staging` oleh `npm run lighthouse`; README screenshot dan rekaman tidak menuliskan URL.
- `npm run audit:publik` memeriksa pola di `~/.config/git/denylist-publik` lewat `git grep`, lalu OCR (tesseract) semua gambar terlacak, satu frame per detik dari setiap video, screenshot di dalam laporan Lighthouse, dan gambar OG hasil build, dengan kontrol positif. Hasil terakhir: `docs/audit-publik.txt`.
- Hook pre-commit dan pre-push menolak commit atau push yang memuat pola itu; jangan dilewati.

## Animasi

Semua animasi ada di `src/styles/motion.css` dan murni CSS, kecuali pemutar cuplikan video di studi kasus: hero yang muncul bertahap dengan stabilo dan coretan tinta, bagian dan kartu yang muncul saat di-scroll (scroll-driven animation), kartu proyek yang terangkat dengan screenshot bergeser, View Transitions native lintas dokumen (screenshot kartu berubah menjadi gambar studi kasus), dan micro-interaction tombol serta tautan. Semuanya hanya aktif untuk `prefers-reduced-motion: no-preference`; dengan reduced motion tidak ada animasi sama sekali, dan tanpa JavaScript semua konten tetap tampil (`tests/motion.spec.ts`). Rekaman buktinya ada di `docs/animasi/`.

## Build dan deploy ulang

Di server, sebagai root, dari folder proyek:

```bash
npm run deploy
```

Skrip `scripts/deploy.sh` menjalankan `npm run build`, menyalin `dist/` ke `/srv/web/portofolio-tenma` dengan rsync, merender `deploy/portofolio-tenma.caddy.template` (host diambil dari `PORTOFOLIO_URL`) ke `/etc/caddy/sites/portofolio-tenma.caddy` kalau berubah (divalidasi dulu dengan `caddy validate`, lalu `systemctl reload caddy`), dan terakhir mengecek `curl -I` ke `PORTOFOLIO_URL`.

Baris pertama blok situs di file Caddy adalah `import gerbang_staging` (snippet dikelola agen utama di `/etc/caddy/Caddyfile`, kini membuang header identitas akun Tailscale).

## Di balik proxy (Tailscale Funnel)

Situs dibuka publik lewat Tailscale Funnel di alamat `PORTOFOLIO_URL`. Funnel menangani TLS dan meneruskan ke Caddy di `http://127.0.0.1:80`; Caddy hanya mendengarkan localhost dan hanya mempercayai `X-Forwarded-For` dari 127.0.0.1. Karena itu template Caddy memakai alamat `http://<host>`.

Situs ini statis, jadi tidak ada yang bergantung pada proxy: tidak ada cookie (pilihan tema disimpan di `localStorage`), tidak ada form atau rate limit yang memakai IP pengunjung, semua URL absolut (canonical, hreflang, Open Graph, sitemap) memakai https dari `domain.env`, dan redirect garis miring akhir dari Caddy bersifat relatif. Buktinya: `tests/proxy.spec.ts` (ikut `npm run test:live`) dan `npm run cek:proxy` (memeriksa Set-Cookie di semua halaman, URL `http://` di hasil build, redirect, serta permintaan dengan `X-Forwarded-For` sama dan berbeda ke `http://127.0.0.1:80`). Kalau nanti ada form atau cookie, ambil IP pengunjung hanya dari proxy 127.0.0.1, beri cookie atribut `Secure`, dan jangan bergantung pada header `Tailscale-User-*`.

Dari server ini, nama host situs diarahkan ke relay Funnel yang berfungsi lewat `/etc/hosts` (dikelola agen utama), jadi test dan Lighthouse dari server tetap melewati jalur publik.

Caddy memberi kompresi zstd/gzip, header keamanan (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, CSP `frame-ancestors`), cache satu tahun untuk aset ber-hash di `/_astro/`, dan halaman 404 sesuai bahasa; HTTPS ditangani Tailscale Funnel. Sumber script dan style dibatasi `<meta>` CSP berbasis hash yang dibuat Astro di tiap halaman.

## Pindah domain

Alamat situs ini dan dua situs demo hanya diambil dari `/root/tenma-ws/portofolio/domain.env` (`PORTOFOLIO_URL`, `HUKUM_URL`, `TOKO_URL`), dibaca oleh `src/config/domain.ts` saat build, test, dan deploy. Tidak ada alamat yang ditulis langsung di kode.

1. Siapkan jalur masuk untuk host baru (saat ini Tailscale Funnel yang diatur agen utama; kalau nanti memakai domain sendiri tanpa tunnel, kembalikan alamat di template Caddy ke host tanpa `http://` supaya Caddy mengurus sertifikat HTTPS sendiri), lalu ubah nilai di `domain.env`.
2. Deploy ulang: `npm run deploy` (build ulang canonical, sitemap, gambar OG, dan tautan demo, lalu merender ulang file Caddy dengan host baru dan memuat ulang Caddy).
3. Periksa: `npm run test:live`, `npm run lighthouse`, dan `npm run cek:proxy`. Opsional: `npm run capture:projects` kalau tampilan situs demo ikut berubah.

Untuk sementara atau di komputer lain, lokasi file bisa diganti dengan `DOMAIN_ENV=/path/ke/domain.env`, atau tiap alamat ditimpa lewat variabel lingkungan bernama sama.
