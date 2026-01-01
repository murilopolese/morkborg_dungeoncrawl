import React, { useContext } from "react";
import "./CharacterSheet.css";

import { initRandomCharacter } from "../utils/characterGenerator";
import { CharacterContext } from "../contexts/CharacterContext";
import CharacterDisplay from "./CharacterDisplay";   // ← new import

export const CharacterSheet: React.FC = () => {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("CharacterSheet must be used within a CharacterProvider");
  const { character, setCharacter } = ctx;

  const handleReset = () => setCharacter(initRandomCharacter());

  /* -------------------------------------------------------------
   *  Handle the “Use Potion” button that lives inside CharacterDisplay
   * ------------------------------------------------------------- */
  const handlePotionUse = (index: number) => {
    // Roll a d4
    const roll = Math.floor(Math.random() * 4) + 1;

    // Calculate new HP, capped at maxHp
    const newHp = Math.min(character.hp + roll, character.maxHp);

    // Remove the used potion from inventory
    const newInventory = [...character.inventory];
    newInventory.splice(index, 1); // remove one item at `index`

    setCharacter({
      ...character,
      hp: newHp,
      inventory: newInventory,
    });
  };

  /* -------------------------------------------------------------
   *  Show reset button only when HP <= 0
   * ------------------------------------------------------------- */
  const canReset = character.hp <= 0;

  return (
    <div>
      <CharacterDisplay
        character={character}
        onPotionUse={handlePotionUse}
        // Pass reset handler only if we may show the button
        onReset={canReset ? handleReset : undefined}
      />
      {/* Optional – explicit button if CharacterDisplay doesn’t already render one */}
      {canReset && (
        <button className="regenerate-btn" onClick={handleReset}>
          Regenerate character
        </button>
      )}
    </div>
  );
};
