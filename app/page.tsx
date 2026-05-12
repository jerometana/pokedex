import { Suspense } from "react";
import { CatalogClient } from "./_clients/catalog-client";
import { getAllPokemonLite } from "@/lib/pokeapi";

export default async function Page() {
  const pokemon = await getAllPokemonLite();
  return (
    <Suspense>
      <CatalogClient pokemon={pokemon} />
    </Suspense>
  );
}
