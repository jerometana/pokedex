"use client";

import { use } from "react";
import type { PokemonEvolutionBundle } from "@/lib/pokeapi";
import { evoLabel, EvoTree } from "./evo-tree";

export function EvolutionPanel({
  currentId,
  evolutionPromise,
}: {
  currentId: number;
  evolutionPromise: Promise<PokemonEvolutionBundle>;
}) {
  const { evolution, babyTriggerItem, evoLites } = use(evolutionPromise);
  if (evolution.children.length === 0) return null;
  return (
    <section className="panel panel-evo">
      <header className="panel-h">
        <h3>Evolution</h3>
        <span className="panel-tag">
          {evoLabel(evolution)}
          {babyTriggerItem
            ? ` · Baby: ${babyTriggerItem.replace(/-/g, " ")}`
            : ""}
        </span>
      </header>
      <div>
        <EvoTree
          node={evolution}
          liteById={evoLites}
          currentId={currentId}
        />
      </div>
    </section>
  );
}
