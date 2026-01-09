// 1️⃣ Import the helper you already use in DungeonView
import type { Character } from "../types";
import { getHighestAttribute } from "./getHighestAttribute";

// 2️⃣ The generator – simply returns a formatted string
export const generateDungeonDescription = (
  quest: {
    dungeonName: string;
    weather: string;
    location: string;
    contact: string;
    occultTreasure: string;
  },
  character: {
    name: string;
    equipment: {
      weapon: { damage: string; name?: string };
      armor: { tier: number; name?: string };
    };
    abilities: Record<string, { value: number }>;
  }
): string => {
  // Helper to decide if the weapon is a bare‑hand (1d2) or named
  const weaponDesc =
    character.equipment.weapon.damage === "1d2"
      ? "your bare hands"
      : `a ${character.equipment.weapon.name}`;

  const armorDesc =
    character.equipment.armor.tier === 0
      ? "barely any clothes"
      : `a ${character.equipment.armor.name} armor`;

  return `
    A series of questionable decisions brought you here at: ${quest.dungeonName}. It's a ${quest.weather} weather ${quest.location}.
    Since you talked with that ${quest.contact} about the ${quest.occultTreasure} you feel possessed. You have very little control over your actions.
    People once called you ${character.name} and you were known for your ${getHighestAttribute(character as Character).join("/")}.
    To get through what's on your path you use ${weaponDesc} and
    to protect yourself you have ${armorDesc}.
    `;
};
