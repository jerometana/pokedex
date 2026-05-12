"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TYPE_COLORS, type PokemonForm, type PokemonFull } from "@/lib/types";
import { mixWithWhite, romanize } from "../_lib/helpers";
import { artVariants, heroVariants } from "../_lib/animations";
import { Num } from "./num";
import { TypeChip } from "./type-chip";

export function FocusHero({
  full,
  active,
  accentStrength,
  dir,
}: {
  full: PokemonFull;
  active: PokemonForm;
  accentStrength: number;
  dir: 1 | -1 | 0;
}) {
  const primary = TYPE_COLORS[active.types[0]];
  const tintBg = accentStrength
    ? `linear-gradient(180deg, ${mixWithWhite(primary.bg, accentStrength)} 0%, var(--card-bg) 78%)`
    : "var(--card-bg)";
  const displayName = active.isDefault
    ? full.name
    : `${full.name} (${active.label})`;
  return (
    <motion.article
      className="focus-hero"
      style={{ background: tintBg }}
      custom={dir}
      variants={heroVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
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
        <Num id={full.id} />
        <div className="focus-hero-gen">Gen {romanize(full.gen)}</div>
      </div>

      <div className="focus-hero-art">
        <motion.div
          key={active.id}
          className="sprite-img"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            filter: "drop-shadow(0 30px 40px rgba(15,23,42,0.22))",
          }}
          custom={dir}
          variants={artVariants}
          initial="enter"
          animate="center"
        >
          <Image
            src={active.art}
            alt={displayName}
            fill
            sizes="(max-width: 900px) 60vw, 280px"
            quality={85}
            preload
            fetchPriority="high"
            style={{ objectFit: "contain" }}
          />
        </motion.div>
      </div>

      <div className="focus-hero-name">{displayName}</div>
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
          <div className="meta-v">{active.abilities.join(" · ")}</div>
        </div>
      </div>
    </motion.article>
  );
}
