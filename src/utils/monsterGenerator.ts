// src/utils/characterGenerator.ts
import { randInt, getModifier, computeHP } from "./random";
import {
  type Ability,
  type AbilityKey,
  type Monster,
} from "../types";

import {
  getRandomWeapon,
  getRandomArmor,
  getRandomShield,
} from "./randomItemGenerator";

/* ------------------------------------------------------------------
   Random character generator -------------------------------------- */

export const initRandomMonster = (): Monster => {
  /* ---- abilities ------------------------------------------------- */
  const abilities: Record<AbilityKey, Ability> = {
    Strength: { value: randInt(8, 20), modifier: 0 },
    Agility: { value: randInt(8, 20), modifier: 0 },
    Presence: { value: randInt(8, 20), modifier: 0 },
    Toughness: { value: randInt(8, 20), modifier: 0 },
  };

  Object.keys(abilities).forEach((k) => {
    const key = k as AbilityKey;
    abilities[key].modifier = getModifier(abilities[key].value);
  });

  /* ---- XP / level / HP ------------------------------------------ */
  const maxHp = computeHP(abilities.Toughness.value);
  const hp = Math.floor(maxHp * 0.7);

  /* ---- equipment ------------------------------------------------- */
  const weapon = getRandomWeapon();
  const armor = getRandomArmor();
  const shield = getRandomShield();

  return {
    abilities,
    hp,
    maxHp,
    equipment: { weapon, armor, shield }
  };
};
