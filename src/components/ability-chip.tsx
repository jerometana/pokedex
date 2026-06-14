"use client";

import type { Ability, AbilityDetail } from "@/lib/types";

export function AbilityChip({
  ability,
  detail,
}: {
  ability: Ability;
  detail?: AbilityDetail;
}) {
  const has =
    !!detail && (detail.shortEffect || detail.effect || detail.flavor);
  return (
    <span className={`ability-chip ${has ? "has-tip" : ""}`} tabIndex={0}>
      {ability.isHidden && (
        <span
          className="ability-hidden"
          title="Hidden ability"
          aria-label="Hidden"
        >
          ✦
        </span>
      )}
      <span className="ability-name">{ability.name}</span>

      {has && (
        <span className="ability-tip" role="tooltip">
          {detail!.shortEffect && (
            <span className="ability-tip-short">{detail!.shortEffect}</span>
          )}
          {detail!.flavor && (
            <span className="ability-tip-flavor">{detail!.flavor}</span>
          )}
        </span>
      )}
    </span>
  );
}
