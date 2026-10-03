#!/usr/bin/env bash
# Deploy ulang situs portofolio: build, salin ke /srv/web, pasang konfigurasi Caddy, lalu cek HTTPS.
# Alamat situs diambil dari domain.env (lihat src/config/domain.ts dan README).
# Pemakaian (sebagai root, dari folder proyek): npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."

SITE_DIR=/srv/web/portofolio-tenma
CADDY_TEMPLATE=deploy/portofolio-tenma.caddy.template
CADDY_SITE=/etc/caddy/sites/portofolio-tenma.caddy

URL=$(node --input-type=module -e "import { PORTOFOLIO_URL } from './src/config/domain.ts'; console.log(PORTOFOLIO_URL)")
HOST=${URL#*://}
echo "==> Alamat situs: $URL"

echo "==> Build (astro check + astro build)"
npm run build

echo "==> Salin dist/ ke $SITE_DIR"
install -d -m 755 "$SITE_DIR"
rsync -a --delete-after --delay-updates --chmod=D755,F644 dist/ "$SITE_DIR/"

echo "==> Konfigurasi Caddy"
rendered=$(mktemp)
trap 'rm -f "$rendered"' EXIT
sed "s/__PORTOFOLIO_HOST__/$HOST/g" "$CADDY_TEMPLATE" > "$rendered"
if cmp -s "$rendered" "$CADDY_SITE"; then
  echo "Tidak berubah."
else
  backup=$(mktemp)
  cp "$CADDY_SITE" "$backup" 2>/dev/null || true
  install -m 644 "$rendered" "$CADDY_SITE"
  if caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null 2>&1; then
    systemctl reload caddy
    echo "Caddy dimuat ulang."
    rm -f "$backup"
  else
    echo "Konfigurasi Caddy tidak valid; versi lama dikembalikan." >&2
    cp "$backup" "$CADDY_SITE"
    caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile || true
    exit 1
  fi
fi

echo "==> Cek HTTPS dari server: $URL/"
curl -sSI --fail "$URL/"
