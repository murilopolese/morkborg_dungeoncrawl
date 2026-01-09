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
import { getHighestAttribute } from "../utils/getHighestAttribute";


export const DungeonView: React.FC = () => {
  const ctx = useContext(DungeonContext);
  if (!ctx) throw new Error("DungeonView must be used inside DungeonProvider");
  const charCtx = useContext(CharacterContext)
  if (!charCtx) throw new Error("DungeonView must be used inside CharacterContext");

  const { grid, player, movePlayer, resetMap, quest } = ctx;
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

  /* ------------------------------------------------------------------
   Helper that updates the grid when a monster changes state.
------------------------------------------------------------------- */
  const setMonster = (monster: Character) => {
    ctx.setGrid?.((prev: Grid) => {
      const newGrid = prev.map(r => r.map(t => ({ ...t })));
      if (monster.hp <= 0) {
        newGrid[ctx.player.row][ctx.player.col].encounter = { type: "none" };
      } else {
        newGrid[ctx.player.row][ctx.player.col].encounter!.description =
          JSON.stringify(monster);
      }
      return newGrid;
    });
  };

  /* ------------------------------------------------------------------
    Attack phase – now returns the updated character & monster.
  ------------------------------------------------------------------- */
  const performAttackPhase = (
    monster: Character,
    character: Character
  ): { monster: Character; character: Character; alive: boolean } => {
    const localChar = { ...character };          // work on a copy
    const localMonster = { ...monster };

    /* --- weapon handling ------------------------------------------ */
    const { weapon } = localChar.equipment;
    const attackRollD20 = rollDie(20);
    const attackMod =
      localChar.abilities[weapon.test as keyof typeof localChar.abilities]
        .modifier;

    if (attackRollD20 === 1) {
      addLog("Critical miss! You dropped your weapon.");
      addLog("====================================");
      localChar.equipment.weapon = EMPTY_WEAPON;
    }

    const isCrit = attackRollD20 === 20;
    if (isCrit) addLog("Critical hit! Double damage will be applied.");

    const attackTotal = attackRollD20 + attackMod;
    addLog(`Attack roll: ${attackTotal} (d20+${attackMod})`);

    /* --- hit check ----------------------------------------------- */
    const monsterAgilityMod =
      localMonster.abilities?.["Agility"]?.modifier ?? 0;
    const monsterArmor = localMonster.equipment?.armor ?? { defenseDr: 0 };
    const hitThreshold =
      10 + monsterAgilityMod - (monsterArmor.defenseDr || 0);

    if (attackTotal <= hitThreshold) {
      addLog("Your attack missed!");
      setMonster(localMonster);          // nothing changed, but keep grid sync
      return { monster: localMonster, character: localChar, alive: true };
    }

    /* --- damage ----------------------------------------------- */
    let dmg = rollDamageFromWeapon(weapon);
    dmg = reduceDamage(dmg, monsterArmor);
    if (isCrit) dmg *= 2;
    addLog(`You hit the monster for ${dmg} damage!`);

    const { newHp: monsterNewHp } = applyDamageAndCheckDead(
      localMonster.hp ?? 0,
      dmg
    );
    localMonster.hp = monsterNewHp;

    if (isCrit && localMonster.equipment?.armor) {
      addLog("Critical hit: Monster’s armor is dropped!");
      localMonster.equipment.armor = EMPTY_ARMOR;
    }

    /* --- XP / level‑up ------------------------------------------ */
    //const updatedCharAfterXp = applyXpAndLevelUp(localChar, dmg); // returns new character

    setMonster(localMonster);

    return {
      monster: localMonster,
      character: localChar,
      alive: localMonster.hp > 0
    };
  };

  /* ------------------------------------------------------------------
    Defense phase – now returns the updated character.
  ------------------------------------------------------------------- */
  const handleDefensePhase = (
    monster: Character,
    character: Character
  ): Character => {
    const localChar = { ...character };          // work on a copy

    const defenseRollD20 = rollDie(20);
    const defenseRaw =
      defenseRollD20 + localChar.abilities["Agility"].modifier;
    const charArmorDef = localChar.equipment.armor?.defenseDr ?? 0;
    const defenseRoll = defenseRaw - charArmorDef;

    addLog(
      `Defense roll: ${defenseRoll} (d20+${localChar.abilities["Agility"].modifier}` +
        `${charArmorDef > 0 ? ` - ${charArmorDef}` : ""})`
    );

    /* --- monster attack bonus ------------------------------------ */
    const monsterWeapon = monster.equipment?.weapon ?? { test: "Strength" };
    const monsterAttackAbilityKey =
      monsterWeapon.test as keyof typeof localChar.abilities;
    const monsterAttackMod =
      monster.abilities?.[monsterAttackAbilityKey]?.modifier ?? 0;

    /* --- critical defence ---------------------------------------- */
    if (defenseRollD20 === 1) {
      addLog("Critical defense failure! Double damage will be applied.");
      localChar.equipment.armor = EMPTY_ARMOR;
    }
    if (defenseRollD20 === 20) {
      addLog("Critical defense success! Monster’s weapon is dropped.");
      monster.equipment.weapon = EMPTY_WEAPON;
      setMonster(monster);
    }

    /* --- hit check ----------------------------------------------- */
    if (defenseRoll <= 10 + monsterAttackMod) {
      let dmg = rollDamageFromWeapon(monsterWeapon);
      if (defenseRollD20 === 1) dmg *= 2;
      dmg = reduceDamage(dmg, localChar.equipment.armor);

      /* shield absorption ---------------------------------------- */
      if (localChar.usingShield) {
        localChar.equipment.shield = undefined; // removed after use
        localChar.usingShield = false
        dmg = 0;
        addLog("Your shield absorbed the hit!");
      }

      addLog(`The monster hit you for ${dmg} damage!`);

      const { newHp: playerNewHp, dead } = applyDamageAndCheckDead(
        localChar.hp,
        dmg
      );
      localChar.hp = playerNewHp;
      if (dead) {
        alert("This one died!");
        setIsDead(true);
      }
    } else {
      addLog("You dodged the monster’s attack!");
    }

    addLog("====================================");
    return localChar;
  };

// ------------------------------------------------------------------
//  Fight orchestrator – guarantees at least one side takes damage per round
// ------------------------------------------------------------------
const fight = (): void => {
  const { grid, player } = ctx;
  const currentTile = grid[player.row][player.col];
  const encounter = currentTile?.encounter;

  if (!encounter || encounter.type !== "monster") return;

  // Parse the monster that lives in this tile
  let monster: Character | null =
    encounter.description ? JSON.parse(encounter.description) : null;
  if (!monster) return;

  /* ------------------------------------------------------------------
     Working copies of the character & monster so we can keep looping.
  ------------------------------------------------------------------ */
  let curChar = { ...character };
  let curMon  = { ...monster };

  const maxAttempts = 20;          // safety guard – never loop forever
  let attempts = 0;

  while (attempts < maxAttempts) {
    /* ---- capture pre‑round state --------------------------------- */
    const prevMonHp     = curMon.hp ?? 0;
    const prevCharHp    = curChar.hp;
    const prevMonEquip  = JSON.stringify(curMon.equipment);
    const prevCharEquip = JSON.stringify(curChar.equipment);

    /* ---- Attack phase ------------------------------------------------ */
    const {
      monster: afterAttack,
      character: charAfterAttack,
      alive
    } = performAttackPhase(curMon, curChar);

    /* ---- Defense phase – only if the monster survived ---------- */
    let updatedChar: Character;
    if (alive) {
      updatedChar = handleDefensePhase(afterAttack, charAfterAttack);
    } else {
      // Monster died in the attack phase – no defense needed
      updatedChar = charAfterAttack;
    }

    /* ---- prepare for next iteration ----------------------------- */
    curMon  = afterAttack;
    curChar = updatedChar;

    /* ---- Did something happen? ----------------------------------- */
    const monDamaged        = (curMon.hp ?? 0) < prevMonHp;
    const charDamaged       = curChar.hp < prevCharHp;
    const monEquipChanged   = JSON.stringify(curMon.equipment) !== prevMonEquip;
    const charEquipChanged  = JSON.stringify(curChar.equipment) !== prevCharEquip;

    if (!alive || monDamaged || charDamaged || monEquipChanged || charEquipChanged) {
      // At least one side took damage / dropped equipment / monster died
      break;
    }

    attempts++;   // nothing changed – retry a new round
  }

  /* ------------------------------------------------------------------
     Final XP/level‑up (only if the monster is dead after all rounds)
  ------------------------------------------------------------------ */
  let finalCharacter = curChar;
  const monsterAlive = curMon.hp! > 0;

  if (!monsterAlive) {
    // The amount of damage you dealt during the fight is stored in
    // `curMon.maxHp` – this matches the original (commented‑out) logic.
    finalCharacter = applyXpAndLevelUp(curChar, curMon.maxHp);
  }

  /* ------------------------------------------------------------------
     Persist all changes: update character state and sync the grid
  ------------------------------------------------------------------ */
  setCharacter(finalCharacter);
  setMonster(curMon);   // clears the encounter if hp <= 0
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
      <h2>{quest.dungeonName} (floor {ctx.level})</h2>
      <p>
        A series of questionable decisions brought you here at: {quest.dungeonName}. It's a {quest.weather} weather {quest.location}.
        Since you talked with that {quest.contact} about the {quest.occultTreasure} you feel possessed. 
        You can't look back, all you can do is choose what you'll have in hands when you get to get to the bottom of it.
        People once called you {character.name} and you were known for your {getHighestAttribute(character).join('/')}.
        To get through what's on your path you use {character.equipment.weapon.damage == '1d2' ? 'your bare hands' : `a ${character.equipment.weapon.name}`} and
        to protect yourself you have {character.equipment.armor.tier == 0 ? 'barely any clothes' : `a ${character.equipment.armor.name} armor`}.

      </p>
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
            ctx.setLevel?.(1);
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
