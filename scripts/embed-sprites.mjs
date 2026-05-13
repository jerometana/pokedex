import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

async function fetchSprite(id) {
  const cached = path.join(CACHE_DIR, `${id}.png`);
  if (existsSync(cached)) return readFile(cached);
  const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
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

async function embedOne(extractor, id) {
  const buf = await fetchSprite(id);
  const img = await RawImage.read(new Blob([buf]));
  const out = await extractor(img);
  return l2normalize(out.data);
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });
  await mkdir(CACHE_DIR, { recursive: true });

  console.log(`Loading ${MODEL} (${DTYPE})...`);
  const extractor = await pipeline("image-feature-extraction", MODEL, {
    dtype: DTYPE,
  });

  console.log("Probing dimension...");
  const probe = await embedOne(extractor, 1);
  const dim = probe.length;
  console.log(`dim=${dim}`);

  const all = new Float32Array(MAX_ID * dim);
  all.set(probe, 0);
  const ids = [1];

  let done = 1;
  const queue = [];
  for (let id = 2; id <= MAX_ID; id++) queue.push(id);

  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      try {
        const vec = await embedOne(extractor, id);
        all.set(vec, (id - 1) * dim);
        ids.push(id);
      } catch (e) {
        console.warn(`skip ${id}: ${e.message}`);
      }
      done++;
      if (done % 25 === 0 || done === MAX_ID) {
        process.stdout.write(`\r${done}/${MAX_ID}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");

  ids.sort((a, b) => a - b);
  await writeFile(OUT_BIN, Buffer.from(all.buffer));
  await writeFile(
    OUT_JSON,
    JSON.stringify({ model: MODEL, dtype: DTYPE, dim, maxId: MAX_ID, ids }, null, 2),
  );
  console.log(`wrote ${OUT_BIN} (${(all.byteLength / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
