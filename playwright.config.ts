import { defineConfig, devices } from '@playwright/test';

// Default: menguji hasil build lewat `astro preview`. Untuk menguji situs live (alamat dari domain.env):
// npm run test:live
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4321';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.BASE_URL ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testMatch: /(navigation|language|theme|a11y|motion)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: devices['Pixel 7'].userAgent,
      },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        // --ignore-lock: Astro 7 memindahkan preview ke latar belakang kalau dijalankan agen AI;
        // flag ini menjaganya di foreground supaya bisa dikelola Playwright.
        command: 'npx astro preview --host 127.0.0.1 --port 4321 --ignore-lock',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
