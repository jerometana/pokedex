import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DetailClient } from "@/app/_clients/detail-client";
import { getAllPokemonLite, getFullPokemon } from "@/lib/pokeapi";
import type { EvolutionNode, PokemonLite } from "@/lib/types";

function collectEvoIds(node: EvolutionNode, out: number[] = []): number[] {
  out.push(node.id);
  for (const c of node.children) collectEvoIds(c, out);
  return out;
}

async function DetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const n = Number(id);
  if (!Number.isFinite(n) || n < 1 || n > 1025) notFound();

  const [all, full] = await Promise.all([
    getAllPokemonLite(),
    getFullPokemon(n),
  ]);

  const total = all.length;
  const idx = Math.max(
    0,
    all.findIndex((p) => p.id === full.id),
  );
  const wrap = (i: number) => all[((i % total) + total) % total];
  const neighbors = {
    prev2: wrap(idx - 2),
    prev: wrap(idx - 1),
    next: wrap(idx + 1),
    next2: wrap(idx + 2),
  };

  const evoLites: Record<number, PokemonLite> = {};
  for (const eid of collectEvoIds(full.evolution)) {
    const p = all.find((x) => x.id === eid);
    if (p) evoLites[p.id] = p;
  }

  return (
    <DetailClient
      full={full}
      neighbors={neighbors}
      idx={idx}
      total={total}
      evoLites={evoLites}
    />
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <DetailContent paramsPromise={params} />
    </Suspense>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Pokémon #${id} · Pokédex` };
}
