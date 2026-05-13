import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Pokedex from "pokedex-promise-v2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "lib", "romaji.json");

const MAX_ID = 1025;
const CONCURRENCY = 8;

const P = new Pokedex({ cacheLimit: 60 * 60 * 1000 });

function pickRomaji(species) {
  for (const entry of species.names) {
    const lang = entry.language?.name;
    if (lang === "roomaji" || lang === "ja-roma" || lang === "ja-Latn") {
      return entry.name;
    }
  }
  return null;
}

async function main() {
  const result = existsSync(OUT)
    ? JSON.parse(await readFile(OUT, "utf8"))
    : {};
  let done = 0;
  const queue = [];
  for (let id = 1; id <= MAX_ID; id++) {
    if (result[id]) continue;
    queue.push(id);
  }
  console.log(`Resuming: ${Object.keys(result).length} already cached, ${queue.length} to fetch.`);

  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      try {
        const species = await P.getPokemonSpeciesByName(id);
        const romaji = pickRomaji(species);
        if (romaji) result[id] = romaji;
      } catch (e) {
        console.warn(`\nspecies ${id} failed: ${e.message}`);
      }
      done++;
      if (done % 25 === 0 || done === queue.length) {
        process.stdout.write(`\r${done}/${queue.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");

  const sorted = {};
  for (const k of Object.keys(result).sort((a, b) => Number(a) - Number(b))) {
    sorted[k] = result[k];
  }
  await writeFile(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`wrote ${OUT} (${Object.keys(sorted).length} entries)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
