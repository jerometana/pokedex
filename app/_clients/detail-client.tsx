"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { PokemonFull, PokemonLite } from "@/lib/types";
import { pokemonHref } from "../_lib/helpers";
import { stackRowVariants } from "../_lib/animations";
import { DetailHeader } from "../_components/detail-header";
import { DetailPanels } from "../_components/detail-panels";
import { FocusHero } from "../_components/focus-hero";
import { StackCard } from "../_components/stack-card";
import {
  accentStrengthFor,
  TweaksPanel,
  useTweaks,
} from "../_components/tweaks";

export function DetailClient({
  pokemon,
  full,
}: {
  pokemon: PokemonLite[];
  full: PokemonFull;
}) {
  const { t, setTweak } = useTweaks();
  const router = useRouter();

  const liteById = useMemo(
    () =>
      Object.fromEntries(pokemon.map((p) => [p.id, p])) as Record<
        number,
        PokemonLite
      >,
    [pokemon],
  );

  const defaultForm = useMemo(
    () => full.forms.find((f) => f.isDefault) ?? full.forms[0],
    [full.forms],
  );
  const [activeFormId, setActiveFormId] = useState<number>(defaultForm.id);
  const [prevDefaultId, setPrevDefaultId] = useState(defaultForm.id);
  if (prevDefaultId !== defaultForm.id) {
    setPrevDefaultId(defaultForm.id);
    setActiveFormId(defaultForm.id);
  }
  const active = useMemo(
    () => full.forms.find((f) => f.id === activeFormId) ?? defaultForm,
    [full.forms, activeFormId, defaultForm],
  );

  const idx = Math.max(
    0,
    pokemon.findIndex((p) => p.id === full.id),
  );
  const prev = pokemon[(idx - 1 + pokemon.length) % pokemon.length];
  const next = pokemon[(idx + 1) % pokemon.length];
  const prev2 = pokemon[(idx - 2 + pokemon.length) % pokemon.length];
  const next2 = pokemon[(idx + 2) % pokemon.length];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") router.push(pokemonHref(prev.id));
      else if (e.key === "ArrowRight") router.push(pokemonHref(next.id));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev.id, next.id, router]);

  const accentStrength = accentStrengthFor(t.accent);

  return (
    <div className={`app density-${t.density}`}>
      <DetailHeader
        cur={full}
        prev={prev}
        next={next}
        idx={idx}
        total={pokemon.length}
      />
      <main className="main">
        <div className="focus-wrap">
          <motion.div
            className="stack-row"
            key={full.id}
            variants={stackRowVariants}
            initial="enter"
            animate="center"
          >
            <StackCard p={prev2} variant="far" />
            <StackCard p={prev} variant="side" />
            <AnimatePresence mode="wait" initial={false}>
              <FocusHero
                key={full.id}
                full={full}
                active={active}
                accentStrength={accentStrength}
                dir={0}
              />
            </AnimatePresence>
            <StackCard p={next} variant="side" />
            <StackCard p={next2} variant="far" />
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            <DetailPanels
              key={full.id}
              full={full}
              active={active}
              onSelectForm={setActiveFormId}
              liteById={liteById}
              dir={0}
            />
          </AnimatePresence>
        </div>
      </main>
      <TweaksPanel t={t} setTweak={setTweak} />
    </div>
  );
}
