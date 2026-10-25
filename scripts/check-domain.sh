#!/usr/bin/env bash
# Memastikan tidak ada alamat staging atau IP server di kode, konten, konfigurasi, dan file deploy.
# Folder docs/ (hasil uji) dikecualikan sesuai aturan bersama. Semua alamat diambil dari domain.env.
# Pola IP dibaca dari denylist di luar repo (sama dengan hook git dan audit:publik), jadi IP server
# tidak pernah tertulis di repo ini, termasuk dalam bentuk regex.
set -euo pipefail
cd "$(dirname "$0")/.."
denylist="${DENYLIST:-$HOME/.config/git/denylist-publik}"
pola=$(mktemp)
trap 'rm -f "$pola"' EXIT
# Pola staging disusun dari potongan supaya skrip ini tidak menemukan dirinya sendiri.
printf '%s\n' "ss""lip\\.io" >"$pola"
if [ -s "$denylist" ]; then
  cat "$denylist" >>"$pola"
else
  echo "Peringatan: $denylist tidak ada, jadi hanya alamat staging yang dicek, IP server tidak." >&2
fi
# Hanya nama file dan nomor baris yang dicetak, supaya IP tidak ikut tampil di log.
temuan=$(git ls-files -z --cached --others --exclude-standard | grep -zv '^docs/' | xargs -0 grep -nIE -f "$pola" | cut -d: -f1,2 || true)
if [ -n "$temuan" ]; then
  printf '%s\n' "$temuan" >&2
  echo "Ditemukan alamat staging/IP di baris di atas. Pakai domain.env lewat src/config/domain.ts." >&2
  exit 1
fi
echo "Bersih: tidak ada alamat staging atau IP server di luar docs/."
