// Download + convert base-species sprites to local webp.
//
//   npm run sprites   (run after `npm run data`)
//
// Pulls official artwork, shiny artwork, and the small sprite for every base
// species (id <= 1025) from the PokeAPI sprite repo, converts each to webp with
// sharp, and writes them under public/sprites. Alt forms (id > 1025) keep using
// the GitHub CDN. Existing files are skipped, so re-runs are cheap.
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import liteData from "../src/data/index.json" with { type: "json" };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "sprites");

const RAW = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const VARIANTS = [
  { dir: "art", url: (id: number) => `${RAW}/other/official-artwork/${id}.png`, quality: 80 },
  { dir: "art-shiny", url: (id: number) => `${RAW}/other/official-artwork/shiny/${id}.png`, quality: 80 },
  { dir: "sprite", url: (id: number) => `${RAW}/${id}.png`, quality: 90 },
];

async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

async function main() {
  console.time("sprites");
  const ids = (liteData as { id: number }[]).map((p) => p.id);
  for (const v of VARIANTS) await mkdir(path.join(OUT, v.dir), { recursive: true });

  const jobs: { id: number; v: (typeof VARIANTS)[number] }[] = [];
  for (const id of ids) for (const v of VARIANTS) jobs.push({ id, v });

  let done = 0;
  let skipped = 0;
  let failed = 0;
  await pool(jobs, 12, async ({ id, v }) => {
    const file = path.join(OUT, v.dir, `${id}.webp`);
    if (existsSync(file)) {
      skipped++;
      done++;
      return;
    }
    try {
      const res = await fetch(v.url(id));
      if (!res.ok) throw new Error(`${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const webp = await sharp(buf).webp({ quality: v.quality }).toBuffer();
      await writeFile(file, webp);
    } catch (err) {
      failed++;
      console.warn(`  skip ${v.dir}/${id}: ${(err as Error).message}`);
    }
    done++;
    if (done % 300 === 0) console.log(`  ${done}/${jobs.length}`);
  });

  console.log(
    `Done. ${jobs.length} variants: ${jobs.length - skipped - failed} written, ${skipped} cached, ${failed} failed.`,
  );
  console.timeEnd("sprites");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
