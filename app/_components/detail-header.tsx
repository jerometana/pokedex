import Link from "next/link";
import type { PokemonLite } from "@/lib/types";
import { padId, pokemonHref } from "../_lib/helpers";
import { Brand } from "./brand";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export function DetailHeader({
  cur,
  prev,
  next,
  idx,
  total,
}: {
  cur: PokemonLite;
  prev: PokemonLite;
  next: PokemonLite;
  idx: number;
  total: number;
}) {
  return (
    <header className="filter-bar">
      <div className="filter-bar-inner">
        <Brand subtitle="Back to catalog" />

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href={pokemonHref(prev.id)}
            className="nav-btn"
            aria-label="Previous"
          >
            <ChevronLeftIcon />
          </Link>
          <div className="nav-progress">
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>
              {idx + 1}
            </span>
            <span style={{ color: "#CBD5E1" }}>/</span>
            <span style={{ color: "#94A3B8" }}>{total}</span>
          </div>
          <Link
            href={pokemonHref(next.id)}
            className="nav-btn"
            aria-label="Next"
          >
            <ChevronRightIcon />
          </Link>
        </div>
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
