import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Pokedex from "pokedex-promise-v2";
import { pipeline, RawImage, env } from "@huggingface/transformers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const CACHE_DIR = path.join(ROOT, ".sprite-cache");
const OUT_BIN = path.join(PUBLIC_DIR, "sprite-embeddings.bin");
const OUT_JSON = path.join(PUBLIC_DIR, "sprite-embeddings.json");

const MODEL = "Xenova/clip-vit-base-patch32";
const DTYPE = "q8";
const MAX_ID = 1025;
const CONCURRENCY = 4;

env.allowLocalModels = false;
const P = new Pokedex({ cacheLimit: 1000 * 60 * 60 * 24 * 30 });

const FORM_LABEL_MAP = {
  mega: "Mega",
  "mega-x": "Mega X",
  "mega-y": "Mega Y",
  gmax: "Gigantamax",
  alola: "Alolan",
  galar: "Galarian",
  hisui: "Hisuian",
  paldea: "Paldean",
  "paldea-combat": "Paldean Combat",
  "paldea-blaze": "Paldean Blaze",
  "paldea-aqua": "Paldean Aqua",
  primal: "Primal",
  origin: "Origin",
  altered: "Altered",
  therian: "Therian",
  incarnate: "Incarnate",
  zen: "Zen",
  pirouette: "Pirouette",
  resolute: "Resolute",
  unbound: "Unbound",
  ash: "Ash",
  complete: "Complete",
  school: "School",
  midnight: "Midnight",
  dusk: "Dusk",
  "dawn-wings": "Dawn Wings",
  "dusk-mane": "Dusk Mane",
};

function titleCase(s) {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function formLabel(speciesSlug, formSlug, isDefault) {
  if (isDefault) return "Default";
  let suffix = formSlug;
  if (suffix.startsWith(`${speciesSlug}-`)) suffix = suffix.slice(speciesSlug.length + 1);
  else if (suffix === speciesSlug) return "Default";
  return FORM_LABEL_MAP[suffix] ?? titleCase(suffix);
}

function urlToId(url) {
  const m = /\/(\d+)\/?$/.exec(url);
  return m ? Number(m[1]) : null;
}

const ART = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

async function fetchSprite(id) {
  const cached = path.join(CACHE_DIR, `${id}.png`);
  if (existsSync(cached)) {
    const buf = await readFile(cached);
    if (buf.byteLength > 0) return buf;
  }
  const res = await fetch(ART(id));
  if (!res.ok) throw new Error(`fetch art for ${id} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(cached, buf);
  return buf;
}

function l2normalize(vec) {
  let s = 0;
  for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i];
  const inv = 1 / (Math.sqrt(s) || 1);
  for (let i = 0; i < vec.length; i++) vec[i] *= inv;
  return vec;
}

async function embedImage(extractor, id) {
  const buf = await fetchSprite(id);
  const img = await RawImage.read(new Blob([buf]));
  const out = await extractor(img);
  return l2normalize(out.data);
}

async function collectEntries() {
  const entries = [];
  let speciesDone = 0;
  const speciesQueue = [];
  for (let id = 1; id <= MAX_ID; id++) speciesQueue.push(id);

  async function worker() {
    while (speciesQueue.length) {
      const id = speciesQueue.shift();
      try {
        const species = await P.getPokemonSpeciesByName(id);
        for (const v of species.varieties) {
          const vid = urlToId(v.pokemon.url);
          if (vid == null) continue;
          entries.push({
            refId: id,
            id: vid,
            slug: v.pokemon.name,
            label: formLabel(species.name, v.pokemon.name, v.is_default),
            isDefault: !!v.is_default,
          });
        }
      } catch (e) {
        console.warn(`\nspecies ${id} failed: ${e.message}`);
      }
      speciesDone++;
      if (speciesDone % 50 === 0 || speciesDone === MAX_ID) {
        process.stdout.write(`\rspecies ${speciesDone}/${MAX_ID}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");

  entries.sort((a, b) =>
    a.refId !== b.refId ? a.refId - b.refId : a.isDefault ? -1 : b.isDefault ? 1 : a.id - b.id,
  );
  return entries;
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });
  await mkdir(CACHE_DIR, { recursive: true });

  console.log("Enumerating species → forms…");
  const entries = await collectEntries();
  console.log(`Collected ${entries.length} variety entries from ${MAX_ID} species.`);

  console.log(`Loading ${MODEL} (${DTYPE})…`);
  const extractor = await pipeline("image-feature-extraction", MODEL, {
    dtype: DTYPE,
  });

  console.log("Probing dimension…");
  const probe = await embedImage(extractor, entries[0].id);
  const dim = probe.length;
  console.log(`dim=${dim}`);

  const N = entries.length;
  const all = new Float32Array(N * dim);
  const kept = new Array(N).fill(false);
  all.set(probe, 0);
  kept[0] = true;

  let done = 1;
  const queue = [];
  for (let i = 1; i < N; i++) queue.push(i);

  async function worker() {
    while (queue.length) {
      const i = queue.shift();
      const e = entries[i];
      try {
        const vec = await embedImage(extractor, e.id);
        all.set(vec, i * dim);
        kept[i] = true;
      } catch (err) {
        console.warn(`\nskip ${e.id} (${e.slug}): ${err.message}`);
      }
      done++;
      if (done % 25 === 0 || done === N) {
        process.stdout.write(`\rembed ${done}/${N}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");

  const finalEntries = [];
  const compact = new Float32Array(kept.filter(Boolean).length * dim);
  let row = 0;
  for (let i = 0; i < N; i++) {
    if (!kept[i]) continue;
    compact.set(all.subarray(i * dim, (i + 1) * dim), row * dim);
    finalEntries.push(entries[i]);
    row++;
  }

  await writeFile(OUT_BIN, Buffer.from(compact.buffer));
  await writeFile(
    OUT_JSON,
    JSON.stringify(
      { model: MODEL, dtype: DTYPE, dim, count: finalEntries.length, entries: finalEntries },
      null,
      2,
    ),
  );
  console.log(
    `wrote ${OUT_BIN} (${(compact.byteLength / 1024 / 1024).toFixed(2)} MB, ${finalEntries.length} entries)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
