"use client";

import { useMemo, useState } from "react";
import {
  ALL_LEARN_METHODS,
  DAMAGE_CLASS_LABEL,
  LEARN_METHOD_LABEL,
  TYPE_COLORS,
  type LearnMethod,
  type MoveDetail,
  type MoveEntry,
} from "@/lib/types";
import { TypeChip } from "./type-chip";

export function MovepoolTable({
  movepool,
  detail,
}: {
  movepool: MoveEntry[];
  detail: Record<string, MoveDetail>;
}) {
  const byMethod = useMemo(() => {
    const out = new Map<LearnMethod, MoveEntry[]>();
    for (const m of movepool) {
      const arr = out.get(m.learnMethod) ?? [];
      arr.push(m);
      out.set(m.learnMethod, arr);
    }
    return out;
  }, [movepool]);

  const available = ALL_LEARN_METHODS.filter((m) => (byMethod.get(m)?.length ?? 0) > 0);
  const [active, setActive] = useState<LearnMethod>(available[0] ?? "level-up");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const rows = byMethod.get(active) ?? [];
  const showLevel = active === "level-up";

  return (
    <div className="movepool">
      <div className="movepool-tabs" role="tablist">
        {available.map((m) => {
          const count = byMethod.get(m)?.length ?? 0;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={m === active}
              className={`movepool-tab ${m === active ? "active" : ""}`}
              onClick={() => {
                setActive(m);
                setOpenSlug(null);
              }}
            >
              {LEARN_METHOD_LABEL[m]}
              <span className="movepool-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="movepool-scroll">
        <table className="movepool-table">
          <thead>
            <tr>
              {showLevel && <th className="mp-lv">Lv</th>}
              <th className="mp-name">Move</th>
              <th className="mp-type">Type</th>
              <th className="mp-class">Class</th>
              <th className="mp-num">Pow</th>
              <th className="mp-num">Acc</th>
              <th className="mp-num">PP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry) => {
              const d = detail[entry.slug];
              const isOpen = openSlug === entry.slug;
              return (
                <FragmentRow
                  key={`${entry.learnMethod}-${entry.slug}-${entry.level}`}
                  entry={entry}
                  detail={d}
                  showLevel={showLevel}
                  open={isOpen}
                  onToggle={() => setOpenSlug(isOpen ? null : entry.slug)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({
  entry,
  detail,
  showLevel,
  open,
  onToggle,
}: {
  entry: MoveEntry;
  detail?: MoveDetail;
  showLevel: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const tint = detail ? TYPE_COLORS[detail.type].chip : undefined;
  return (
    <>
      <tr
        className={`mp-row ${open ? "open" : ""}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        {showLevel && (
          <td className="mp-lv">{entry.level ? entry.level : "—"}</td>
        )}
        <td className="mp-name">{entry.name}</td>
        <td className="mp-type">
          {detail ? <TypeChip type={detail.type} /> : <span className="mp-dim">—</span>}
        </td>
        <td className="mp-class">
          {detail ? (
            <span className={`dmg-class dmg-${detail.damageClass}`}>
              {DAMAGE_CLASS_LABEL[detail.damageClass]}
            </span>
          ) : (
            <span className="mp-dim">—</span>
          )}
        </td>
        <td className="mp-num">{detail?.power ?? "—"}</td>
        <td className="mp-num">{detail?.accuracy ?? "—"}</td>
        <td className="mp-num">{detail?.pp ?? "—"}</td>
      </tr>
      {open && detail && (
        <tr className="mp-detail-row">
          <td colSpan={showLevel ? 7 : 6}>
            <div
              className="mp-detail-card"
              style={{ borderLeftColor: tint }}
            >
              <div className="mp-detail-head">
                <strong>{detail.name}</strong>
                <span>{DAMAGE_CLASS_LABEL[detail.damageClass]}</span>
                <span>{detail.type}</span>
              </div>
              {detail.shortEffect && (
                <p className="mp-detail-short">{detail.shortEffect}</p>
              )}
              {detail.effect && detail.effect !== detail.shortEffect && (
                <p className="mp-detail-long">{detail.effect}</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
