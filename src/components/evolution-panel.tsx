import type { EvolutionBundle } from "@/lib/types";
import { evoLabel, EvoTree } from "./evo-tree";

export function EvolutionPanel({
  currentId,
  bundle,
}: {
  currentId: number;
  bundle: EvolutionBundle;
}) {
  const { evolution, babyTriggerItem, evoLites } = bundle;
  if (evolution.children.length === 0) return null;
  return (
    <section className="panel panel-evo">
      <header className="panel-h">
        <h3>Evolution</h3>
        <span className="panel-tag">
          {evoLabel(evolution)}
          {babyTriggerItem
            ? ` · Baby: ${babyTriggerItem.replace(/-/g, " ")}`
            : ""}
        </span>
      </header>
      <div>
        <EvoTree node={evolution} liteById={evoLites} currentId={currentId} />
      </div>
    </section>
  );
}
