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
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            display: 'swap',
            src: ['./node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2'],
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
