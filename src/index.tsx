// src/index.tsx (or create a small wrapper component)
import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";

import { CharacterSheet } from "./components/CharacterView";
import { DungeonView } from "./components/DungeonView";
import { EncounterView } from "./components/EncounterView";
import { VictoryView } from "./components/VictoryView";   // ← new

import { CharacterProvider } from "./contexts/CharacterContext";
import { DungeonProvider, DungeonContext } from "./contexts/DungeonContext";
import { LogProvider } from "./contexts/LogContext";

const Root = () => {
  const ctx = React.useContext(DungeonContext);

  /* If you want the victory screen to replace the whole layout,
     just guard on `ctx.victory`. */
  if (ctx?.victory) {
    return <VictoryView />;
  }

  // Normal three‑column layout
  return (
    <div className="layout">
      <div className="column"><CharacterSheet /></div>
      <div className="column"><DungeonView /></div>
      <div className="column"><EncounterView /></div>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("app")!
);
root.render(
  <React.StrictMode>
    <CharacterProvider>
      <DungeonProvider>
        <LogProvider>
          {/* Pass the context down once so that `Root` can read it */}
          <Root />
        </LogProvider>
      </DungeonProvider>
    </CharacterProvider>
  </React.StrictMode>
);
