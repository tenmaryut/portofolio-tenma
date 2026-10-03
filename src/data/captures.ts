import type { ProjectSlug } from '../i18n/routes';

// Tanggal pengambilan screenshot situs live (YYYY-MM-DD).
// Diperbarui otomatis oleh scripts/capture-projects.mjs.
export const captures: Partial<Record<ProjectSlug, string>> = {
  'company-profile-hukum': '2026-10-03',
  'toko-online-umkm': '2026-10-03'
};
