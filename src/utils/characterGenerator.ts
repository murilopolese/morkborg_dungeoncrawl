// src/utils/characterGenerator.ts
import { randInt, getModifier, computeHP, computeLevel } from "./random";
import {
  type Item,
  type Ability,
  type AbilityKey,
  type Character,
} from "../types";

import {
  getRandomWeapon,
  getRandomArmor,
  getRandomShield,
  generateStartingInventory,
} from "./randomItemGenerator";

/* ------------------------------------------------------------------
   Random character generator -------------------------------------- */

export const initRandomCharacter = (): Character => {
  /* ---- abilities ------------------------------------------------- */
  const abilities: Record<AbilityKey, Ability> = {
    Strength: { value: randInt(1, 20), modifier: 0 },
    Agility: { value: randInt(1, 20), modifier: 0 },
    Presence: { value: randInt(1, 20), modifier: 0 },
    Toughness: { value: randInt(1, 20), modifier: 0 },
  };

  Object.keys(abilities).forEach((k) => {
    const key = k as AbilityKey;
    abilities[key].modifier = getModifier(abilities[key].value);
  });

  /* ---- XP / level / HP ------------------------------------------ */
  const xp = 0;                     // <-- start at zero
  const level = computeLevel(xp);   // will be 0 with the new rule
  const maxHp = computeHP(abilities.Toughness.value);
  const hp = Math.floor(maxHp * 0.7);

  /* ---- equipment ------------------------------------------------- */
  const weapon = getRandomWeapon();
  const armor = getRandomArmor();
  const shield = getRandomShield();

  /* ---- inventory ------------------------------------------------- */
  const carryCapacity = Math.max(0, abilities.Strength.modifier + 8);
  const inventory: Item[] = generateStartingInventory();

  return {
    abilities,
    xp,
    level,
    hp,
    maxHp,
    carryCapacity,
    equipment: { weapon, armor, shield },
    inventory,
  };
};
