// Mengukur situs dengan Lighthouse (mode mobile, bawaan Lighthouse) dan menyimpan laporannya.
//
//   npm run lighthouse                      → beranda + satu studi kasus situs ini, minimal 95
//   node scripts/lighthouse.mjs nama=URL …  → halaman lain (mis. situs demo), OUT_DIR & MIN_SCORE opsional
//
// Laporan HTML/JSON ada di docs/lighthouse/ (atau OUT_DIR), ringkasannya di summary.json. Alamat staging
// di laporan disamarkan otomatis dengan `samarkan-staging` (kalau tersedia) supaya aman untuk repo publik.
//
// Pengali CPU dikalibrasi ke host di setiap putaran (keputusan agen utama 25 Okt 2026), mengikuti tabel resmi
// Lighthouse: https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md#calibrating-the-cpu-slowdown
// Pengali bawaan 4x dimaksudkan untuk host High-End Desktop (benchmarkIndex 1.500–2.000). Host Low-End Desktop
// (1.000–1.499) memakai 2x supaya tetap meniru ponsel kelas menengah yang sama. Putaran dengan benchmarkIndex
// di bawah 1.000 tidak dihitung dan diulang. Data halaman dikumpulkan sekali (-G); throttling simulasi tidak
// memengaruhi tahap ini, karena halaman dimuat tanpa throttling CPU. BenchmarkIndex dibaca dari artefak,
// pengali yang tercatat di artefak disamakan, lalu laporan diaudit (-A) dengan pengali itu.
// CPU_MULTIPLIER=<angka> memaksa satu pengali, MAX_ATTEMPTS mengatur jumlah percobaan per halaman.
// Ketentuan "jalankan saat load rendah" (keputusan yang sama): sebelum tiap pengumpulan, skrip menunggu load
// rata-rata 1 menit di bawah LOAD_MAX (bawaan 2,5) paling lama LOAD_WAIT detik (bawaan 300). Kalau load tetap
// tinggi, percobaan itu tidak dihitung. Load saat mulai dicatat di summary.json.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { loadavg, tmpdir } from 'node:os';
import { join } from 'node:path';
import { PORTOFOLIO_URL as SITE } from '../src/config/domain.ts';

// Studi kasus yang diukur: proyek pertama di daftar (sejak 25 Okt 2026 produk TakarLaba).
const defaults = [`beranda=${SITE}/`, `studi-kasus=${SITE}/proyek/takarlaba/`];
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
const forcedMultiplier = process.env.CPU_MULTIPLIER ? Number(process.env.CPU_MULTIPLIER) : null;
const maxAttempts = Number(process.env.MAX_ATTEMPTS ?? 4);
const loadMax = Number(process.env.LOAD_MAX ?? 2.5);
const loadWaitMs = Number(process.env.LOAD_WAIT ?? 300) * 1000;

/** Tunggu sampai load rata-rata 1 menit di bawah loadMax; kembalikan load saat itu, atau null kalau batas waktu habis. */
function waitForLowLoad() {
  const end = Date.now() + loadWaitMs;
  for (;;) {
    const load = loadavg()[0];
    if (load < loadMax) return Number(load.toFixed(2));
    if (Date.now() >= end) return null;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
  }
}

/** Pengali CPU untuk benchmarkIndex host, atau null kalau putaran tidak dihitung. */
function multiplierFor(benchmark) {
  if (forcedMultiplier) return forcedMultiplier;
  if (benchmark >= 1500) return 4;
  if (benchmark >= 1000) return 2;
  return null;
}

function runLighthouse(url, outputPath, extraArgs, readReport) {
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
      ...extraArgs,
    ],
    { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromePath } },
  );
  return readReport ? JSON.parse(readFileSync(`${outputPath}.report.json`, 'utf8')) : null;
}

for (const { name, url } of targets) {
  const outputPath = join(outDir, name);
  let counted = null;
  const skipped = [];
  for (let attempt = 1; attempt <= maxAttempts && !counted; attempt++) {
    const loadAtStart = waitForLowLoad();
    if (loadAtStart === null) {
      console.log(`Load tetap di atas ${loadMax} selama ${loadWaitMs / 1000} detik: percobaan ${attempt} tidak dihitung.`);
      skipped.push(`load ${loadavg()[0].toFixed(2)}`);
      continue;
    }
    console.log(`Mengukur ${url} (percobaan ${attempt}, load ${loadAtStart}) …`);
    const artifactsDir = mkdtempSync(join(tmpdir(), 'lh-artefak-'));
    try {
      runLighthouse(url, outputPath, [`-G=${artifactsDir}`, '--throttling.cpuSlowdownMultiplier=4'], false);
      const artifactsPath = join(artifactsDir, 'artifacts.json');
      const artifacts = JSON.parse(readFileSync(artifactsPath, 'utf8'));
      const benchmark = Math.round(artifacts.BenchmarkIndex);
      const multiplier = multiplierFor(benchmark);
      if (multiplier === null) {
        console.log(`benchmarkIndex ${benchmark} di bawah 1.000: putaran tidak dihitung dan diulang.`);
        skipped.push(benchmark);
        continue;
      }
      artifacts.settings.throttling.cpuSlowdownMultiplier = multiplier;
      writeFileSync(artifactsPath, JSON.stringify(artifacts));
      console.log(`benchmarkIndex ${benchmark}: diaudit dengan pengali CPU ${multiplier}x.`);
      const report = runLighthouse(url, outputPath, [`-A=${artifactsDir}`, `--throttling.cpuSlowdownMultiplier=${multiplier}`], true);
      counted = { report, benchmark, multiplier, attempt, loadAtStart };
    } finally {
      rmSync(artifactsDir, { recursive: true, force: true });
    }
  }
  if (!counted) {
    results.push({ name, url, counted: false, skippedBenchmarks: skipped, scores: {}, metrics: { cls: 0 } });
    continue;
  }
  const { report } = counted;
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
    benchmarkIndex: counted.benchmark,
    loadAtStart: counted.loadAtStart,
    cpuSlowdownMultiplier: report.configSettings.throttling.cpuSlowdownMultiplier,
    counted: true,
    skippedBenchmarks: skipped,
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
console.table(Object.fromEntries(results.map((r) => [r.name, { ...r.scores, ...r.metrics, bench: r.benchmarkIndex, cpu: r.cpuSlowdownMultiplier, load: r.loadAtStart, formFactor: r.formFactor }])));

const failing = results.filter((r) => !r.counted || Object.values(r.scores).some((score) => score < minScore) || r.metrics.cls > maxCls);
if (failing.length > 0) {
  console.error(`Skor di bawah ${minScore}, CLS di atas ${maxCls}, atau tidak ada putaran yang dihitung: ${failing.map((r) => r.name).join(', ')}`);
  process.exit(1);
}
console.log(`Semua skor ≥ ${minScore} dan CLS ≤ ${maxCls}.`);
