// src/utils/generateEncounter.ts
import { type Encounter, type EncounterType } from "../types";
import { getRandomAnyItem } from "./randomItemGenerator";
import { initRandomMonster } from "./monsterGenerator";
import { TRAPS, FEATURES } from "../data/encounterData";
import { ROOM_DESCRIPTION } from "../data/rooms";

// Track used features to prevent repetition
let usedFeatures: Set<string> = new Set();
let allFeatures = [...FEATURES]; // Keep a copy of all features

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
  const chosen = types[Math.floor(Math.random() * types.length)];

  let desc: string | undefined;
  switch (chosen) {
    case "trap":
      desc = TRAPS[Math.floor(Math.random() * TRAPS.length)];
      break;

    case "item":
      desc = JSON.stringify(getRandomAnyItem(), null, 2);
      break;

    case "feature":
      // If all features have been used, reset the set
      if (usedFeatures.size < allFeatures.length) {
        
        // Find a feature that hasn't been used yet
        let availableFeatures = allFeatures.filter(feature => !usedFeatures.has(feature));
        
        // If no unused features left, use any feature (resetting the set)
        if (availableFeatures.length === 0) {
          availableFeatures = [...allFeatures];
          usedFeatures.clear();
        }
        
        const randomFeature = availableFeatures[Math.floor(Math.random() * availableFeatures.length)];
        usedFeatures.add(randomFeature);
        desc = randomFeature;
      } else {
        desc = ROOM_DESCRIPTION[
          Math.floor(Math.random() * ROOM_DESCRIPTION.length)
        ];
      }
      
      break;

    case "monster":
      desc = JSON.stringify(initRandomMonster(), null, 2);
      break;

    default:
      desc = ROOM_DESCRIPTION[
        Math.floor(Math.random() * ROOM_DESCRIPTION.length)
      ];
  }

  return { type: chosen as EncounterType, description: desc };
};

// Reset function to be called when needed (e.g., new game session)
export const resetUsedFeatures = () => {
  usedFeatures.clear();
};
