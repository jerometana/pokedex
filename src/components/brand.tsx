import Link from "./link";
import { PokedexWordmark } from "./pokedex-wordmark";

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
        <div className="brand-title">
          <PokedexWordmark />
        </div>
        <div className="brand-sub">{subtitle}</div>
      </div>
    </Link>
  );
}
