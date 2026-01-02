// src/components/EncounterSheet.tsx
import React from "react";
import {
  type Character,
  type AbilityKey,
  type Item,
} from "../types";

import "./CharacterView.css";   // keeps the same styling

export interface EncounterSheetProps {
  /** The character to render */
  character: Character;
  /** Optional reset callback – if omitted the button is hidden. */
  onReset?: () => void;

  /**
   * Callback that is invoked when a potion in the inventory
   * is clicked.
   *
   * @param index Index of the potion inside `character.inventory`
   */
  onPotionUse?: (index: number) => void;
}

const EncounterSheet: React.FC<EncounterSheetProps> = ({
  character
}) => {
  const modText = (mod: number) =>
    mod >= 0 ? `+${mod}` : `${mod}`;

  return (
    <div className="container">
      <h2 className="title">Random Character</h2>

      {/* Abilities */}
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

      {/* XP / Level / HP */}
      <div className="stat">
        <strong>HP:</strong> {character.hp} ({character.maxHp}) /{" "}
        <strong>Level:</strong> {character.level} / <strong>XP:</strong>{" "}
        {character.xp}
      </div>

      {/* Equipped Items */}
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
            <td>{character.equipment.weapon.name} ({character.equipment.weapon.damage})</td>
          </tr>
          <tr>
            <td>
              Armor
            </td>
            <td>{character.equipment.armor.name} (tier {character.equipment.armor.tier})</td>
          </tr>
          {character.equipment.shield && (
            <tr>
              <td>Shield</td>
              <td>{(character.equipment.shield as Item).name}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EncounterSheet;
