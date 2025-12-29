// src/utils/random.ts
export const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const getModifier = (value: number): number => {
  if (value <= 4) return -3;
  if (value <= 6) return -2;
  if (value <= 8) return -1;
  if (value <= 12) return 0;
  if (value <= 14) return 1;
  if (value <= 16) return 2;
  return 3; // 17‑20
};

export const computeHP = (toughness: number): number => toughness * 2;

export const computeLevel = (xp: number): number =>
  Math.floor(xp / 500) + 1;
