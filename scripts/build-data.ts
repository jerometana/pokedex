// One-time PokeAPI snapshot builder.
//
//   npm run data
//
// Fetches the full Pokédex (throttled + disk-cached in .cache/pokeapi) and
// writes a static snapshot into src/data, which Astro then builds from with
// zero network access:
//
//   src/data/index.json           -> PokemonLite[]   (catalog)
//   src/data/type-relations.json  -> DamageRelations (shared, fetched once)
//   src/data/pokemon/<id>.json    -> DetailSnapshot  (one per Pokémon)
//
// Commit src/data so deploys never touch PokeAPI. Re-run only to refresh.
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getAllPokemonLite,
  getDamageRelations,
  getDetailSnapshot,
} from "../src/lib/build/pokeapi.ts";
import { cacheStats, mapWithConcurrency } from "../src/lib/build/fetcher.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const POKE_DIR = path.join(DATA_DIR, "pokemon");
const PUBLIC_DATA = path.join(ROOT, "public", "data");
// Page snapshot ({full, evolution}) served for the in-catalog popup dialog.
const PUBLIC_POKE_DIR = path.join(PUBLIC_DATA, "pokemon");
// Heavy move/ability effect text lives here and is fetched client-side, keeping
// it out of the pre-rendered HTML.
const DEFER_DIR = path.join(PUBLIC_DATA, "detail");

async function main() {
  console.time("snapshot");
  for (const d of [POKE_DIR, PUBLIC_POKE_DIR, DEFER_DIR]) {
    await rm(d, { recursive: true, force: true });
    await mkdir(d, { recursive: true });
  }

  console.log("Fetching catalog + type relations…");
  const [lite, damageRelations] = await Promise.all([
    getAllPokemonLite(),
    getDamageRelations(),
  ]);

  await writeFile(path.join(DATA_DIR, "index.json"), JSON.stringify(lite));
  const relJson = JSON.stringify(damageRelations);
  await writeFile(path.join(DATA_DIR, "type-relations.json"), relJson);
  // Public copy for the dialog (fetched client-side).
  await writeFile(path.join(PUBLIC_DATA, "type-relations.json"), relJson);
  console.log(`Catalog: ${lite.length} Pokémon.`);

  const liteById = new Map(lite.map((p) => [p.id, p]));
  const ids = lite.map((p) => p.id);

  let done = 0;
  await mapWithConcurrency(ids, 12, async (id) => {
    try {
      const snap = await getDetailSnapshot(id, liteById);
      // Page-critical (embedded in HTML / fetched by the dialog): full + evolution.
      const pageJson = JSON.stringify({
        full: snap.full,
        evolution: snap.evolution,
      });
      await writeFile(path.join(POKE_DIR, `${id}.json`), pageJson);
      await writeFile(path.join(PUBLIC_POKE_DIR, `${id}.json`), pageJson);
      // Deferred (fetched client-side): move + ability effect text.
      await writeFile(
        path.join(DEFER_DIR, `${id}.json`),
        JSON.stringify({
          abilityDetail: snap.abilityDetail,
          moveDetail: snap.moveDetail,
        }),
      );
    } catch (err) {
      console.error(`[snapshot] FAILED #${id}:`, err);
      throw err;
    }
    done++;
    if (done % 50 === 0 || done === ids.length) {
      const { hits, misses } = cacheStats();
      console.log(`  ${done}/${ids.length}  (cache hits ${hits}, misses ${misses})`);
    }
  });

  const { hits, misses } = cacheStats();
  console.log(`Done. Cache hits ${hits}, network fetches ${misses}.`);
  console.timeEnd("snapshot");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
