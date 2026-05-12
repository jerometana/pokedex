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

export type LocalizedName = { lang: string; label: string; name: string };

export type Ability = {
  slug: string;
  name: string;
  isHidden: boolean;
};

export type AbilityDetail = {
  shortEffect: string;
  effect: string;
  flavor: string;
};

export type DamageClass = "physical" | "special" | "status";

export const DAMAGE_CLASS_LABEL: Record<DamageClass, string> = {
  physical: "Physical",
  special: "Special",
  status: "Status",
};

export type LearnMethod = "level-up" | "machine" | "egg" | "tutor" | "other";

export const LEARN_METHOD_LABEL: Record<LearnMethod, string> = {
  "level-up": "Level up",
  machine: "TM / TR",
  egg: "Egg",
  tutor: "Tutor",
  other: "Other",
};

export const ALL_LEARN_METHODS: LearnMethod[] = [
  "level-up",
  "machine",
  "egg",
  "tutor",
  "other",
];

export type MoveEntry = {
  slug: string;
  name: string;
  learnMethod: LearnMethod;
  level: number;
};

export type MoveDetail = {
  slug: string;
  name: string;
  type: PokeType;
  damageClass: DamageClass;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  shortEffect: string;
  effect: string;
};

export type EvoCondition = {
  trigger: string;
  minLevel: number | null;
  item: string | null;
  heldItem: string | null;
  timeOfDay: string;
  location: string | null;
  knownMove: string | null;
  knownMoveType: string | null;
  usedMove: string | null;
  minHappiness: number | null;
  minBeauty: number | null;
  minAffection: number | null;
  gender: number | null;
  needsOverworldRain: boolean;
  needsMultiplayer: boolean;
  turnUpsideDown: boolean;
  relativePhysicalStats: number | null;
  tradeSpecies: string | null;
  partySpecies: string | null;
  partyType: string | null;
};

export type EvolutionNode = {
  id: number;
  conditions: EvoCondition[];
  children: EvolutionNode[];
};

export type TypeRelation = {
  doubleFrom: PokeType[];
  halfFrom: PokeType[];
  noFrom: PokeType[];
  doubleTo: PokeType[];
  halfTo: PokeType[];
  noTo: PokeType[];
};

export type DamageRelations = Record<PokeType, TypeRelation>;

export type Gen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const ALL_GENS: Gen[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export type FormCategory = "mega" | "gmax" | "regional" | "primal";

export const ALL_FORM_CATEGORIES: FormCategory[] = [
  "mega",
  "gmax",
  "regional",
  "primal",
];

export const FORM_LABELS: Record<FormCategory, string> = {
  mega: "Mega",
  gmax: "Gigantamax",
  regional: "Regional",
  primal: "Primal",
};

export type Rarity = "legendary" | "mythical" | "baby";

export const ALL_RARITIES: Rarity[] = ["legendary", "mythical", "baby"];

export const RARITY_LABELS: Record<Rarity, string> = {
  legendary: "Legendary",
  mythical: "Mythical",
  baby: "Baby",
};

export const RARITY_STYLES: Record<Rarity, { bg: string; fg: string; chip: string }> = {
  legendary: { bg: "#FFF6DC", fg: "#7C4A03", chip: "#E0A521" },
  mythical:  { bg: "#F0E6FF", fg: "#5B21B6", chip: "#8B5CF6" },
  baby:      { bg: "#FFE9F1", fg: "#9D174D", chip: "#F472B6" },
};

export type PokemonLite = {
  id: number;
  name: string;
  gen: Gen;
  types: PokeType[];
  art: string;
  sprite: string;
  formTags: FormCategory[];
  rarity: Rarity[];
};

export type PokemonForm = {
  id: number;
  slug: string;
  label: string;
  isDefault: boolean;
  types: PokeType[];
  height: number;
  weight: number;
  abilities: Ability[];
  stats: Stats;
  art: string;
  sprite: string;
};

export type PokemonFull = PokemonLite & {
  height: number;
  weight: number;
  abilities: Ability[];
  stats: Stats;
  movepool: MoveEntry[];
  moveDetail: Record<string, MoveDetail>;
  abilityDetail: Record<string, AbilityDetail>;
  evolution: EvolutionNode;
  babyTriggerItem: string | null;
  flavor: string;
  forms: PokemonForm[];
  names: LocalizedName[];
  damageRelations: DamageRelations;
  versionGroup: string | null;
};

export type Pokemon = PokemonFull;
