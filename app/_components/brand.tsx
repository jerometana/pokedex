import Link from "next/link";

export function Brand({ subtitle }: { subtitle: string }) {
  return (
    <Link
      href="/"
      className="brand"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="brand-mark" aria-hidden>
        <span className="brand-dot" />
      </div>
      <div>
        <div className="brand-title">Pokédex</div>
        <div className="brand-sub">{subtitle}</div>
      </div>
    </Link>
  );
}
