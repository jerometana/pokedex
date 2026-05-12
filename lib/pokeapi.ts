import Pokedex from "pokedex-promise-v2";
import type {
  EvolutionNode,
  Gen,
  PokeType,
  PokemonForm,
  PokemonFull,
  PokemonLite,
  Stats,
} from "./types";

const REVALIDATE_SECONDS = 60 * 60 * 24 * 30;
const MAX_ID = 1025;

const P = new Pokedex({ cacheLimit: REVALIDATE_SECONDS * 1000 });

const ART = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const STAT_KEY: Record<string, keyof Stats> = {
  hp: "hp",
  attack: "atk",
  defense: "def",
  "special-attack": "spA",
  "special-defense": "spD",
  speed: "spd",
};

const GEN_KEY: Record<string, Gen> = {
  "generation-i": 1,
  "generation-ii": 2,
  "generation-iii": 3,
  "generation-iv": 4,
  "generation-v": 5,
  "generation-vi": 6,
  "generation-vii": 7,
  "generation-viii": 8,
  "generation-ix": 9,
};

const PREFERRED_FLAVOR_VERSIONS = [
  "scarlet", "violet", "sword", "shield", "sun", "moon",
  "x", "y", "black", "white", "ruby", "sapphire", "emerald",
  "gold", "silver", "crystal", "red", "blue", "yellow",
  "firered", "leafgreen",
];

const TYPE_NAMES: PokeType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

function urlToId(url: string): number {
  const parts = url.replace(/\/+$/, "").split("/");
  return Number(parts[parts.length - 1]);
}

function buildEvoTree(link: { species: { url: string }; evolves_to: unknown[] }): EvolutionNode {
  return {
    id: urlToId(link.species.url),
    children: (link.evolves_to as typeof link[]).map(buildEvoTree),
  };
}

function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function pickFlavor(species: Pokedex.PokemonSpecies): string {
  const en = species.flavor_text_entries.filter((e) => e.language.name === "en");
  for (const v of PREFERRED_FLAVOR_VERSIONS) {
    const hit = en.find((e) => e.version.name === v);
    if (hit) return hit.flavor_text;
  }
  return en[0]?.flavor_text ?? "";
}

const FORM_LABEL_MAP: Record<string, string> = {
  mega: "Mega",
  "mega-x": "Mega X",
  "mega-y": "Mega Y",
  gmax: "Gigantamax",
  alola: "Alolan",
  galar: "Galarian",
  hisui: "Hisuian",
  paldea: "Paldean",
  "paldea-combat": "Paldean Combat",
  "paldea-blaze": "Paldean Blaze",
  "paldea-aqua": "Paldean Aqua",
  primal: "Primal",
  origin: "Origin",
  altered: "Altered",
  therian: "Therian",
  incarnate: "Incarnate",
  zen: "Zen",
  pirouette: "Pirouette",
  black: "Black",
  white: "White",
  resolute: "Resolute",
  unbound: "Unbound",
  "ash": "Ash",
  "10": "10%",
  complete: "Complete",
  "school": "School",
  "midnight": "Midnight",
  "dusk": "Dusk",
  "dawn-wings": "Dawn Wings",
  "dusk-mane": "Dusk Mane",
  ultra: "Ultra",
};

function formLabel(speciesSlug: string, formSlug: string, isDefault: boolean): string {
  if (isDefault) return "Default";
  let suffix = formSlug;
  if (suffix.startsWith(`${speciesSlug}-`)) suffix = suffix.slice(speciesSlug.length + 1);
  else if (suffix === speciesSlug) return "Default";
  return FORM_LABEL_MAP[suffix] ?? titleCase(suffix);
}

async function buildForm(
  variety: { pokemon: { name: string; url: string }; is_default: boolean },
  speciesSlug: string,
): Promise<PokemonForm | null> {
  try {
    const pkmn = await P.getPokemonByName(variety.pokemon.name);
    const types = [...pkmn.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name as PokeType);

    const stats: Stats = { hp: 0, atk: 0, def: 0, spA: 0, spD: 0, spd: 0 };
    for (const s of pkmn.stats) {
      const k = STAT_KEY[s.stat.name];
      if (k) stats[k] = s.base_stat;
    }

    const abilitiesOrdered = [...pkmn.abilities].sort((a, b) => a.slot - b.slot);
    const abilities = Array.from(
      new Set(abilitiesOrdered.map((a) => titleCase(a.ability.name))),
    );

    return {
      id: pkmn.id,
      slug: pkmn.name,
      label: formLabel(speciesSlug, pkmn.name, variety.is_default),
      isDefault: variety.is_default,
      types,
      height: Math.round((pkmn.height / 10) * 10) / 10,
      weight: Math.round((pkmn.weight / 10) * 10) / 10,
      abilities,
      stats,
      art: ART(pkmn.id),
      sprite: SPRITE(pkmn.id),
    };
  } catch {
    return null;
  }
}

export async function getFullPokemon(id: number): Promise<PokemonFull> {
  const [pkmn, species] = await Promise.all([
    P.getPokemonByName(id),
    P.getPokemonSpeciesByName(id),
  ]);
  const chainId = urlToId(species.evolution_chain.url);
  const chain = await P.getEvolutionChainById(chainId);

  const types = [...pkmn.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name as PokeType);

  const stats: Stats = { hp: 0, atk: 0, def: 0, spA: 0, spD: 0, spd: 0 };
  for (const s of pkmn.stats) {
    const k = STAT_KEY[s.stat.name];
    if (k) stats[k] = s.base_stat;
  }

  const abilitiesOrdered = [...pkmn.abilities].sort((a, b) => a.slot - b.slot);
  const abilities = Array.from(
    new Set(abilitiesOrdered.map((a) => titleCase(a.ability.name))),
  );

  const formsRaw = await Promise.all(
    species.varieties.map((v) => buildForm(v, species.name)),
  );
  const forms = formsRaw.filter((f): f is PokemonForm => f !== null);
  forms.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return {
    id: pkmn.id,
    name: titleCase(pkmn.name),
    gen: GEN_KEY[species.generation.name] ?? 1,
    types,
    height: Math.round((pkmn.height / 10) * 10) / 10,
    weight: Math.round((pkmn.weight / 10) * 10) / 10,
    abilities,
    stats,
    moves: pkmn.moves.slice(0, 8).map((m) => titleCase(m.move.name)),
    evolution: buildEvoTree(chain.chain),
    flavor: pickFlavor(species).replace(/[\f\n\r­]/g, " ").replace(/\s+/g, " ").trim(),
    art: ART(pkmn.id),
    sprite: SPRITE(pkmn.id),
    forms,
  };
}

export async function getAllPokemonLite(): Promise<PokemonLite[]> {
  const typeResults = await P.getTypeByName(TYPE_NAMES as unknown as string[]);
  const typesByPokemonId = new Map<number, PokeType[]>();
  TYPE_NAMES.forEach((tname, ti) => {
    for (const entry of typeResults[ti].pokemon) {
      const id = urlToId(entry.pokemon.url);
      if (id > MAX_ID) continue;
      const arr = typesByPokemonId.get(id) ?? [];
      arr.push(tname);
      typesByPokemonId.set(id, arr);
    }
  });

  const genNames = Object.keys(GEN_KEY);
  const genResults = await P.getGenerationByName(genNames);
  const genByPokemonId = new Map<number, Gen>();
  genNames.forEach((gname, gi) => {
    const gen = GEN_KEY[gname];
    for (const sp of genResults[gi].pokemon_species) {
      const id = urlToId(sp.url);
      if (id > MAX_ID) continue;
      genByPokemonId.set(id, gen);
    }
  });

  const list = await P.getPokemonsList({ offset: 0, limit: MAX_ID });

  const lite: PokemonLite[] = [];
  for (const entry of list.results) {
    const id = urlToId(entry.url);
    if (id > MAX_ID) continue;
    const types = typesByPokemonId.get(id);
    const gen = genByPokemonId.get(id);
    if (!types || !gen) continue;
    lite.push({
      id,
      name: titleCase(entry.name),
      gen,
      types,
      art: ART(id),
      sprite: SPRITE(id),
    });
  }

  return lite.sort((a, b) => a.id - b.id);
}
