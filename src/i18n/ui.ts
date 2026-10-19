import type { Locale } from './routes';

// Teks antarmuka yang dipakai bersama. Teks khusus halaman ada di komponen halamannya.
const id = {
  site: {
    tagline: 'Website dan spreadsheet untuk usaha kecil',
    description:
      'Portofolio Tenma, programmer web yang membuat website serta templat dan dashboard Excel/Google Sheets untuk usaha kecil.',
  },
  skipLink: 'Langsung ke konten utama',
  nav: {
    label: 'Navigasi utama',
    home: 'Beranda',
    projects: 'Proyek',
    services: 'Layanan',
    about: 'Tentang',
    contact: 'Kontak',
    openMenu: 'Buka menu',
    closeMenu: 'Tutup menu',
  },
  language: {
    label: 'Pilih bahasa',
  },
  theme: {
    toggle: 'Mode gelap',
  },
  footer: {
    note: 'Situs statis tanpa cookie dan tanpa pelacak. Dibangun dengan Astro dan Tailwind CSS, diuji dengan Playwright.',
    elsewhere: 'Di tempat lain',
    rights: 'Tenma',
  },
  cta: {
    projects: 'Lihat proyek',
    contact: 'Hubungi saya',
    caseStudy: 'Baca studi kasus',
    demo: 'Buka demo',
    allProjects: 'Semua proyek',
    allServices: 'Detail layanan',
    quote: 'Hubungi untuk penawaran',
  },
  project: {
    demoBadge: 'Demo',
    role: 'Peran',
    stack: 'Stack',
    status: 'Status',
    live: 'Online',
    source: 'Kode sumber',
    sourceLink: 'Lihat di GitHub',
    screenshotPending: 'Screenshot situs live menyusul',
    screenshotAlt: (name: string) => `Tangkapan layar beranda ${name}`,
    screenshotMobileAlt: (name: string) => `Tangkapan layar ${name} di layar ponsel`,
  },
  external: '(membuka situs lain)',
};

export type UiStrings = typeof id;

const en: UiStrings = {
  site: {
    tagline: 'Websites and spreadsheets for small businesses',
    description:
      'Portfolio of Tenma, a web developer who builds websites and Excel and Google Sheets templates and dashboards for small businesses.',
  },
  skipLink: 'Skip to main content',
  nav: {
    label: 'Main navigation',
    home: 'Home',
    projects: 'Projects',
    services: 'Services',
    about: 'About',
    contact: 'Contact',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  language: {
    label: 'Choose language',
  },
  theme: {
    toggle: 'Dark mode',
  },
  footer: {
    note: 'A static site with no cookies and no trackers. Built with Astro and Tailwind CSS, tested with Playwright.',
    elsewhere: 'Elsewhere',
    rights: 'Tenma',
  },
  cta: {
    projects: 'See projects',
    contact: 'Get in touch',
    caseStudy: 'Read the case study',
    demo: 'Open demo',
    allProjects: 'All projects',
    allServices: 'Service details',
    quote: 'Contact me for a quote',
  },
  project: {
    demoBadge: 'Demo',
    role: 'Role',
    stack: 'Stack',
    status: 'Status',
    live: 'Online',
    source: 'Source code',
    sourceLink: 'View on GitHub',
    screenshotPending: 'Live site screenshot coming soon',
    screenshotAlt: (name: string) => `Screenshot of the ${name} home page`,
    screenshotMobileAlt: (name: string) => `Screenshot of ${name} on a phone screen`,
  },
  external: '(opens another site)',
};

export const ui: Record<Locale, UiStrings> = { id, en };

export function useTranslations(locale: Locale): UiStrings {
  return ui[locale];
}
