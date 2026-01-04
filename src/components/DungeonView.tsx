// src/components/DungeonView.tsx
import React, { useCallback, useContext, useState } from "react";
import { DungeonContext } from "../contexts/DungeonContext";
import { GameLog } from "./GameLog";
import type { EncounterType, Grid } from "../types";
import { CharacterContext } from "../contexts/CharacterContext";
import { initRandomCharacter } from "../utils/characterGenerator";
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

  /* ---------- Roll a single die with `sides` faces. ---------- */
  const rollDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

  /* ---------- Parse dice strings like “2d6+3” or just “1d4”. ---------- */
  const parseDiceString = (dice: string): { count: number; sides: number; bonus: number } => {
    const match = dice.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) throw new Error(`Invalid dice string: ${dice}`);
    const [, cnt, side, bon] = match;
    return { count: +cnt, sides: +side, bonus: bon ? +bon : 0 };
  };

  /* ---------- Roll the damage defined by a weapon’s `damage` property. ---------- */
  const rollDamageFromWeapon = (weapon: any /* Weapon */): number => {
    const { count, sides, bonus } = parseDiceString(weapon.damage);
    let total = 0;
    for (let i = 0; i < count; i++) total += rollDie(sides);
    return total + bonus;
  };

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


  const fight = () => {
    /* ---- Grab current tile & its encounter -------------------------------- */
    const currentTile = grid[player.row][player.col];
    const encounter   = currentTile?.encounter;
    if (!encounter || encounter.type !== "monster") return;

    /* ---- Parse the monster from JSON ------------------------------------- */
    let monster: any; // In a real app you’d type this properly.
    try {
      monster = encounter.description ? JSON.parse(encounter.description) : null;
    } catch (_) { /* ignore – if it fails we just abort */ }
    if (!monster) return;

    /* ---- Helper: apply damage‑reduction dice ----------------------------- */
    const reduceDamage = (dmg: number, armor: any /* Armor | undefined */): number => {
      const redStr = armor?.dmgReduction;
      if (!redStr) return dmg;                      // no reduction

      let isNegative = false;
      let str = redStr.trim();

      if (str.startsWith("-")) {                     // e.g. "-1d2"
        isNegative = true;
        str = str.slice(1);                          // strip the sign
      }

      const { count, sides, bonus } = parseDiceString(str);
      let reduction = 0;
      for (let i = 0; i < count; i++) reduction += rollDie(sides);
      reduction += bonus;

      // armor’s dmgReduction is always a *negative* effect → subtract it
      return Math.max(dmg - reduction, 0);
    };

    /* --------------------------------------------------------------------- */
    /* ---------- 1️⃣ Attack Roll (with critical checks) ------------------ */
    const attackRollD20 = rollDie(20);          // raw d20 value
    const weapon        = character.equipment.weapon;
    const attackAbilityKey  = weapon.test as keyof typeof character.abilities;
    const attackMod         = character.abilities[attackAbilityKey].modifier;

    /* ----- Critical fail – drop weapon ---------------------------------- */
    if (attackRollD20 === 1) {
      addLog("Critical miss! You dropped your weapon.");
      setCharacter(prev => ({
        ...prev,
        equipment: { ...prev.equipment, weapon: EMPTY_WEAPON }
      }));
      return;            // attack automatically fails
    }

    /* ----- Critical success – double damage & drop monster armor ------ */
    const isAttackCritSuccess = attackRollD20 === 20;
    if (isAttackCritSuccess) addLog("Critical hit! Double damage will be applied.");

    const attackRoll = attackRollD20 + attackMod;
    addLog(`Attack roll: ${attackRoll} (d20+${attackMod})`);

    /* ---- Monster agility & armor ---------------------------------------- */
    const monsterAgilityMod =
      monster.abilities?.["Agility"]?.modifier ?? 0;

    // Monster’s armor – defaults to zero if it doesn’t have one
    const monsterArmor = monster.equipment?.armor ?? { defenseDr: 0 };
    const hitThreshold = 10 + monsterAgilityMod - (monsterArmor.defenseDr || 0);

    /* ---- Does the attack land? ------------------------------------------- */
    if (attackRoll > hitThreshold) {
      let dmg = rollDamageFromWeapon(weapon);
      dmg = reduceDamage(dmg, monsterArmor);          // apply monster’s DR

      /* ----- Apply critical‑success multiplier ---------------------------- */
      if (isAttackCritSuccess) dmg *= 2;

      addLog(`You hit the monster for ${dmg} damage!`);

      /* --- mutate monster HP ------------------------------------------------ */
      monster.hp = Math.max((monster.hp ?? 0) - dmg, 0);

      /* ----- Drop monster armor on critical success ------------------------ */
      if (isAttackCritSuccess && monster.equipment?.armor) {
        addLog("Critical hit: Monster’s armor is dropped!");
        monster.equipment.armor = EMPTY_ARMOR;          // removed from game
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

    /* --------------------------------------------------------------------- */
    /* ---------- 2️⃣ Defense Roll (with critical checks) ----------------- */
    const defenseRollD20 = rollDie(20);            // raw d20 value
    const defenseRollRaw = defenseRollD20 + character.abilities["Agility"].modifier;

    // Player’s armor – subtract its defenseDr from the roll
    const charArmorDef = character.equipment.armor?.defenseDr ?? 0;
    const defenseRoll  = defenseRollRaw - charArmorDef;

    addLog(
      `Defense roll: ${defenseRoll} (d20+${character.abilities["Agility"].modifier}` +
        `${charArmorDef > 0 ? ` - ${charArmorDef}` : ""})`
    );

    /* ----- Monster’s attack bonus ---------------------------------------- */
    const monsterWeapon =
      monster.equipment?.weapon ?? { test: "Strength" };
    const monsterAttackAbilityKey =
      monsterWeapon.test as keyof typeof character.abilities;
    const monsterAttackMod =
      monster.abilities?.[monsterAttackAbilityKey]?.modifier ?? 0;

    /* ----- Critical fail – double damage & drop armor ------------------- */
    if (defenseRollD20 === 1) {
      addLog("Critical defense failure! Double damage will be applied.");
      // Drop player’s armor
      setCharacter(prev => ({
        ...prev,
        equipment: { ...prev.equipment, armor: EMPTY_ARMOR }
      }));
    }


    /* ----- Critical success – drop monster armor ------------------------ */
    if (isAttackCritSuccess && monster.equipment?.armor) {
      addLog("Critical hit: Monster’s armor is dropped!");
      monster.equipment.armor = EMPTY_ARMOR;          // removed from game
    }

    /* ----- Critical success – drop monster weapon ------------------------ */
    if (defenseRollD20 === 20) {
      addLog("Critical defense success! Monster’s weapon is dropped.");
      monster.equipment.weapon = EMPTY_WEAPON;          // removed from game
    }


    /* ---- Does the monster hit? ------------------------------------------- */
    if (defenseRoll <= 10 + monsterAttackMod) {
      let dmg = rollDamageFromWeapon(monsterWeapon);
      dmg = reduceDamage(dmg, character.equipment.armor);   // apply player’s DR

      /* ----- Apply critical‑fail multiplier ------------------------------ */
      if (defenseRollD20 === 1) dmg *= 2;

      addLog(`The monster hit you for ${dmg} damage!`);

      const newHp = Math.max(character.hp - dmg, 0);
      setCharacter(prev => ({ ...prev, hp: newHp }));
      if (newHp <= 0) {
        alert("This one died!");
        setIsDead(true);
      }
    } else {
      addLog("You dodged the monster’s attack!");
    }

    addLog("====================================");
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
            <button onClick={onClick} className="action-btn">
              Escape trap
            </button>
          )}

          {encounterType === "monster" && (
            <button onClick={fight} className="action-btn">
              Fight monster
            </button>
          )}
        </>
      )}

      {/* NEW: death‑recovery button */}
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
