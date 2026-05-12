"use client";

import { useEffect, useState } from "react";

export function StatBar({
  label,
  value,
  max = 180,
  tint = "#0F172A",
}: {
  label: string;
  value: number;
  max?: number;
  tint?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 60);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 0",
      }}
    >
      <div
        style={{
          width: 44,
          fontSize: 11,
          fontWeight: 600,
          color: "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: 30,
          fontSize: 13,
          fontWeight: 700,
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div
        style={{
          flex: 1,
          height: 8,
          background: "var(--bar-track)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${w}%`,
            height: "100%",
            background: tint,
            borderRadius: 999,
            transition: "width 700ms cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </div>
    </div>
  );
}
