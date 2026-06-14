import { RARITY_LABELS, RARITY_STYLES, type Rarity } from "@/lib/types";

export function RarityBadge({
  rarity,
  size = "sm",
}: {
  rarity: Rarity;
  size?: "sm" | "lg";
}) {
  const s = RARITY_STYLES[rarity];
  const lg = size === "lg";
  return (
    <span
      title={RARITY_LABELS[rarity]}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: lg ? 6 : 4,
        padding: lg ? "4px 10px" : "2px 7px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontWeight: 700,
        fontSize: lg ? 11 : 10,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        lineHeight: 1,
        border: `1px solid ${s.chip}33`,
      }}
    >
      <span
        aria-hidden
        style={{
          width: lg ? 6 : 5,
          height: lg ? 6 : 5,
          borderRadius: 999,
          background: s.chip,
        }}
      />
      {RARITY_LABELS[rarity]}
    </span>
  );
}

export function RarityBadges({
  rarities,
  size = "sm",
}: {
  rarities: Rarity[];
  size?: "sm" | "lg";
}) {
  if (rarities.length === 0) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: 4,
      }}
    >
      {rarities.map((r) => (
        <RarityBadge key={r} rarity={r} size={size} />
      ))}
    </span>
  );
}
