// src/utils/randomItemGenerator.ts
import { randInt } from "./random";
import {
  WEAPONS,
  ARMORS,
  POTIONS,
  SHIELDS,
} from "../data";

import type { Armor, Item, Potion, Shield, Weapon } from "../types";

/**
 * Pick a random weapon from the data set.
 */
export const getRandomWeapon = (): Weapon =>
  WEAPONS[randInt(0, WEAPONS.length - 1)];

/**
 * Pick a random armor from the data set.
 */
export const getRandomArmor = (): Armor =>
  ARMORS[randInt(0, ARMORS.length - 1)];

/**
 * Return a shield with a 50 % chance; otherwise `undefined`.
 */
export const getRandomShield = (): Shield => {
  return SHIELDS[randInt(0, SHIELDS.length - 1)];
};

/**
 * Pick a healing‑type potion (or fall back to the first entry).
 */
export const getHealingPotion = (): Potion => {
  const healingPotions = POTIONS.filter((p) =>
    p.name.toLowerCase().includes("heal")
  );
  return healingPotions.length
    ? healingPotions[randInt(0, healingPotions.length - 1)]
    : POTIONS[0];
};

/**
 * Build a starting inventory that always contains:
 *
 *   • one random weapon
 *   • one random healing potion
 *
 * The rest of the slots are filled with empty “placeholder” items until
 * the capacity is reached.
 */
export const generateStartingInventory = (): Item[] => {
  const inventory: Item[] = [getRandomWeapon(), getHealingPotion()];
  return inventory;
};

/**
 * Pick **any** random item from all categories (weapons, armors,
 * potions, shields).  Useful for loot tables or generic “pick a
 * random thing” logic.
 */
export const getRandomAnyItem = (): Item => {
  const allItems = [...WEAPONS, ...ARMORS, ...POTIONS, ...SHIELDS];
  return allItems[randInt(0, allItems.length - 1)];
};