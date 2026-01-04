// src/components/DungeonView.tsx
import React, { useCallback, useContext, useState } from "react";
import { DungeonContext } from "../contexts/DungeonContext";
import { GameLog } from "./GameLog";
import type { EncounterType, Grid } from "../types";
import { CharacterContext } from "../contexts/CharacterContext";
import { initRandomCharacter } from "../utils/characterGenerator";
import { rollDie, applyDamageAndCheckDead, rollDamageFromWeapon, reduceDamage } from "../utils/combat";
import { EMPTY_WEAPON, EMPTY_ARMOR } from "../utils/inventory";

import './DungeonView.css';


export const DungeonView: React.FC = () => {
  const ctx = useContext(DungeonContext);
  if (!ctx) throw new Error("DungeonView must be used inside DungeonProvider");
  const charCtx = useContext(CharacterContext)
  if (!charCtx) throw new Error("DungeonView must be used inside CharacterContext");

  const { grid, player, movePlayer, resetMap } = ctx;
  const { character, setCharacter } = charCtx;
  const [isDead, setIsDead] = useState(false);
  const [logEntries, setLogEntries] = useState<string[]>([]);

  /** Push a new entry into the log */
  const addLog = useCallback((msg: string) => {
    setLogEntries(prev => [...prev, msg]);
  }, []);

  /** Clear all entries – used when you die and respawn */
  const clearLog = useCallback(() => {
    setLogEntries([]);
  }, []);
  /* ---------- helper that returns the image path for a tile ---------- */
  const getTileImage = (tile: typeof grid[0][0], r: number, c: number): string | undefined => {
    if (!tile.visited) return undefined;          // only visited tiles have an image

    // order: up, right, down, left
    const dirs = [
      { dr: -1, dc: 0 },   // up
      { dr: 0, dc: 1 },    // right
      { dr: 1, dc: 0 },     // down
      { dr: 0, dc: -1 }     // left
    ];

    const bits = dirs
      .map(({ dr, dc }) => {
        const nr = r + dr;
        const nc = c + dc;
        const isCameFrom =
          tile.cameFrom?.row === nr && tile.cameFrom.col === nc;
        const isWentTo =
          tile.wentTo?.row === nr && tile.wentTo.col === nc;
        return (isCameFrom || isWentTo) ? "1" : "0";
      })
      .join("");

    // images live in /public/assets/tiles/
    return `/assets/tiles/${bits}.png`;
  };

  /**
   * The entire fight routine.
   *
   * @param ctx          DungeonContext (only the parts we need)
   * @param charCtx      CharacterContext
   * @param addLog       callback to push a log entry
   */
  const fight = (
    ctx: any,
    charCtx: any,
    addLog: (msg: string) => void
  ): void => {
    /* Grab current tile & its encounter -------------------------------- */
    const { grid, player } = ctx;
    const currentTile = grid[player.row][player.col];
    const encounter   = currentTile?.encounter;
  
    if (!encounter || encounter.type !== "monster") return;
  
    let monster: any; // In a real app you’d type this properly.
    try {
      monster = encounter.description ? JSON.parse(encounter.description) : null;
    } catch (_) { /* ignore – if it fails we just abort */ }
    if (!monster) return;
  
    const { character, setCharacter } = charCtx;
  
    /* ---------- Attack Roll (with critical checks) -------------------- */
    const attackRollD20 = rollDie(20);
    const weapon        = character.equipment.weapon;
    const attackAbilityKey  = weapon.test as keyof typeof character.abilities;
    const attackMod         = character.abilities[attackAbilityKey].modifier;
  
    /* Critical miss – drop weapon ------------------------------------- */
    if (attackRollD20 === 1) {
      addLog("Critical miss! You dropped your weapon.");
      setCharacter((prev : any) => ({
        ...prev,
        equipment: { ...prev.equipment, weapon: EMPTY_WEAPON }
      }));
      return;
    }
  
    const isAttackCritSuccess = attackRollD20 === 20;
    if (isAttackCritSuccess) addLog("Critical hit! Double damage will be applied.");
  
    const attackRoll = attackRollD20 + attackMod;
    addLog(`Attack roll: ${attackRoll} (d20+${attackMod})`);
  
    /* Monster agility & armor ------------------------------------------ */
    const monsterAgilityMod =
      monster.abilities?.["Agility"]?.modifier ?? 0;
  
    const monsterArmor = monster.equipment?.armor ?? { defenseDr: 0 };
    const hitThreshold = 10 + monsterAgilityMod - (monsterArmor.defenseDr || 0);
  
    /* Does the attack land? -------------------------------------------- */
    if (attackRoll > hitThreshold) {
      let dmg = rollDamageFromWeapon(weapon);
      dmg = reduceDamage(dmg, monsterArmor);          // apply monster’s DR
  
      if (isAttackCritSuccess) dmg *= 2;
  
      addLog(`You hit the monster for ${dmg} damage!`);
  
      /* ----- Update monster HP --------------------------------------- */
      const { newHp: monsterNewHp } = applyDamageAndCheckDead(monster.hp ?? 0, dmg);
      monster.hp = monsterNewHp;
  
      if (isAttackCritSuccess && monster.equipment?.armor) {
        addLog("Critical hit: Monster’s armor is dropped!");
        monster.equipment.armor = EMPTY_ARMOR;
      }
  
      ctx.setGrid?.((prev: Grid) => {
        const newGrid = prev.map(r => r.map(t => ({ ...t })));
        if (monster.hp <= 0) {                         // monster dies
          newGrid[player.row][player.col].encounter = { type: "none" };
        } else {
          newGrid[player.row][player.col].encounter!.description =
            JSON.stringify(monster);
        }
        return newGrid;
      });
    } else {
      addLog("Your attack missed!");
    }
  
    /* ---------- Defense Roll (with critical checks) ------------------- */
    const defenseRollD20 = rollDie(20);
    const defenseRollRaw = defenseRollD20 + character.abilities["Agility"].modifier;
  
    const charArmorDef = character.equipment.armor?.defenseDr ?? 0;
    const defenseRoll  = defenseRollRaw - charArmorDef;
  
    addLog(
      `Defense roll: ${defenseRoll} (d20+${character.abilities["Agility"].modifier}` +
        `${charArmorDef > 0 ? ` - ${charArmorDef}` : ""})`
    );
  
    /* Monster’s attack bonus ------------------------------------------- */
    const monsterWeapon =
      monster.equipment?.weapon ?? { test: "Strength" };
    const monsterAttackAbilityKey =
      monsterWeapon.test as keyof typeof character.abilities;
    const monsterAttackMod =
      monster.abilities?.[monsterAttackAbilityKey]?.modifier ?? 0;
  
    /* Critical defense failure ----------------------------------------- */
    if (defenseRollD20 === 1) {
      addLog("Critical defense failure! Double damage will be applied.");
      setCharacter((prev : any) => ({
        ...prev,
        equipment: { ...prev.equipment, armor: EMPTY_ARMOR }
      }));
    }
  
    /* Monster’s weapon dropped on player’s critical success ------------ */
    if (defenseRollD20 === 20) {
      addLog("Critical defense success! Monster’s weapon is dropped.");
      monster.equipment.weapon = EMPTY_WEAPON;
    }
  
    /* Does the monster hit? -------------------------------------------- */
    if (defenseRoll <= 10 + monsterAttackMod) {
      let dmg = rollDamageFromWeapon(monsterWeapon);
      dmg = reduceDamage(dmg, character.equipment.armor);
  
      if (defenseRollD20 === 1) dmg *= 2;
  
      addLog(`The monster hit you for ${dmg} damage!`);
  
      const { newHp: playerNewHp, dead } = applyDamageAndCheckDead(
        character.hp,
        dmg
      );
  
      setCharacter((prev : any) => ({ ...prev, hp: playerNewHp }));
      if (dead) {
        alert("This one died!");
        setIsDead(true); // <-- we keep this line for backward compatibility; 
                         // the check is now also performed in applyDamageAndCheckDead.
      }
    } else {
      addLog("You dodged the monster’s attack!");
    }
  
    addLog("====================================");
  };

  const escapeTrap = () => {
    /* Presence DR – d20 + presence modifier, success if ≥ 14 */
    const presenceMod = character.abilities["Presence"].modifier;
    const roll = rollDie(20) + presenceMod;

    addLog(`Presence check: ${roll} (d20+${presenceMod})`);
    if (roll >= 14) {
      addLog("You successfully escaped the trap!");
      // You might want to change the tile’s encounter here:
      ctx.setGrid?.((prev: Grid) => {
        const newGrid = prev.map(r => r.map(t => ({ ...t })));
        newGrid[player.row][player.col].encounter = { type: "none" };
        return newGrid;
      });
    } else {
      /* take 1d6 damage */
      const dmg = rollDie(6);
      addLog(`You failed to escape! You take ${dmg} damage.`);

      const { newHp, dead } = applyDamageAndCheckDead(character.hp, dmg);
      setCharacter(prev => ({ ...prev, hp: newHp }));
      if (dead) {
        alert("This one died!");
        setIsDead(true);
      }
    }
  };

  const handleFight = () => {
    fight(ctx, charCtx, addLog);
  };

  /* ---------- determine what button(s) to show ---------- */
  const currentTile = grid[player.row][player.col];
  const encounterType: EncounterType = currentTile?.encounter?.type ?? "none";
  const onClick = movePlayer;

  /* ---------- render the map ---------- */
  return (
    <div>
      <div className="dungeon">
        {grid.map((row, i) =>
          row.map((tile, j) => {
            const isCurrent = i === player.row && j === player.col;
            const imgSrc = getTileImage(tile, i, j);

            return (
              <div
                key={`${i}-${j}`}
                className={`tile ${tile.visited ? "visited" : ""} ${isCurrent ? "current" : ""}`}
              >
                {imgSrc && (
                  <img src={imgSrc} alt="floor" style={{ width: "100%", height: "100%" }} />
                )}
                {isCurrent && <span className="player-icon">🧍</span>}
              </div>
            );
          })
        )}
      </div>

       {!isDead && (
        <>
          {(encounterType === "none" ||
            encounterType === "feature" ||
            encounterType === "item") && (
            <button onClick={onClick} className="action-btn">
              Move to next room
            </button>
          )}

          {encounterType === "trap" && (
            <button onClick={escapeTrap} className="action-btn">
              Escape trap
            </button>
          )}

          {encounterType === "monster" && (
            <button onClick={handleFight} className="action-btn">
              Fight monster
            </button>
          )}
        </>
      )}

      {isDead && (
        <button
          onClick={() => {
            resetMap();
            setCharacter(initRandomCharacter());
            setIsDead(false);
            clearLog();
          }}
          className="action-btn"
        >
          Spend another life
        </button>
      )}

      <GameLog entries={logEntries} />
    </div>
  );
};
