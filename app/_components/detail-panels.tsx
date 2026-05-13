"use client";

import { Suspense } from "react";
import type { PokemonEvolutionBundle } from "@/lib/pokeapi";
import {
  TYPE_COLORS,
  type MoveDetail,
  type PokemonForm,
  type PokemonFull,
} from "@/lib/types";
import { EvolutionPanel } from "./evolution-panel";
import { FormCard } from "./form-card";
import { MatchupChart } from "./matchup-chart";
import { MovesPanel } from "./moves-panel";
import { StatBar } from "./stat-bar";

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
  evolutionPromise,
  movesPromise,
}: {
  full: PokemonFull;
  active: PokemonForm;
  onSelectForm: (id: number) => void;
  evolutionPromise: Promise<PokemonEvolutionBundle>;
  movesPromise: Promise<Record<string, MoveDetail>>;
}) {
  const tint = TYPE_COLORS[active.types[0]].chip;
  const total = Object.values(active.stats).reduce((a, b) => a + b, 0);
  const altForms = full.forms.filter((f) => !f.isDefault);

  return (
    <div className="detail-grid">
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
        <Suspense fallback={null}>
          <MovesPanel movepool={full.movepool} movesPromise={movesPromise} />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <EvolutionPanel
          currentId={full.id}
          evolutionPromise={evolutionPromise}
        />
      </Suspense>

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
    </div>
  );
}
