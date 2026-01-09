// src/components/VictoryView.tsx
import React, { useContext } from "react";
import { DungeonContext } from "../contexts/DungeonContext";
import { generateRandomQuest } from "../utils/generateRandomQuest";

export const VictoryView: React.FC = () => {
  const ctx = useContext(DungeonContext);
  if (!ctx) throw new Error("VictoryView must be used inside a DungeonProvider");

  const { quest, setVictory } = ctx;

  return (
    <div className="victory-screen">
      <h1>Congratulations!</h1>
      <p>You have discovered the occult treasure of the current quest.</p>

      {/* Show some quest details – tweak as you like */}
      <section className="quest-details">
        <h2>{quest.dungeonName}</h2>
        <p>{quest.occultTreasure}</p>
      </section>

      {/* A button to restart or play again – optional */}
      <button
        onClick={() => {
            // Reset the dungeon for a new run
            setVictory?.(false);
            ctx.resetMap();
            ctx.setLevel?.(1);   // make sure we start at level 1 again
            ctx.setLevel?.(1);
            ctx.setQuest?.(generateRandomQuest());
        }}
      >
        Play Again
      </button>
    </div>
  );
};
