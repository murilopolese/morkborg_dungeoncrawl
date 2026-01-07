import React, { useContext } from "react";
import "./CharacterView.css";

import { CharacterContext } from "../contexts/CharacterContext";
import CharacterDisplay from "./CharacterDisplay";

import { equip, unequip, dropItem, useShield } from "../utils/inventory";

export const CharacterSheet: React.FC = () => {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("CharacterSheet must be used within a CharacterProvider");
  const { character, setCharacter } = ctx;
  

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
   *  Handle unequip – returns a new character via the utility
   * ------------------------------------------------------------- */
  const handleUnequip = (slot: "weapon" | "armor" | "shield") => {
    setCharacter((prev) => unequip(prev, slot));
  };

  /* -------------------------------------------------------------
   *  Handle “Equip” from inventory
   * ------------------------------------------------------------- */
  const handleEquip = (index: number) => {
    setCharacter((prev) =>  equip(prev, index))
  };

  /* ------------------------------------------------------------------- */
  /*  Drop an item from the inventory                                  */
  /* ------------------------------------------------------------------- */
  const handleDrop = (index: number) => {
    setCharacter((prev) => dropItem(prev, index));
  };

  /* ------------------------------------------------------------------- */
  /*  Use shield                                  */
  /* ------------------------------------------------------------------- */
  const handleShield = () => {
    setCharacter((prev) => useShield(prev));
  };

  return (
    <div>
      <CharacterDisplay
        character={character}
        onPotionUse={handlePotionUse}
        onUnequip={handleUnequip}
        onEquip={handleEquip}
        onDrop={handleDrop}
        onShield={handleShield}
      />
    </div>
  );
};
