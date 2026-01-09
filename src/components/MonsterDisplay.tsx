// src/components/MonsterDisplay.tsx
import React from "react";
import {
  type Monster,
  type AbilityKey,
} from "../types";

import "./CharacterView.css";   // keeps the same styling

export interface MonsterDisplayProps {
  /** The character to render */
  monster: Monster;
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

const MonsterDisplay: React.FC<MonsterDisplayProps> = ({
  monster
}) => {
  const modText = (mod: number) =>
    mod >= 0 ? `+${mod}` : `${mod}`;

  return (
    <div className="container">
      <h2 className="title">Dangerous Encounter</h2>

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
          {(Object.keys(monster.abilities) as AbilityKey[]).map((k) => (
            <tr key={k}>
              <td>{k}</td>
              <td className="right">{monster.abilities[k].value}</td>
              <td className="right">
                {modText(monster.abilities[k].modifier)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* XP / Level / HP */}
      <div className="stat">
        <strong>HP:</strong> {monster.hp} ({monster.maxHp})
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
            <td>{monster.equipment.weapon.name} ({monster.equipment.weapon.damage})</td>
          </tr>
          <tr>
            <td>
              Armor
            </td>
            <td>{monster.equipment.armor.name} (tier {monster.equipment.armor.tier})</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MonsterDisplay;
