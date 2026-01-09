// src/components/MonsterView.tsx
import React, { useContext } from "react";
import type { Character } from "../types";
import MonsterDisplay from "./MonsterDisplay";
import { LogContext } from "../contexts/LogContext";
import { GameLog } from "./GameLog";

export interface MonsterViewProps {
  description: Character;
}

export const MonsterView: React.FC<MonsterViewProps> = ({ description }) => {
  const logCtx = useContext(LogContext);
  if (!logCtx) throw new Error("DungeonView must be used inside LogProvider");
  const { entries: logEntries} = logCtx;

  return <>
    <MonsterDisplay monster={description} />
    <GameLog entries={logEntries} />
  </>
}
