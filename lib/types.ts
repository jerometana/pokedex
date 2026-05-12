export type PokeType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export type TypeColor = { bg: string; fg: string; chip: string };

export const TYPE_COLORS: Record<PokeType, TypeColor> = {
  normal:   { bg: "#F5F5EF", fg: "#6B6B5A", chip: "#A8A878" },
  fire:     { bg: "#FFF1E8", fg: "#C2410C", chip: "#F08030" },
  water:    { bg: "#EAF2FF", fg: "#1D4ED8", chip: "#6890F0" },
  electric: { bg: "#FFF9E0", fg: "#A16207", chip: "#F8D030" },
  grass:    { bg: "#E8F7E4", fg: "#15803D", chip: "#78C850" },
  ice:      { bg: "#E6F6F6", fg: "#0F766E", chip: "#98D8D8" },
  fighting: { bg: "#FBE9E7", fg: "#991B1B", chip: "#C03028" },
  poison:   { bg: "#F5E8F5", fg: "#86198F", chip: "#A040A0" },
  ground:   { bg: "#FAF1DC", fg: "#854D0E", chip: "#E0C068" },
  flying:   { bg: "#EFEBFB", fg: "#4338CA", chip: "#A890F0" },
  psychic:  { bg: "#FFE9EF", fg: "#BE185D", chip: "#F85888" },
  bug:      { bg: "#F0F2DD", fg: "#4D7C0F", chip: "#A8B820" },
  rock:     { bg: "#F3EEDB", fg: "#78350F", chip: "#B8A038" },
  ghost:    { bg: "#ECE6F4", fg: "#5B21B6", chip: "#705898" },
  dragon:   { bg: "#EAE0FE", fg: "#5B21B6", chip: "#7038F8" },
  dark:     { bg: "#ECE6E2", fg: "#44403C", chip: "#705848" },
  steel:    { bg: "#EEEEF4", fg: "#475569", chip: "#B8B8D0" },
  fairy:    { bg: "#FCEAEF", fg: "#9D174D", chip: "#EE99AC" },
};

export const ALL_TYPES: PokeType[] = [
  "normal","fire","water","electric","grass","ice","fighting","poison","ground",
  "flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
];

export type Stats = { hp: number; atk: number; def: number; spA: number; spD: number; spd: number };

export type EvolutionNode = {
  id: number;
  children: EvolutionNode[];
};

export type Gen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const ALL_GENS: Gen[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export type PokemonLite = {
  id: number;
  name: string;
  gen: Gen;
  types: PokeType[];
  art: string;
  sprite: string;
};

export type PokemonForm = {
  id: number;
  slug: string;
  label: string;
  isDefault: boolean;
  types: PokeType[];
  height: number;
  weight: number;
  abilities: string[];
  stats: Stats;
  art: string;
  sprite: string;
};

export type PokemonFull = PokemonLite & {
  height: number;
  weight: number;
  abilities: string[];
  stats: Stats;
  moves: string[];
  evolution: EvolutionNode;
  flavor: string;
  forms: PokemonForm[];
};

export type Pokemon = PokemonFull;
