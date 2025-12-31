// src/components/CharacterSheet.tsx
import React, { useContext } from "react";
import "./CharacterSheet.css";

import { initRandomCharacter } from "../utils/characterGenerator";
import { CharacterContext } from "../contexts/CharacterContext";
import CharacterDisplay from "./CharacterDisplay";   // ← new import

export const CharacterSheet: React.FC = () => {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("CharacterSheet must be used within a CharacterProvider");
  const { character, setCharacter } = ctx;

  const handleReset = () => setCharacter(initRandomCharacter());

  return (
    <CharacterDisplay
      character={character}
      onReset={handleReset}   // optional – keeps the button from the original component
    />
  );
};
