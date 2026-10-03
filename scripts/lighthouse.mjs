// Mengukur situs dengan Lighthouse (mode mobile, bawaan Lighthouse) dan menyimpan laporannya.
//
//   npm run lighthouse                      → beranda + satu studi kasus situs ini, minimal 95
//   node scripts/lighthouse.mjs nama=URL …  → halaman lain (mis. situs demo), OUT_DIR & MIN_SCORE opsional
//
// Laporan HTML/JSON ada di docs/lighthouse/ (atau OUT_DIR), ringkasannya di summary.json. Alamat staging
// di laporan disamarkan otomatis dengan `samarkan-staging` (kalau tersedia) supaya aman untuk repo publik.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PORTOFOLIO_URL as SITE } from '../src/config/domain.ts';

const defaults = [`beranda=${SITE}/`, `studi-kasus=${SITE}/proyek/company-profile-hukum/`];
const targets = (process.argv.length > 2 ? process.argv.slice(2) : defaults).map((arg) => {
  const index = arg.indexOf('=');
  return { name: arg.slice(0, index), url: arg.slice(index + 1) };
});
const outDir = process.env.OUT_DIR ?? 'docs/lighthouse';
const minScore = Number(process.env.MIN_SCORE ?? 95);
const maxCls = Number(process.env.MAX_CLS ?? 0.1);
const chromePath = process.env.CHROME_PATH ?? '/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

mkdirSync(outDir, { recursive: true });
const results = [];

for (const { name, url } of targets) {
  const outputPath = join(outDir, name);
  console.log(`Mengukur ${url} …`);
  execFileSync(
    'npx',
    [
      'lighthouse',
      url,
      '--quiet',
      `--only-categories=${categories.join(',')}`,
      '--output=json',
      '--output=html',
      `--output-path=${outputPath}`,
      '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
    ],
    { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromePath } },
  );
  const report = JSON.parse(readFileSync(`${outputPath}.report.json`, 'utf8'));
  const scores = Object.fromEntries(categories.map((id) => [id, Math.round(report.categories[id].score * 100)]));
  const metrics = {
    cls: Number(report.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
    lcpMs: Math.round(report.audits['largest-contentful-paint'].numericValue),
    tbtMs: Math.round(report.audits['total-blocking-time'].numericValue),
  };
  results.push({
    name,
    url,
    fetchTime: report.fetchTime,
    lighthouseVersion: report.lighthouseVersion,
    formFactor: report.configSettings.formFactor,
    scores,
    metrics,
  });
}

writeFileSync(join(outDir, 'summary.json'), `${JSON.stringify(results, null, 2)}\n`);

const written = [join(outDir, 'summary.json'), ...targets.flatMap(({ name }) => [`${join(outDir, name)}.report.html`, `${join(outDir, name)}.report.json`])];
try {
  execFileSync('samarkan-staging', written, { stdio: 'inherit' });
  console.log('Alamat staging di laporan sudah disamarkan (samarkan-staging).');
} catch {
  console.warn('samarkan-staging tidak tersedia: periksa laporan sebelum di-commit ke repo publik.');
}
console.table(Object.fromEntries(results.map((r) => [r.name, { ...r.scores, ...r.metrics, formFactor: r.formFactor }])));

const failing = results.filter((r) => Object.values(r.scores).some((score) => score < minScore) || r.metrics.cls > maxCls);
if (failing.length > 0) {
  console.error(`Skor di bawah ${minScore} atau CLS di atas ${maxCls}: ${failing.map((r) => r.name).join(', ')}`);
  process.exit(1);
}
console.log(`Semua skor ≥ ${minScore} dan CLS ≤ ${maxCls}.`);
