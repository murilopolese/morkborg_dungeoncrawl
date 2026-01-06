// src/components/DungeonView.tsx
import React, { useCallback, useContext, useState } from "react";
import { DungeonContext } from "../contexts/DungeonContext";
import { GameLog } from "./GameLog";
import type { Character, EncounterType, Grid } from "../types";
import { CharacterContext } from "../contexts/CharacterContext";
import { initRandomCharacter } from "../utils/characterGenerator";
import { rollDie, applyDamageAndCheckDead, rollDamageFromWeapon, reduceDamage } from "../utils/combat";
import { EMPTY_WEAPON, EMPTY_ARMOR } from "../utils/inventory";

import './DungeonView.css';
import { getModifier } from "../utils/random";


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
    return `./assets/tiles/${bits}.png`;
  };

  // ---------------------------------------------------------------
//  Helpers – split out of the original huge fight() function
// ---------------------------------------------------------------
  /** Attack phase: rolls, hit‑check, damage, XP & level‑up. */
  const performAttackPhase = (
    monster: Character,
    character: Character
  ): boolean /* returns true if the monster is still alive */ => {
    const { weapon } = character.equipment;
    const attackRollD20 = rollDie(20);
    const attackMod = character.abilities[weapon.test as keyof typeof character.abilities].modifier;

    /** Critical miss – drop the weapon */
    if (attackRollD20 === 1) {
      addLog("Critical miss! You dropped your weapon.");
      addLog("====================================");
      setCharacter(
        (prev: Character) => ({
          ...prev,
          equipment: { ...prev.equipment, weapon: EMPTY_WEAPON }
        } as Character)
      );
      return true; // monster stays
    }

    const isCrit = attackRollD20 === 20;
    if (isCrit) addLog("Critical hit! Double damage will be applied.");

    const attackTotal = attackRollD20 + attackMod;
    addLog(`Attack roll: ${attackTotal} (d20+${attackMod})`);

    /* ----- Hit check ---------------------------------------------- */
    const monsterAgilityMod = monster.abilities?.["Agility"]?.modifier ?? 0;
    const monsterArmor = monster.equipment?.armor ?? { defenseDr: 0 };
    const hitThreshold = 10 + monsterAgilityMod - (monsterArmor.defenseDr || 0);

    if (attackTotal <= hitThreshold) {
      addLog("Your attack missed!");
      return true; // monster stays
    }

    /* ----- Damage calculation -------------------------------------- */
    let dmg = rollDamageFromWeapon(weapon);
    dmg = reduceDamage(dmg, monsterArmor);          // apply monster’s DR
    if (isCrit) dmg *= 2;
    addLog(`You hit the monster for ${dmg} damage!`);

    const { newHp: monsterNewHp } = applyDamageAndCheckDead( monster.hp ?? 0, dmg );
    monster.hp = monsterNewHp;

    /* ----- Critical hit – drop armor -------------------------------- */
    if (isCrit && monster.equipment?.armor) {
      addLog("Critical hit: Monster’s armor is dropped!");
      monster.equipment.armor = EMPTY_ARMOR;
    }

    /* ----- XP & level‑up ------------------------------------------- */
    //setCharacter((prev: any) => applyXpAndLevelUp(prev, dmg, addLog));

    /* ----- Update the grid (monster may have died) ----------------- */
    ctx.setGrid?.((prev: Grid) => {
      const newGrid = prev.map(r => r.map(t => ({ ...t })));
      if (monster.hp <= 0) {
        newGrid[ctx.player.row][ctx.player.col].encounter = { type: "none" };
      } else {
        newGrid[ctx.player.row][ctx.player.col].encounter!.description = JSON.stringify(monster);
      }
      return newGrid;
    });

    return monster.hp > 0; // true if monster still alive
  };

  /** XP handling & level‑up logic (called from performAttackPhase). */
  const applyXpAndLevelUp = (
    prev: Character,
    dmg: number
  ): Character => {
    const addedXp = dmg;
    const newXp = prev.xp + addedXp;
    let newLevel = prev.level;
    let newHp = prev.hp

    /* Compute final level after adding XP – handles multi‑level jumps. */
    while (newXp >= newLevel * 40) newLevel += 1;

    if (newLevel > prev.level) {
      addLog(`You leveled up to level ${newLevel}.`);
      newHp = prev.maxHp + rollDie(8)
      
      /* Roll for each ability; bump if the roll is higher. */
      const newAbilities: Record<string, any> = { ...prev.abilities };
      (["Strength", "Agility", "Presence", "Toughness"] as const).forEach(
        key => {
          const roll = rollDie(20);
          if (roll > newAbilities[key].value) {
            const newValue = newAbilities[key].value + 1
            const newMod = getModifier(newValue);
            newAbilities[key] = { value: newValue, modifier: newMod };
            addLog(`Your ${key} increased to ${newValue}.`);
          }
        }
      );
      
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        hp: newHp,
        maxHp: newHp,
        abilities: newAbilities
      };
    }

    /* No level‑up – just update XP. */
    return { ...prev, xp: newXp };
  };

  /** Defense phase: monster’s attack on the player. */
  const handleDefensePhase = (
    monster: Character,
    character: Character
  ): void => {
    const defenseRollD20 = rollDie(20);
    const defenseRaw = defenseRollD20 + character.abilities["Agility"].modifier;
    const charArmorDef = character.equipment.armor?.defenseDr ?? 0;
    const defenseRoll = defenseRaw - charArmorDef;

    addLog(
      `Defense roll: ${defenseRoll} (d20+${character.abilities["Agility"].modifier}` +
        `${charArmorDef > 0 ? ` - ${charArmorDef}` : ""})`
    );

    /* Monster’s attack bonus */
    const monsterWeapon = monster.equipment?.weapon ?? { test: "Strength" };
    const monsterAttackAbilityKey = monsterWeapon.test as keyof typeof character.abilities;
    const monsterAttackMod = monster.abilities?.[monsterAttackAbilityKey]?.modifier ?? 0;

    /* Critical defense failure – drop armor */
    if (defenseRollD20 === 1) {
      addLog("Critical defense failure! Double damage will be applied.");
      setCharacter((prev: any) => ({
        ...prev,
        equipment: { ...prev.equipment, armor: EMPTY_ARMOR }
      }));
    }

    /* Critical defense success – monster drops its weapon */
    if (defenseRollD20 === 20) {
      addLog("Critical defense success! Monster’s weapon is dropped.");
      monster.equipment.weapon = EMPTY_WEAPON;
      ctx.setGrid?.((prev: Grid) => {
        const newGrid = prev.map(r => r.map(t => ({ ...t })));
        newGrid[ctx.player.row][ctx.player.col].encounter!.description = JSON.stringify(monster);
        return newGrid;
      });
    }

    /* Does the monster hit? ---------------------------------------- */
    if (defenseRoll <= 10 + monsterAttackMod) {
      let dmg = rollDamageFromWeapon(monsterWeapon);
      if (defenseRollD20 === 1) dmg *= 2;
      dmg = reduceDamage(dmg, character.equipment.armor);

      /* NEW: shield absorption logic --------------------------------- */
      if (character.usingShield) {
        // Shield absorbs all damage and is removed
        setCharacter(prev => ({
          ...prev,
          equipment: { ...prev.equipment, shield: undefined }
        }));
        dmg = 0;                         // no damage taken
        addLog("Your shield absorbed the hit!");
      }

      addLog(`The monster hit you for ${dmg} damage!`);

      const { newHp: playerNewHp, dead } = applyDamageAndCheckDead(
        character.hp,
        dmg
      );

      setCharacter((prev: any) => ({ ...prev, hp: playerNewHp }));
      if (dead) {
        alert("This one died!");
        setIsDead(true);
      }
    } else {
      addLog("You dodged the monster’s attack!");
    }

    addLog("====================================");
  };

  // ---------------------------------------------------------------
  //  Updated fight() – now a thin orchestrator
  // ---------------------------------------------------------------
  const fight = (): void => {
    const { grid, player } = ctx;
    const currentTile = grid[player.row][player.col];
    const encounter   = currentTile?.encounter;

    if (!encounter || encounter.type !== "monster") return;

    let monster: Character = {} as Character;
    try {
      monster = encounter.description ? JSON.parse(encounter.description) : null;
    } catch (_) {
      // Ignore
      return
    }

    /* ---------- Attack phase --------------------------------------- */
    const isMonsterAlive = performAttackPhase(monster, character);

    /* ---------- Defense phase -------------------------------------- */
    handleDefensePhase(
      monster,
      character
    );

    if (!isMonsterAlive) {
      setCharacter(
        (prev: any) => applyXpAndLevelUp(prev, monster.maxHp)
      );
    }
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
    addLog("====================================");
  };


  /* ---------- determine what button(s) to show ---------- */
  const currentTile = grid[player.row][player.col];
  const encounterType: EncounterType = currentTile?.encounter?.type ?? "none";

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
            <button onClick={movePlayer} className="action-btn">
              Move to next room
            </button>
          )}

          {encounterType === "trap" && (
            <button onClick={escapeTrap} className="action-btn">
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
