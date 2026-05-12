"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { TYPE_COLORS, type PokemonLite } from "@/lib/types";
import { pokemonHref } from "../_lib/helpers";
import { ArtImg } from "./art-img";
import { Num } from "./num";
import { RarityBadges } from "./rarity-badge";
import { TypeChip } from "./type-chip";
import type { Density } from "./tweaks";

const ROW_GAP = 14;
const EAGER_COUNT = 12;

export function CatalogGrid({
  list,
  density,
  resetKey,
}: {
  list: PokemonLite[];
  density: Density;
  resetKey: string;
}) {
  const minCell = density === "compact" ? 150 : 220;
  const estimatedRow = density === "compact" ? 240 : 340;

  const parentRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);

  useLayoutEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const measure = () => {
      setWidth(el.clientWidth);
      setOffsetTop(el.getBoundingClientRect().top + window.scrollY);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  const columnCount = Math.max(
    1,
    Math.floor((width + ROW_GAP) / (minCell + ROW_GAP)),
  );
  const rowCount = Math.ceil(list.length / columnCount);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimatedRow + ROW_GAP,
    overscan: 4,
    scrollMargin: offsetTop,
  });

  useEffect(() => {
    virtualizer.scrollToOffset(offsetTop, { align: "start" });
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  return (
    <div ref={parentRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ height: totalHeight, width: "100%", position: "relative" }}>
        {items.map((vr) => {
          const start = vr.index * columnCount;
          const end = Math.min(start + columnCount, list.length);
          const row = list.slice(start, end);
          return (
            <div
              key={vr.key}
              data-index={vr.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vr.start - virtualizer.options.scrollMargin}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                gap: ROW_GAP,
                paddingBottom: ROW_GAP,
              }}
            >
              {row.map((p, i) => {
                const globalIdx = start + i;
                return (
                  <Link
                    key={p.id}
                    href={pokemonHref(p.id)}
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
                        style={{
                          position: "relative",
                          width: "86%",
                          height: "86%",
                        }}
                      >
                        <ArtImg
                          src={p.art}
                          alt={p.name}
                          sizes="(max-width: 720px) 40vw, 220px"
                          loading={globalIdx < EAGER_COUNT ? "eager" : undefined}
                          fetchPriority={
                            globalIdx < EAGER_COUNT ? "high" : undefined
                          }
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
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
