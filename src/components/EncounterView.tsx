import React, { useContext } from "react";
import { DungeonContext } from "../contexts/DungeonContext";

import { MonsterView } from "./MonsterView";
import { ItemView } from "./ItemView";
import { FeatureView } from "./FeatureView";
import { TrapView } from "./TrapView";

export const EncounterView: React.FC = () => {
  const ctx = useContext(DungeonContext);
  if (!ctx) return null;
  const { grid, player } = ctx;

  const tile = grid[player.row][player.col];
  const encounter = tile.encounter ?? { type: "none" };

  /* ---------- Render logic -------------------------------------- */
  let content;
  switch (encounter.type) {
    case "monster": {
      const char = JSON.parse(encounter.description || "{}");
      content = <MonsterView description={char} />;
      break;
    }

    case "item": {
      const item = JSON.parse(encounter.description || "{}");
      content = <ItemView item={item} />;
      break;
    }

    case "feature":
      content = (
        <FeatureView
          description={encounter.description as string ?? ""}
        />
      );
      break;

    case "trap":
      content = <TrapView description={encounter.description as string} />;
      break;

    default: // none
      content = <p>This room is empty.</p>;
  }

  /* ---------- JSX ----------------------------------------------- */
  return (
    <div className="encounter-view">
      <h2>Current Encounter</h2>
      {content}
    </div>
  );
};
