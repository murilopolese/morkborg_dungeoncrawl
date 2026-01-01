import { type Character, type Weapon, type Armor } from "../types";

/* ----- Default “empty” equipment – replace if desired ----- */
export const EMPTY_WEAPON: Weapon = {
  category: "Weapon",
  name: "Bare Hands",
  damage: "0d0",
  test: "Strength" as const,
};

export const EMPTY_ARMOR: Armor = {
  category: "Armor",
  tier: 1,
  name: "Cloth",
  dmgReduction: "-0d0",
  defenseDr: 0,
  agilityDr: 0,
} as const;

/* ----- Unequip helper ------------------------------------- */
export function unequip(
  character: Character,
  slot: "weapon" | "armor" | "shield"
): Character {
  const { equipment, inventory } = character;

  // Shallow copies so we never mutate the original objects
  const newEquipment = { ...equipment };
  const newInventory = [...inventory];

  // Item to be moved (if any)
  let itemToMove: typeof equipment.weapon | typeof equipment.armor | typeof equipment.shield | undefined;

  if (slot === "weapon") {
    itemToMove = equipment.weapon;
    newEquipment.weapon = EMPTY_WEAPON;
  } else if (slot === "armor") {
    itemToMove = equipment.armor;
    newEquipment.armor = EMPTY_ARMOR;
  } else if (slot === "shield" && equipment.shield) {
    itemToMove = equipment.shield;
    delete (newEquipment as any).shield; // optional slot – remove it
  }

  if (!itemToMove) return character; // nothing to unequip

  /* --- Place into inventory or drop if full ------------------- */
  const freeIndex = newInventory.findIndex((it) => !it.name); // empty slot
  if (freeIndex >= 0) {
    newInventory[freeIndex] = itemToMove;
  } // else: no space – the item is dropped

  return { ...character, equipment: newEquipment, inventory: newInventory };
}
