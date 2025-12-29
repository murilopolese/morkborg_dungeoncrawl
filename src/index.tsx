// index.tsx (unchanged imports)
import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { CharacterSheet } from "./components/CharacterSheet";
import { DungeonView } from "./components/DungeonView";

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
        <div className="layout">
          <div className="column"><CharacterSheet /></div>

          {/* Middle column – dungeon map + move button */}
          <div className="column"><DungeonView /></div>

          <div className="column"></div>
        </div>
      </DungeonProvider>
    </CharacterProvider>
  </React.StrictMode>
);
