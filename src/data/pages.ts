import type { Locale, RouteKey } from '../i18n/routes';
import { projects } from './projects';

export interface PageMeta {
  /** Judul lengkap untuk <title>. */
  title: string;
  description: string;
  /** Teks kecil di atas judul gambar Open Graph. */
  ogEyebrow: string;
  /** Judul besar di gambar Open Graph. */
  ogTitle: string;
}

type PageKey = RouteKey | 'notFound';

export const pageMeta: Record<PageKey, Record<Locale, PageMeta>> = {
  home: {
    id: {
      title: 'Tenma · Website dan spreadsheet untuk usaha kecil',
      description:
        'Tenma, programmer web yang baru memulai kerja sampingan: company profile, landing page, toko online, serta templat dan dashboard Excel/Google Sheets untuk usaha kecil.',
      ogEyebrow: '§ Portofolio',
      ogTitle: 'Website cepat dan spreadsheet rapi untuk usaha kecil',
    },
    en: {
      title: 'Tenma · Websites and spreadsheets for small businesses',
      description:
        'Tenma is a web developer who has just started side work: company profiles, landing pages, online stores, and Excel and Google Sheets templates for small businesses.',
      ogEyebrow: '§ Portfolio',
      ogTitle: 'Fast websites and tidy spreadsheets for small businesses',
    },
  },
  projects: {
    id: {
      title: 'Proyek · Tenma',
      description:
        'Proyek demo Tenma: company profile kantor hukum dengan CMS dan toko online UMKM, lengkap dengan studi kasus, hasil test, dan skor Lighthouse.',
      ogEyebrow: '§ 02 · Proyek',
      ogTitle: 'Proyek demo dan studi kasus',
    },
    en: {
      title: 'Projects · Tenma',
      description:
        'Tenma’s demo projects: a law firm company profile with a CMS and an online store for a small business, with case studies, test results, and Lighthouse scores.',
      ogEyebrow: '§ 02 · Projects',
      ogTitle: 'Demo projects and case studies',
    },
  },
  services: {
    id: {
      title: 'Layanan · Tenma',
      description:
        'Pembuatan company profile, landing page, toko online, sistem informasi sederhana, spreadsheet Excel dan Google Sheets, serta perawatan website. Hubungi untuk penawaran.',
      ogEyebrow: '§ 03 · Layanan',
      ogTitle: 'Company profile, landing page, toko online, dan lainnya',
    },
    en: {
      title: 'Services · Tenma',
      description:
        'Company profiles, landing pages, online stores, simple information systems, Excel and Google Sheets spreadsheets, and website maintenance. Get in touch for a quote.',
      ogEyebrow: '§ 03 · Services',
      ogTitle: 'Company profiles, landing pages, online stores, and more',
    },
  },
  about: {
    id: {
      title: 'Tentang · Tenma',
      description:
        'Siapa Tenma, alur kerja dari konsultasi sampai serah terima dengan perjanjian tertulis, dan stack yang dipakai.',
      ogEyebrow: '§ 04 · Tentang',
      ogTitle: 'Kerja rapi untuk usaha kecil',
    },
    en: {
      title: 'About · Tenma',
      description:
        'Who Tenma is, the workflow from consultation to handover with a written agreement, and the tech stack in use.',
      ogEyebrow: '§ 04 · About',
      ogTitle: 'Careful work for small businesses',
    },
  },
  contact: {
    id: {
      title: 'Kontak · Tenma',
      description: 'Hubungi Tenma lewat WhatsApp, email, atau GitHub untuk membicarakan rencana website Anda.',
      ogEyebrow: '§ 05 · Kontak',
      ogTitle: 'Punya rencana website? Mari bicara',
    },
    en: {
      title: 'Contact · Tenma',
      description: 'Reach Tenma via WhatsApp, email, or GitHub to talk about your website plans.',
      ogEyebrow: '§ 05 · Contact',
      ogTitle: 'Planning a website? Let’s talk',
    },
  },
  notFound: {
    id: {
      title: 'Halaman tidak ditemukan · Tenma',
      description: 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.',
      ogEyebrow: '§ 404',
      ogTitle: 'Halaman tidak ditemukan',
    },
    en: {
      title: 'Page not found · Tenma',
      description: 'The page you are looking for does not exist or has moved.',
      ogEyebrow: '§ 404',
      ogTitle: 'Page not found',
    },
  },
};

export interface OgEntry {
  /** Path gambar tanpa ekstensi, mis. "id/home". */
  path: string;
  locale: Locale;
  eyebrow: string;
  title: string;
  /** Cap stempel di pojok gambar, mis. "DEMO" untuk studi kasus. */
  stamp?: string;
}

/** Semua gambar Open Graph yang dibuat saat build. */
export function ogEntries(): OgEntry[] {
  const entries: OgEntry[] = [];
  for (const [key, byLocale] of Object.entries(pageMeta)) {
    for (const locale of ['id', 'en'] as const) {
      const meta = byLocale[locale];
      entries.push({ path: `${locale}/${key}`, locale, eyebrow: meta.ogEyebrow, title: meta.ogTitle });
    }
  }
  for (const project of projects) {
    for (const locale of ['id', 'en'] as const) {
      entries.push({
        path: `${locale}/${project.slug}`,
        locale,
        eyebrow: locale === 'id' ? '§ Studi kasus' : '§ Case study',
        title: project.name[locale],
        stamp: 'DEMO',
      });
    }
  }
  return entries;
}

/**
 * Naikkan setiap kali tampilan gambar OG berubah. Facebook dan aplikasi chat menyimpan gambar pratinjau
 * berdasarkan URL-nya, dan Caddy mengizinkan cache 7 hari, jadi gambar baru di URL lama bisa tidak terambil.
 * Versi 2: huruf yang sebelumnya tampil sebagai kotak kosong (9 Okt 2026).
 */
const ogVersion = 2;

export function ogImagePath(locale: Locale, key: string): string {
  return `/og/${locale}/${key}.png?v=${ogVersion}`;
}
