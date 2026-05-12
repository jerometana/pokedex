import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TYPE_COLORS, type PokeType } from "@/lib/types";
import { TYPE_ICONS } from "../_lib/type-icons";

export function TypeChip({
  type,
  size = "sm",
}: {
  type: PokeType;
  size?: "sm" | "lg";
}) {
  const c = TYPE_COLORS[type] ?? TYPE_COLORS.normal;
  const d = size === "lg" ? 34 : 24;
  const i = size === "lg" ? 18 : 12;
  return (
    <span
      role="img"
      aria-label={type}
      title={type}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: d,
        height: d,
        borderRadius: 999,
        background: c.chip,
        color: "#fff",
        boxShadow:
          "inset 0 -2px 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.30)",
        flex: "0 0 auto",
      }}
    >
      <FontAwesomeIcon icon={TYPE_ICONS[type]} style={{ fontSize: i }} />
    </span>
  );
}
