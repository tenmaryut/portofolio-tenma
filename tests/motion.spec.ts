import { expect, test, type Page } from '@playwright/test';
import { projects } from '../src/data/projects';
import { caseStudyPaths, routes } from '../src/i18n/routes';
import { allPages, notFoundPages } from './helpers';

// Animasi putaran 2: hero, scroll reveal, kartu proyek, View Transitions, dan micro-interaction.
// Dibuktikan tiga hal: animasinya benar-benar jalan, reduced motion mematikan semuanya,
// dan konten tetap tampil penuh tanpa JavaScript.

const animatedSelector = '.rise, .rise-move, .rise-card, .reveal';
const firstProject = projects[0]!;
const clipPath = caseStudyPaths(firstProject.slug).id;

/** Catat apakah navigasi lintas dokumen memakai View Transition (event pagereveal). */
async function trackViewTransitions(page: Page) {
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', (event) => {
      (window as unknown as { viewTransitionUsed?: boolean }).viewTransitionUsed = Boolean(
        (event as Event & { viewTransition?: unknown }).viewTransition,
      );
    });
  });
}

/**
 * Nilai yang dicatat trackViewTransitions. pagereveal terjadi pada kesempatan render pertama, yang saat CPU
 * sibuk bisa datang setelah load, jadi nilainya ditunggu dengan expect.poll, bukan dibaca sekali.
 */
function viewTransitionUsed(page: Page) {
  return page
    .evaluate(() => (window as unknown as { viewTransitionUsed?: boolean }).viewTransitionUsed)
    .catch(() => undefined);
}

async function openFirstCaseStudyFromProjects(page: Page) {
  await page.goto(routes.projects.id);
  await page.getByRole('heading', { level: 2, name: firstProject.name.id }).getByRole('link').click();
  await page.waitForURL((url) => url.pathname === caseStudyPaths(firstProject.slug).id);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(firstProject.name.id);
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    }
  });
}

test.describe('animasi aktif (tanpa preferensi reduced motion)', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('hero beranda beranimasi: teks bertahap, stabilo, dan coretan tinta', async ({ page }) => {
    await page.goto('/');
    const names = await page.evaluate(() =>
      document.getAnimations().map((animation) => (animation as CSSAnimation).animationName),
    );
    expect(names).toEqual(expect.arrayContaining(['rise', 'rise-move', 'rise-card', 'stabilo-sweep', 'ink-draw']));

    // Setelah selesai, tampilan akhirnya sama dengan tampilan statis: semua terlihat penuh.
    await page.waitForTimeout(1800);
    for (const element of await page.locator('.rise, .rise-move, .rise-card').all()) {
      await expect(element).toHaveCSS('opacity', '1');
    }
    await expect(page.locator('.ink-stroke path')).toHaveCSS('stroke-dashoffset', '0px');
  });

  test('bagian dan kartu muncul saat di-scroll (scroll-driven animation)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(caseStudyPaths(firstProject.slug).id);
    const lastCard = page.locator('.reveal').last();
    expect(Number(await lastCard.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.5);

    await lastCard.scrollIntoViewIfNeeded();
    await expect.poll(() => lastCard.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    const timelines = await page.evaluate(() =>
      document.getAnimations().map((animation) => animation.timeline?.constructor.name),
    );
    expect(timelines).toContain('ViewTimeline');
  });

  test('kartu proyek terangkat dan screenshot bergeser saat disorot atau difokus', async ({ page }, testInfo) => {
    await page.goto(routes.projects.id);
    const card = page.locator('.project-card').first();
    const media = card.locator('.shot-media');
    await expect(card).toHaveCSS('transform', 'none');

    if (testInfo.project.name === 'desktop') {
      await card.hover();
    } else {
      await card.getByRole('link').first().focus();
    }
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
    await expect.poll(() => media.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  });

  test('pindah halaman memakai View Transition dan screenshot kartu berubah menjadi gambar studi kasus', async ({ page }) => {
    await trackViewTransitions(page);
    await openFirstCaseStudyFromProjects(page);
    await expect.poll(() => viewTransitionUsed(page)).toBe(true);

    const name = `shot-${firstProject.slug}`;
    await expect(page.locator(`.vt-shot-${firstProject.slug}`)).toHaveCSS('view-transition-name', name);
    await page.goto(routes.projects.id);
    await expect(page.locator(`.vt-shot-${firstProject.slug}`)).toHaveCSS('view-transition-name', name);
  });

  test('cuplikan video dimuat lazy lalu diputar tanpa suara saat terlihat', async ({ page }) => {
    const videoRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.webm')) videoRequests.push(request.url());
    });
    await page.goto(clipPath);
    const video = page.locator('video[data-autoplay-in-view]');
    await expect(video).toHaveAttribute('preload', 'none');
    expect(videoRequests).toEqual([]);

    await video.scrollIntoViewIfNeeded();
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => !el.paused && el.muted)).toBe(true);
    expect(videoRequests.length).toBeGreaterThan(0);

    // Jeda dari pengguna dihormati walau video keluar-masuk layar.
    await video.evaluate((el: HTMLVideoElement) => el.pause());
    await page.evaluate(() => window.scrollTo(0, 0));
    await video.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  });

  test('tombol tema memutar ikonnya saat diklik', async ({ page }) => {
    await page.goto('/');
    // Skrip melepas data-animate 600 ms setelah klik. Di CPU yang sibuk, animasi yang sedang jalan bisa
    // sudah selesai saat diperiksa, jadi atribut dan animationstart dicatat di halaman sejak sebelum klik.
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { tombolTema: string[] }).tombolTema = log;
      const toggle = document.querySelector('[data-theme-toggle]')!;
      new MutationObserver(() => {
        if (toggle.hasAttribute('data-animate')) log.push('data-animate');
      }).observe(toggle, { attributeFilter: ['data-animate'] });
      toggle.addEventListener('animationstart', (event) => log.push((event as AnimationEvent).animationName));
    });
    await page.locator('[data-theme-toggle]').click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { tombolTema: string[] }).tombolTema))
      .toEqual(expect.arrayContaining(['data-animate', 'icon-spin-in']));
  });
});

test.describe('prefers-reduced-motion: reduce mematikan animasi', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of ['/', routes.projects.id, caseStudyPaths(firstProject.slug).en, '/en/about/']) {
    test(`tidak ada animasi dan semua konten langsung tampil: ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      await scrollThrough(page);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);

      for (const element of await page.locator(animatedSelector).all()) {
        await expect(element).toHaveCSS('opacity', '1');
        await expect(element).toHaveCSS('transform', 'none');
      }
    });
  }

  test('stabilo dan coretan tinta langsung dalam keadaan akhir', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.ink-stroke path')).toHaveCSS('stroke-dashoffset', '0px');
    expect(await page.locator('.stabilo').evaluate((el) => getComputedStyle(el, '::before').transform)).toBe('none');
  });

  test('kartu proyek tidak bergerak saat disorot', async ({ page }) => {
    await page.goto(routes.projects.id);
    const card = page.locator('.project-card').first();
    await card.hover();
    await card.getByRole('link').first().focus();
    await expect(card).toHaveCSS('transform', 'none');
    await expect(card.locator('.shot-media')).toHaveCSS('transform', 'none');
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test('pindah halaman tanpa View Transition', async ({ page }) => {
    await trackViewTransitions(page);
    await openFirstCaseStudyFromProjects(page);
    await expect.poll(() => viewTransitionUsed(page)).toBe(false);
  });

  test('cuplikan video tidak diputar otomatis', async ({ page }) => {
    await page.goto(clipPath);
    const video = page.locator('video[data-autoplay-in-view]');
    await video.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
    await expect(video).toHaveAttribute('controls', '');
  });

  test('tombol tema berganti tanpa animasi ikon', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-theme-toggle]').click();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});

test.describe('tanpa JavaScript konten tetap tampil penuh', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of [...allPages, notFoundPages.id]) {
    test(`semua bagian terlihat: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // Tidak ada skrip yang dibutuhkan: animasi hero (CSS) selesai sendiri, dan tiap bagian
      // yang di-scroll ke layar tampil penuh.
      await page.waitForTimeout(1800);
      for (const element of await page.locator(animatedSelector).all()) {
        await element.scrollIntoViewIfNeeded();
        await expect.poll(() => element.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
      }
    });
  }

  test('cuplikan video tetap punya poster dan kontrol pemutar', async ({ page }) => {
    await page.goto(clipPath);
    const video = page.locator('video[data-autoplay-in-view]');
    await video.scrollIntoViewIfNeeded();
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('poster', /\/video\/.+-poster\.webp$/);
    await expect(video).toHaveAttribute('controls', '');
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  });

  test('navigasi tetap terlihat di layar kecil tanpa tombol menu', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    await expect(page.locator('#site-nav')).toBeVisible();
    await expect(page.locator('.menu-toggle')).toBeHidden();
    await expect(page.locator('#site-nav').getByRole('link', { name: 'Proyek', exact: true })).toBeVisible();
  });
});
