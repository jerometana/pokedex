import { padId } from "@/lib/helpers";

export function Num({ id }: { id: number }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        fontWeight: 600,
        color: "#94A3B8",
        letterSpacing: 0.4,
      }}
    >
      #{padId(id)}
    </span>
  );
}
