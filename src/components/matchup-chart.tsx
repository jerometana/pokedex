"use client";

import { useMemo } from "react";
import { ALL_TYPES, type DamageRelations, type PokeType } from "@/lib/types";
import { TypeChip } from "./type-chip";

type Bucket = { label: string; mult: number; types: PokeType[] };

const BUCKETS: { label: string; mult: number }[] = [
  { label: "4×", mult: 4 },
  { label: "2×", mult: 2 },
  { label: "0.5×", mult: 0.5 },
  { label: "0.25×", mult: 0.25 },
  { label: "0×", mult: 0 },
];

function multKey(m: number): string {
  if (m === 4) return "4";
  if (m === 2) return "2";
  if (m === 0.5) return "half";
  if (m === 0.25) return "quarter";
  return "zero";
}

export function MatchupChart({
  types,
  damageRelations,
}: {
  types: PokeType[];
  damageRelations: DamageRelations;
}) {
  const buckets = useMemo<Bucket[]>(() => {
    const mults = new Map<PokeType, number>();
    for (const atk of ALL_TYPES) {
      let m = 1;
      for (const def of types) {
        const rel = damageRelations[def];
        if (rel.noFrom.includes(atk)) m *= 0;
        else if (rel.doubleFrom.includes(atk)) m *= 2;
        else if (rel.halfFrom.includes(atk)) m *= 0.5;
      }
      mults.set(atk, m);
    }
    return BUCKETS.map((b) => ({
      label: b.label,
      mult: b.mult,
      types: ALL_TYPES.filter((t) => mults.get(t) === b.mult),
    })).filter((b) => b.types.length > 0);
  }, [types, damageRelations]);

  return (
    <div className="matchup">
      {buckets.map((b) => (
        <div key={b.label} className={`matchup-row matchup-${multKey(b.mult)}`}>
          <div className="matchup-label">
            <span className="matchup-mult">{b.label}</span>
          </div>
          <div className="matchup-types">
            {b.types.map((t) => (
              <span key={t} className="matchup-cell" title={t}>
                <TypeChip type={t} />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
