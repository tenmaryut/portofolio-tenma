// Membuat favicon.ico (16/32/48 px) dan apple-touch-icon.png dari public/favicon.svg.
// Jalankan ulang setelah mengubah favicon.svg: `node scripts/make-icons.mjs`.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
const png = (size) => sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // tipe: ikon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt8(0, entry + 2); // jumlah warna palet
  header.writeUInt8(0, entry + 3);
  header.writeUInt16LE(1, entry + 4); // color planes
  header.writeUInt16LE(32, entry + 6); // bit per piksel
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await writeFile(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([header, ...images]));

// Ikon Apple tidak boleh transparan: latar kotak penuh tanpa sudut membulat.
const appleSvg = svg.toString().replace('rx="14"', 'rx="0"');
await sharp(Buffer.from(appleSvg), { density: 576 })
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(new URL('../public/apple-touch-icon.png', import.meta.url).pathname);

console.log('favicon.ico dan apple-touch-icon.png diperbarui');
