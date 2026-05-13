import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DetailClient } from "@/app/_clients/detail-client";
import {
  getAllPokemonLite,
  getFullPokemon,
  getPokemonAbilityDetail,
  getPokemonEvolution,
  getPokemonMoveDetail,
} from "@/lib/pokeapi";

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

  const evolutionPromise = getPokemonEvolution(n);
  const abilityDetailPromise = getPokemonAbilityDetail(n);
  const movesPromise = getPokemonMoveDetail(n);

  return (
    <DetailClient
      full={full}
      neighbors={neighbors}
      idx={idx}
      total={total}
      evolutionPromise={evolutionPromise}
      abilityDetailPromise={abilityDetailPromise}
      movesPromise={movesPromise}
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
