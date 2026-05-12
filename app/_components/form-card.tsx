import Image from "next/image";
import type { PokemonForm } from "@/lib/types";
import { Num } from "./num";
import { TypeChip } from "./type-chip";

export function FormCard({
  form,
  baseName,
  active,
  onClick,
}: {
  form: PokemonForm;
  baseName: string;
  active: boolean;
  onClick: () => void;
}) {
  const display = form.isDefault ? baseName : form.label;
  return (
    <button
      type="button"
      className={`evo-stage form-stage ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="evo-art" style={{ position: "relative" }}>
        <Image
          src={form.sprite}
          alt={display}
          width={96}
          height={96}
          sizes="96px"
          quality={50}
          style={{ objectFit: "contain" }}
        />
      </div>
      <Num id={form.id} />
      <div className="evo-name">{display}</div>
      <div className="evo-types">
        {form.types.map((t) => (
          <TypeChip key={t} type={t} />
        ))}
      </div>
    </button>
  );
}
