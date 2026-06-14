export function romanize(n: number): string {
  return (
    ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][n] || String(n)
  );
}

export function mixWithWhite(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(255 - (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function pokemonHref(id: number) {
  return `/pokemon/${id}`;
}

export function padId(id: number): string {
  return String(id).padStart(4, "0");
}
