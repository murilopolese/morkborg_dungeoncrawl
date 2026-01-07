// src/utils/generateEncounter.ts
import { type Encounter, type EncounterType } from "../types";
import { getRandomAnyItem } from "./randomItemGenerator";
import { initRandomMonster } from "./monsterGenerator";
import { TRAPS, FEATURES } from "../data/encounterData";

/* ------------------------------------------------------------------ */
/*  Public helper – generates a random encounter object.             */
/* ------------------------------------------------------------------ */
export const generateEncounter = (): Encounter => {
  const types: EncounterType[] = [
    "trap",
    "monster",
    "item",
    "feature",
    "none",
  ];
  const chosen =
    types[Math.floor(Math.random() * types.length)];

  let desc: string | undefined;
  switch (chosen) {
    case "trap":
      desc = TRAPS[Math.floor(Math.random() * TRAPS.length)];
      break;

    case "item":
      desc = JSON.stringify(getRandomAnyItem(), null, 2);
      break;

    case "feature":
      desc = FEATURES[Math.floor(Math.random() * FEATURES.length)];
      break;

    case "monster":
      desc = JSON.stringify(initRandomMonster(), null, 2);
      break;

    default:
      desc = undefined;
  }

  return { type: chosen as EncounterType, description: desc };
};
