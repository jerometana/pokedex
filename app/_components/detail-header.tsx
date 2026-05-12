import type { PokemonLite } from "@/lib/types";
import { padId } from "../_lib/helpers";
import { Brand } from "./brand";

export function DetailHeader({ cur }: { cur: PokemonLite }) {
  return (
    <header className="filter-bar">
      <div className="filter-bar-inner">
        <Brand subtitle="Back to catalog" />
      </div>
      <div className="pills-row">
        <div className="pills-scroll">
          <span
            style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}
          >
            #{padId(cur.id)} · {cur.name}
          </span>
        </div>
      </div>
    </header>
  );
}
