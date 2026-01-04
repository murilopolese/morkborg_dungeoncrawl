// src/components/GameLog.tsx
import React, { useEffect, useRef } from "react";
import "./GameLog.css";

export interface GameLogProps {
  /** Array of strings that will be displayed in chronological order */
  entries: string[];
}

/**
 * A simple log panel that automatically scrolls to the newest entry.
 */
export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  // Reference to the wrapper so we can scroll
  const containerRef = useRef<HTMLDivElement>(null);

  // Whenever the list changes, scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="game-log" ref={containerRef}>
      {entries.map((msg, i) => (
        <p key={i} className="log-entry">{msg}</p>
      ))}
    </div>
  );
};
