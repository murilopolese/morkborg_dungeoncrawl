// src/components/MonsterView.tsx
import React from "react";
import type { Character } from "../types";
import EncounterSheet from "./MonsterDisplay";

export interface MonsterViewProps {
  description: Character;
}

export const MonsterView: React.FC<MonsterViewProps> = ({ description }) => {
  return <EncounterSheet character={description} />
}
