// Menjalankan seluruh test Playwright terhadap situs live (alamat dari domain.env),
// termasuk pemeriksaan tautan eksternal. Argumen tambahan diteruskan ke Playwright.
import { spawnSync } from 'node:child_process';
import { PORTOFOLIO_URL } from '../src/config/domain.ts';

const result = spawnSync('npx', ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, BASE_URL: PORTOFOLIO_URL, CHECK_EXTERNAL: '1' },
});
process.exit(result.status ?? 1);
