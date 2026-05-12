import Image from "next/image";
import Link from "next/link";
import type { EvoCondition, EvolutionNode, PokemonLite } from "@/lib/types";
import { pokemonHref } from "../_lib/helpers";
import { ArrowRightIcon } from "./icons";
import { Num } from "./num";
import { TypeChip } from "./type-chip";

export function countEvoNodes(n: EvolutionNode): number {
  return 1 + n.children.reduce((a, c) => a + countEvoNodes(c), 0);
}

export function hasBranch(n: EvolutionNode): boolean {
  return n.children.length > 1 || n.children.some(hasBranch);
}

export function evoLabel(n: EvolutionNode): string {
  const total = countEvoNodes(n);
  if (total === 1) return "Does not evolve";
  if (hasBranch(n)) return `${total} forms`;
  return `${total} stages`;
}

function titleize(s: string): string {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function describeCondition(c: EvoCondition): string[] {
  const parts: string[] = [];
  if (c.trigger === "level-up") {
    if (c.minLevel != null) parts.push(`Lv. ${c.minLevel}`);
    else parts.push("Level up");
  } else if (c.trigger === "trade") {
    parts.push(
      c.tradeSpecies ? `Trade w/ ${titleize(c.tradeSpecies)}` : "Trade",
    );
  } else if (c.trigger === "use-item") {
    parts.push(c.item ? `Use ${titleize(c.item)}` : "Use item");
  } else if (c.trigger === "shed") {
    parts.push("Shed");
  } else if (c.trigger === "spin") {
    parts.push("Spin");
  } else if (c.trigger === "tower-of-darkness") {
    parts.push("Tower of Darkness");
  } else if (c.trigger === "tower-of-waters") {
    parts.push("Tower of Waters");
  } else if (c.trigger === "three-critical-hits") {
    parts.push("3 critical hits in 1 battle");
  } else if (c.trigger === "take-damage") {
    parts.push("Take damage");
  } else if (c.trigger === "agile-style-move") {
    parts.push("Use agile-style move");
  } else if (c.trigger === "strong-style-move") {
    parts.push("Use strong-style move");
  } else if (c.trigger === "recoil-damage") {
    parts.push("Recoil damage");
  } else {
    parts.push(titleize(c.trigger));
  }
  if (c.heldItem) parts.push(`Hold ${titleize(c.heldItem)}`);
  if (c.knownMove) parts.push(`Know ${titleize(c.knownMove)}`);
  if (c.knownMoveType) parts.push(`Know ${titleize(c.knownMoveType)} move`);
  if (c.usedMove && c.trigger !== "use-item")
    parts.push(`Use ${titleize(c.usedMove)}`);
  if (c.minHappiness != null) parts.push(`Happiness ≥ ${c.minHappiness}`);
  if (c.minBeauty != null) parts.push(`Beauty ≥ ${c.minBeauty}`);
  if (c.minAffection != null) parts.push(`Affection ≥ ${c.minAffection}`);
  if (c.timeOfDay) parts.push(titleize(c.timeOfDay));
  if (c.location) parts.push(`At ${titleize(c.location)}`);
  if (c.needsOverworldRain) parts.push("Raining");
  if (c.needsMultiplayer) parts.push("Multiplayer");
  if (c.turnUpsideDown) parts.push("Hold upside down");
  if (c.gender === 1) parts.push("Female");
  else if (c.gender === 2) parts.push("Male");
  if (c.relativePhysicalStats === 1) parts.push("Atk > Def");
  else if (c.relativePhysicalStats === -1) parts.push("Atk < Def");
  else if (c.relativePhysicalStats === 0) parts.push("Atk = Def");
  if (c.partySpecies) parts.push(`Party has ${titleize(c.partySpecies)}`);
  if (c.partyType) parts.push(`Party has ${titleize(c.partyType)} type`);
  return parts;
}

function EvoArrow({ conditions }: { conditions: EvoCondition[] }) {
  const labels = conditions.flatMap(describeCondition);
  return (
    <div className="evo-arrow" aria-label={labels.join("; ") || "evolves"}>
      <ArrowRightIcon />
      {labels.length > 0 && (
        <div className="evo-cond">
          {Array.from(new Set(labels)).map((l) => (
            <span key={l} className="evo-cond-pill">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EvoStage({ ev, active }: { ev: PokemonLite; active: boolean }) {
  return (
    <Link
      href={pokemonHref(ev.id)}
      prefetch={false}
      className={`evo-stage ${active ? "active" : ""}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="evo-art" style={{ position: "relative" }}>
        <Image
          src={ev.art}
          alt={ev.name}
          width={200}
          height={200}
          sizes="200px"
          quality={50}
          style={{ objectFit: "contain" }}
        />
      </div>
      <Num id={ev.id} />
      <div className="evo-name">{ev.name}</div>
      <div className="evo-types">
        {ev.types.map((t) => (
          <TypeChip key={t} type={t} />
        ))}
      </div>
    </Link>
  );
}

export function EvoTree({
  node,
  liteById,
  currentId,
}: {
  node: EvolutionNode;
  liteById: Record<number, PokemonLite>;
  currentId: number;
}) {
  const ev = liteById[node.id];
  if (!ev) return null;
  const stage = <EvoStage ev={ev} active={ev.id === currentId} />;

  if (node.children.length === 0) {
    return <div className="evo-row">{stage}</div>;
  }

  if (node.children.length === 1) {
    const child = node.children[0];
    return (
      <div className="evo-row">
        {stage}
        <EvoArrow conditions={child.conditions} />
        <EvoTree node={child} liteById={liteById} currentId={currentId} />
      </div>
    );
  }

  return (
    <div className="evo-row">
      {stage}
      <div className="evo-branches">
        {node.children.map((child) => (
          <div key={child.id} className="evo-branch-row">
            <EvoArrow conditions={child.conditions} />
            <EvoTree node={child} liteById={liteById} currentId={currentId} />
          </div>
        ))}
      </div>
    </div>
  );
}
