import type { IconName } from '../lib/icons';
import type { Locale, ProjectSlug } from '../i18n/routes';

type Localized<T> = Record<Locale, T>;

export interface Service {
  id: string;
  icon: IconName;
  name: Localized<string>;
  summary: Localized<string>;
  suitableFor: Localized<string>;
  includes: Localized<string[]>;
  /** Proyek demo yang paling dekat dengan layanan ini. */
  demo?: ProjectSlug;
}

export const services: Service[] = [
  {
    id: 'company-profile',
    icon: 'building',
    name: { id: 'Company profile', en: 'Company profile' },
    summary: {
      id: 'Website resmi untuk usaha, kantor, atau organisasi: siapa Anda, apa layanan Anda, dan bagaimana cara menghubungi Anda.',
      en: 'An official website for a business, office, or organization: who you are, what you offer, and how to reach you.',
    },
    suitableFor: {
      id: 'Kantor jasa (hukum, konsultan, klinik), UMKM, sekolah, dan komunitas.',
      en: 'Service firms (law, consulting, clinics), small businesses, schools, and communities.',
    },
    includes: {
      id: [
        'Halaman beranda, profil, layanan, dan kontak',
        'Panel admin (CMS) supaya isi bisa diubah sendiri, bila diperlukan',
        'SEO dasar: meta, sitemap, dan Open Graph',
        'Pemberitahuan privasi untuk setiap form',
      ],
      en: [
        'Home, profile, services, and contact pages',
        'An admin panel (CMS) so you can edit the content yourself, if needed',
        'SEO basics: meta tags, sitemap, and Open Graph',
        'A privacy notice for every form',
      ],
    },
    demo: 'company-profile-hukum',
  },
  {
    id: 'landing-page',
    icon: 'megaphone',
    name: { id: 'Landing page', en: 'Landing page' },
    summary: {
      id: 'Satu halaman dengan satu tujuan: memperkenalkan produk, acara, atau promo, lalu mengarahkan pengunjung untuk menghubungi Anda.',
      en: 'A single page with a single goal: introduce a product, event, or promotion, then lead visitors to contact you.',
    },
    suitableFor: {
      id: 'Peluncuran produk, acara, dan kampanye promosi.',
      en: 'Product launches, events, and promotional campaigns.',
    },
    includes: {
      id: [
        'Desain satu halaman yang cepat dimuat di ponsel',
        'Tombol WhatsApp atau form singkat',
        'Pengukuran kecepatan dan aksesibilitas dengan Lighthouse',
        'Bisa dikembangkan menjadi situs lengkap di kemudian hari',
      ],
      en: [
        'A one-page design that loads fast on phones',
        'A WhatsApp button or a short form',
        'Speed and accessibility measured with Lighthouse',
        'Room to grow into a full website later',
      ],
    },
  },
  {
    id: 'online-store',
    icon: 'bag',
    name: { id: 'Toko online', en: 'Online store' },
    summary: {
      id: 'Toko sendiri di luar marketplace: katalog, keranjang, checkout, akun pelanggan, dan dashboard untuk mengelola pesanan.',
      en: 'Your own store outside the marketplaces: catalog, cart, checkout, customer accounts, and a dashboard to manage orders.',
    },
    suitableFor: {
      id: 'UMKM yang ingin punya kanal penjualan sendiri.',
      en: 'Small businesses that want a sales channel of their own.',
    },
    includes: {
      id: [
        'Katalog dengan kategori, pencarian, dan filter',
        'Keranjang dan checkout dengan ongkos kirim',
        'Dashboard admin untuk produk, stok, dan pesanan',
        'Integrasi pembayaran dan pengiriman dibahas sesuai kebutuhan',
      ],
      en: [
        'Catalog with categories, search, and filters',
        'Cart and checkout with shipping costs',
        'Admin dashboard for products, stock, and orders',
        'Payment and shipping integrations discussed case by case',
      ],
    },
    demo: 'toko-online-umkm',
  },
  {
    id: 'spreadsheet',
    icon: 'table',
    name: { id: 'Spreadsheet Excel & Google Sheets', en: 'Excel & Google Sheets spreadsheets' },
    summary: {
      id: 'Templat dan dashboard yang menghitung sendiri: buku kas, stok, HPP dan harga jual, atau rekap penjualan. Bisa juga merapikan berkas lama atau mengubah tabel PDF dan foto menjadi Excel.',
      en: 'Templates and dashboards that do the math for you: cash books, stock, cost and pricing, or sales summaries. I can also tidy up old files or turn PDF and photo tables into Excel.',
    },
    suitableFor: {
      id: 'UMKM yang masih mencatat di buku atau di berkas Excel yang berantakan.',
      en: 'Small businesses still keeping records on paper or in messy Excel files.',
    },
    includes: {
      id: [
        'Rumus otomatis, daftar pilihan, dan sel isian yang diberi warna',
        'Dashboard dengan grafik yang ikut berubah saat data ditambah',
        'Pemeriksaan setiap rumus dengan data kosong dan data ekstrem',
        'Berkas .xlsx yang bisa dibuka di Excel dan Google Sheets',
      ],
      en: [
        'Automatic formulas, dropdown lists, and color-coded input cells',
        'Dashboards with charts that update as you add data',
        'Every formula checked against blank and extreme data',
        'An .xlsx file that opens in Excel and Google Sheets',
      ],
    },
  },
  {
    id: 'information-system',
    icon: 'database',
    name: { id: 'Sistem informasi sederhana', en: 'Simple information system' },
    summary: {
      id: 'Aplikasi web untuk pekerjaan internal yang masih dicatat manual, misalnya pendataan, inventaris, pendaftaran, atau laporan.',
      en: 'A web app for internal work that is still done by hand, such as record keeping, inventory, registrations, or reports.',
    },
    suitableFor: {
      id: 'Kantor kecil, sekolah, komunitas, dan usaha dengan pencatatan rutin.',
      en: 'Small offices, schools, communities, and businesses with routine record keeping.',
    },
    includes: {
      id: [
        'Login dengan hak akses sesuai peran',
        'Form input dengan validasi',
        'Tabel data, pencarian, dan ekspor sederhana',
        'Pengamanan dan pencadangan data',
      ],
      en: [
        'Login with role-based access',
        'Input forms with validation',
        'Data tables, search, and simple exports',
        'Data security and backups',
      ],
    },
  },
  {
    id: 'maintenance',
    icon: 'wrench',
    name: { id: 'Perawatan website', en: 'Website maintenance' },
    summary: {
      id: 'Menjaga website tetap aman, cepat, dan berjalan setelah diluncurkan.',
      en: 'Keeping a website secure, fast, and running after launch.',
    },
    suitableFor: {
      id: 'Pemilik website yang tidak punya tim teknis sendiri.',
      en: 'Website owners without an in-house technical team.',
    },
    includes: {
      id: [
        'Pembaruan dependensi dan tambalan keamanan',
        'Pencadangan berkala',
        'Perbaikan kecil dan pembaruan konten',
        'Pemantauan supaya situs tetap online',
      ],
      en: [
        'Dependency updates and security patches',
        'Regular backups',
        'Small fixes and content updates',
        'Monitoring to keep the site online',
      ],
    },
  },
];
