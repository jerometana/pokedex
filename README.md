# Pokédex (Astro SSG)

Static Pokédex built with [Astro](https://astro.build). All PokeAPI data is
fetched **once** at snapshot time and committed to `src/data`, so dev builds,
production builds, and deploys make **zero** PokeAPI requests — staying clear of
PokeAPI's fair-use rate limits. Pages are fully pre-rendered; interactive parts
(catalog filter/grid, detail form switcher, image search) are React islands.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321  (uses the committed snapshot)
```

## Build

```bash
npm run build    # pre-renders / and /pokemon/<id> for all Pokémon -> dist/
npm run preview  # serve dist locally
```

`dist/` is plain static files — deploy to any static host (Vercel, Netlify,
Cloudflare Pages, GitHub Pages, S3, …). No server, no runtime API.

## Refreshing PokeAPI data

The snapshot in `src/data` is the source of truth for the build. Regenerate it
only when you want fresher data:

```bash
npm run data     # fetch all Pokémon (throttled, disk-cached) -> snapshot JSON
npm run sprites  # download + webp-convert base-species sprites -> public/sprites
```

`npm run data` writes:
- `src/data/index.json`, `src/data/type-relations.json`, and
  `src/data/pokemon/<id>.json` (`{ full, evolution }` — embedded in the page HTML).
- `public/data/detail/<id>.json` (`{ abilityDetail, moveDetail }` — the heavy
  move/ability effect text, fetched client-side on the detail page so it stays
  out of the HTML).

Notes:
- Raw PokeAPI responses are cached on disk in `.cache/pokeapi` (gitignored).
  Re-running `npm run data` only hits the network for endpoints it hasn't seen.
  Delete `.cache/pokeapi` to force a cold refresh.
- A cold `data` run makes ~5,000 throttled requests (concurrency 10) and takes
  ~1 min; a warm re-run makes **0** network requests.
- `npm run sprites` localizes official art, shiny art, and the small sprite for
  base species (id ≤ 1025) as webp. Alt forms (id > 1025) keep using the GitHub
  sprite CDN. It pulls from the sprite repo, **not** the rate-limited PokeAPI.
  Existing files are skipped, so re-runs are cheap.
- Commit `src/data`, `public/data`, and `public/sprites` after refreshing so
  deploys never touch PokeAPI.

## Layout

```
scripts/build-data.ts     # snapshot builder (npm run data)
src/lib/build/            # build-only PokeAPI fetcher + mappers (disk cache + throttle)
src/data/                 # committed snapshot: index.json, type-relations.json, pokemon/<id>.json
src/pages/                # index.astro (catalog), pokemon/[id].astro (detail)
src/clients/              # React islands: catalog-client, detail-client
src/components/           # ported UI components
src/styles/               # global + module CSS
```

## Image search

Client-side CLIP image search (`@huggingface/transformers`) ranks against
pre-computed sprite embeddings in `public/sprite-embeddings.*`. Regenerate with:

```bash
npm run embed-sprites
```
