import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// Build-time PokeAPI fetcher with an on-disk cache + concurrency throttle.
// The disk cache means a re-run of the snapshot only hits the network for
// endpoints it has never seen — keeping us well under PokeAPI's fair-use rate
// limits. Delete .cache/pokeapi to force a cold refresh.

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const CACHE_DIR = path.join(process.cwd(), ".cache", "pokeapi");
const CONCURRENCY = 10;
const MAX_RETRIES = 5;

let active = 0;
const queue: (() => void)[] = [];

function acquire(): Promise<void> {
  if (active < CONCURRENCY) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => queue.push(resolve));
}

function release(): void {
  active--;
  const next = queue.shift();
  if (next) {
    active++;
    next();
  }
}

function cacheKey(pathname: string): string {
  const safe = pathname
    .replace(/^\/+/, "")
    .replace(/[/?=&]/g, "_")
    .replace(/_+$/, "");
  return path.join(CACHE_DIR, `${safe}.json`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let hits = 0;
let misses = 0;

export function cacheStats() {
  return { hits, misses };
}

export async function pokeFetch<T>(pathname: string): Promise<T> {
  const file = cacheKey(pathname);
  if (existsSync(file)) {
    hits++;
    return JSON.parse(await readFile(file, "utf8")) as T;
  }

  await acquire();
  try {
    let lastErr: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(`${POKEAPI_BASE}${pathname}`);
        if (res.status === 429 || res.status >= 500) {
          throw new Error(`PokeAPI ${pathname} ${res.status}`);
        }
        if (!res.ok) throw new Error(`PokeAPI ${pathname} ${res.status}`);
        const json = (await res.json()) as T;
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, JSON.stringify(json));
        misses++;
        return json;
      } catch (err) {
        lastErr = err;
        await sleep(500 * 2 ** attempt);
      }
    }
    throw lastErr;
  } finally {
    release();
  }
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}
