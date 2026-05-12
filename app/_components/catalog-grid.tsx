"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { TYPE_COLORS, type PokemonLite } from "@/lib/types";
import { pokemonHref } from "../_lib/helpers";
import { useInfinitePage } from "../_lib/use-infinite-page";
import { ArtImg } from "./art-img";
import { Num } from "./num";
import { RarityBadges } from "./rarity-badge";
import { TypeChip } from "./type-chip";
import type { Density } from "./tweaks";

export function CatalogGrid({
  list,
  density,
  resetKey,
}: {
  list: PokemonLite[];
  density: Density;
  resetKey: string;
}) {
  const min = density === "compact" ? 150 : 220;
  const style: CSSProperties = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
  };
  const { count, sentinelRef } = useInfinitePage(resetKey, list.length);
  const visible = list.slice(0, count);
  return (
    <>
      <div className="grid-view" style={style}>
        {visible.map((p, i) => (
          <Link
            key={p.id}
            href={pokemonHref(p.id)}
            prefetch={false}
            className="grid-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="grid-card-art"
              style={{
                background: `radial-gradient(circle at 50% 60%, ${TYPE_COLORS[p.types[0]].bg} 0%, transparent 70%)`,
                position: "relative",
              }}
            >
              <div
                style={{ position: "relative", width: "86%", height: "86%" }}
              >
                <ArtImg
                  src={p.art}
                  alt={p.name}
                  sizes="(max-width: 720px) 40vw, 220px"
                  loading={i < 12 ? "eager" : undefined}
                  fetchPriority={i < 12 ? "high" : undefined}
                />
              </div>
              {p.rarity.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    zIndex: 1,
                  }}
                >
                  <RarityBadges rarities={p.rarity} />
                </div>
              )}
            </div>
            <div className="grid-card-foot">
              <Num id={p.id} />
              <div className="grid-card-name">{p.name}</div>
              <div className="grid-card-types">
                {p.types.map((t) => (
                  <TypeChip key={t} type={t} />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {count < list.length && (
        <div
          ref={sentinelRef}
          style={{
            padding: "24px 0",
            textAlign: "center",
            color: "var(--ink-3)",
            fontSize: 12,
          }}
        >
          Loading more…
        </div>
      )}
    </>
  );
}
