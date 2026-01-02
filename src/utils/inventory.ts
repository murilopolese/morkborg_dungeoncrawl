// src/utils/inventory.ts
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
  tier: 0,
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
  let itemToMove:
    | typeof equipment.weapon
    | typeof equipment.armor
    | typeof equipment.shield
    | undefined;

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

/* ----- Equip helper ---------------------------------------- */
/**
 * Equips an item that lives in the character’s inventory.
 *
 * The function determines which slot the item belongs to based on its
 * `category` field (Weapon → “weapon”, Armor → “armor”, Shield → “shield”).
 *
 * It swaps the currently equipped item of that slot back into the same
 * inventory position (or drops it if no space is available).  The
 * returned character object is a shallow copy – the original character
 * instance remains untouched.
 */
export function equip(
  character: Character,
  index: number // index of the inventory slot to equip from
): Character {
  const item = character.inventory[index];
  if (!item) return character; // nothing at that position

  let slot: "weapon" | "armor" | "shield";
  if ((item as any).category === "Weapon") slot = "weapon";
  else if ((item as any).category === "Armor") slot = "armor";
  else if ((item as any).category === "Shield") slot = "shield";
  else return character; // unknown category

  const newEquipment = { ...character.equipment };
  const newInventory = [...character.inventory];

  /* 1️⃣ Put the chosen item into equipment */
  if (slot === "weapon") newEquipment.weapon = item as any;
  else if (slot === "armor") newEquipment.armor = item as any;
  else newEquipment.shield = item as any;

  /* 2️⃣ Determine what was previously equipped (if anything) */
  let oldItem: typeof item | undefined;
  if (slot === "weapon" && character.equipment.weapon !== EMPTY_WEAPON)
    oldItem = character.equipment.weapon;
  else if (
    slot === "armor" &&
    character.equipment.armor !== EMPTY_ARMOR
  )
    oldItem = character.equipment.armor;
  else if (slot === "shield") oldItem = character.equipment.shield;

  /* 3️⃣ If there was an old item, swap it into the inventory slot.
   *    Otherwise remove the newly equipped item and add an empty slot
   *    to keep capacity constant. */
  if (oldItem) {
    newInventory[index] = oldItem as any; // replace the inventory spot
  } else {
    // remove the newly equipped item from inventory
    newInventory.splice(index, 1);
    // push an empty placeholder to preserve length
    newInventory.push({} as any);
  }

  return { ...character, equipment: newEquipment, inventory: newInventory };
}

/**
 * Adds an item to the first empty inventory slot.
 * If no slot is free, returns the original character unchanged.
 */
export function addItem(
  character: Character,
  newItem: typeof character.inventory[number]
): Character {
  if (character.carryCapacity <= character.inventory.length) return character; // inventory full

  const newInventory = [...character.inventory];
  newInventory.push(newItem);
  return { ...character, inventory: newInventory };
}

/**
 * Drops an item from the given inventory index.
 * The slot becomes an empty placeholder (`{}`).
 */
export function dropItem(
  character: Character,
  index: number
): Character {
  // Remove the item from the array (the slot becomes empty)
  const newInventory = [...character.inventory];
  newInventory.splice(index, 1);   // <-- removes the element

  return { ...character, inventory: newInventory };
}