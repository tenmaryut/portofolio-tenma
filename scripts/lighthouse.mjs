// Mengukur situs dengan Lighthouse (mode mobile, bawaan Lighthouse) dan menyimpan laporannya.
//
//   npm run lighthouse                      → beranda + satu studi kasus situs ini, run median ≥ 95
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
// Penilaian memakai run median (keputusan agen utama 25 Okt 2026, menggantikan syarat ≥ 95 per putaran): tiap halaman
// diukur RUNS putaran terhitung (bawaan 5), lalu yang dinilai run median pilihan computeMedianRun Lighthouse,
// sesuai docs/variability.md: https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md#run-lighthouse-multiple-times
// Semua putaran, termasuk yang di bawah 95, dicatat di summary.json beserta min dan max per halaman. Laporan
// HTML/JSON yang disimpan adalah run median. Putaran yang gagal memuat (runtimeError, misalnya NO_FCP) tidak
// dihitung, sama seperti filterToValidRuns Lighthouse, tetapi kodenya tetap dicatat.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { loadavg, tmpdir } from 'node:os';
import { join } from 'node:path';
import { computeMedianRun, filterToValidRuns } from 'lighthouse/core/lib/median-run.js';
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
const runsPerPage = Number(process.env.RUNS ?? 5);
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

/**
 * Jalankan Lighthouse CLI. CLI tetap menyimpan laporan saat halaman gagal dimuat (runtimeError), lalu keluar
 * dengan kode galat; laporan itu dikembalikan supaya putarannya bisa ditandai tidak dihitung. Galat lain
 * (misalnya Chrome tidak bisa dihubungi) dikembalikan sebagai { failed }.
 */
function runLighthouse(url, outputPath, extraArgs, readReport) {
  const reportPath = `${outputPath}.report.json`;
  for (const ext of ['report.html', 'report.json']) rmSync(`${outputPath}.${ext}`, { force: true });
  try {
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
  } catch (error) {
    if (!readReport || !existsSync(reportPath)) return { failed: `Lighthouse keluar dengan kode ${error.status}` };
  }
  return readReport ? { report: JSON.parse(readFileSync(reportPath, 'utf8')) } : {};
}

/** Satu putaran terhitung: tunggu load rendah, kumpulkan (-G), kalibrasi, audit (-A). Null kalau tidak dihitung. */
function measureOnce(url, outputPath, skipped) {
  const loadAtStart = waitForLowLoad();
  if (loadAtStart === null) {
    console.log(`Load tetap di atas ${loadMax} selama ${loadWaitMs / 1000} detik: percobaan tidak dihitung.`);
    skipped.push(`load ${loadavg()[0].toFixed(2)}`);
    return null;
  }
  console.log(`Mengukur ${url} (load ${loadAtStart}) …`);
  const artifactsDir = mkdtempSync(join(tmpdir(), 'lh-artefak-'));
  try {
    const gathered = runLighthouse(url, outputPath, [`-G=${artifactsDir}`, '--throttling.cpuSlowdownMultiplier=4'], false);
    const artifactsPath = join(artifactsDir, 'artifacts.json');
    if (gathered.failed || !existsSync(artifactsPath)) {
      console.log(`Pengumpulan gagal (${gathered.failed ?? 'artefak tidak ada'}): putaran tidak dihitung dan diulang.`);
      skipped.push('pengumpulan gagal');
      return null;
    }
    const artifacts = JSON.parse(readFileSync(artifactsPath, 'utf8'));
    const benchmark = Math.round(artifacts.BenchmarkIndex);
    const multiplier = multiplierFor(benchmark);
    if (multiplier === null) {
      console.log(`benchmarkIndex ${benchmark} di bawah 1.000: putaran tidak dihitung dan diulang.`);
      skipped.push(benchmark);
      return null;
    }
    artifacts.settings.throttling.cpuSlowdownMultiplier = multiplier;
    writeFileSync(artifactsPath, JSON.stringify(artifacts));
    console.log(`benchmarkIndex ${benchmark}: diaudit dengan pengali CPU ${multiplier}x.`);
    const { report, failed } = runLighthouse(url, outputPath, [`-A=${artifactsDir}`, `--throttling.cpuSlowdownMultiplier=${multiplier}`], true);
    if (failed) {
      console.log(`Audit gagal (${failed}): putaran tidak dihitung dan diulang.`);
      skipped.push('audit gagal');
      return null;
    }
    if (report.runtimeError || filterToValidRuns([report]).length === 0) {
      const code = report.runtimeError?.code ?? 'tanpa FCP/TTI';
      console.log(`Halaman gagal dimuat (${code}): putaran tidak dihitung dan diulang.`);
      skipped.push(code);
      return null;
    }
    const run = { report, benchmark, loadAtStart };
    const { scores, metrics } = describeRun(run);
    console.log(`Putaran terhitung: ${categories.map((id) => scores[id]).join('/')}, TBT ${metrics.tbtMs} ms, LCP ${metrics.lcpMs} ms, CLS ${metrics.cls}.`);
    return run;
  } finally {
    rmSync(artifactsDir, { recursive: true, force: true });
  }
}

function describeRun({ report, benchmark, loadAtStart }) {
  return {
    fetchTime: report.fetchTime,
    benchmarkIndex: benchmark,
    loadAtStart,
    cpuSlowdownMultiplier: report.configSettings.throttling.cpuSlowdownMultiplier,
    scores: Object.fromEntries(categories.map((id) => [id, Math.round(report.categories[id].score * 100)])),
    metrics: {
      cls: Number(report.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
      lcpMs: Math.round(report.audits['largest-contentful-paint'].numericValue),
      tbtMs: Math.round(report.audits['total-blocking-time'].numericValue),
    },
  };
}

for (const { name, url } of targets) {
  const outputPath = join(outDir, name);
  const runs = [];
  const skipped = [];
  const runPath = (n) => (runsPerPage > 1 ? `${outputPath}-putaran${n}` : outputPath);
  // Laporan per putaran hanya sementara: yang disimpan cuma run median, putaran lain tercatat di summary.json.
  const removeRunReports = () => {
    if (runsPerPage === 1) return;
    for (let n = 1; n <= runsPerPage; n++) for (const ext of ['report.html', 'report.json']) rmSync(`${runPath(n)}.${ext}`, { force: true });
  };
  for (let attempt = 1; attempt <= maxAttempts * runsPerPage && runs.length < runsPerPage; attempt++) {
    const path = runPath(runs.length + 1);
    const run = measureOnce(url, path, skipped);
    if (run) runs.push({ ...run, runPath: path });
  }
  if (runs.length < runsPerPage) {
    removeRunReports();
    results.push({ name, url, counted: false, runsCounted: runs.length, notCounted: skipped, scores: {}, metrics: { cls: 0 } });
    continue;
  }
  // Run median ala Lighthouse: paling dekat dengan median FCP dan TTI.
  const median = runsPerPage > 1 ? computeMedianRun(runs.map((run) => run.report)) : runs[0].report;
  const medianIndex = runs.findIndex((run) => run.report === median);
  if (runsPerPage > 1) {
    for (const ext of ['report.html', 'report.json']) copyFileSync(`${runs[medianIndex].runPath}.${ext}`, `${outputPath}.${ext}`);
    removeRunReports();
  }
  const described = runs.map(describeRun);
  const range = (pick) => {
    const values = described.map(pick);
    return { min: Math.min(...values), max: Math.max(...values) };
  };
  results.push({
    name,
    url,
    lighthouseVersion: median.lighthouseVersion,
    formFactor: median.configSettings.formFactor,
    counted: true,
    runsCounted: runs.length,
    medianRun: medianIndex + 1,
    ...described[medianIndex],
    range: {
      ...Object.fromEntries(categories.map((id) => [id, range((run) => run.scores[id])])),
      cls: range((run) => run.metrics.cls),
      lcpMs: range((run) => run.metrics.lcpMs),
      tbtMs: range((run) => run.metrics.tbtMs),
    },
    notCounted: skipped,
    runs: described,
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
const row = (run) => ({ ...run.scores, ...run.metrics, bench: run.benchmarkIndex, cpu: run.cpuSlowdownMultiplier, load: run.loadAtStart });
console.log('Semua putaran terhitung:');
console.table(Object.fromEntries(results.flatMap((r) => (r.runs ?? []).map((run, i) => [`${r.name} #${i + 1}${i + 1 === r.medianRun ? ' (median)' : ''}`, row(run)]))));
console.log('Run median yang dinilai (min–max performa semua putaran):');
console.table(Object.fromEntries(results.map((r) => [r.name, { ...row(r), 'perf min–max': r.range ? `${r.range.performance.min}–${r.range.performance.max}` : '-', putaran: r.runsCounted, formFactor: r.formFactor }])));

const failing = results.filter((r) => !r.counted || Object.values(r.scores).some((score) => score < minScore) || r.metrics.cls > maxCls);
if (failing.length > 0) {
  console.error(`Run median di bawah ${minScore}, CLS di atas ${maxCls}, atau putaran terhitung kurang dari ${runsPerPage}: ${failing.map((r) => r.name).join(', ')}`);
  process.exit(1);
}
console.log(`Run median semua halaman ≥ ${minScore} dan CLS ≤ ${maxCls} (${runsPerPage} putaran terhitung per halaman).`);
