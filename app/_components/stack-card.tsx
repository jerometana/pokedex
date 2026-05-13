"use client";

import Link from "next/link";
import type { PokemonLite } from "@/lib/types";
import { pokemonHref } from "../_lib/helpers";
import { ArtImg } from "./art-img";
import { Num } from "./num";

export function StackCard({
  p,
  variant,
}: {
  p: PokemonLite;
  variant: "side" | "far";
}) {
  return (
    <Link
      href={pokemonHref(p.id)}
      prefetch={variant === "far" ? false : null}
      className={`stack-card stack-card-${variant}`}
      aria-label={`Show ${p.name}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          position: "relative",
          width: variant === "far" ? "60%" : "80%",
          aspectRatio: "1 / 1",
        }}
      >
        <ArtImg
          src={p.art}
          alt={p.name}
          sizes={variant === "far" ? "120px" : "180px"}
          quality={variant === "far" ? 50 : 70}
        />
      </div>
      {variant === "side" && (
        <div className="stack-card-meta">
          <Num id={p.id} />
          <div className="stack-card-name">{p.name}</div>
        </div>
      )}
    </Link>
  );
}
