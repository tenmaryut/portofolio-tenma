import type { ProjectSlug } from '../i18n/routes';

export interface ProjectVideo {
  src: string;
  poster: string;
  width: number;
  height: number;
  durationSeconds: number;
  /** Asal rekaman di repo proyek demo. */
  sourceFile: string;
  importedOn: string;
}

// Cuplikan animasi situs demo. Diperbarui otomatis oleh scripts/import-demo-videos.mjs.
export const videos: Partial<Record<ProjectSlug, ProjectVideo>> = {
  'company-profile-hukum': {
    src: '/video/company-profile-hukum.webm',
    poster: '/video/company-profile-hukum-poster.webp',
    width: 1280,
    height: 720,
    durationSeconds: 5.1,
    sourceFile: 'docs/animasi/01-hero-beranda.webm',
    importedOn: '2026-10-03'
  },
  'toko-online-umkm': {
    src: '/video/toko-online-umkm.webm',
    poster: '/video/toko-online-umkm-poster.webp',
    width: 1280,
    height: 800,
    durationSeconds: 10.1,
    sourceFile: 'docs/animasi/01-tambah-keranjang.webm',
    importedOn: '2026-10-03'
  }
};
