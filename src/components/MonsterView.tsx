// src/components/MonsterView.tsx
import React from "react";
import type { Character, Encounter } from "../types";
import CharacterDisplay from "./CharacterDisplay";

export const MonsterView: React.FC<Encounter> = ({ description }) => {
  let character = JSON.parse(description || '{}') as Character
  return <CharacterDisplay character={character} />
}
