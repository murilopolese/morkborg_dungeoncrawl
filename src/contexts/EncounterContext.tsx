import React, { createContext, useState, type ReactNode } from "react";
import { initRandomCharacter } from "../utils/characterGenerator";

import { type Encounter, type EncounterType } from "../types";
import { getRandomAnyItem } from "../utils/randomItemGenerator";

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
const FEATURES = [
  "Portal to the land of the dead, soon ready",
  "Lab where corpses are assembled into golems",
  "Black prism which twists all Powers",
  "300 emaciated, mutilated prisoners",
  "Blind hermit, firmly rooted in the ground, spreading his vile corruption",
  "Bony remains of the Basilisk’s spawn",
  "Obelisk that separates body and soul",
  "Rooms move around the dungeons center",
  "High ceilings, whispers in the upper dark",
  "Artwork affecting the surroundings",
  "Ensnaring, intelligent plants",
  "Giant pools of boiling tar"
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
    const types: EncounterType[] = ["trap", "monster", "item", "feature", "none"];
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