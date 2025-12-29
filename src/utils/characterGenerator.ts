// src/utils/characterGenerator.ts
import { randInt, getModifier, computeHP, computeLevel } from "./random";
import {
  type Item,
  type Ability,
  type AbilityKey,
  type Character,
} from "../types";

import { WEAPONS, ARMORS, POTIONS, SHIELDS } from "../data";

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
  const weapon = WEAPONS[randInt(0, WEAPONS.length - 1)];
  const armor = ARMORS[randInt(0, ARMORS.length - 1)];

  const shield =
    Math.random() < 0.5
      ? undefined
      : SHIELDS[randInt(0, SHIELDS.length - 1)];

  /* ---- inventory ------------------------------------------------- */
  const carryCapacity = Math.max(0, abilities.Strength.modifier + 8);

  const startWeapon =
    WEAPONS[randInt(0, WEAPONS.length - 1)];
  const healingPotions = POTIONS.filter((p) =>
    p.name.toLowerCase().includes("heal")
  );
  const startPotion =
    healingPotions.length
      ? healingPotions[randInt(0, healingPotions.length - 1)]
      : POTIONS[0];

  const inventory: Item[] = [startWeapon, startPotion];
  while (inventory.length < carryCapacity) {
    inventory.push({ name: "", category: "" } as any);
  }

  return {
    abilities,
    xp,
    level,
    hp,
    maxHp,
    equipment: { weapon, armor, shield },
    inventory,
  };
};
