// src/components/TrapView.tsx
import React, { useContext } from "react";
import { GameLog } from "./GameLog";
import { LogContext } from "../contexts/LogContext";

export interface TrapViewProps {
  description: string;
}

export const TrapView: React.FC<TrapViewProps> = ({ description }) => {
  const logCtx = useContext(LogContext);
  if (!logCtx) throw new Error("DungeonView must be used inside LogProvider");
  const { entries: logEntries} = logCtx;
  return (
    <div className="trap-view">
      {/* Title */}
      <h3>Trap</h3>

      {/* Description */}
      <p>{description}</p>

      <GameLog entries={logEntries} />
    </div>
  )
};
