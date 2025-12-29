// src/types/index.ts

export type AbilityKey = "Strength" | "Agility" | "Presence" | "Toughness";

export interface Ability {
  value: number;
  modifier: number;
}

export interface Character {
  abilities: Record<AbilityKey, Ability>;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;

  equipment: Equipment;
  inventory: Item[];
}

/* ---------- Item definitions -------------------------------------- */
export type Weapon = {
  category: "Weapon";
  name: string;
  damage: string;       // e.g. “1d4”
  test: AbilityKey;     // ability that must be used to wield it
};

export type Armor = {
  category: "Armor";
  tier: 1 | 2 | 3;
  name: string;
  dmgReduction: string;   // e.g. “-1d2”
  dr: number;             // DR bonus on Agility tests
};

export type Potion = {
  category: "Potion";
  name: string;
  effect: string;         // e.g. “Cures 1d4”
};

export interface Shield {
  category: "Shield";
  name: string;
}

export type Item = Weapon | Armor | Potion | Shield;

/* ---------- Equipment slots --------------------------------------- */
export interface Equipment {
  weapon: Weapon;
  armor: Armor;
  shield?: Item;          // optional
}

// src/types.ts   (add after the existing exports)
export interface Tile {
  visited: boolean;
  cameFrom?: { row: number; col: number };
  wentTo?: { row: number; col: number };
}
