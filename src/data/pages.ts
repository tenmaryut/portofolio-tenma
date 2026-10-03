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
      title: 'Tenma · Programmer web yang paham hukum',
      description:
        'Tenma, mahasiswa Ilmu Hukum di Universitas Terbuka yang baru memulai kerja sampingan sebagai programmer web: company profile, toko online, dan sistem informasi.',
      ogEyebrow: '§ Portofolio',
      ogTitle: 'Programmer web yang paham hukum',
    },
    en: {
      title: 'Tenma · A web developer who understands the law',
      description:
        'Tenma is a law student at Universitas Terbuka who has just started web development on the side: company profiles, online stores, and information systems.',
      ogEyebrow: '§ Portfolio',
      ogTitle: 'A web developer who understands the law',
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
        'Pembuatan company profile, landing page, toko online, sistem informasi sederhana, dan perawatan website. Hubungi untuk penawaran.',
      ogEyebrow: '§ 03 · Layanan',
      ogTitle: 'Company profile, landing page, toko online, dan lainnya',
    },
    en: {
      title: 'Services · Tenma',
      description:
        'Company profiles, landing pages, online stores, simple information systems, and website maintenance. Get in touch for a quote.',
      ogEyebrow: '§ 03 · Services',
      ogTitle: 'Company profiles, landing pages, online stores, and more',
    },
  },
  about: {
    id: {
      title: 'Tentang · Tenma',
      description:
        'Latar belakang hukum dan programming Tenma, alur kerja dari konsultasi sampai serah terima dengan perjanjian tertulis, dan stack yang dipakai.',
      ogEyebrow: '§ 04 · Tentang',
      ogTitle: 'Dari ruang kuliah hukum ke editor kode',
    },
    en: {
      title: 'About · Tenma',
      description:
        'Tenma’s background in law and programming, the workflow from consultation to handover with a written agreement, and the tech stack in use.',
      ogEyebrow: '§ 04 · About',
      ogTitle: 'From law school to the code editor',
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

export function ogImagePath(locale: Locale, key: string): string {
  return `/og/${locale}/${key}.png`;
}
