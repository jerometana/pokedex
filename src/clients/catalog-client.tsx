"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ALL_FORM_CATEGORIES,
  ALL_GENS,
  ALL_RARITIES,
  ALL_TYPES,
  type FormCategory,
  type Gen as GenNum,
  type PokeType,
  type PokemonLite,
  type Rarity,
} from "@/lib/types";
import { CatalogGrid } from "@/components/catalog-grid";
import { Empty } from "@/components/empty";
import { FilterBar } from "@/components/filter-bar";
import { useTweaks } from "@/components/tweaks";
import { pokemonHref } from "@/lib/helpers";
import { DetailDialog } from "./detail-dialog";
import type { ImageSearchResult } from "@/lib/image-search";

const ImageSearchModal = lazy(() =>
  import("@/components/image-search-modal").then((m) => ({
    default: m.ImageSearchModal,
  })),
);

const Q_KEY = "q";
const GENS_KEY = "gens";
const TYPES_KEY = "types";
const FORMS_KEY = "forms";
const RARITY_KEY = "rarity";

const ALL_TYPES_SET = new Set<string>(ALL_TYPES);
const ALL_GENS_SET = new Set<number>(ALL_GENS);
const ALL_FORMS_SET = new Set<string>(ALL_FORM_CATEGORIES);
const ALL_RARITIES_SET = new Set<string>(ALL_RARITIES);

function parseTypes(raw: string | null): Set<PokeType> {
  if (!raw) return new Set();
  return new Set(raw.split(",").filter((v) => ALL_TYPES_SET.has(v)) as PokeType[]);
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
function parseRarities(raw: string | null): Set<Rarity> {
  if (!raw) return new Set();
  return new Set(raw.split(",").filter((v) => ALL_RARITIES_SET.has(v)) as Rarity[]);
}

function initialSearch(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function CatalogClient({ pokemon }: { pokemon: PokemonLite[] }) {
  const { t } = useTweaks();
  const [search, setSearch] = useState<URLSearchParams>(initialSearch);

  const urlQuery = search.get(Q_KEY) ?? "";
  const activeGens = useMemo(() => parseGens(search.get(GENS_KEY)), [search]);
  const activeTypes = useMemo(() => parseTypes(search.get(TYPES_KEY)), [search]);
  const activeForms = useMemo(() => parseForms(search.get(FORMS_KEY)), [search]);
  const activeRarities = useMemo(
    () => parseRarities(search.get(RARITY_KEY)),
    [search],
  );

  const [query, setQuery] = useState(urlQuery);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageSearch, setImageSearch] = useState<{
    scores: Map<number, number>;
    formLabels: Map<number, string>;
    previewUrl: string;
  } | null>(null);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    return () => {
      if (imageSearch?.previewUrl) URL.revokeObjectURL(imageSearch.previewUrl);
    };
  }, [imageSearch?.previewUrl]);

  const handleImageResults = useCallback(
    (results: ImageSearchResult[], previewUrl: string) => {
      const scores = new Map<number, number>();
      const formLabels = new Map<number, string>();
      for (const r of results) {
        scores.set(r.id, r.score);
        if (r.formLabel) formLabels.set(r.id, r.formLabel);
      }
      setImageSearch((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { scores, formLabels, previewUrl };
      });
    },
    [],
  );

  const clearImageSearch = useCallback(() => {
    setImageSearch((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }, []);

  // Detail popup. Opening pushes /pokemon/<id> (so Back closes it and deep
  // links / cmd-click still load the static page); navigating within the dialog
  // replaces the URL; browser history is the source of truth via popstate.
  const [dialogId, setDialogId] = useState<number | null>(null);
  const openDialog = useCallback((pid: number) => {
    window.history.pushState({ pokeId: pid }, "", pokemonHref(pid));
    setDialogId(pid);
  }, []);
  const navigateDialog = useCallback((pid: number) => {
    window.history.replaceState({ pokeId: pid }, "", pokemonHref(pid));
    setDialogId(pid);
  }, []);
  const closeDialog = useCallback(() => {
    if (window.history.state?.pokeId != null) window.history.back();
    else setDialogId(null);
  }, []);
  useEffect(() => {
    const onPop = () =>
      setDialogId(
        (window.history.state?.pokeId as number | undefined) ?? null,
      );
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const writeParams = useCallback((mutate: (p: URLSearchParams) => void) => {
    setSearch((prev) => {
      const p = new URLSearchParams(prev.toString());
      mutate(p);
      const qs = p.toString();
      if (typeof window !== "undefined") {
        const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        window.history.replaceState(null, "", url);
      }
      return p;
    });
  }, []);

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
  const clearTypes = useCallback(() => writeParams((p) => p.delete(TYPES_KEY)), [writeParams]);

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
  const clearGens = useCallback(() => writeParams((p) => p.delete(GENS_KEY)), [writeParams]);

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
  const clearForms = useCallback(() => writeParams((p) => p.delete(FORMS_KEY)), [writeParams]);

  const toggleRarity = useCallback(
    (r: Rarity) => {
      writeParams((p) => {
        const cur = parseRarities(p.get(RARITY_KEY));
        if (cur.has(r)) cur.delete(r);
        else cur.add(r);
        if (cur.size) p.set(RARITY_KEY, Array.from(cur).join(","));
        else p.delete(RARITY_KEY);
      });
    },
    [writeParams],
  );
  const clearRarities = useCallback(
    () => writeParams((p) => p.delete(RARITY_KEY)),
    [writeParams],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = pokemon.filter((p) => {
      if (q) {
        const idMatch =
          String(p.id).includes(q) || String(p.id).padStart(4, "0").includes(q);
        const nameMatch = p.name.toLowerCase().includes(q);
        const romajiMatch = p.romaji?.toLowerCase().includes(q) ?? false;
        if (!nameMatch && !romajiMatch && !idMatch) return false;
      }
      if (activeGens.size > 0 && !activeGens.has(p.gen)) return false;
      if (activeTypes.size > 0 && !p.types.some((t) => activeTypes.has(t)))
        return false;
      if (activeForms.size > 0 && !p.formTags.some((f) => activeForms.has(f)))
        return false;
      if (activeRarities.size > 0 && !p.rarity.some((r) => activeRarities.has(r)))
        return false;
      return true;
    });
    if (imageSearch) {
      const { scores } = imageSearch;
      return list
        .filter((p) => scores.has(p.id))
        .sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
    }
    return list;
  }, [pokemon, query, activeGens, activeTypes, activeForms, activeRarities, imageSearch]);

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
        activeRarities={activeRarities}
        toggleRarity={toggleRarity}
        clearRarities={clearRarities}
        imageSearchUrl={imageSearch?.previewUrl ?? null}
        onOpenImageSearch={() => setImageModalOpen(true)}
        onClearImageSearch={clearImageSearch}
        count={filtered.length}
      />
      {imageModalOpen && (
        <Suspense fallback={null}>
          <ImageSearchModal
            open={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            onResults={handleImageResults}
          />
        </Suspense>
      )}
      <main className="main">
        {filtered.length === 0 ? (
          <Empty />
        ) : (
          <CatalogGrid
            list={filtered}
            density={t.density}
            formLabels={imageSearch?.formLabels ?? null}
            onOpen={openDialog}
          />
        )}
      </main>
      {dialogId != null && (
        <DetailDialog
          id={dialogId}
          pokemon={pokemon}
          onClose={closeDialog}
          onNavigate={navigateDialog}
        />
      )}
    </div>
  );
}
