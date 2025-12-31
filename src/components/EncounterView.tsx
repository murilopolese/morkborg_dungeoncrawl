// src/components/EncounterView.tsx
import React, { useContext } from "react";
import { EncounterContext } from "../contexts/EncounterContext";

import { MonsterView } from "./MonsterView";
import { ItemView } from "./ItemView";
import { FeatureView } from "./FeatureView";
import { TrapView } from "./TrapView";

export const EncounterView: React.FC = () => {
  const ctx = useContext(EncounterContext);
  if (!ctx) return null;
  const { encounter, rollEncounter } = ctx;

  /* ---------- Render logic -------------------------------------- */
  let content;
  switch (encounter.type) {
    case "monster": {
      const char = encounter.description;
      content = <MonsterView description={char} />;
      break;
    }

    case "item": {
      const item = encounter.description as import("../types").Item | undefined;
      content = <ItemView item={item} />;
      break;
    }

    case "feature":
      content = <FeatureView description={encounter.description as string ?? ""} />;
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
      <button onClick={rollEncounter}>Roll Encounter</button>
    </div>
  );
};
