// Alamat ketiga situs dibaca dari domain.env bersama, satu-satunya sumber URL untuk build, test,
// skrip, dan file Caddy. Variabel lingkungan bernama sama (PORTOFOLIO_URL, HUKUM_URL, TOKO_URL)
// menimpa isi file, dan DOMAIN_ENV mengganti lokasi file. Contoh isinya: domain.env.example.
// Modul ini hanya dipakai di sisi server/build (Node), tidak pernah dikirim ke browser.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const keys = ['PORTOFOLIO_URL', 'HUKUM_URL', 'TOKO_URL'] as const;
type DomainKey = (typeof keys)[number];

/** Lokasi bawaan: /root/tenma-ws/portofolio/domain.env, relatif dari folder proyek. */
export const domainEnvPath = process.env.DOMAIN_ENV ?? resolve(process.cwd(), '..', '..', 'portofolio', 'domain.env');

function parseEnv(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const match = /^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (match) values[match[1]!] = match[2]!.replace(/^(['"])(.*)\1$/, '$2');
  }
  return values;
}

const fileValues = existsSync(domainEnvPath) ? parseEnv(readFileSync(domainEnvPath, 'utf8')) : {};

function readOrigin(key: DomainKey): string {
  const raw = process.env[key] || fileValues[key];
  if (!raw) {
    throw new Error(`${key} belum diatur. Isi ${domainEnvPath} (contoh: domain.env.example) atau set variabel lingkungan ${key}.`);
  }
  const url = new URL(raw);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(`${key} harus URL http(s), bukan ${raw}`);
  return url.origin;
}

/** Origin tanpa garis miring akhir, mis. "https://tenma.contoh.id". */
export const PORTOFOLIO_URL = readOrigin('PORTOFOLIO_URL');
export const HUKUM_URL = readOrigin('HUKUM_URL');
export const TOKO_URL = readOrigin('TOKO_URL');
