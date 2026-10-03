/**
 * Data profil Tenma: satu-satunya tempat untuk data pribadi yang tampil di situs.
 *
 * Nilai `null` bertanda TODO(Tenma) belum diisi. Selama masih `null`, situs
 * menyembunyikannya atau menampilkan "segera tersedia", tanpa tautan palsu.
 * Setelah diisi, jalankan `npm run build` lalu deploy ulang (lihat README.md).
 * Cari semua yang belum diisi dengan: `npm run todo`.
 */
import type { ImageMetadata } from 'astro';

export interface Profile {
  /** Nama yang tampil di situs. */
  displayName: string;
  /** Nama lengkap, untuk data terstruktur dan halaman Tentang. */
  fullName: string | null;
  /** Foto profil (gambar yang di-import dari src/assets/, dioptimalkan otomatis oleh Astro). */
  photo: ImageMetadata | null;
  /** Email kerja. */
  email: string | null;
  /** Nomor WhatsApp, format internasional tanpa "+" dan tanpa 0 di depan, mis. "6281234567890". */
  whatsapp: string | null;
  /** Kota domisili. */
  city: string | null;
  /** Kisaran tarif. Sengaja tidak ditampilkan; halaman Layanan memakai "hubungi untuk penawaran". */
  rates: string | null;
  githubUsername: string;
}

export const profile: Profile = {
  displayName: 'Tenma',
  // TODO(Tenma): nama lengkap (opsional). Biarkan null kalau cukup "Tenma".
  fullName: null,
  // TODO(Tenma): foto profil. Simpan di src/assets/profile/ (mis. foto.jpg), tambahkan
  // `import foto from '../assets/profile/foto.jpg';` di atas, lalu isi `photo: foto`.
  // Selama null, halaman Tentang memakai monogram.
  photo: null,
  // TODO(Tenma): email kerja untuk tombol Email di halaman Kontak.
  email: null,
  // TODO(Tenma): nomor WhatsApp untuk tombol WhatsApp di halaman Kontak, mis. "6281234567890".
  whatsapp: null,
  // TODO(Tenma): kota domisili (opsional), tampil di halaman Kontak.
  city: null,
  // TODO(Tenma): kisaran tarif untuk catatan pribadi; tidak ditampilkan di situs.
  rates: null,
  githubUsername: 'tenmaryut',
};

export const githubUrl = `https://github.com/${profile.githubUsername}`;

export function whatsappUrl(message: string): string | null {
  if (!profile.whatsapp) return null;
  const number = profile.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function emailUrl(subject: string): string | null {
  if (!profile.email) return null;
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}`;
}
