#!/usr/bin/env bash
# Memastikan tidak ada alamat staging atau IP server di kode, konten, konfigurasi, dan file deploy.
# Folder docs/ (hasil uji) dikecualikan sesuai aturan bersama. Semua alamat diambil dari domain.env.
set -euo pipefail
cd "$(dirname "$0")/.."
# Pola disusun dari potongan supaya skrip ini tidak menemukan dirinya sendiri.
pattern="ss""lip\\.io|169[.-]58[.-]123[.-]8"
if git ls-files --cached --others --exclude-standard | grep -v '^docs/' | xargs grep -nIE "$pattern"; then
  echo "Ditemukan alamat staging/IP di atas. Pakai domain.env lewat src/config/domain.ts." >&2
  exit 1
fi
echo "Bersih: tidak ada alamat staging atau IP server di luar docs/."
