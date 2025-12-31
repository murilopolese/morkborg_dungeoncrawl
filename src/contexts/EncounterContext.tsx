import React, { createContext, useState, type ReactNode } from "react";
import { initRandomCharacter } from "../utils/characterGenerator";

export type EncounterType =
  | "trap"
  | "monster"
  | "item"
  | "feature"
  | "corpse"
  | "none";

export interface Encounter {
  type: EncounterType;
  description?: string; // for non-monster types
}

const TRAPS = [
  "Well dressed corpse, booby trapped",
  "Wall-holes shoot poisonous arrows",
  "Bells and marbles on the floor",
  "Scorpion-filled basket poised to fall",
  "Fish hooks hanging at eye level",
  "Chest marked with explosive runes",
  "Lock trapped with vial of poison gas",
  "Jewel removal leads to roof collapse",
  "Slanted floor, translucent oil, pit",
  "Snake-cages on collapsing ceiling tiles",
  "Evil urns release cold ghosts",
  "Coins coated in grime and poison"
];
const ITEMS = [
  "Femur 1d4",
  "Staff 1d4",
  "Shortsword 1d4",
  "Knife 1d4",
  "Warhammer 1d6",
];
const FEATURES = [
  "Portal to the land of the dead, soon ready",
  "Lab where corpses are assembled into golems",
  "Black prism which twists all Powers",
];

export interface EncounterContextType {
  encounter: Encounter;
  rollEncounter: () => void;
}

export const EncounterContext = createContext<EncounterContextType | undefined>(undefined);

interface Props { children: ReactNode; }

export const EncounterProvider: React.FC<Props> = ({ children }) => {
  const [encounter, setEncounter] = useState<Encounter>({ type: "none" });

  const rollEncounter = () => {
    const types: EncounterType[] = ["trap", "monster", "item", "feature", "corpse", "none"];
    const chosen = types[Math.floor(Math.random() * types.length)];
    let desc: string | undefined;
    switch (chosen) {
      case "trap":
        desc = TRAPS[Math.floor(Math.random() * TRAPS.length)];
        break;
      case "item":
        desc = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        break;
      case "feature":
        desc = FEATURES[Math.floor(Math.random() * FEATURES.length)];
        break;
      case "monster":
        desc = JSON.stringify(initRandomCharacter(), null, 2);
        break;
      case "none":
        desc = undefined;
    }
    setEncounter({ type: chosen, description: desc });
  };

  return (
    <EncounterContext.Provider value={{ encounter, rollEncounter }}>
      {children}
    </EncounterContext.Provider>
  );
};