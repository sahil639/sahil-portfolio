// Lists every image in public/extras/ (newest file name last). Drop images in that folder and they appear.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DIR = join(process.cwd(), "public/extras");

export async function getExtras() {
  let files = [];
  try {
    files = readdirSync(DIR).filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f)).sort();
  } catch {
    return [];
  }
  return Promise.all(files.map(async (f) => {
    const { width = 1200, height = 1200 } = await sharp(join(DIR, f)).metadata().catch(() => ({}));
    const caption = f.replace(/\.[^.]+$/, "").replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ");
    return { src: `/extras/${f}`, width, height, caption };
  }));
}
