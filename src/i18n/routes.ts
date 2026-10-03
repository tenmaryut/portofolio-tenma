// Peta rute ID/EN. Dipakai halaman, pengalih bahasa, tag hreflang, dan sitemap,
// jadi file ini tidak boleh mengimpor modul `astro:*` (ikut dimuat astro.config.ts).

export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'id';

/** Kode bahasa untuk atribut `lang`, `hreflang`, dan `og:locale`. */
export const localeMeta = {
  id: { htmlLang: 'id', hreflang: 'id', ogLocale: 'id_ID', label: 'Indonesia', short: 'ID' },
  en: { htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US', label: 'English', short: 'EN' },
} as const satisfies Record<Locale, unknown>;

export const routes = {
  home: { id: '/', en: '/en/' },
  projects: { id: '/proyek/', en: '/en/projects/' },
  services: { id: '/layanan/', en: '/en/services/' },
  about: { id: '/tentang/', en: '/en/about/' },
  contact: { id: '/kontak/', en: '/en/contact/' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

/** Slug studi kasus. Data lengkapnya ada di src/data/projects.ts. */
export const projectSlugs = ['company-profile-hukum', 'toko-online-umkm'] as const;
export type ProjectSlug = (typeof projectSlugs)[number];

export type Alternates = Record<Locale, string>;

export function caseStudyPaths(slug: ProjectSlug): Alternates {
  return { id: `${routes.projects.id}${slug}/`, en: `${routes.projects.en}${slug}/` };
}

/** Semua pasangan halaman ID/EN yang masuk sitemap. */
export function allPagePairs(): Alternates[] {
  return [...Object.values(routes), ...projectSlugs.map(caseStudyPaths)];
}

/** Pasangan bahasa untuk sebuah path, atau `undefined` kalau path tidak dikenal. */
export function alternatesForPath(pathname: string): Alternates | undefined {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return allPagePairs().find((pair) => pair.id === path || pair.en === path);
}

export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'id';
}
