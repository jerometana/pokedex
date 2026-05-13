"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PokemonFull, PokemonLite } from "@/lib/types";
import { pokemonHref } from "../_lib/helpers";
import { DetailHeader } from "../_components/detail-header";
import { DetailPanels } from "../_components/detail-panels";
import { FocusHero } from "../_components/focus-hero";
import { ChevronLeftIcon, ChevronRightIcon } from "../_components/icons";
import { StackCard } from "../_components/stack-card";
import { accentStrengthFor, useTweaks } from "../_components/tweaks";

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
  evoLites,
}: {
  full: PokemonFull;
  neighbors: Neighbors;
  idx: number;
  total: number;
  evoLites: Record<number, PokemonLite>;
}) {
  const { t } = useTweaks();
  const router = useRouter();

  const defaultForm = full.forms.find((f) => f.isDefault) ?? full.forms[0];
  const [activeFormId, setActiveFormId] = useState<number>(defaultForm.id);
  const [prevDefaultId, setPrevDefaultId] = useState(defaultForm.id);
  if (prevDefaultId !== defaultForm.id) {
    setPrevDefaultId(defaultForm.id);
    setActiveFormId(defaultForm.id);
  }
  const active =
    full.forms.find((f) => f.id === activeFormId) ?? defaultForm;

  const handleSelectForm = (id: number) => {
    setActiveFormId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { prev2, prev, next, next2 } = neighbors;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        router.push(pokemonHref(prev.id));
      } else if (e.key === "ArrowRight") {
        router.push(pokemonHref(next.id));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev.id, next.id, router]);

  const accentStrength = accentStrengthFor(t.accent);

  return (
    <div className={`app density-${t.density}`}>
      <DetailHeader cur={full} />
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
            />
            <StackCard p={next} variant="side" />
            <StackCard p={next2} variant="far" />
          </div>

          <div className="detail-paginator">
            <Link
              href={pokemonHref(prev.id)}
              prefetch
              className="nav-btn"
              aria-label="Previous"
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
              prefetch
              className="nav-btn"
              aria-label="Next"
            >
              <ChevronRightIcon />
            </Link>
          </div>

          <DetailPanels
            key={full.id}
            full={full}
            active={active}
            onSelectForm={handleSelectForm}
            liteById={evoLites}
          />
        </div>
      </main>
    </div>
  );
}
