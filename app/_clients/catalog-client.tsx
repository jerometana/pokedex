"use client";

import { useCallback, useMemo, useState } from "react";
import type { Gen as GenNum, PokeType, PokemonLite } from "@/lib/types";
import { CatalogGrid } from "../_components/catalog-grid";
import { Empty } from "../_components/empty";
import { FilterBar } from "../_components/filter-bar";
import { TweaksPanel, useTweaks } from "../_components/tweaks";

export function CatalogClient({ pokemon }: { pokemon: PokemonLite[] }) {
  const { t, setTweak } = useTweaks();

  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<PokeType>>(
    () => new Set(),
  );
  const [activeGens, setActiveGens] = useState<Set<GenNum>>(() => new Set());

  const toggleType = useCallback((tp: PokeType) => {
    setActiveTypes((prev) => {
      const n = new Set(prev);
      if (n.has(tp)) n.delete(tp);
      else n.add(tp);
      return n;
    });
  }, []);
  const clearTypes = useCallback(() => setActiveTypes(new Set()), []);

  const toggleGen = useCallback((g: GenNum) => {
    setActiveGens((prev) => {
      const n = new Set(prev);
      if (n.has(g)) n.delete(g);
      else n.add(g);
      return n;
    });
  }, []);
  const clearGens = useCallback(() => setActiveGens(new Set()), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pokemon.filter((p) => {
      if (q) {
        const idMatch =
          String(p.id).includes(q) || String(p.id).padStart(4, "0").includes(q);
        if (!p.name.toLowerCase().includes(q) && !idMatch) return false;
      }
      if (activeGens.size > 0 && !activeGens.has(p.gen)) return false;
      if (activeTypes.size > 0 && !p.types.some((t) => activeTypes.has(t)))
        return false;
      return true;
    });
  }, [pokemon, query, activeGens, activeTypes]);

  const resetKey = `${query}|${Array.from(activeGens).sort().join(",")}|${Array.from(activeTypes).sort().join(",")}`;

  return (
    <div className={`app density-${t.density}`}>
      <FilterBar
        query={query}
        setQuery={setQuery}
        activeTypes={activeTypes}
        toggleType={toggleType}
        clearTypes={clearTypes}
        activeGens={activeGens}
        toggleGen={toggleGen}
        clearGens={clearGens}
        count={filtered.length}
      />
      <main className="main">
        {filtered.length === 0 ? (
          <Empty />
        ) : (
          <CatalogGrid
            list={filtered}
            density={t.density}
            resetKey={resetKey}
          />
        )}
      </main>
      <TweaksPanel t={t} setTweak={setTweak} />
    </div>
  );
}
