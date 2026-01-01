// src/components/CharacterDisplay.tsx
import React from "react";
import {
  type Character,
  type AbilityKey,
  type Item,
} from "../types";

import "./CharacterSheet.css";   // keeps the same styling
import { EMPTY_WEAPON, EMPTY_ARMOR } from "../utils/inventory";

export interface CharacterDisplayProps {
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
  /** Called when an equipped item button is pressed. */
  onUnequip?: (
    slot: "weapon" | "armor" | "shield"
  ) => void;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
    character,
    onReset,
    onPotionUse,
    onUnequip,
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
          {/* Weapon */}
          <tr>
            <td>Weapon</td>
            <td>
              {character.equipment.weapon.name} ({character.equipment.weapon.damage})
              {character.equipment.weapon.name !== EMPTY_WEAPON.name &&
                onUnequip && (
                  <button
                    className="unequip-btn"
                    onClick={() => onUnequip("weapon")}
                  >
                    Unequip
                  </button>
                )}
            </td>
          </tr>

          {/* Armor */}
          <tr>
            <td>Armor</td>
            <td>
              {character.equipment.armor.name} (tier{" "}
              {character.equipment.armor.tier})
              {character.equipment.armor.name !== EMPTY_ARMOR.name &&
                onUnequip && (
                  <button
                    className="unequip-btn"
                    onClick={() => onUnequip("armor")}
                  >
                    Unequip
                  </button>
                )}
            </td>
          </tr>

          {/* Shield – optional */}
          {character.equipment.shield && (
            <tr>
              <td>Shield</td>
              <td>
                {(character.equipment.shield as Item).name}
                {onUnequip && (
                  <button
                    className="unequip-btn"
                    onClick={() => onUnequip("shield")}
                  >
                    Unequip
                  </button>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Inventory */}
      <h3 className="sub-title">
        Inventory (Capacity: {character.carryCapacity})
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

                  {/* If the item is a potion, show a “Use” button */}
                  {itm.category === "Potion" && onPotionUse && (
                    <button
                      className="use-potion-btn"
                      onClick={() => onPotionUse(i)}
                    >
                      Use Potion
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional reset button */}
      {onReset && (
        <button onClick={onReset} className="reset-btn">
          Randomize Character
        </button>
      )}
    </div>
  );
};

export default CharacterDisplay;
