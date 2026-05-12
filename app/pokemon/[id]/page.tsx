import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DetailClient } from "@/app/_clients/detail-client";
import { getAllPokemonLite, getFullPokemon } from "@/lib/pokeapi";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <PokemonDetail params={params} />
    </Suspense>
  );
}

async function PokemonDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n) || n < 1 || n > 1025) notFound();

  const [pokemon, full] = await Promise.all([
    getAllPokemonLite(),
    getFullPokemon(n),
  ]);

  return <DetailClient pokemon={pokemon} full={full} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Pokémon #${id} · Pokédex` };
}
