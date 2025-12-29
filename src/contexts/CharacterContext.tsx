// src/contexts/CharacterContext.tsx
import React, {
  createContext,
  useState,
  type ReactNode,
} from "react";
import { type Character } from "../types";
import { initRandomCharacter } from "../utils/characterGenerator";

type CharacterContextType = {
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
};

export const CharacterContext =
  createContext<CharacterContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const CharacterProvider: React.FC<Props> = ({ children }) => {
  const [character, setCharacter] = useState<Character>(
    initRandomCharacter
  );

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};
