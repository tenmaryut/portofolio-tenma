#!/usr/bin/env bash
# Bukti situs statis ini aman di balik proxy (Tailscale Funnel -> Caddy di http://127.0.0.1:80):
# tidak ada cookie, tidak ada rate limit yang bergantung pada IP pengunjung, URL absolut https,
# redirect relatif. Dijalankan di server: npm run cek:proxy
set -euo pipefail
cd "$(dirname "$0")/.."

URL=$(node --input-type=module -e "import { PORTOFOLIO_URL } from './src/config/domain.ts'; console.log(PORTOFOLIO_URL)")
HOST=${URL#*://}
echo "Alamat publik (domain.env): $URL"

echo
echo "== 1. Cookie: header Set-Cookie di halaman sitemap, 404, dan aset (lewat alamat publik)"
mapfile -t urls < <(curl -sS "$URL/sitemap-0.xml" | grep -oE '<loc>[^<]+' | sed 's/<loc>//')
urls+=("$URL/404.html" "$URL/en/404/" "$URL/favicon.svg" "$URL/og/id/home.png" "$URL/robots.txt" "$URL/video/toko-online-umkm-poster.webp")
with_cookie=0
for u in "${urls[@]}"; do
  if curl -sS -D - -o /dev/null "$u" | grep -qi '^set-cookie'; then
    with_cookie=$((with_cookie + 1))
    echo "Set-Cookie ditemukan: $u"
  fi
done
echo "${#urls[@]} URL diperiksa, $with_cookie mengirim Set-Cookie."
if grep -rlq 'document\.cookie' dist; then echo "PERINGATAN: ada document.cookie di dist/"; else echo "Tidak ada document.cookie di dist/ (pilihan tema hanya di localStorage)."; fi

echo
echo "== 2. URL absolut http:// di HTML hasil build (sumber mixed content), selain namespace XML"
insecure=$(grep -rhoE '(href|src|srcset|poster|content)="http://[^"]*"' dist --include='*.html' | sort -u || true)
if [ -n "$insecure" ]; then echo "$insecure"; else echo "Tidak ada; semua URL absolut memakai https://${HOST}."; fi
grep -oE '<loc>[^<]+' dist/sitemap-0.xml | head -2 | sed 's/<loc>/contoh sitemap: /'

echo
echo "== 3. Redirect di balik proxy https (harus relatif)"
for p in /layanan /en; do
  curl -sSI "$URL$p" | grep -iE '^(HTTP|location)' | tr -d '\r' | paste -sd ' ' | sed "s|^|$p -> |"
done

echo
echo "== 4. IP pengunjung dan rate limit: 20 permintaan X-Forwarded-For sama, 20 berbeda, ke http://127.0.0.1:80"
same=$(for _ in $(seq 20); do curl -s -o /dev/null -w '%{http_code}\n' -H "Host: $HOST" -H 'X-Forwarded-For: 198.51.100.7' http://127.0.0.1:80/; done | sort | uniq -c | xargs)
diff=$(for i in $(seq 20); do curl -s -o /dev/null -w '%{http_code}\n' -H "Host: $HOST" -H "X-Forwarded-For: 198.51.100.$i" http://127.0.0.1:80/; done | sort | uniq -c | xargs)
echo "X-Forwarded-For sama   : $same (jumlah status)"
echo "X-Forwarded-For berbeda: $diff (jumlah status)"
if grep -q 'rate_limit' deploy/portofolio-tenma.caddy.template; then echo "Template Caddy memakai rate_limit."; else echo "Template Caddy situs ini tidak memakai rate_limit; situs statis tanpa form tidak membatasi pengunjung, jadi IP pengunjung tidak dipakai untuk keputusan apa pun."; fi
