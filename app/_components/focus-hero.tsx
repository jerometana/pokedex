"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, use, useState } from "react";
import {
  TYPE_COLORS,
  type Ability,
  type AbilityDetail,
  type PokemonForm,
  type PokemonFull,
} from "@/lib/types";
import { mixWithWhite, romanize } from "../_lib/helpers";
import { artVariants } from "../_lib/animations";
import { AbilityChip } from "./ability-chip";
import { CryButton } from "./cry-button";
import { ChevronLeftIcon, ChevronRightIcon, SparkleIcon } from "./icons";
import { Num } from "./num";
import { RarityBadges } from "./rarity-badge";
import { TypeChip } from "./type-chip";

function AbilitiesRowWithTooltips({
  abilities,
  detailPromise,
}: {
  abilities: Ability[];
  detailPromise: Promise<Record<string, AbilityDetail>>;
}) {
  const detail = use(detailPromise);
  return (
    <>
      {abilities.map((a) => (
        <AbilityChip key={a.slug} ability={a} detail={detail[a.slug]} />
      ))}
    </>
  );
}

function toShiny(url: string): string {
  return url.replace("/official-artwork/", "/official-artwork/shiny/");
}

export function FocusHero({
  full,
  active,
  accentStrength,
  onSelectForm,
  abilityDetailPromise,
}: {
  full: PokemonFull;
  active: PokemonForm;
  accentStrength: number;
  onSelectForm: (id: number) => void;
  abilityDetailPromise: Promise<Record<string, AbilityDetail>>;
}) {
  const [shiny, setShiny] = useState(false);
  const primary = TYPE_COLORS[active.types[0]];
  const tintBg = accentStrength
    ? `linear-gradient(180deg, ${mixWithWhite(primary.bg, accentStrength)} 0%, var(--card-bg) 78%)`
    : "var(--card-bg)";
  const displayName = active.isDefault
    ? full.name
    : `${full.name} (${active.label})`;
  const formLabel = active.isDefault ? null : active.label;
  const heroArt = shiny ? toShiny(active.art) : active.art;
  const formIdx = full.forms.findIndex((f) => f.id === active.id);
  const hasForms = full.forms.length > 1;
  const [formDir, setFormDir] = useState<1 | -1 | 0>(0);
  const [prevFormIdx, setPrevFormIdx] = useState(formIdx);
  if (prevFormIdx !== formIdx) {
    const n = full.forms.length;
    const delta = formIdx - prevFormIdx;
    const d: 1 | -1 =
      delta > n / 2 ? -1 : delta < -n / 2 ? 1 : delta > 0 ? 1 : -1;
    setFormDir(d);
    setPrevFormIdx(formIdx);
  }
  const goForm = (delta: number) => {
    if (!hasForms) return;
    const n = full.forms.length;
    const nextIdx = (formIdx + delta + n) % n;
    setFormDir(delta > 0 ? 1 : -1);
    onSelectForm(full.forms[nextIdx].id);
  };
  return (
    <article className="focus-hero" style={{ background: tintBg }}>
      <div className="focus-hero-bg" aria-hidden>
        <div
          className="focus-hero-blob"
          style={{
            background: primary.chip,
            opacity: accentStrength ? 0.12 : 0.05,
          }}
        />
        <div className="focus-hero-grid" />
      </div>

      <div className="focus-hero-top">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Num id={full.id} />
          <div className="focus-hero-gen">Gen {romanize(full.gen)}</div>
          <RarityBadges rarities={full.rarity} />
        </div>
        <div className="focus-hero-top-right">
          <CryButton src={active.cry} name={displayName} />
          <button
            type="button"
            className={`shiny-toggle ${shiny ? "on" : ""}`}
            onClick={() => setShiny((v) => !v)}
            aria-pressed={shiny}
            aria-label={shiny ? "Hide shiny" : "Show shiny"}
            title={shiny ? "Hide shiny" : "Show shiny"}
          >
            <SparkleIcon size={24} />
          </button>
        </div>
      </div>

      {hasForms && (
        <button
          type="button"
          className="form-slider-arrow form-slider-arrow-l"
          onClick={() => goForm(-1)}
          aria-label="Previous form"
        >
          <ChevronLeftIcon size={64} />
        </button>
      )}
      {hasForms && (
        <button
          type="button"
          className="form-slider-arrow form-slider-arrow-r"
          onClick={() => goForm(1)}
          aria-label="Next form"
        >
          <ChevronRightIcon size={64} />
        </button>
      )}

      <div className="focus-hero-art">
        <AnimatePresence mode="wait" custom={formDir} initial={false}>
          <motion.div
            key={`${active.id}-${shiny ? "s" : "n"}`}
            className="sprite-img"
            style={{
              position: "absolute",
              inset: 0,
              filter: "drop-shadow(0 30px 40px rgba(15,23,42,0.22))",
            }}
            custom={formDir}
            variants={artVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <Image
              src={heroArt}
              alt={shiny ? `${displayName} (Shiny)` : displayName}
              fill
              sizes="(max-width: 900px) 60vw, 280px"
              quality={85}
              loading="eager"
              fetchPriority="high"
              style={{ objectFit: "contain" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="focus-hero-name">
        {formLabel && <div className="focus-hero-form-label">{formLabel}</div>}
        {full.name}
        {(() => {
          const romaji = full.names.find((n) => n.lang === "ja-roma")?.name;
          return romaji ? (
            <span
              className="block text-sm font-medium mt-3"
              style={{
                color: "var(--ink-3)",
                letterSpacing: 0,
              }}
            >
              ({romaji})
            </span>
          ) : null;
        })()}
      </div>
      <div className="focus-hero-types">
        {active.types.map((t) => (
          <TypeChip key={t} type={t} size="lg" />
        ))}
      </div>
      <div className="focus-hero-flavor">{full.flavor}</div>

      <div className="focus-hero-meta">
        <div>
          <div className="meta-k">Height</div>
          <div className="meta-v">{active.height} m</div>
        </div>
        <div>
          <div className="meta-k">Weight</div>
          <div className="meta-v">{active.weight} kg</div>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <div className="meta-k">Abilities</div>
          <div className="ability-chip-row">
            {active.abilities.length === 0 && (
              <span className="meta-v">N/A</span>
            )}
            <Suspense
              fallback={active.abilities.map((a) => (
                <AbilityChip key={a.slug} ability={a} />
              ))}
            >
              <AbilitiesRowWithTooltips
                abilities={active.abilities}
                detailPromise={abilityDetailPromise}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </article>
  );
}
