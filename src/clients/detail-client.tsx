"use client";

import { useEffect, useState } from "react";
import Link from "@/components/link";
import type {
  AbilityDetail,
  DamageRelations,
  EvolutionBundle,
  MoveDetail,
  PokemonFull,
  PokemonLite,
} from "@/lib/types";
import { pokemonHref } from "@/lib/helpers";
import { DetailHeader } from "@/components/detail-header";
import { DetailPanels } from "@/components/detail-panels";
import { FocusHero } from "@/components/focus-hero";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { StackCard } from "@/components/stack-card";
import { accentStrengthFor, useTweaks } from "@/components/tweaks";
import { NavigateContext, pokeNavClick } from "@/components/nav-context";

type Neighbors = {
  prev2: PokemonLite;
  prev: PokemonLite;
  next: PokemonLite;
  next2: PokemonLite;
};

export function DetailClient({
  full,
  neighbors,
  idx,
  total,
  evolution,
  damageRelations,
  onNavigate = null,
  inDialog = false,
}: {
  full: PokemonFull;
  neighbors: Neighbors;
  idx: number;
  total: number;
  evolution: EvolutionBundle;
  damageRelations: DamageRelations;
  // When provided (popup dialog), neighbour/evolution links swap content in
  // place instead of navigating. Omitted on the standalone page.
  onNavigate?: ((id: number) => void) | null;
  inDialog?: boolean;
}) {
  const { t } = useTweaks();

  // Move/ability effect text is fetched on demand (kept out of the HTML) from a
  // static JSON file — still zero PokeAPI calls. Table/abilities render
  // immediately from data already in `full`, then enrich once this resolves.
  const [deferred, setDeferred] = useState<{
    abilityDetail: Record<string, AbilityDetail>;
    moveDetail: Record<string, MoveDetail>;
  }>({ abilityDetail: {}, moveDetail: {} });
  useEffect(() => {
    let alive = true;
    fetch(`/data/detail/${full.id}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setDeferred(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [full.id]);
  const { abilityDetail, moveDetail } = deferred;

  const defaultForm = full.forms.find((f) => f.isDefault) ?? full.forms[0];
  const [activeFormId, setActiveFormId] = useState<number>(defaultForm.id);
  const [prevDefaultId, setPrevDefaultId] = useState(defaultForm.id);
  if (prevDefaultId !== defaultForm.id) {
    setPrevDefaultId(defaultForm.id);
    setActiveFormId(defaultForm.id);
  }
  const active = full.forms.find((f) => f.id === activeFormId) ?? defaultForm;

  const handleSelectForm = (id: number) => {
    setActiveFormId(id);
    if (!inDialog) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { prev2, prev, next, next2 } = neighbors;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const go = (id: number) => {
        if (onNavigate) onNavigate(id);
        else window.location.href = pokemonHref(id);
      };
      if (e.key === "ArrowLeft") go(prev.id);
      else if (e.key === "ArrowRight") go(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev.id, next.id, onNavigate]);

  const accentStrength = accentStrengthFor(t.accent);

  return (
    <NavigateContext.Provider value={onNavigate}>
      <div className={`app density-${t.density}`}>
        {!inDialog && <DetailHeader cur={full} />}
        <main className="main">
          <div className="focus-wrap">
            <div className="stack-row">
              <StackCard p={prev2} variant="far" />
              <StackCard p={prev} variant="side" />
              <FocusHero
                key={full.id}
                full={full}
                active={active}
                accentStrength={accentStrength}
                onSelectForm={handleSelectForm}
                abilityDetail={abilityDetail}
              />
              <StackCard p={next} variant="side" />
              <StackCard p={next2} variant="far" />
            </div>

            <div className="detail-paginator">
              <Link
                href={pokemonHref(prev.id)}
                className="nav-btn"
                aria-label="Previous"
                onClick={(e) => pokeNavClick(e, prev.id, onNavigate)}
              >
                <ChevronLeftIcon />
              </Link>
              <div className="nav-progress">
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                  {idx + 1}
                </span>
                <span style={{ color: "#CBD5E1" }}>/</span>
                <span style={{ color: "#94A3B8" }}>{total}</span>
              </div>
              <Link
                href={pokemonHref(next.id)}
                className="nav-btn"
                aria-label="Next"
                onClick={(e) => pokeNavClick(e, next.id, onNavigate)}
              >
                <ChevronRightIcon />
              </Link>
            </div>

            <DetailPanels
              key={full.id}
              full={full}
              active={active}
              onSelectForm={handleSelectForm}
              evolution={evolution}
              moveDetail={moveDetail}
              damageRelations={damageRelations}
            />
          </div>
        </main>
      </div>
    </NavigateContext.Provider>
  );
}
