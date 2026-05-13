"use client";

import { use } from "react";
import type { MoveDetail, MoveEntry } from "@/lib/types";
import { MovepoolTable } from "./movepool-table";

export function MovesPanel({
  movepool,
  movesPromise,
}: {
  movepool: MoveEntry[];
  movesPromise: Promise<Record<string, MoveDetail>>;
}) {
  const detail = use(movesPromise);
  return <MovepoolTable movepool={movepool} detail={detail} />;
}
