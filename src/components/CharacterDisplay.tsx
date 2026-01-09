// src/components/CharacterDisplay.tsx
import React from "react";
import {
  type Character,
  type AbilityKey,
  type Item,
  type Weapon,
} from "../types";

import "./CharacterView.css";
import { EMPTY_WEAPON, EMPTY_ARMOR } from "../utils/inventory";

export interface CharacterDisplayProps {
  character: Character;
  onReset?: () => void;
  onPotionUse?: (index: number) => void;
  onUnequip?: (slot: "weapon" | "armor" | "shield") => void;
  onEquip?: (index: number) => void;
  onDrop?: (index: number) => void;
  onShield?: () => void; // called when sacrifice is clicked
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  character,
  onPotionUse,
  onUnequip,
  onEquip,
  onDrop,
  onShield,
}) => {
  const modText = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);
  const getItem = (idx: number) => character.inventory[idx];

  // <‑‑ NEW LINE -------------------------------------------------
  const isAlive = character.hp > 0;
  // ----------------------------------------------------------------

  return (
    <div className="container">
      <h2 className="title">Character name: {character.name}</h2>

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
              <td>{character.abilities[k].value}</td>
              <td>{modText(character.abilities[k].modifier)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* HP / Level / XP */}
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
              {character.equipment.weapon?.name} ({character.equipment.weapon?.damage})
              {character.equipment.weapon?.name !== EMPTY_WEAPON.name &&
                isAlive && onUnequip && (
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
              {character.equipment.armor?.name} (tier{" "}
              {character.equipment.armor?.tier})
              {character.equipment.armor?.name !== EMPTY_ARMOR.name &&
                isAlive && onUnequip && (
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
                {!character.usingShield &&
                  isAlive && onUnequip && (
                    <button
                      className="unequip-btn"
                      onClick={() => onUnequip("shield")}
                    >
                      Unequip
                    </button>
                  )}
                {/* Sacrifice button – shown only when not using shield */}
                {!character.usingShield &&
                  isAlive && onShield && (
                    <button
                      className="sacrifice-btn"
                      onClick={onShield}
                    >
                      Sacrifice
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
        {Array.from({ length: character.carryCapacity }).map((_, idx) => {
          const itm = getItem(idx);
          const isEmpty = !itm || !itm.name;

          return (
            <div
              key={idx}
              className={isEmpty ? "slot empty-slot" : "slot"}
            >
              {!isEmpty && (
                <>
                  <p>{itm!.name}</p>
                  <p>
                    {(itm as any).category}
                    {itm!.category === "Weapon" && <>({(itm as Weapon).damage})</>}
                  </p>


                  {/* All buttons are guarded by `isAlive` ----------------- */}
                  {isAlive && (
                    <>
                      {itm!.category === "Potion" &&
                        onPotionUse && (
                          <button
                            className="use-potion-btn"
                            onClick={() => onPotionUse(idx)}
                          >
                            Use Potion
                          </button>
                        )}
                      {["Weapon", "Armor", "Shield"].includes(itm!.category) &&
                        onEquip && (
                          <button
                            className="equip-btn"
                            onClick={() => onEquip(idx)}
                          >
                            Equip
                          </button>
                        )}
                      {onDrop && (
                        <button
                          className="drop-potion-btn"
                          onClick={() => onDrop(idx)}
                        >
                          Drop
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterDisplay;
