import { HUKUM_URL, TOKO_URL } from '../config/domain';
import { projectSlugs, type Locale, type ProjectSlug } from '../i18n/routes';

type Localized<T> = Record<Locale, T>;

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
}

export interface ProjectResults {
  /** Tanggal pengukuran Lighthouse (YYYY-MM-DD), dijalankan dari situs ini (lihat docs/lighthouse/proyek-demo/). */
  measuredOn: string;
  lighthouseVersion: string;
  lighthouse: LighthouseRun[];
  /** Tanggal laporan test proyek (progress akhir proyek demo), semuanya lulus. */
  testsReportedOn: string;
  tests: TestSuite[];
}

export interface Challenge {
  title: string;
  body: string;
}

export interface Project {
  slug: ProjectSlug;
  demoUrl: string;
  /** Repo kode sumber publik di GitHub; `null` kalau belum dipublikasikan. */
  sourceUrl: string | null;
  /** Jenis proyek, mis. "Company profile kantor hukum + CMS". */
  name: Localized<string>;
  /** Nama bisnis fiktif yang dipakai di demo. */
  demoBrand: string;
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
    slug: 'company-profile-hukum',
    demoUrl: `${HUKUM_URL}/`,
    sourceUrl: 'https://github.com/tenmaryut/company-profile-hukum',
    demoBrand: 'Kantor Hukum Nalar Saksama',
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
    demoUrl: `${TOKO_URL}/`,
    sourceUrl: 'https://github.com/tenmaryut/toko-online-umkm',
    demoBrand: 'Lumbung Kabut',
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
