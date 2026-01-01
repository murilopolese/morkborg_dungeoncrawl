import React, { useContext } from "react";
import "./CharacterSheet.css";

import { initRandomCharacter } from "../utils/characterGenerator";
import { CharacterContext } from "../contexts/CharacterContext";
import CharacterDisplay from "./CharacterDisplay";

import { unequip } from "../utils/inventory";
import { EMPTY_WEAPON, EMPTY_ARMOR } from "../utils/inventory";

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
   *  Handle unequip – returns a new character via the utility
   * ------------------------------------------------------------- */
  const handleUnequip = (slot: "weapon" | "armor" | "shield") => {
    setCharacter((prev) => unequip(prev, slot));
  };

  /* -------------------------------------------------------------
   *  Handle “Equip” from inventory
   * ------------------------------------------------------------- */
  const handleEquip = (index: number) => {
    const item = character.inventory[index];
    let slot: "weapon" | "armor" | "shield";
    if ((item as any).category === "Weapon") slot = "weapon";
    else if ((item as any).category === "Armor") slot = "armor";
    else if ((item as any).category === "Shield") slot = "shield";
    else return; // should not happen

    setCharacter((prev) => {
      const newEquip = { ...prev.equipment };
      const newInventory = [...prev.inventory];

      /* 1️⃣ Put the chosen item into equipment */
      if (slot === "weapon") newEquip.weapon = item as any;
      else if (slot === "armor") newEquip.armor = item as any;
      else newEquip.shield = item as any;

      /* 2️⃣ Determine what was previously equipped (if anything) */
      let oldItem: typeof item | undefined;
      if (slot === "weapon" && prev.equipment.weapon !== EMPTY_WEAPON)
        oldItem = prev.equipment.weapon;
      else if (slot === "armor" && prev.equipment.armor !== EMPTY_ARMOR)
        oldItem = prev.equipment.armor;
      else if (slot === "shield") oldItem = prev.equipment.shield;

      /* 3️⃣ If there was an old item, swap it into the inventory slot.
           Otherwise remove the new item from inventory and add an empty slot
           to keep capacity constant. */
      if (oldItem) {
        newInventory[index] = oldItem as any;
      } else {
        // remove the newly equipped item
        newInventory.splice(index, 1);
        // push an empty placeholder to preserve length
        newInventory.push({} as any);
      }

      return { ...prev, equipment: newEquip, inventory: newInventory };
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
        onReset={canReset ? handleReset : undefined}
        onUnequip={handleUnequip}
        onEquip={handleEquip}
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
