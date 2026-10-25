import { HUKUM_URL, PASALBARU_URL, TAKARLABA_URL, TOKO_URL } from '../config/domain';
import { projectSlugs, type Locale, type ProjectSlug } from '../i18n/routes';

type Localized<T> = Record<Locale, T>;

/** `product`: produk milik Tenma yang dipakai orang sungguhan. `demo`: situs untuk bisnis fiktif. */
export type ProjectKind = 'product' | 'demo';

export interface LighthouseRun {
  page: Localized<string>;
  url: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface TestSuite {
  name: Localized<string>;
  tool: string;
  count: number;
  /** Tanggal laporan suite ini (YYYY-MM-DD) kalau berbeda antar-suite; bawaannya `testsReportedOn`. */
  reportedOn?: string;
}

export interface ProjectResults {
  /** Tanggal pengukuran Lighthouse (YYYY-MM-DD), dijalankan dari server ini (lihat docs/lighthouse/proyek-demo/ dan docs/lighthouse/produk/). */
  measuredOn: string;
  lighthouseVersion: string;
  /** Jumlah putaran pengukuran kalau skor yang ditampilkan adalah nilai tengahnya (median). */
  medianOf?: number;
  lighthouse: LighthouseRun[];
  /** Tanggal laporan test proyek (progress proyek itu), semuanya lulus. Untuk beberapa tanggal: yang terbaru. */
  testsReportedOn: string;
  tests: TestSuite[];
}

export interface Challenge {
  title: string;
  body: string;
}

export interface Project {
  slug: ProjectSlug;
  kind: ProjectKind;
  /** Alamat situs yang online: domain produk atau alamat demo. */
  liveUrl: string;
  /** Repo kode sumber publik di GitHub; `null` kalau belum atau tidak dipublikasikan (repo produk privat). */
  sourceUrl: string | null;
  /** Nama proyek, mis. "Company profile kantor hukum + CMS" atau "TakarLaba: …". */
  name: Localized<string>;
  /** Nama produk, atau nama bisnis fiktif yang dipakai di demo. */
  brand: string;
  summary: Localized<string>;
  role: Localized<string>;
  stack: string[];
  problem: Localized<string[]>;
  solution: Localized<string[]>;
  features: Localized<string[]>;
  challenges: Localized<Challenge[]>;
  /** Hasil uji yang benar-benar diukur. `null` selama belum diukur. */
  results: ProjectResults | null;
  /** Keterangan cuplikan animasi (videonya di src/data/videos.ts); `null` selama belum ada rekaman. */
  videoCaption: Localized<string> | null;
}

export const projects: Project[] = [
  {
    slug: 'takarlaba',
    kind: 'product',
    liveUrl: `${TAKARLABA_URL}/`,
    sourceUrl: null,
    brand: 'TakarLaba',
    name: {
      id: 'TakarLaba: hitung untung bersih di marketplace',
      en: 'TakarLaba: marketplace profit calculator',
    },
    summary: {
      id: 'Aplikasi web gratis yang merinci potongan Shopee, TikTok Shop & Tokopedia, dan Lazada, lalu menghitung untung bersih, harga impas, dan batas biaya iklan per pesanan.',
      en: 'A free web app that itemizes Shopee, TikTok Shop & Tokopedia, and Lazada fees, then works out net profit, the break-even price, and the ad spend limit per order.',
    },
    role: {
      id: 'Perencanaan produk, riset tarif, pengembangan, pengujian, dan peluncuran',
      en: 'Product planning, fee research, development, testing, and launch',
    },
    stack: ['Node.js 24', 'TypeScript', 'Hono', 'SQLite', 'Zod', 'esbuild', 'PWA'],
    problem: {
      id: [
        'Penjual di Shopee, TikTok Shop & Tokopedia, dan Lazada dikenai banyak potongan: biaya administrasi, biaya proses pesanan, program gratis ongkir, komisi dinamis, sampai biaya layanan logistik. Susunannya berbeda di tiap platform, dan sebagian potongan punya batas maksimum per produk.',
        'Tarifnya juga sering berubah. Sepanjang 2026, beberapa platform menaikkan biaya serentak pada Mei, batas komisi dinamis berubah pada September, dan biaya Gratis Ongkir XTRA Shopee naik mulai 1 Desember. Harga jual yang dulu aman bisa diam-diam kehilangan marginnya.',
      ],
      en: [
        'Sellers on Shopee, TikTok Shop & Tokopedia, and Lazada pay a stack of deductions: admin fees, order processing fees, free shipping programs, dynamic commissions, and logistics service fees. Each platform structures them differently, and some fees are capped per product.',
        'The rates also change often. During 2026, several platforms raised fees together in May, the dynamic commission cap changed in September, and Shopee’s Gratis Ongkir XTRA (free shipping) fee goes up on December 1. A price that used to be safe can quietly lose its margin.',
      ],
    },
    solution: {
      id: [
        'TakarLaba menyimpan tarif resmi per kategori dan subkategori, masing-masing dengan tautan sumber dan tanggal terakhir dicek. Penjual cukup mengisi harga jual, modal, dan kategori. Setiap potongan lalu tampil terperinci, bersama untung bersih, margin, harga impas, dan batas biaya iklan (ROAS impas).',
        'Mesin hitungnya adalah satu modul TypeScript yang dipakai bersama oleh browser dan server. Angkanya berubah saat isian diketik, dan formulirnya tetap bekerja tanpa JavaScript. Kalkulator bisa dipakai gratis tanpa daftar, sedangkan akun gratis menyimpan 3 produk yang dihitung ulang dengan tarif terbaru setiap kali dibuka.',
      ],
      en: [
        'TakarLaba stores the official rates per category and subcategory, each with a link to its source and the date it was last checked. Sellers enter a selling price, a product cost, and a category. Every deduction then appears line by line, next to net profit, margin, the break-even price, and the ad spend limit (break-even ROAS).',
        'The fee engine is a single TypeScript module shared by the browser and the server. Numbers update as you type, and the form still works without JavaScript. The calculator is free without signing up, and a free account saves 3 products that are recalculated with the latest rates every time they are opened.',
      ],
    },
    features: {
      id: [
        'Kalkulator untuk Shopee (termasuk Mall), TikTok Shop & Tokopedia, dan Lazada, dengan rumus di balik setiap potongan',
        'Harga impas dan batas biaya iklan per pesanan (ROAS impas)',
        'Pilihan untuk memakai tarif Shopee yang berlaku mulai 1 Desember 2026',
        'Tabel tarif tiap platform dengan tautan ke halaman resminya',
        'Hasil hitungan bisa dibagikan lewat tautan atau WhatsApp',
        'Akun gratis lewat email atau Google, dengan 3 produk tersimpan, ekspor data, dan penghapusan akun mandiri',
        'Bisa dipasang di HP sebagai aplikasi (PWA), dan kalkulatornya tetap jalan tanpa internet',
        'Fitur Pro sudah dibangun (produk tanpa batas, harga untuk target margin, simulasi kampanye, dan perhitungan massal sampai 500 baris dari CSV), tetapi pembayarannya belum dibuka',
      ],
      en: [
        'Calculators for Shopee (including Mall), TikTok Shop & Tokopedia, and Lazada, with the formula behind every deduction',
        'Break-even price and the ad spend limit per order (break-even ROAS)',
        'A switch to apply the Shopee rates that take effect on December 1, 2026',
        'Rate tables for each platform, linked to the official pages',
        'Calculations can be shared by link or WhatsApp',
        'Free accounts with email or Google sign-in: 3 saved products, data export, and self-service account deletion',
        'Installable on a phone as an app (PWA), and the calculator keeps working offline',
        'Pro features are built (unlimited products, target-margin pricing, campaign simulation, and bulk calculations of up to 500 rows from CSV), but payments are not open yet',
      ],
    },
    challenges: {
      id: [
        {
          title: 'Tarif yang berganti menurut tanggal',
          body: 'Setiap tarif menyimpan tanggal mulai berlakunya, dan mesin hitung memilih tarif menurut tanggal WIB. Perubahan yang sudah diumumkan, misalnya biaya program Shopee per 1 Desember 2026, bisa disimulasikan sebelum berlaku. Produk yang disimpan selalu dihitung ulang dengan tarif terbaru.',
        },
        {
          title: 'Harga impas yang mengikuti batas potongan',
          body: 'Sebagian potongan punya batas maksimum per produk, sehingga harga impas tidak bisa dihitung dari satu rumus. TakarLaba mencarinya dengan pencarian biner yang menjalankan mesin hitung lengkap di setiap langkah.',
        },
        {
          title: 'Satu mesin hitung, dicek dengan contoh resmi',
          body: 'Mesin hitung yang sama dipakai oleh server, browser, dan alur pembuatan konten media sosial. Test unitnya mencocokkan hasil dengan contoh perhitungan resmi dari platform, dan pembuatan konten berhenti jika ada angka di naskah video yang berbeda dari hasil mesin hitung.',
        },
        {
          title: 'Aman, dengan data sesedikit mungkin',
          body: 'TakarLaba memakai CSP ketat tanpa script inline, token sesi yang di-hash, perlindungan CSRF double-submit, serta pembatasan laju untuk login dan pendaftaran. Pengunjung tanpa akun tidak mendapat cookie, dan analitiknya hanya menyimpan jumlah harian tanpa alamat IP.',
        },
      ],
      en: [
        {
          title: 'Rates that change by date',
          body: 'Every rate stores the date it takes effect, and the engine picks rates by the date in Jakarta time. Announced changes, such as Shopee’s program fees from December 1, 2026, can be simulated before they apply. Saved products are always recalculated with the current rates.',
        },
        {
          title: 'A break-even price that respects fee caps',
          body: 'Some fees are capped per product, so the break-even price cannot be found with a single formula. TakarLaba finds it with a binary search that runs the full fee engine at every step.',
        },
        {
          title: 'One engine, checked against official examples',
          body: 'The same engine powers the server, the browser, and the social media content pipeline. Its unit tests compare results with the platforms’ own worked examples, and content production stops if a number in a video script does not match the engine.',
        },
        {
          title: 'Secure, with as little data as possible',
          body: 'TakarLaba uses a strict CSP with no inline scripts, hashed session tokens, double-submit CSRF protection, and rate limits on sign-in and sign-up. Visitors without an account get no cookies, and the analytics keep daily totals only, with no IP addresses.',
        },
      ],
    },
    results: {
      measuredOn: '2026-10-25',
      lighthouseVersion: '13.5.0',
      medianOf: 3,
      lighthouse: [
        {
          page: { id: 'Beranda dan kalkulator', en: 'Home page and calculator' },
          url: `${TAKARLABA_URL}/`,
          performance: 98,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
        },
        {
          page: { id: 'Tabel tarif Shopee', en: 'Shopee rate table' },
          url: `${TAKARLABA_URL}/tarif/shopee`,
          performance: 100,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
        },
      ],
      testsReportedOn: '2026-10-22',
      tests: [
        {
          name: {
            id: 'Test unit: mesin hitung tarif (dicocokkan dengan contoh resmi platform), server dan keamanan, akun, serta pemeriksa angka di naskah konten',
            en: 'Unit tests: the fee engine (checked against the platforms’ official examples), server and security, accounts, and the number checks for content scripts',
          },
          tool: 'Vitest',
          count: 174,
          reportedOn: '2026-10-22',
        },
        {
          name: {
            id: 'Test end-to-end: menghitung dan membagikan tautan, formulir tanpa JavaScript, halaman tarif dan PWA, serta pendaftaran akun sampai penghapusannya, di Pixel 7 dan Chrome desktop',
            en: 'End-to-end tests: calculating and sharing links, the form without JavaScript, rate pages and the PWA, and an account from sign-up to deletion, on a Pixel 7 and desktop Chrome',
          },
          tool: 'Playwright',
          count: 10,
          reportedOn: '2026-10-18',
        },
      ],
    },
    videoCaption: null,
  },
  {
    slug: 'pasalbaru',
    kind: 'product',
    liveUrl: `${PASALBARU_URL}/`,
    sourceUrl: null,
    brand: 'PasalBaru',
    name: {
      id: 'PasalBaru: konverter pasal KUHP lama ke baru',
      en: 'PasalBaru: old-to-new Criminal Code converter',
    },
    summary: {
      id: 'Situs dan aplikasi Android yang menunjukkan padanan pasal KUHP lama di KUHP baru (UU 1/2023), lengkap dengan teks resmi, ancaman pidana, dan penyesuaian UU 1/2026.',
      en: 'A website and an Android app that show where an old Criminal Code article sits in the new Code (Law 1/2023), with the official text, penalties, and Law 1/2026 changes.',
    },
    role: {
      id: 'Perencanaan produk, verifikasi data, pengembangan, pengujian, dan peluncuran',
      en: 'Product planning, data verification, development, testing, and launch',
    },
    stack: ['Astro 7', 'TypeScript', 'Python', 'Tesseract OCR', 'satori', 'openpyxl', 'PWA', 'Android TWA'],
    problem: {
      id: [
        'Sejak 2 Januari 2026, KUHP Nasional (Undang-Undang Nomor 1 Tahun 2023) menggantikan KUHP peninggalan Belanda, dan sebagian pasalnya disesuaikan lagi oleh Undang-Undang Nomor 1 Tahun 2026 tentang Penyesuaian Pidana. Nomor pasal yang dihafal bertahun-tahun, seperti pencurian atau penipuan, kini berpindah.',
        'Mahasiswa hukum, advokat, paralegal, wartawan, dan masyarakat umum butuh cara cepat untuk tahu pasal lama itu sekarang menjadi pasal berapa, dengan teks resmi yang bisa dipercaya.',
      ],
      en: [
        'Since January 2, 2026, Indonesia’s National Criminal Code (Law No. 1 of 2023) has replaced the Dutch-era Code, and some of its articles were adjusted again by Law No. 1 of 2026 on criminal law adjustments. Article numbers that people memorized for years, such as theft or fraud, have moved.',
        'Law students, lawyers, paralegals, journalists, and the general public need a quick way to find which article an old one has become, with official text they can trust.',
      ],
    },
    solution: {
      id: [
        'PasalBaru memetakan 139 pasal KUHP lama yang sering dipakai ke padanannya di KUHP baru. Setiap halaman padanan menampilkan teks lama dan baru berdampingan, unsur dan perbedaannya, ancaman pidana beserta kategori dendanya dalam rupiah, dan perubahan dari UU 1/2026.',
        'Teks KUHP baru berasal dari salinan resmi yang berupa hasil pindai. Teks itu dibaca dua kali lalu kedua hasilnya dibandingkan, dan setiap pasal yang dikutip dicocokkan kata per kata dengan gambar halamannya. Padanan yang masih bisa diperdebatkan diberi label "Masih ditinjau".',
      ],
      en: [
        'PasalBaru maps 139 frequently used old articles to their counterparts in the new Code. Each mapping page shows the old and new text side by side, their elements and differences, the penalty with its fine category in rupiah, and any changes made by Law 1/2026.',
        'The new Code’s text comes from official copies that are scanned images. The text is read twice and the two readings are compared. Every quoted article is then checked word by word against the image of its page. Mappings that are still open to debate are labeled "Masih ditinjau" (under review).',
      ],
    },
    features: {
      id: [
        'Pencarian nomor pasal lama, nomor pasal baru, atau kata kunci, yang diproses di perangkat pengguna',
        '139 halaman padanan dengan teks resmi berdampingan, ancaman pidana, dan kategori denda',
        'Halaman penyesuaian UU 1/2026, dengan label pada pasal yang ikut diubah',
        'Kartu bergambar untuk dibagikan dari setiap padanan, plus tautan WhatsApp',
        'Bisa dipasang di HP sebagai PWA, halaman yang pernah dibuka tetap terbaca tanpa internet, dan APK Android tersedia untuk diunduh langsung',
        'Produk berbayar: Tabel Konkordansi KUHP (PDF A4 dan Excel berfilter) serta Tabel Konkordansi KUHAP dengan 362 padanan UU 8/1981 ke UU 20/2025',
        'Tanpa akun dan tanpa cookie; laporan kesalahan dari pengguna disimpan paling lama 180 hari',
      ],
      en: [
        'Search by old article number, new article number, or keyword, processed on the user’s device',
        '139 mapping pages with official text side by side, penalties, and fine categories',
        'A page for the Law 1/2026 adjustments, with labels on the articles it changed',
        'An image card to share for every mapping, plus a WhatsApp link',
        'Installable on a phone as a PWA, with pages already visited readable offline, and an Android APK available as a direct download',
        'Paid products: a KUHP concordance table (A4 PDF and filterable Excel) and a KUHAP (Criminal Procedure Code) concordance table with 362 mappings from Law 8/1981 to Law 20/2025',
        'No accounts and no cookies; error reports from users are kept for at most 180 days',
      ],
    },
    challenges: {
      id: [
        {
          title: 'Teks resmi dari hasil pindai',
          body: 'Salinan resmi UU 1/2023 dan UU 1/2026 berupa gambar hasil pindai. Teksnya dibaca dua kali, oleh Tesseract dan dari lapisan teks PDF. Kata yang terbaca sama pada kedua pembacaan diterima, sedangkan yang berbeda dicek ke kamus atau ditandai meragukan. Teks yang belum diperiksa secara manual diberi label "hasil OCR" di situs.',
        },
        {
          title: 'Validator sebelum setiap rilis',
          body: 'Setiap padanan melewati validator otomatis. Nomor pasal harus ada, kutipan harus sama persis dengan teks terstruktur, pasal yang dikutip harus sudah terverifikasi, dan kategori denda serta lama pidana dicek ulang terhadap kutipannya. Produk berbayar hanya memakai padanan berkeyakinan tinggi.',
        },
        {
          title: 'Cepat, dan tetap terbaca saat sinyal hilang',
          body: 'Situsnya statis (Astro) dengan CSP ketat tanpa script inline. Service worker mengambil halaman dari jaringan lebih dulu dan memakai cache sebagai cadangan. Data terbaru langsung sampai, dan halaman yang pernah dibuka tetap bisa dibaca tanpa internet.',
        },
        {
          title: 'Kartu bergambar yang dibuat otomatis',
          body: 'Gambar kartu untuk setiap padanan dibuat saat build dengan satori dan resvg dari data yang sama dengan halamannya. Begitu data padanan diperbarui, kartunya ikut berubah tanpa disunting satu per satu.',
        },
      ],
      en: [
        {
          title: 'Official text from scanned copies',
          body: 'The official copies of Law 1/2023 and Law 1/2026 are scanned images. Their text is read twice, by Tesseract and from the PDF’s text layer. Words that both readings agree on are accepted, while differences are checked against a word list or flagged as uncertain. Text not yet checked by hand is labeled "hasil OCR" (OCR output) on the site.',
        },
        {
          title: 'A validator before every release',
          body: 'Every mapping goes through an automated validator. Article numbers must exist, quotes must match the structured text exactly, cited articles must already be verified, and fine categories and prison terms are cross-checked against the quote. Paid products use high-confidence mappings only.',
        },
        {
          title: 'Fast, and readable when the signal drops',
          body: 'The site is static (Astro) and runs under a strict CSP with no inline scripts. Its service worker fetches pages from the network first and falls back to the cache. New data arrives right away, and pages already visited stay readable offline.',
        },
        {
          title: 'Share cards generated automatically',
          body: 'The card image for every mapping is generated at build time with satori and resvg from the same data as its page. When a mapping is updated, its card changes too, with no manual editing.',
        },
      ],
    },
    results: {
      measuredOn: '2026-10-25',
      lighthouseVersion: '13.5.0',
      medianOf: 3,
      lighthouse: [
        {
          page: { id: 'Beranda', en: 'Home page' },
          url: `${PASALBARU_URL}/`,
          performance: 99,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
        },
        {
          page: { id: 'Halaman padanan: pencurian', en: 'Mapping page: theft' },
          url: `${PASALBARU_URL}/pasal/pencurian/`,
          performance: 99,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
        },
      ],
      testsReportedOn: '2026-10-25',
      tests: [
        {
          name: {
            id: 'Test end-to-end di situs live: pencarian, halaman pasal, kartu untuk dibagikan, PWA dan mode offline, header keamanan, serta aksesibilitas dan kontras warna dengan axe, di Pixel 7 dan Chrome desktop',
            en: 'End-to-end tests on the live site: search, article pages, share cards, the PWA and offline mode, security headers, and accessibility and color contrast with axe, on a Pixel 7 and desktop Chrome',
          },
          tool: 'Playwright',
          count: 142,
          reportedOn: '2026-10-25',
        },
        {
          name: {
            id: 'Test akurasi data Tabel Konkordansi KUHAP: validator padanan dan kutipan',
            en: 'Data accuracy tests for the KUHAP concordance table: mapping and quote validator',
          },
          tool: 'pytest',
          count: 26,
          reportedOn: '2026-10-12',
        },
      ],
    },
    videoCaption: null,
  },
  {
    slug: 'company-profile-hukum',
    kind: 'demo',
    liveUrl: `${HUKUM_URL}/`,
    sourceUrl: 'https://github.com/tenmaryut/company-profile-hukum',
    brand: 'Kantor Hukum Nalar Saksama',
    name: {
      id: 'Company profile kantor hukum + CMS',
      en: 'Law firm company profile + CMS',
    },
    summary: {
      id: 'Situs profil untuk kantor hukum fiktif, lengkap dengan panel admin supaya isinya bisa diperbarui sendiri tanpa menyentuh kode.',
      en: 'A company profile for a fictional law firm, with an admin panel so the content can be updated without touching any code.',
    },
    role: {
      id: 'Perencanaan, pengembangan, pengujian, dan deploy',
      en: 'Planning, development, testing, and deployment',
    },
    stack: ['Laravel 13', 'Filament 5', 'Livewire 4', 'Blade', 'Tailwind CSS 4', 'SQLite', 'PHP 8.3', 'Caddy'],
    problem: {
      id: [
        'Kantor hukum kecil butuh website yang tepercaya dan informatif, tetapi isinya sering berubah: bidang praktik, profil advokat, artikel, dan FAQ. Kalau setiap perubahan harus lewat programmer, situsnya cepat usang.',
        'Ada juga batasan etika profesi: promosi jasa advokat tidak boleh berlebihan, misalnya mengaku "terbaik" atau menjanjikan hasil perkara. Form konsultasinya pun menampung data pribadi calon klien yang wajib dijaga.',
      ],
      en: [
        'A small law firm needs a website that feels trustworthy and informative, yet its content changes often: practice areas, lawyer profiles, articles, and FAQs. If every change has to go through a developer, the site goes stale quickly.',
        'There are ethical limits too: lawyers may not over-promote their services, for example by claiming to be "the best" or promising case outcomes. The consultation form also collects personal data from prospective clients, which must be protected.',
      ],
    },
    solution: {
      id: [
        'Company profile dibangun dengan Laravel 13 dan panel admin Filament. Pengelola situs bisa mengubah bidang praktik, tim, artikel bergambar, FAQ, dan teks halaman, serta membaca permintaan konsultasi dari satu dasbor.',
        'Kontennya informatif tanpa klaim berlebihan, termasuk enam artikel hukum orisinal yang rujukannya dicek ke sumber resmi. Form konsultasi dilengkapi pemberitahuan privasi, perlindungan anti-spam, dan penghapusan otomatis setelah 7 hari, mengikuti prinsip Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
      ],
      en: [
        'The company profile is built with Laravel 13 and a Filament admin panel. Site managers can edit practice areas, team members, illustrated articles, FAQs, and page copy, and read consultation requests from a single dashboard.',
        'The copy is informative without overstated claims, including six original legal articles whose references were checked against official sources. The consultation form comes with a privacy notice, spam protection, and automatic deletion after 7 days, following the principles of Indonesia’s Personal Data Protection Law (Law No. 27 of 2022).',
      ],
    },
    features: {
      id: [
        'Beranda, profil firma, bidang praktik, tim, FAQ, dan kontak dengan peta ilustrasi statis',
        'Enam artikel hukum dengan kategori, pencarian, daftar isi, dan catatan kaki, termasuk KUHP Nasional dan KUHAP baru',
        'Form konsultasi dengan honeypot, jebakan waktu, pembatasan laju, dan persetujuan privasi',
        'Panel admin Filament untuk bidang praktik, tim, artikel bergambar, FAQ, teks halaman, dan permintaan konsultasi',
        'Akun demo di halaman login admin, dengan data yang direset otomatis tiap malam',
        'SEO: meta, Open Graph, sitemap, data terstruktur LegalService, Article, dan FAQPage, serta halaman error khusus',
        'Animasi CSS yang tenang tanpa JavaScript: hero bertahap dengan garis tinta, kartu muncul saat di-scroll, transisi antarhalaman, FAQ yang membuka halus, dan bilah progres baca',
      ],
      en: [
        'Home, firm profile, practice areas, team, FAQ, and contact pages with a static illustrated map',
        'Six legal articles with categories, search, a table of contents, and footnotes, including pieces on Indonesia’s new Criminal Code and Criminal Procedure Code',
        'Consultation form with a honeypot, a time trap, rate limiting, and privacy consent',
        'Filament admin panel for practice areas, team, illustrated articles, FAQs, page copy, and consultation requests',
        'Demo account shown on the admin login page, with data reset automatically every night',
        'SEO: meta tags, Open Graph, sitemap, LegalService, Article, and FAQPage structured data, and custom error pages',
        'Calm CSS animations without JavaScript: a staged hero with an ink line, cards that appear on scroll, page transitions, smoothly opening FAQs, and a reading progress bar',
      ],
    },
    challenges: {
      id: [
        {
          title: 'Data pribadi yang tidak menumpuk',
          body: 'Permintaan konsultasi dihapus otomatis setelah 7 hari oleh tugas terjadwal yang berjalan tiap jam. Notifikasi ke admin dikirim tanpa data pribadi, dan akun demo hanya bisa melihat data contoh serta kiriman dari browsernya sendiri.',
        },
        {
          title: 'CSP ketat tanpa mengorbankan panel admin',
          body: 'Halaman publik dibuat tanpa JavaScript (menu ponsel dan FAQ memakai elemen details) dengan font yang di-host sendiri, sehingga bisa memakai Content Security Policy yang ketat. Panel Filament, yang butuh script inline, mendapat kebijakan terpisah.',
        },
        {
          title: 'Demo publik yang aman dipulihkan',
          body: 'Seluruh data demo direset tiap tengah malam lewat systemd timer. Perintah reset memeriksa semua konten lebih dulu sehingga gagal dengan aman kalau ada yang rusak, dan akun admin asli disimpan terpisah.',
        },
        {
          title: 'Server yang dikunci rapat',
          body: 'Laravel berjalan di pool PHP-FPM tersendiri sebagai www-data dengan open_basedir, socket-nya hanya bisa diakses Caddy, serta file .env dan folder database berizin ketat.',
        },
      ],
      en: [
        {
          title: 'Personal data that does not pile up',
          body: 'Consultation requests are deleted automatically after 7 days by a scheduled task that runs every hour. Admin notifications contain no personal data, and the demo account can only see sample data and submissions from its own browser.',
        },
        {
          title: 'A strict CSP without breaking the admin panel',
          body: 'Public pages ship no JavaScript (the mobile menu and FAQ use the details element) and self-hosted fonts, so they can run under a strict Content Security Policy. The Filament panel, which needs inline scripts, gets its own policy.',
        },
        {
          title: 'A public demo that recovers safely',
          body: 'All demo data is reset every midnight with a systemd timer. The reset command validates all content first, so it fails safely if anything is broken, and the real admin account is stored separately.',
        },
        {
          title: 'A locked-down server',
          body: 'Laravel runs in its own PHP-FPM pool as www-data with open_basedir, its socket is reachable only by Caddy, and the .env file and database folder have strict permissions.',
        },
      ],
    },
    results: {
      measuredOn: '2026-10-03',
      lighthouseVersion: '13.5.0',
      lighthouse: [
        {
          page: { id: 'Beranda', en: 'Home page' },
          url: `${HUKUM_URL}/`,
          performance: 100,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
        },
        {
          page: { id: 'Artikel: pokok perubahan KUHP Nasional', en: 'Article: key changes in the new Criminal Code' },
          url: `${HUKUM_URL}/artikel/kuhp-nasional-pokok-perubahan`,
          performance: 100,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
        },
      ],
      testsReportedOn: '2026-10-03',
      tests: [
        {
          name: {
            id: 'Test Laravel: halaman publik, validasi dan penyimpanan form, akses admin, reset demo, kesiapan domain',
            en: 'Laravel tests: public pages, form validation and storage, admin access, demo reset, domain readiness',
          },
          tool: 'PHPUnit',
          count: 59,
        },
        {
          name: {
            id: 'Test end-to-end: kirim form, login admin demo, tampilan responsif, dan animasi (termasuk reduced motion)',
            en: 'End-to-end tests: form submission, demo admin login, responsive layout, and animations (including reduced motion)',
          },
          tool: 'Playwright',
          count: 13,
        },
      ],
    },
    videoCaption: {
      id: 'Animasi beranda Nalar Saksama: judul dan subjudul muncul bertahap, garis tinta di bawah judul tergambar, lalu ilustrasi memorandum terisi sampai capnya muncul. Rekaman Playwright dari situs live, sekitar 5 detik, tanpa suara.',
      en: 'Nalar Saksama’s home page animation: the heading and subheading appear in sequence, an ink line draws itself under the heading, and the memorandum illustration fills in until its stamp appears. A Playwright recording of the live site, about 5 seconds, no sound.',
    },
  },
  {
    slug: 'toko-online-umkm',
    kind: 'demo',
    liveUrl: `${TOKO_URL}/`,
    sourceUrl: 'https://github.com/tenmaryut/toko-online-umkm',
    brand: 'Lumbung Kabut',
    name: {
      id: 'Toko online UMKM',
      en: 'Online store for a small business',
    },
    summary: {
      id: 'Toko online full-stack untuk UMKM fiktif: katalog, keranjang, checkout, akun pelanggan, dan dasbor admin.',
      en: 'A full-stack online store for a fictional small business: catalog, cart, checkout, customer accounts, and an admin dashboard.',
    },
    role: {
      id: 'Perencanaan, pengembangan, pengujian, dan deploy',
      en: 'Planning, development, testing, and deployment',
    },
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Drizzle ORM', 'SQLite', 'Better Auth', 'Zod', 'Caddy'],
    problem: {
      id: [
        'Banyak UMKM bergantung penuh pada marketplace. Toko sendiri memberi kendali atas tampilan, data pelanggan, dan hubungan dengan pembeli, tetapi harus tetap mudah dipakai: produk gampang dicari, ongkir jelas sejak awal, dan pesanan mudah dikelola.',
      ],
      en: [
        'Many small businesses depend entirely on marketplaces. Their own store gives them control over the look, customer data, and the relationship with buyers, but it still has to be easy to use: products that are easy to find, shipping costs that are clear up front, and orders that are easy to manage.',
      ],
    },
    solution: {
      id: [
        'Toko dibangun dengan Next.js 16 (App Router), Drizzle ORM, dan database SQLite. Pembeli bisa mencari dan memfilter produk, menyimpan keranjang, lalu checkout dengan ongkir tetap per zona dan pembayaran simulasi.',
        'Pemilik toko mendapat dasbor untuk melihat grafik penjualan, mengelola produk dan stok, serta mengubah status pesanan dari dibayar, dikemas, dikirim, sampai selesai.',
      ],
      en: [
        'The store is built with Next.js 16 (App Router), Drizzle ORM, and an SQLite database. Shoppers can search and filter products, keep a persistent cart, and check out with flat shipping rates per zone and a simulated payment.',
        'The owner gets a dashboard with a sales chart, product and stock management, and order status updates from paid, packed, and shipped to completed.',
      ],
    },
    features: {
      id: [
        'Katalog dengan kategori, pencarian, filter harga dan ketersediaan, urutan, dan harga dalam format Rupiah',
        'Keranjang yang tetap tersimpan setelah halaman dimuat ulang',
        'Checkout dengan ongkir tetap per zona (38 provinsi, 4 zona) dan pembayaran simulasi; stok berkurang saat pesanan dibuat',
        'Akun pelanggan: daftar, masuk, riwayat pesanan dengan linimasa status, dan pembatalan',
        'Dasbor admin: grafik penjualan 14 hari, produk dengan unggah gambar, kategori, status pesanan, dan pelanggan',
        'Akun demo pelanggan dan admin, dengan data yang direset otomatis tiap malam',
        'Animasi belanja: konfirmasi tambah ke keranjang, keranjang mini, skeleton katalog, toast, linimasa pesanan, dan angka dasbor yang menghitung naik',
      ],
      en: [
        'Catalog with categories, search, price and availability filters, sorting, and prices in Indonesian Rupiah',
        'A cart that survives page reloads',
        'Checkout with flat shipping per zone (38 provinces, 4 zones) and simulated payment; stock decreases when an order is placed',
        'Customer accounts: sign-up, sign-in, order history with a status timeline, and cancellation',
        'Admin dashboard: 14-day sales chart, products with image uploads, categories, order statuses, and customers',
        'Demo customer and admin accounts, with data reset automatically every night',
        'Shopping animations: add-to-cart confirmation, a mini cart, catalog skeletons, toasts, an order timeline, and dashboard numbers that count up',
      ],
    },
    challenges: {
      id: [
        {
          title: 'Stok yang tetap konsisten',
          body: 'Pesanan dibuat dan stok dikurangi dalam satu transaksi database yang dijaga aturan CHECK stok ≥ 0, sehingga stok tidak bisa minus ketika dua pembeli checkout bersamaan. Harga dan stok di keranjang selalu dihitung ulang dari database.',
        },
        {
          title: 'Keamanan dijaga di server',
          body: 'Setiap input divalidasi dengan Zod, akses admin diperiksa di layout dan di setiap Server Action, login, pendaftaran, checkout, serta aksi admin dibatasi lajunya, dan setiap halaman memakai CSP dengan nonce per permintaan.',
        },
        {
          title: 'Unggahan gambar yang aman',
          body: 'Isi file diperiksa dengan sharp, bukan sekadar ekstensinya, ukurannya dibatasi 2 MB, lalu dikonversi ke WebP tanpa metadata EXIF dan disimpan di luar folder build.',
        },
        {
          title: 'Layanan yang dikunci rapat',
          body: 'Build standalone Next.js berjalan sebagai layanan systemd non-root (DynamicUser) dengan ProtectSystem=strict, PrivateTmp, dan NoNewPrivileges; systemd-analyze security menilainya 1,2 (OK). Admin demo hanya melihat data pelanggan dalam bentuk tersamar.',
        },
      ],
      en: [
        {
          title: 'Stock that stays consistent',
          body: 'Orders are created and stock is reduced in a single database transaction guarded by a CHECK stock ≥ 0 constraint, so stock cannot go negative when two shoppers check out at the same time. Cart prices and stock are always recalculated from the database.',
        },
        {
          title: 'Security enforced on the server',
          body: 'Every input is validated with Zod, admin access is checked in the layout and in every Server Action, sign-in, sign-up, checkout, and admin actions are rate limited, and every page uses a CSP with a per-request nonce.',
        },
        {
          title: 'Safe image uploads',
          body: 'File contents are inspected with sharp rather than trusting the extension, uploads are capped at 2 MB, then converted to WebP without EXIF metadata and stored outside the build folder.',
        },
        {
          title: 'A locked-down service',
          body: 'The standalone Next.js build runs as a non-root systemd service (DynamicUser) with ProtectSystem=strict, PrivateTmp, and NoNewPrivileges; systemd-analyze security rates it 1.2 (OK). The demo admin only sees customer data in masked form.',
        },
      ],
    },
    results: {
      measuredOn: '2026-10-03',
      lighthouseVersion: '13.5.0',
      lighthouse: [
        {
          page: { id: 'Beranda', en: 'Home page' },
          url: `${TOKO_URL}/`,
          performance: 93,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
        },
        {
          page: { id: 'Halaman produk', en: 'Product page' },
          url: `${TOKO_URL}/produk/kopi-arabika-lereng-pagi`,
          performance: 94,
          accessibility: 100,
          bestPractices: 100,
          seo: 100,
        },
      ],
      testsReportedOn: '2026-10-03',
      tests: [
        {
          name: {
            id: 'Test unit: keranjang, ongkir, format harga, validasi, pesanan dan stok',
            en: 'Unit tests: cart, shipping, price formatting, validation, orders and stock',
          },
          tool: 'Vitest',
          count: 51,
        },
        {
          name: {
            id: 'Test end-to-end: belanja sampai checkout, admin mengubah status pesanan, keamanan, dan animasi',
            en: 'End-to-end tests: browsing to checkout, admin order status updates, security, and animations',
          },
          tool: 'Playwright',
          count: 16,
        },
      ],
    },
    videoCaption: {
      id: 'Animasi belanja Lumbung Kabut: tombol Tambah berubah menjadi centang, lencana keranjang bertambah, dan keranjang mini meluncur masuk tanpa merebut fokus. Rekaman Playwright dari situs live, sekitar 10 detik, tanpa suara.',
      en: 'Lumbung Kabut’s shopping animation: the Add button turns into a check mark, the cart badge counts up, and a mini cart slides in without stealing focus. A Playwright recording of the live site, about 10 seconds, no sound.',
    },
  },
];

// Pastikan setiap slug di peta rute punya data proyek.
for (const slug of projectSlugs) {
  if (!projects.some((project) => project.slug === slug)) throw new Error(`Data proyek ${slug} belum ada`);
}

export function getProject(slug: ProjectSlug): Project {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Proyek tidak dikenal: ${slug}`);
  return project;
}

/** Proyek berikutnya untuk navigasi antar-studi kasus. */
export function nextProject(slug: ProjectSlug): Project {
  const index = projects.findIndex((p) => p.slug === slug);
  return projects[(index + 1) % projects.length]!;
}
