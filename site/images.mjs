// Generates responsive images from the masters in site/images/.
//
//   npm run images
//
// Output goes to site/static/img/ (copied into dist/ by the build) and a manifest
// at site/data/images.json that the templates use to write width, height and
// srcset attributes. Run this whenever you add or replace a master image, then
// commit the results. The normal build does not re-encode images, which keeps
// Cloudflare builds fast.

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, 'images');
const OUT = path.join(ROOT, 'static', 'assets', 'img');
const MANIFEST = path.join(ROOT, 'data', 'images.json');

const WIDTHS = [480, 800, 1200, 1600, 2000];
const PORTRAIT_WIDTHS = [320, 560, 900];
const force = process.argv.includes('--force');

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

const manifest = {};
const files = (await fs.readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();

for (const file of files) {
  const name = file.replace(/\.(jpe?g|png)$/i, '');
  if (name.startsWith('logo-')) continue;
  const input = path.join(SRC, file);
  const meta = await sharp(input).metadata();
  const alpha = Boolean(meta.hasAlpha);
  const widths = (alpha ? PORTRAIT_WIDTHS : WIDTHS).filter((w) => w <= meta.width);
  if (!widths.length || widths[widths.length - 1] < Math.min(meta.width, alpha ? 900 : 2000)) {
    widths.push(Math.min(meta.width, alpha ? 900 : 2000));
  }
  const unique = [...new Set(widths)].sort((a, b) => a - b);

  for (const w of unique) {
    const base = path.join(OUT, `${name}-${w}`);
    if (!force && (await exists(`${base}.webp`)) && (await exists(`${base}.avif`))) continue;
    const pipeline = sharp(input).resize({ width: w, withoutEnlargement: true });
    await pipeline.clone().webp({ quality: alpha ? 82 : 74, effort: 5, alphaQuality: 90 }).toFile(`${base}.webp`);
    await pipeline.clone().avif({ quality: alpha ? 58 : 50, effort: 4 }).toFile(`${base}.avif`);
  }

  // 1200 x 630 JPEG for social sharing (Open Graph and Twitter cards prefer JPEG).
  if (!alpha && (force || !(await exists(path.join(OUT, `${name}-og.jpg`))))) {
    await sharp(input).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, `${name}-og.jpg`));
  }

  manifest[name] = {
    width: meta.width,
    height: meta.height,
    widths: unique,
    alpha,
  };
  console.log(`${name.padEnd(42)} ${meta.width}x${meta.height} -> ${unique.join(', ')}`);
}

// Logos: crisp WebP at 1x and 2x header sizes, plus a PNG for structured data.
for (const variant of ['dark', 'light']) {
  const input = path.join(SRC, `logo-${variant}.png`);
  for (const w of [280, 560]) {
    await sharp(input).resize({ width: w }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(path.join(OUT, `logo-${variant}-${w}.webp`));
  }
  const m = await sharp(input).metadata();
  manifest[`logo-${variant}`] = { width: m.width, height: m.height, widths: [280, 560], alpha: true };
}
await sharp(path.join(SRC, 'logo-dark.png')).resize({ width: 600 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'logo-600.png'));

// Icons: the hummingbird mark, cut from the top left of the logo.
const logo = sharp(path.join(SRC, 'logo-dark.png'));
const lm = await logo.metadata();
const markBuf = await sharp(path.join(SRC, 'logo-dark.png'))
  .extract({ left: Math.round(lm.width * 0.0716), top: 0, width: Math.round(lm.width * 0.358), height: Math.round(lm.height * 0.723) })
  .png()
  .toBuffer()
  .then(trimAlpha);
await sharp(markBuf).resize({ width: 240 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'mark.png'));
await sharp(markBuf).resize({ width: 240 }).webp({ quality: 88, alphaQuality: 100 }).toFile(path.join(OUT, 'mark.webp'));
const square = async (size, pad, bg) => {
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await sharp(markBuf).resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 });
};
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const paper = { r: 247, g: 245, b: 240, alpha: 1 };
await (await square(32, 0.02, clear)).toFile(path.join(OUT, 'favicon-32.png'));
await (await square(192, 0.1, paper)).toFile(path.join(OUT, 'icon-192.png'));
await (await square(512, 0.1, paper)).toFile(path.join(OUT, 'icon-512.png'));
await (await square(180, 0.12, paper)).toFile(path.join(OUT, 'apple-touch-icon.png'));
await writeIco(await (await square(32, 0.02, clear)).toBuffer(), path.join(ROOT, 'static', 'favicon.ico'));

// Default social share image (1200 x 630): hero poster, darkened, with the light logo.
const ogLogo = await sharp(path.join(SRC, 'logo-light.png')).resize({ width: 760 }).png().toBuffer();
const ogShade = Buffer.from('<svg width="1200" height="630"><rect width="1200" height="630" fill="#0b1d21" fill-opacity="0.58"/></svg>');
await sharp(path.join(SRC, 'hero-poster.jpg'))
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .composite([{ input: ogShade }, { input: ogLogo, gravity: 'center' }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(OUT, 'og-default.jpg'));

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nWrote ${Object.keys(manifest).length} entries to ${path.relative(process.cwd(), MANIFEST)}`);

// Crop transparent margins by scanning the alpha channel.
async function trimAlpha(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return sharp(buf).extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }).png().toBuffer();
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// Minimal .ico writer: a single 32 x 32 PNG entry, which every current browser accepts.
async function writeIco(png, dest) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  await fs.writeFile(dest, Buffer.concat([header, entry, png]));
}
