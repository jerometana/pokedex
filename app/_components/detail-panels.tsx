"use client";

import { motion } from "framer-motion";
import { TYPE_COLORS, type PokemonForm, type PokemonFull } from "@/lib/types";
import { detailVariants } from "../_lib/animations";
import { evoLabel, EvoTree } from "./evo-tree";
import { FormCard } from "./form-card";
import { MatchupChart } from "./matchup-chart";
import { MovepoolTable } from "./movepool-table";
import { StatBar } from "./stat-bar";
import type { PokemonLite } from "@/lib/types";

const STAT_ROWS: [string, keyof PokemonFull["stats"]][] = [
  ["HP", "hp"],
  ["ATK", "atk"],
  ["DEF", "def"],
  ["SpA", "spA"],
  ["SpDef", "spD"],
  ["SPD", "spd"],
];

function vgLabel(slug: string | null): string {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) =>
      w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1),
    )
    .join(" ");
}

export function DetailPanels({
  full,
  active,
  onSelectForm,
  liteById,
  dir,
}: {
  full: PokemonFull;
  active: PokemonForm;
  onSelectForm: (id: number) => void;
  liteById: Record<number, PokemonLite>;
  dir: 1 | -1 | 0;
}) {
  const tint = TYPE_COLORS[active.types[0]].chip;
  const total = Object.values(active.stats).reduce((a, b) => a + b, 0);
  const altForms = full.forms.filter((f) => !f.isDefault);
  const hasEvolution = full.evolution.children.length > 0;

  return (
    <motion.div
      className="detail-grid"
      custom={dir}
      variants={detailVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <section className="panel panel-stats">
        <header className="panel-h">
          <h3>Base stats</h3>
          <span className="panel-tag">
            Total <b style={{ color: "var(--ink)" }}>{total}</b>
          </span>
        </header>
        <div>
          {STAT_ROWS.map(([k, key]) => (
            <StatBar
              key={key}
              label={k}
              value={active.stats[key]}
              tint={tint}
            />
          ))}
        </div>
      </section>

      <section className="panel panel-matchups">
        <header className="panel-h">
          <h3>Type matchups</h3>
          <span className="panel-tag">{active.types.join(" / ")}</span>
        </header>
        <MatchupChart
          types={active.types}
          damageRelations={full.damageRelations}
        />
      </section>

      <section className="panel panel-moves">
        <header className="panel-h">
          <h3>Movepool</h3>
          <span className="panel-tag">
            {full.movepool.length} moves
            {full.versionGroup ? ` · ${vgLabel(full.versionGroup)}` : ""}
          </span>
        </header>
        <MovepoolTable movepool={full.movepool} detail={full.moveDetail} />
      </section>

      {hasEvolution && (
        <section className="panel panel-evo">
          <header className="panel-h">
            <h3>Evolution</h3>
            <span className="panel-tag">
              {evoLabel(full.evolution)}
              {full.babyTriggerItem
                ? ` · Baby: ${full.babyTriggerItem.replace(/-/g, " ")}`
                : ""}
            </span>
          </header>
          <div>
            <EvoTree
              node={full.evolution}
              liteById={liteById}
              currentId={full.id}
            />
          </div>
        </section>
      )}

      {altForms.length > 0 && (
        <section className="panel panel-forms">
          <header className="panel-h">
            <h3>Forms</h3>
            <span className="panel-tag">{altForms.length} forms</span>
          </header>
          <div className="form-grid">
            {altForms.map((f) => (
              <FormCard
                key={f.id}
                form={f}
                baseName={full.name}
                active={f.id === active.id}
                onClick={() => onSelectForm(f.id)}
              />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
