// index.tsx 
import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { CharacterSheet } from "./components/CharacterView";
import { DungeonView } from "./components/DungeonView";
import { EncounterView } from "./components/EncounterView";
import { EncounterProvider } from "./contexts/EncounterContext";

import { CharacterProvider } from "./contexts/CharacterContext";
import { DungeonProvider } from "./contexts/DungeonContext";

const root = ReactDOM.createRoot(
  document.getElementById("app")!
);
root.render(
  <React.StrictMode>
    {/* All providers go at the top */}
    <CharacterProvider>
      <DungeonProvider>
        <EncounterProvider>
          <div className="layout">
            <div className="column"><CharacterSheet /></div>
  
            {/* Middle column – dungeon map + move button */}
            <div className="column"><DungeonView /></div>
  
            <div className="column"><EncounterView /></div>
          </div>
        </EncounterProvider>
      </DungeonProvider>
    </CharacterProvider>
  </React.StrictMode>
);
