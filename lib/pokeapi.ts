import { cacheLife, cacheTag } from "next/cache";
import Pokedex from "pokedex-promise-v2";
import { rarityFor } from "./rarity";
import type {
  Ability,
  AbilityDetail,
  DamageClass,
  DamageRelations,
  EvoCondition,
  EvolutionNode,
  FormCategory,
  Gen,
  LearnMethod,
  LocalizedName,
  MoveDetail,
  MoveEntry,
  PokeType,
  PokemonForm,
  PokemonFull,
  PokemonLite,
  Stats,
  TypeRelation,
} from "./types";
import { ALL_TYPES } from "./types";

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

const PREFERRED_VERSION_GROUPS = [
  "scarlet-violet",
  "sword-shield",
  "ultra-sun-ultra-moon",
  "sun-moon",
  "omega-ruby-alpha-sapphire",
  "x-y",
  "black-2-white-2",
  "black-white",
  "heartgold-soulsilver",
  "platinum",
  "diamond-pearl",
  "firered-leafgreen",
  "emerald",
  "ruby-sapphire",
  "crystal",
  "gold-silver",
  "yellow",
  "red-blue",
];

const LOCALIZED_LANGS: { code: string; label: string }[] = [
  { code: "ja-roma", label: "Romaji" },
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

function namedSlug(r: { name: string } | null | undefined): string | null {
  return r?.name ?? null;
}

function mapEvoDetail(d: Pokedex.EvolutionDetail): EvoCondition {
  return {
    trigger: d.trigger?.name ?? "unknown",
    minLevel: d.min_level ?? null,
    item: namedSlug(d.item),
    heldItem: namedSlug(d.held_item),
    timeOfDay: d.time_of_day ?? "",
    location: namedSlug(d.location),
    knownMove: namedSlug(d.known_move),
    knownMoveType: namedSlug(d.known_move_type),
    usedMove: namedSlug(d.used_move),
    minHappiness: d.min_happiness ?? null,
    minBeauty: d.min_beauty ?? null,
    minAffection: d.min_affection ?? null,
    gender: d.gender ?? null,
    needsOverworldRain: !!d.needs_overworld_rain,
    needsMultiplayer: !!d.needs_multiplayer,
    turnUpsideDown: !!d.turn_upside_down,
    relativePhysicalStats: d.relative_physical_stats ?? null,
    tradeSpecies: namedSlug(d.trade_species),
    partySpecies: namedSlug(d.party_species),
    partyType: namedSlug(d.party_type),
  };
}

type EvoLink = {
  species: { url: string };
  evolution_details: Pokedex.EvolutionDetail[];
  evolves_to: EvoLink[];
};

function buildEvoTree(link: EvoLink): EvolutionNode {
  return {
    id: urlToId(link.species.url),
    conditions: (link.evolution_details ?? []).map(mapEvoDetail),
    children: (link.evolves_to ?? []).map(buildEvoTree),
  };
}

function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function pickLocalizedNames(species: Pokedex.PokemonSpecies): LocalizedName[] {
  const byLang = new Map<string, string>();
  for (const entry of species.names) {
    byLang.set(entry.language.name, entry.name);
  }
  const out: LocalizedName[] = [];
  for (const { code, label } of LOCALIZED_LANGS) {
    const name = byLang.get(code);
    if (name) out.push({ lang: code, label, name });
  }
  return out;
}

function pickFlavor(species: Pokedex.PokemonSpecies): string {
  const en = species.flavor_text_entries.filter((e) => e.language.name === "en");
  for (const v of PREFERRED_FLAVOR_VERSIONS) {
    const hit = en.find((e) => e.version.name === v);
    if (hit) return hit.flavor_text;
  }
  return en[0]?.flavor_text ?? "";
}

const REGIONAL_SUFFIXES = new Set(["alola", "galar", "hisui", "paldea"]);

function detectFormCategory(suffix: string): FormCategory | null {
  if (!suffix) return null;
  const tokens = suffix.split("-");
  if (tokens.includes("mega")) return "mega";
  if (tokens.includes("gmax")) return "gmax";
  if (tokens.includes("primal")) return "primal";
  for (const r of REGIONAL_SUFFIXES) {
    if (tokens.includes(r)) return "regional";
  }
  return null;
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

function buildFormAbilities(pkmn: Pokedex.Pokemon): Ability[] {
  const ordered = [...pkmn.abilities].sort((a, b) => a.slot - b.slot);
  const seen = new Set<string>();
  const out: Ability[] = [];
  for (const a of ordered) {
    const slug = a.ability.name;
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      slug,
      name: titleCase(slug),
      isHidden: !!a.is_hidden,
    });
  }
  return out;
}

async function buildForm(
  variety: { pokemon: { name: string; url: string }; is_default: boolean },
  speciesSlug: string,
): Promise<{ form: PokemonForm; raw: Pokedex.Pokemon } | null> {
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

    return {
      form: {
        id: pkmn.id,
        slug: pkmn.name,
        label: formLabel(speciesSlug, pkmn.name, variety.is_default),
        isDefault: variety.is_default,
        types,
        height: Math.round((pkmn.height / 10) * 10) / 10,
        weight: Math.round((pkmn.weight / 10) * 10) / 10,
        abilities: buildFormAbilities(pkmn),
        stats,
        art: ART(pkmn.id),
        sprite: SPRITE(pkmn.id),
      },
      raw: pkmn,
    };
  } catch (err) {
    console.error(`[pokeapi] buildForm failed for ${variety.pokemon.name}:`, err);
    return null;
  }
}

function pickBestVersionGroup(pkmn: Pokedex.Pokemon): string | null {
  const present = new Set<string>();
  for (const m of pkmn.moves) {
    for (const d of m.version_group_details) present.add(d.version_group.name);
  }
  for (const vg of PREFERRED_VERSION_GROUPS) {
    if (present.has(vg)) return vg;
  }
  return present.values().next().value ?? null;
}

function mapLearnMethod(raw: string): LearnMethod {
  if (raw === "level-up" || raw === "machine" || raw === "egg" || raw === "tutor") return raw;
  return "other";
}

function buildMovepool(pkmn: Pokedex.Pokemon, vg: string | null): MoveEntry[] {
  if (!vg) return [];
  const out: MoveEntry[] = [];
  const seen = new Map<string, MoveEntry>();
  for (const m of pkmn.moves) {
    const entries = m.version_group_details.filter(
      (d) => d.version_group.name === vg,
    );
    if (entries.length === 0) continue;
    for (const d of entries) {
      const lm = mapLearnMethod(d.move_learn_method.name);
      const key = `${m.move.name}::${lm}`;
      const prev = seen.get(key);
      const level = d.level_learned_at || 0;
      if (prev) {
        if (level && (!prev.level || level < prev.level)) prev.level = level;
        continue;
      }
      const entry: MoveEntry = {
        slug: m.move.name,
        name: titleCase(m.move.name),
        learnMethod: lm,
        level,
      };
      seen.set(key, entry);
      out.push(entry);
    }
  }
  out.sort((a, b) => {
    if (a.learnMethod !== b.learnMethod) return a.learnMethod.localeCompare(b.learnMethod);
    if (a.learnMethod === "level-up") return (a.level || 0) - (b.level || 0);
    return a.name.localeCompare(b.name);
  });
  return out;
}

function pickAbilityShortEffect(a: Pokedex.Ability): string {
  return cleanText(
    a.effect_entries.find((e) => e.language.name === "en")?.short_effect ?? "",
  );
}
function pickAbilityEffect(a: Pokedex.Ability): string {
  return cleanText(
    a.effect_entries.find((e) => e.language.name === "en")?.effect ?? "",
  );
}
function pickAbilityFlavor(a: Pokedex.Ability): string {
  const en = a.flavor_text_entries.filter((e) => e.language.name === "en");
  for (const vg of PREFERRED_VERSION_GROUPS) {
    const hit = en.find((e) => e.version_group.name === vg);
    if (hit) return cleanText(hit.flavor_text);
  }
  return cleanText(en[0]?.flavor_text ?? "");
}

function pickMoveEffect(m: Pokedex.Move, short: boolean): string {
  const entry = m.effect_entries.find((e) => e.language.name === "en");
  if (!entry) return "";
  const raw = short ? entry.short_effect : entry.effect;
  const chance = m.effect_chance ?? "";
  return cleanText(raw.replace(/\$effect_chance/g, String(chance)));
}

function cleanText(s: string): string {
  return s.replace(/[\f\n\r­]/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchAbilityDetails(slugs: string[]): Promise<Record<string, AbilityDetail>> {
  if (slugs.length === 0) return {};
  const list = await P.getAbilityByName(slugs);
  const arr = Array.isArray(list) ? list : [list];
  const out: Record<string, AbilityDetail> = {};
  for (const a of arr) {
    out[a.name] = {
      shortEffect: pickAbilityShortEffect(a),
      effect: pickAbilityEffect(a),
      flavor: pickAbilityFlavor(a),
    };
  }
  return out;
}

async function fetchMoveDetails(slugs: string[]): Promise<Record<string, MoveDetail>> {
  if (slugs.length === 0) return {};
  const list = await P.getMoveByName(slugs);
  const arr = Array.isArray(list) ? list : [list];
  const out: Record<string, MoveDetail> = {};
  for (const m of arr) {
    out[m.name] = {
      slug: m.name,
      name: titleCase(m.name),
      type: m.type.name as PokeType,
      damageClass: m.damage_class.name as DamageClass,
      power: m.power,
      accuracy: m.accuracy,
      pp: m.pp,
      shortEffect: pickMoveEffect(m, true),
      effect: pickMoveEffect(m, false),
    };
  }
  return out;
}

let DAMAGE_RELATIONS_PROMISE: Promise<DamageRelations> | null = null;
async function getDamageRelations(): Promise<DamageRelations> {
  if (!DAMAGE_RELATIONS_PROMISE) {
    DAMAGE_RELATIONS_PROMISE = (async () => {
      const list = await P.getTypeByName(ALL_TYPES as unknown as string[]);
      const arr = Array.isArray(list) ? list : [list];
      const out = {} as DamageRelations;
      for (const t of arr) {
        const r = t.damage_relations;
        const rel: TypeRelation = {
          doubleFrom: r.double_damage_from.map((x) => x.name as PokeType),
          halfFrom: r.half_damage_from.map((x) => x.name as PokeType),
          noFrom: r.no_damage_from.map((x) => x.name as PokeType),
          doubleTo: r.double_damage_to.map((x) => x.name as PokeType),
          halfTo: r.half_damage_to.map((x) => x.name as PokeType),
          noTo: r.no_damage_to.map((x) => x.name as PokeType),
        };
        out[t.name as PokeType] = rel;
      }
      return out;
    })();
  }
  return DAMAGE_RELATIONS_PROMISE;
}

export async function getFullPokemon(id: number): Promise<PokemonFull> {
  "use cache";
  cacheLife("max");
  cacheTag(`pokemon:${id}`);
  const [pkmn, species, damageRelations] = await Promise.all([
    P.getPokemonByName(id),
    P.getPokemonSpeciesByName(id),
    getDamageRelations(),
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

  const formsRaw = await Promise.all(
    species.varieties.map((v) => buildForm(v, species.name)),
  );
  const formBundles = formsRaw.filter(
    (f): f is { form: PokemonForm; raw: Pokedex.Pokemon } => f !== null,
  );
  formBundles.sort((a, b) => Number(b.form.isDefault) - Number(a.form.isDefault));

  const forms = formBundles.map((b) => b.form);
  const defaultBundle = formBundles.find((b) => b.form.isDefault) ?? formBundles[0];
  const defaultRaw = defaultBundle?.raw ?? pkmn;

  const versionGroup = pickBestVersionGroup(defaultRaw);
  const movepool = buildMovepool(defaultRaw, versionGroup);

  const abilitySlugs = Array.from(
    new Set(forms.flatMap((f) => f.abilities.map((a) => a.slug))),
  );
  const moveSlugs = Array.from(new Set(movepool.map((m) => m.slug)));

  const [abilityDetail, moveDetail] = await Promise.all([
    fetchAbilityDetails(abilitySlugs),
    fetchMoveDetails(moveSlugs),
  ]);

  const defaultAbilities = defaultBundle?.form.abilities ?? buildFormAbilities(pkmn);
  const formTags = deriveFormTags(species.name, forms.map((f) => f.slug));

  return {
    id: pkmn.id,
    name: titleCase(pkmn.name),
    gen: GEN_KEY[species.generation.name] ?? 1,
    types,
    height: Math.round((pkmn.height / 10) * 10) / 10,
    weight: Math.round((pkmn.weight / 10) * 10) / 10,
    abilities: defaultAbilities,
    stats,
    movepool,
    moveDetail,
    abilityDetail,
    evolution: buildEvoTree(chain.chain as EvoLink),
    babyTriggerItem: chain.baby_trigger_item?.name ?? null,
    flavor: cleanText(pickFlavor(species)),
    art: ART(pkmn.id),
    forms,
    formTags,
    rarity: rarityFor(pkmn.id),
    names: pickLocalizedNames(species),
    damageRelations,
    versionGroup,
  };
}

function deriveFormTags(speciesSlug: string, formSlugs: string[]): FormCategory[] {
  const set = new Set<FormCategory>();
  for (const slug of formSlugs) {
    if (slug === speciesSlug) continue;
    const suffix = slug.startsWith(`${speciesSlug}-`)
      ? slug.slice(speciesSlug.length + 1)
      : slug;
    const cat = detectFormCategory(suffix);
    if (cat) set.add(cat);
  }
  return Array.from(set);
}

export async function getAllPokemonLite(): Promise<PokemonLite[]> {
  "use cache";
  cacheLife("max");
  cacheTag("pokemon:list");
  const typeResults = await P.getTypeByName(TYPE_NAMES as unknown as string[]);
  const typesByPokemonId = new Map<number, PokeType[]>();
  for (const t of typeResults) {
    const tname = t.name as PokeType;
    for (const entry of t.pokemon) {
      const id = urlToId(entry.pokemon.url);
      if (id > MAX_ID) continue;
      const arr = typesByPokemonId.get(id) ?? [];
      arr.push(tname);
      typesByPokemonId.set(id, arr);
    }
  }

  const genNames = Object.keys(GEN_KEY);
  const genResults = await P.getGenerationByName(genNames);
  const genByPokemonId = new Map<number, Gen>();
  for (const g of genResults) {
    const gen = GEN_KEY[g.name];
    if (!gen) continue;
    for (const sp of g.pokemon_species) {
      const id = urlToId(sp.url);
      if (id > MAX_ID) continue;
      genByPokemonId.set(id, gen);
    }
  }

  const fullList = await P.getPokemonsList({ offset: 0, limit: 2000 });

  const baseEntries: { id: number; name: string }[] = [];
  const formEntries: { id: number; name: string }[] = [];
  for (const entry of fullList.results) {
    const id = urlToId(entry.url);
    if (id <= MAX_ID) baseEntries.push({ id, name: entry.name });
    else formEntries.push({ id, name: entry.name });
  }

  const baseSlugs = baseEntries
    .map((e) => e.name)
    .sort((a, b) => b.length - a.length);

  const tagsBySpeciesId = new Map<number, Set<FormCategory>>();
  const slugToId = new Map<string, number>(
    baseEntries.map((e) => [e.name, e.id]),
  );

  for (const form of formEntries) {
    const speciesSlug = baseSlugs.find(
      (s) => form.name === s || form.name.startsWith(`${s}-`),
    );
    if (!speciesSlug) continue;
    const suffix = form.name === speciesSlug
      ? ""
      : form.name.slice(speciesSlug.length + 1);
    const cat = detectFormCategory(suffix);
    if (!cat) continue;
    const speciesId = slugToId.get(speciesSlug);
    if (speciesId == null) continue;
    const cur = tagsBySpeciesId.get(speciesId) ?? new Set<FormCategory>();
    cur.add(cat);
    tagsBySpeciesId.set(speciesId, cur);
  }

  const lite: PokemonLite[] = [];
  for (const entry of baseEntries) {
    const { id, name } = entry;
    const types = typesByPokemonId.get(id);
    const gen = genByPokemonId.get(id);
    if (!types || !gen) continue;
    lite.push({
      id,
      name: titleCase(name),
      gen,
      types,
      art: ART(id),
      formTags: Array.from(tagsBySpeciesId.get(id) ?? []),
      rarity: rarityFor(id),
    });
  }

  return lite.sort((a, b) => a.id - b.id);
}
