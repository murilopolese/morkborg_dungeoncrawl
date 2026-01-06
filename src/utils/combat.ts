// src/utils/combat.ts
import type { Weapon, Armor } from "../types";
import type { Grid } from "../types";
import { EMPTY_WEAPON, EMPTY_ARMOR } from "../utils/inventory";

export const rollDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

export const parseDiceString = (
  dice: string
): { count: number; sides: number; bonus: number } => {
  const match = dice.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) throw new Error(`Invalid dice string: ${dice}`);
  const [, cnt, side, bon] = match;
  return { count: +cnt, sides: +side, bonus: bon ? +bon : 0 };
};

export const rollDamageFromWeapon = (weapon: Weapon): number => {
  const { count, sides, bonus } = parseDiceString(weapon.damage);
  let total = 0;
  for (let i = 0; i < count; i++) total += rollDie(sides);
  return total + bonus;
};

export const reduceDamage = (
  dmg: number,
  armor?: Armor
): number => {
  const redStr = armor?.dmgReduction;
  if (!redStr) return dmg;

  // let isNegative = false;
  let str = redStr.trim();
  if (str.startsWith("-")) {
    // isNegative = true;
    str = str.slice(1);
  }

  const { count, sides, bonus } = parseDiceString(str);
  let reduction = 0;
  for (let i = 0; i < count; i++) reduction += rollDie(sides);
  reduction += bonus;

  // armor’s dmgReduction is always a *negative* effect → subtract it
  return Math.max(dmg - reduction, 0);
};

/**
 * Apply damage to the target and check if the target dies.
 *
 * @param currentHp Current hit‑points of the target
 * @param dmg Damage that should be applied
 * @returns { newHp: number; dead: boolean }
 */
export const applyDamageAndCheckDead = (
  currentHp: number,
  dmg: number
): { newHp: number; dead: boolean } => {
  const newHp = currentHp - dmg;
  return { newHp, dead: newHp <= 0 };
};

