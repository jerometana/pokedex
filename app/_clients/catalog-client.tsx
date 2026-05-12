"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ALL_FORM_CATEGORIES,
  ALL_GENS,
  ALL_TYPES,
  type FormCategory,
  type Gen as GenNum,
  type PokeType,
  type PokemonLite,
} from "@/lib/types";
import { CatalogGrid } from "../_components/catalog-grid";
import { Empty } from "../_components/empty";
import { FilterBar } from "../_components/filter-bar";
import { TweaksPanel, useTweaks } from "../_components/tweaks";

const Q_KEY = "q";
const GENS_KEY = "gens";
const TYPES_KEY = "types";
const FORMS_KEY = "forms";

const ALL_TYPES_SET = new Set<string>(ALL_TYPES);
const ALL_GENS_SET = new Set<number>(ALL_GENS);
const ALL_FORMS_SET = new Set<string>(ALL_FORM_CATEGORIES);

function parseTypes(raw: string | null): Set<PokeType> {
  if (!raw) return new Set();
  return new Set(
    raw.split(",").filter((v) => ALL_TYPES_SET.has(v)) as PokeType[],
  );
}

function parseGens(raw: string | null): Set<GenNum> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && ALL_GENS_SET.has(n)) as GenNum[],
  );
}

function parseForms(raw: string | null): Set<FormCategory> {
  if (!raw) return new Set();
  return new Set(
    raw.split(",").filter((v) => ALL_FORMS_SET.has(v)) as FormCategory[],
  );
}

export function CatalogClient({ pokemon }: { pokemon: PokemonLite[] }) {
  const { t, setTweak } = useTweaks();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get(Q_KEY) ?? "";
  const activeGens = useMemo(
    () => parseGens(searchParams.get(GENS_KEY)),
    [searchParams],
  );
  const activeTypes = useMemo(
    () => parseTypes(searchParams.get(TYPES_KEY)),
    [searchParams],
  );
  const activeForms = useMemo(
    () => parseForms(searchParams.get(FORMS_KEY)),
    [searchParams],
  );

  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const writeParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams.toString());
      mutate(p);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  useEffect(() => {
    if (query === urlQuery) return;
    const id = setTimeout(() => {
      writeParams((p) => {
        if (query) p.set(Q_KEY, query);
        else p.delete(Q_KEY);
      });
    }, 200);
    return () => clearTimeout(id);
  }, [query, urlQuery, writeParams]);

  const toggleType = useCallback(
    (tp: PokeType) => {
      writeParams((p) => {
        const cur = parseTypes(p.get(TYPES_KEY));
        if (cur.has(tp)) cur.delete(tp);
        else cur.add(tp);
        if (cur.size) p.set(TYPES_KEY, Array.from(cur).join(","));
        else p.delete(TYPES_KEY);
      });
    },
    [writeParams],
  );
  const clearTypes = useCallback(
    () => writeParams((p) => p.delete(TYPES_KEY)),
    [writeParams],
  );

  const toggleGen = useCallback(
    (g: GenNum) => {
      writeParams((p) => {
        const cur = parseGens(p.get(GENS_KEY));
        if (cur.has(g)) cur.delete(g);
        else cur.add(g);
        if (cur.size) p.set(GENS_KEY, Array.from(cur).join(","));
        else p.delete(GENS_KEY);
      });
    },
    [writeParams],
  );
  const clearGens = useCallback(
    () => writeParams((p) => p.delete(GENS_KEY)),
    [writeParams],
  );

  const toggleForm = useCallback(
    (f: FormCategory) => {
      writeParams((p) => {
        const cur = parseForms(p.get(FORMS_KEY));
        if (cur.has(f)) cur.delete(f);
        else cur.add(f);
        if (cur.size) p.set(FORMS_KEY, Array.from(cur).join(","));
        else p.delete(FORMS_KEY);
      });
    },
    [writeParams],
  );
  const clearForms = useCallback(
    () => writeParams((p) => p.delete(FORMS_KEY)),
    [writeParams],
  );

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
      if (activeForms.size > 0 && !p.formTags.some((f) => activeForms.has(f)))
        return false;
      return true;
    });
  }, [pokemon, query, activeGens, activeTypes, activeForms]);

  const resetKey = `${query}|${Array.from(activeGens).sort().join(",")}|${Array.from(activeTypes).sort().join(",")}|${Array.from(activeForms).sort().join(",")}`;

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
        activeForms={activeForms}
        toggleForm={toggleForm}
        clearForms={clearForms}
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
