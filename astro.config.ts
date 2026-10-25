import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { PORTOFOLIO_URL } from './src/config/domain';
import { alternatesForPath, localeMeta, locales } from './src/i18n/routes';

// Alamat situs dibaca dari domain.env (lihat src/config/domain.ts).
const site = PORTOFOLIO_URL;

export default defineConfig({
  site,
  trailingSlash: 'always',
  i18n: {
    locales: [...locales],
    defaultLocale: 'id',
    routing: { prefixDefaultLocale: false },
  },
  build: {
    // CSS kecil (±6 kB gzip), jadi disisipkan langsung ke tiap halaman agar tidak memblokir render.
    inlineStylesheets: 'always',
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      // Tanpa Georgia: font cadangan yang ukurannya disesuaikan (Times New Roman lokal) sudah lebih dulu dipakai
      // di Windows, Mac, dan iOS, sedangkan di Linux dan Android Georgia tidak ada dan hanya menambah satu
      // pencarian font lewat IPC (lihat catatan tumpukan font di global.css).
      fallbacks: ['serif'],
      options: {
        variants: [
          {
            // Semua judul memakai bobot 600, jadi dipakai instance statis (18 KB) alih-alih font variabel
            // (37 KB). A/B Lighthouse di live 25 Okt 2026: beranda 99/100 dengan font statis, 83/97 dengan
            // font variabel, karena shaping font variabel menambah waktu layout pertama.
            weight: '600',
            style: 'normal',
            // optional, bukan swap: kalau font terlambat, halaman tetap memakai font cadangan sampai
            // selesai dibuka. Di Linux dan Android tidak ada Georgia, jadi font cadangan bisa memecah
            // judul ke baris yang berbeda dan menggeser isi saat Fraunces masuk (CLS 0,19 pada 19 Okt).
            display: 'optional',
            src: ['./node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2'],
          },
        ],
      },
    },
  ],
  security: {
    // Astro membuat <meta> CSP berisi hash untuk setiap script dan style.
    // frame-ancestors tidak berlaku lewat <meta>, jadi dipasang sebagai header di Caddy.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
      serialize(item) {
        const pair = alternatesForPath(new URL(item.url).pathname);
        if (pair) {
          item.links = locales.map((locale) => ({
            lang: localeMeta[locale].hreflang,
            url: new URL(pair[locale], site).href,
          }));
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
