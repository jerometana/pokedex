"use client";

import Link from "./link";
import type { PokemonLite } from "@/lib/types";
import { pokemonHref } from "@/lib/helpers";
import { ArtImg } from "./art-img";
import { Num } from "./num";
import { pokeNavClick, usePokeNavigate } from "./nav-context";

export function StackCard({
  p,
  variant,
}: {
  p: PokemonLite;
  variant: "side" | "far";
}) {
  const nav = usePokeNavigate();
  return (
    <Link
      href={pokemonHref(p.id)}
      prefetch={variant === "far" ? false : true}
      className={`stack-card stack-card-${variant}`}
      aria-label={`Show ${p.name}`}
      style={{ textDecoration: "none", color: "inherit" }}
      onClick={(e) => pokeNavClick(e, p.id, nav)}
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
