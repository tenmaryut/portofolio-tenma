import type { ImageMetadata } from 'astro';
import type { ProjectSlug } from '../i18n/routes';
import { captures } from './captures';

// Screenshot asli diambil dari situs live dengan `npm run capture:projects`, disimpan sebagai
// src/assets/projects/<slug>-desktop.png dan <slug>-mobile.png, dan tanggalnya dicatat di captures.ts.
const shotFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/projects/*.png', { eager: true });

export interface ProjectShots {
  desktop: ImageMetadata | null;
  mobile: ImageMetadata | null;
  /** Tanggal pengambilan screenshot (YYYY-MM-DD). */
  capturedOn: string | null;
}

export function projectShots(slug: ProjectSlug): ProjectShots {
  const find = (variant: 'desktop' | 'mobile') => shotFiles[`../assets/projects/${slug}-${variant}.png`]?.default ?? null;
  return { desktop: find('desktop'), mobile: find('mobile'), capturedOn: captures[slug] ?? null };
}
