// src/components/CharacterSheet.tsx
import React, { useContext } from "react";
import {
  type AbilityKey,
  type Item,
} from "../types";


import "./CharacterSheet.css";

import { initRandomCharacter } from "../utils/characterGenerator";
import { CharacterContext } from "../contexts/CharacterContext";

/* ------------------------------------------------------------------
   UI component ----------------------------------------------------- */
export const CharacterSheet: React.FC = () => {
  // Pull character state and updater from context
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("CharacterSheet must be used within a CharacterProvider");
  const { character, setCharacter } = ctx;

  const handleReset = () => setCharacter(initRandomCharacter());

  /* ---- helpers for rendering ------------------------------------ */
  const modText = (mod: number) =>
    mod >= 0 ? `+${mod}` : `${mod}`;

  return (
    <div className="container">
      <h2 className="title">Mörk Borg Character Sheet</h2>

      {/* ---------------- Abilities --------------------------------- */}
      <table className="sheet-table">
        <thead>
          <tr>
            {["Ability", "Value", "Modifier"].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(Object.keys(character.abilities) as AbilityKey[]).map((k) => (
            <tr key={k}>
              <td>{k}</td>
              <td className="right">{character.abilities[k].value}</td>
              <td className="right">
                {modText(character.abilities[k].modifier)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------------- XP / Level / HP -------------------------- */}
      <div className="stat">
        <strong>Level:</strong> {character.level} / <strong>XP:</strong> {character.xp}
      </div>
      <div className="stat"><strong>HP:</strong> {character.hp} / {character.maxHp}</div>

      {/* ---------------- Equipped Items ----------------------------- */}
      <h3 className="sub-title">Equipped</h3>
      <table className="sheet-table">
        <thead>
          <tr>
            {["Slot", "Item"].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Weapon</td>
            <td>{character.equipment.weapon.name}</td>
          </tr>
          <tr>
            <td>
              Armor (tier {character.equipment.armor.tier})
            </td>
            <td>{character.equipment.armor.name}</td>
          </tr>
          {character.equipment.shield && (
            <tr>
              <td>Shield</td>
              <td>{(character.equipment.shield as Item).name}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ---------------- Inventory ----------------------------------- */}
      <h3 className="sub-title">
        Inventory (Capacity: {character.inventory.length})
      </h3>
      <div className="inventory">
        {character.inventory.map((itm, i) => {
          const isEmpty = !itm.name;
          return (
            <div
              key={i}
              className={isEmpty ? "slot empty-slot" : "slot"}
            >
              {!isEmpty && (
                <>
                  <strong>{itm.name}</strong>
                  <br />
                  <span className="category">
                    {(itm as any).category}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ---------------- Reset button -------------------------------- */}
      <button onClick={handleReset} className="reset-btn">
        Randomize Character
      </button>
    </div>
  );
};
