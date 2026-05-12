"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { PokemonFull, PokemonLite } from "@/lib/types";
import { pokemonHref } from "../_lib/helpers";
import { consumeNavDir, setNavDir, stackRowVariants } from "../_lib/animations";
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
  const [dir] = useState<1 | -1 | 0>(() => consumeNavDir());

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
        setNavDir(-1);
        router.push(pokemonHref(prev.id));
      } else if (e.key === "ArrowRight") {
        setNavDir(1);
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
          <motion.div
            className="stack-row"
            key={full.id}
            custom={dir}
            variants={stackRowVariants}
            initial="enter"
            animate="center"
          >
            <StackCard p={prev2} variant="far" navDir={-1} />
            <StackCard p={prev} variant="side" navDir={-1} />
            <AnimatePresence mode="wait" initial={false}>
              <FocusHero
                key={full.id}
                full={full}
                active={active}
                accentStrength={accentStrength}
                dir={dir}
                onSelectForm={handleSelectForm}
              />
            </AnimatePresence>
            <StackCard p={next} variant="side" navDir={1} />
            <StackCard p={next2} variant="far" navDir={1} />
          </motion.div>

          <div className="detail-paginator">
            <Link
              href={pokemonHref(prev.id)}
              prefetch
              className="nav-btn"
              aria-label="Previous"
              onClick={() => setNavDir(-1)}
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
              onClick={() => setNavDir(1)}
            >
              <ChevronRightIcon />
            </Link>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <DetailPanels
              key={full.id}
              full={full}
              active={active}
              onSelectForm={handleSelectForm}
              liteById={evoLites}
              dir={dir}
            />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
