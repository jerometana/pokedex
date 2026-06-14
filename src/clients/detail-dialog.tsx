"use client";

import { useEffect, useState } from "react";
import type {
  DamageRelations,
  PageSnapshot,
  PokemonFull,
  PokemonLite,
} from "@/lib/types";
import { DetailClient } from "./detail-client";
import { CloseIcon } from "@/components/icons";

// type-relations is identical for every Pokémon; fetch it once per session.
let relPromise: Promise<DamageRelations> | null = null;
function loadRelations(): Promise<DamageRelations> {
  if (!relPromise) {
    relPromise = fetch("/data/type-relations.json").then((r) => r.json());
  }
  return relPromise;
}

const pageCache = new Map<number, PageSnapshot>();
async function loadPage(id: number): Promise<PageSnapshot> {
  const hit = pageCache.get(id);
  if (hit) return hit;
  const data = (await fetch(`/data/pokemon/${id}.json`).then((r) =>
    r.json(),
  )) as PageSnapshot;
  pageCache.set(id, data);
  return data;
}

export function DetailDialog({
  id,
  pokemon,
  onClose,
  onNavigate,
}: {
  id: number;
  pokemon: PokemonLite[];
  onClose: () => void;
  onNavigate: (id: number) => void;
}) {
  const [page, setPage] = useState<PageSnapshot | null>(null);
  const [relations, setRelations] = useState<DamageRelations | null>(null);

  useEffect(() => {
    let alive = true;
    setPage(null);
    loadPage(id).then((p) => {
      if (alive) setPage(p);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    let alive = true;
    loadRelations().then((r) => {
      if (alive) setRelations(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Esc to close + lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const total = pokemon.length;
  const idx = Math.max(
    0,
    pokemon.findIndex((p) => p.id === id),
  );
  const wrap = (i: number) => pokemon[((i % total) + total) % total];
  const neighbors = {
    prev2: wrap(idx - 2),
    prev: wrap(idx - 1),
    next: wrap(idx + 1),
    next2: wrap(idx + 2),
  };

  const ready = page && relations;
  const full = ready
    ? ({ ...page!.full, damageRelations: relations! } as PokemonFull)
    : null;

  return (
    <div className="detail-dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={full ? full.name : "Pokémon detail"}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="detail-dialog-close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        <div className="detail-dialog-scroll">
          {full && page && relations ? (
            <DetailClient
              key={id}
              full={full}
              neighbors={neighbors}
              idx={idx}
              total={total}
              evolution={page.evolution}
              damageRelations={relations}
              onNavigate={onNavigate}
              inDialog
            />
          ) : (
            <div className="detail-dialog-loading" aria-busy="true">
              Loading…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
