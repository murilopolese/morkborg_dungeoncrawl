// src/utils/combat.ts
import type { Weapon, Armor } from "../types";
import type { Grid } from "../types";
import { EMPTY_WEAPON, EMPTY_ARMOR } from "../utils/inventory";

export const rollDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

export const parseDiceString = (
  dice: string
): { count: number; sides: number; bonus: number } => {
  const match = dice.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) throw new Error(`Invalid dice string: ${dice}`);
  const [, cnt, side, bon] = match;
  return { count: +cnt, sides: +side, bonus: bon ? +bon : 0 };
};

export const rollDamageFromWeapon = (weapon: Weapon): number => {
  const { count, sides, bonus } = parseDiceString(weapon.damage);
  let total = 0;
  for (let i = 0; i < count; i++) total += rollDie(sides);
  return total + bonus;
};

export const reduceDamage = (
  dmg: number,
  armor?: Armor
): number => {
  const redStr = armor?.dmgReduction;
  if (!redStr) return dmg;

  // let isNegative = false;
  let str = redStr.trim();
  if (str.startsWith("-")) {
    // isNegative = true;
    str = str.slice(1);
  }

  const { count, sides, bonus } = parseDiceString(str);
  let reduction = 0;
  for (let i = 0; i < count; i++) reduction += rollDie(sides);
  reduction += bonus;

  // armor’s dmgReduction is always a *negative* effect → subtract it
  return Math.max(dmg - reduction, 0);
};

/**
 * Apply damage to the target and check if the target dies.
 *
 * @param currentHp Current hit‑points of the target
 * @param dmg Damage that should be applied
 * @returns { newHp: number; dead: boolean }
 */
export const applyDamageAndCheckDead = (
  currentHp: number,
  dmg: number
): { newHp: number; dead: boolean } => {
  const newHp = Math.max(currentHp - dmg, 0);
  return { newHp, dead: newHp <= 0 };
};

/**
 * The entire fight routine.
 *
 * @param ctx          DungeonContext (only the parts we need)
 * @param charCtx      CharacterContext
 * @param addLog       callback to push a log entry
 */
export const fight = (
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
    setCharacter((prev: any) => ({
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

    const { newHp: playerNewHp } = applyDamageAndCheckDead(
      character.hp,
      dmg
    );
    setCharacter((prev : any) => ({ ...prev, hp: playerNewHp }));
  } else {
    addLog("You dodged the monster’s attack!");
  }

  addLog("====================================");
};

/**
 * Escape‑trap logic – called when the user clicks “Escape trap”.
 *
 * @param character     current character state
 * @param setCharacter  setter for CharacterContext
 * @param ctx           DungeonContext (only the parts we need)
 * @param addLog        callback to push a log entry
 */
export const escapeTrap = (
  character: any,
  setCharacter: React.Dispatch<any>,
  ctx: any,
  addLog: (msg: string) => void
): void => {
  const presenceMod = character.abilities["Presence"].modifier;
  const roll = rollDie(20) + presenceMod;

  addLog(`Presence check: ${roll} (d20+${presenceMod})`);
  if (roll >= 14) {
    addLog("You successfully escaped the trap!");
    // clear the encounter on this tile
    ctx.setGrid?.((prev: Grid) => {
      const newGrid = prev.map(r => r.map(t => ({ ...t })));
      newGrid[ctx.player.row][ctx.player.col].encounter = { type: "none" };
      return newGrid;
    });
  } else {
    // take 1d6 damage
    const dmg = rollDie(6);
    addLog(`You failed to escape! You take ${dmg} damage.`);

    const { newHp, dead } = (ctx as any).applyDamageAndCheckDead(
      character.hp,
      dmg
    );
    setCharacter((prev : any) => ({ ...prev, hp: newHp }));
    if (dead) {
      alert("This one died!");
      ctx.setIsDead?.(true);
    }
  }
};