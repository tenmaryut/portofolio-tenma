import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { allPages, notFoundPages } from './helpers';

// Pemeriksaan otomatis WCAG 2.2 A/AA dengan axe-core, di mode terang dan gelap.
// Reduced motion dipakai supaya kontras dinilai pada keadaan akhir halaman, bukan saat elemen
// masih memudar masuk (scroll reveal); bahwa animasi itu selesai ke opacity 1 diuji di motion.spec.ts.
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`mode ${scheme === 'light' ? 'terang' : 'gelap'}`, () => {
    test.use({ colorScheme: scheme, reducedMotion: 'reduce' });

    for (const path of [...allPages, notFoundPages.id, notFoundPages.en]) {
      test(`aksesibilitas (axe) ${path}`, async ({ page }) => {
        await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(tags).analyze();
        const violations = results.violations.map(
          (violation) =>
            `${violation.id} (${violation.impact}): ${violation.nodes
              .slice(0, 3)
              .map((node) => node.target.join(' '))
              .join(' | ')}`,
        );
        expect(violations).toEqual([]);
      });
    }
  });
}
