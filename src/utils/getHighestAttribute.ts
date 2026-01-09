import type { Character, AbilityKey } from "../types";

export function getHighestAttribute(
  character: Character
): AbilityKey[] {
  const abilities = Object.entries(character.abilities) as [
    AbilityKey,
    { value: number; modifier: number }
  ][];

  // Find the maximum modifier among all abilities
  let maxModifier = -Infinity;
  for (const [, attr] of abilities) {
    if (attr.modifier > maxModifier) {
      maxModifier = attr.modifier;
    }
  }

  // Collect every ability that has this maximum modifier
  const result: AbilityKey[] = [];
  for (const [key, attr] of abilities) {
    if (attr.modifier === maxModifier) {
      result.push(key);
    }
  }

  return result;
}
