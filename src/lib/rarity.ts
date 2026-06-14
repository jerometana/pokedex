import type { Rarity } from "./types";

const LEGENDARY_IDS = new Set<number>([
  144, 145, 146, 150,
  243, 244, 245, 249, 250,
  377, 378, 379, 380, 381, 382, 383, 384,
  480, 481, 482, 483, 484, 485, 486, 487, 488,
  638, 639, 640, 641, 642, 643, 644, 645, 646,
  716, 717, 718,
  772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800,
  888, 889, 890, 891, 892, 894, 895, 896, 897, 898,
  1001, 1002, 1003, 1004, 1007, 1008,
  1014, 1015, 1016, 1017, 1024,
]);

const MYTHICAL_IDS = new Set<number>([
  151,
  251,
  385, 386,
  489, 490, 491, 492, 493,
  494, 647, 648, 649,
  719, 720, 721,
  801, 802, 807, 808, 809,
  893,
  1025,
]);

const BABY_IDS = new Set<number>([
  172, 173, 174, 175,
  236, 238, 239, 240,
  298, 360,
  406, 433, 438, 439, 440, 446, 447, 458,
  848,
]);

export function rarityFor(id: number): Rarity[] {
  const out: Rarity[] = [];
  if (LEGENDARY_IDS.has(id)) out.push("legendary");
  if (MYTHICAL_IDS.has(id)) out.push("mythical");
  if (BABY_IDS.has(id)) out.push("baby");
  return out;
}
