// src/data/weapons.ts
import { type Weapon } from "../types";

export const WEAPONS: Weapon[] = [
  { category: "Weapon", name: "Femur", damage: "1d4", test: "Strength" },
  { category: "Weapon", name: "Staff", damage: "1d4", test: "Strength" },
  { category: "Weapon", name: "Shortsword", damage: "1d4", test: "Strength" },
  { category: "Weapon", name: "Knife", damage: "1d4", test: "Strength" },
  { category: "Weapon", name: "Warhammer", damage: "1d6", test: "Strength" },
  { category: "Weapon", name: "Sword", damage: "1d6", test: "Strength" },
  { category: "Weapon", name: "Bow", damage: "1d6", test: "Agility" },
  { category: "Weapon", name: "Flail", damage: "1d8", test: "Strength" },
  { category: "Weapon", name: "Crossbow", damage: "1d8", test: "Agility" },
  { category: "Weapon", name: "Long d10", damage: "1d10", test: "Strength" },
];
