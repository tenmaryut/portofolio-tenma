// Gambar Open Graph 1200×630 dibuat saat build: satori mengubah tata letak menjadi SVG
// (teks sudah berupa path), lalu sharp mengubahnya menjadi PNG.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { profile } from '../config/profile';
import type { Locale } from '../i18n/routes';

interface OgOptions {
  eyebrow: string;
  title: string;
  locale: Locale;
  stamp?: string;
}

type Node = { type: string; props: Record<string, unknown> & { style?: Record<string, unknown> } };

// Satori menolak array anak yang kosong, jadi elemen tanpa anak tidak diberi `children`.
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: children.length === 0 ? { style } : { style, children: children.length === 1 ? children[0] : children },
});

const colors = {
  paper: '#f6f1e7',
  ink: '#1b2230',
  muted: '#4c5466',
  accent: '#b03a1e',
  rule: 'rgba(46, 94, 170, 0.13)',
  margin: 'rgba(176, 58, 30, 0.45)',
};

const tagline: Record<Locale, string> = {
  id: 'Programmer web yang paham hukum',
  en: 'A web developer who understands the law',
};

let fonts: Promise<{ name: string; data: Buffer; weight: 500 | 600; style: 'normal' }[]> | undefined;

function loadFonts() {
  const file = (pkg: string, name: string) => readFile(join(process.cwd(), 'node_modules', pkg, 'files', name));
  fonts ??= Promise.all([
    file('@fontsource/fraunces', 'fraunces-latin-600-normal.woff'),
    file('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
  ]).then(([fraunces, mono]) => [
    { name: 'Fraunces', data: fraunces, weight: 600, style: 'normal' },
    { name: 'JetBrains Mono', data: mono, weight: 500, style: 'normal' },
  ]);
  return fonts;
}

export async function renderOgImage({ eyebrow, title, locale, stamp }: OgOptions): Promise<Uint8Array<ArrayBuffer>> {
  const rules = Array.from({ length: 15 }, (_, i) =>
    h('div', { position: 'absolute', left: 0, right: 0, top: 42 * (i + 1), height: 1, backgroundColor: colors.rule }),
  );
  const margins = [118, 126].map((left) =>
    h('div', { position: 'absolute', top: 0, bottom: 0, left, width: 2, backgroundColor: colors.margin }),
  );

  const content = h(
    'div',
    {
      position: 'absolute',
      left: 170,
      right: 80,
      top: 72,
      bottom: 64,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    h(
      'div',
      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: 28 },
      h('div', { display: 'flex', color: colors.ink }, '§ Tenma'),
      h(
        'div',
        { display: 'flex', color: colors.muted, border: `2px solid ${colors.muted}`, borderRadius: 8, padding: '2px 12px', fontSize: 22 },
        locale.toUpperCase(),
      ),
    ),
    h(
      'div',
      { display: 'flex', flexDirection: 'column' },
      h('div', { display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 28, color: colors.accent, marginBottom: 20 }, eyebrow),
      h(
        'div',
        { display: 'flex', fontFamily: 'Fraunces', fontSize: title.length > 42 ? 60 : 72, lineHeight: 1.08, color: colors.ink, maxWidth: 900 },
        title,
      ),
    ),
    h(
      'div',
      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: 'JetBrains Mono', fontSize: 22, color: colors.muted },
      h('div', { display: 'flex' }, tagline[locale]),
      h('div', { display: 'flex' }, `github.com/${profile.githubUsername}`),
    ),
  );

  const children: Node[] = [...rules, ...margins, content];
  if (stamp) {
    children.push(
      h(
        'div',
        {
          position: 'absolute',
          right: 80,
          top: 150,
          display: 'flex',
          border: `5px solid ${colors.accent}`,
          borderRadius: 10,
          padding: '6px 22px',
          color: colors.accent,
          fontFamily: 'JetBrains Mono',
          fontSize: 34,
          letterSpacing: 6,
          transform: 'rotate(-8deg)',
        },
        stamp,
      ),
    );
  }

  const root = h('div', { position: 'relative', display: 'flex', width: 1200, height: 630, backgroundColor: colors.paper }, ...children);
  const svg = await satori(root as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: await loadFonts() });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
  // Salin ke ArrayBuffer biasa supaya cocok dengan tipe body Response.
  const body = new Uint8Array(png.length);
  body.set(png);
  return body;
}
