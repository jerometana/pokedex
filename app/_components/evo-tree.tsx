import Image from "next/image";
import Link from "next/link";
import type { EvolutionNode, PokemonLite } from "@/lib/types";
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

function EvoArrow() {
  return (
    <div className="evo-arrow" aria-hidden>
      <ArrowRightIcon />
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
          src={ev.sprite}
          alt={ev.name}
          width={96}
          height={96}
          sizes="96px"
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
    return (
      <div className="evo-row">
        {stage}
        <EvoArrow />
        <EvoTree
          node={node.children[0]}
          liteById={liteById}
          currentId={currentId}
        />
      </div>
    );
  }

  return (
    <div className="evo-row">
      {stage}
      <EvoArrow />
      <div className="evo-branches">
        {node.children.map((child) => (
          <EvoTree
            key={child.id}
            node={child}
            liteById={liteById}
            currentId={currentId}
          />
        ))}
      </div>
    </div>
  );
}
