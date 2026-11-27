// Makes smaller WebP copies of every blog image so pages load fast.
// Input:  public/blog/<post>/ and public/projects/<project>/ images (jpg, jpeg, png, webp)
// Output: public/_img/blog/<post>/<image>-<width>.webp  +  src/data/images.json (sizes)
// Runs automatically before `npm run dev` and `npm run build`. Skips images already done.
import { readdir, stat, mkdir, writeFile, readFile } from "node:fs/promises";
import { join, relative, dirname, extname, basename } from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRCS = [join(ROOT, "public/blog"), join(ROOT, "public/projects")];
const OUT = join(ROOT, "public/_img");
const MANIFEST = join(ROOT, "src/data/images.json");
const WIDTHS = [480, 800, 1200, 1600];

async function walk(dir) {
  let out = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(await walk(p));
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const old = JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "{}"));
const manifest = {};
let made = 0;

const files = (await Promise.all(SRCS.map(walk))).flat();
for (const file of files) {
  const url = "/" + relative(join(ROOT, "public"), file).split("\\").join("/");
  const { mtimeMs } = await stat(file);
  const prev = old[url];
  if (prev && prev.mtime === mtimeMs) { manifest[url] = prev; continue; }

  const img = sharp(file).rotate();
  const { width, height } = await img.metadata();
  const base = join(OUT, dirname(relative(join(ROOT, "public"), file)), basename(file, extname(file)));
  await mkdir(dirname(base), { recursive: true });
  const sizes = WIDTHS.filter((w) => w < width).concat(Math.min(width, 2000));
  const variants = [];
  for (const w of [...new Set(sizes)]) {
    const out = `${base}-${w}.webp`;
    await sharp(file).rotate().resize({ width: w }).webp({ quality: 82 }).toFile(out);
    variants.push([w, "/" + relative(join(ROOT, "public"), out).split("\\").join("/")]);
    made++;
  }
  manifest[url] = { width, height, mtime: mtimeMs, variants };
}

await mkdir(dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`images: ${Object.keys(manifest).length} blog image(s), ${made} new size(s) made`);
