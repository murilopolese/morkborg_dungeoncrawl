import { useEffect, useRef, useState } from 'react';

// Helpers
function randomArray(arr: any[]): any {
  return arr[Math.floor(Math.random()*(arr.length))]
}
function random(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}
function calculateModifier(value: number): number {
  if (value < 5) return -3
  if (value < 7) return -2
  if (value < 9) return -1
  if (value < 13) return 0
  if (value < 15) return 1
  if (value < 17) return 2
  return 3
}
function getRandomId(): string {
  return crypto.randomUUID()
}

// Tables
const NAMES : string[] = ["Aerg-Tval","Agn","Arvant","Belsum","Belum","Brint","Bhorda","Daeru","Eldar","Felban","Gotven","Graft","Grin","Grittr","Haerhu","Hargha","Harmug","Jotna","Karg","Karva","Katla","Keftar","Klort","Kratar","Kutz","Kvetin","Lygan","Margar","Merkari","Nagl","Niduk","Nifehl","Prhugl","Qillnach","Risten","Svind","Theras","Therg","Torvul","Thorn","Urm","Urvarg","Vagal","Vatan","Von","Vrakh","Vresi","Wemut"]
const WEAPON : WeaponType[] = [
  { name: "Femur", damage: 4 },
  { name: "Staff", damage: 4 },
  { name: "Shortsword", damage: 4 },
  { name: "Knife", damage: 4 },
  { name: "Warhammer", damage: 6 },
  { name: "Sword", damage: 6 },
  { name: "Bow", damage: 6, ammo: 30 },
  { name: "Flail", damage: 8 },
  { name: "Crossbow", damage: 8, ammo: 30 },
  { name: "Zweihander", damage: 10 },
]
const ARMOR: ArmorType[] = [
  // { name: "No armor", tier: 0, penalty: 0, wear: 0 },
  { name: "Light armor", tier: 1 },
  { name: "Medium armor", tier: 2 },
  { name: "Heavy armor", tier: 3 },
]
const BERSERKER_WEAPON: WeaponType[] = [
  { name: "Long flail", damage: 8 },
  { name: "Heavy mace", damage: 6 },
  { name: "Chained sword", damage: 6 },
  { name: "Huge warhammer", damage: 10 }
]

const CREATURES: CreatureType[] = [
  {
    name: "Goblin",
    morale: 7,
    hp: 6,
    armor: { name: "Ropy skin", tier: 1 },
    attacks: [{ name: "Knife", damage: 4 } as Weapon],
    dr: 14,
    extra: [{ name: "Curse", value: 15, dr: 12, effect: "death" }]
  },
  {
    name: "Scum",
    morale: 8,
    hp: 7,
    armor: { name: "No armor", tier: 0 },
    attacks: [{ name: "Poisoned knife", damage: 4 }],
    dr: 12,
    extra: [{ name: "Poison", value: 4, dr: 10, effect: "damage" }]
  },
  {
    name: "Berserker",
    morale: 9,
    hp: 13,
    armor: { name: "Hardened skin", tier: 1 },
    attacks: [randomArray(BERSERKER_WEAPON), randomArray(BERSERKER_WEAPON)],
    dr: 10
  }
]

const TILES: Record<string, string> = {
  '1000': `x..x
           x..x
           x..x
           xxxx`,

  '0100': `xxxx
           x...
           x...
           xxxx`,

  '0010': `xxxx
           x..x
           x..x
           x..x`,

  '0001': `xxxx
           ...x
           ...x
           xxxx`,

 '1010': `x..x
          x..x
          x..x
          x..x`,

 '0101': `xxxx
          ....
          ....
          xxxx`,

  '1100': `x..x
           x...
           x...
           xxxx`,

  '0110': `xxxx
           x...
           x...
           x..x`,

  '0011': `xxxx
           ...x
           ...x
           x..x`,

  '1001': `x..x
           ...x
           ...x
           xxxx`,

}

// Types
type WeaponType = {
  name: string,
  damage: number,
  ammo?: number|undefined
}
class Weapon {
  readonly id: string = getRandomId()
  readonly type: string = 'weapon'
  name: string
  damage: number
  ammo?: number|undefined
  constructor({ name, damage, ammo }: WeaponType) {
    this.name = name
    this.damage = damage
    this.ammo = ammo

  }
  rollDamage(): number {
    return random(1, this.damage)
  }
}

type ArmorType = {
  name: string,
  tier: number
}
class Armor {
  readonly id: string = getRandomId()
  readonly type: string = 'armor'
  name: string
  tier: number
  penalty: number
  wear: number
  constructor({ name, tier }: ArmorType) {
    this.id = getRandomId()
    this.name = name
    this.tier = tier
    this.wear = 0
    this.penalty = Math.max(this.tier-1, 0)*2
  }
}

type ShieldType = {
  name: string,
  protection: number
}
class Shield {
  readonly id: string = getRandomId()
  readonly type: string = 'shield'
  name: string
  protection: number
  constructor({ name, protection }: ShieldType) {
    this.name = name
    this.protection = protection
  }
}

type HealingType = {
  name: string,
  cure: number,
  quantity: number
}
class Healing {
  readonly id: string = getRandomId()
  readonly type: string = 'healing'
  name: string
  cure: number
  quantity: number
  constructor({ name, cure, quantity }: HealingType) {
    this.name = name
    this.cure = cure
    this.quantity = quantity
  }
  rollHealing(): number {
    this.quantity -= 1
    return random(1, this.cure)
  }
}

type ItemType = {
  name: string,
  price?: number
}
class Item {
  readonly id: string = getRandomId()
  readonly type: string = 'item'
  name: string
  price: number|undefined
  constructor({ name, price }: ItemType) {
    this.name = name
    this.price = price
  }
}

type PoisonType = {
  name: string,
  dr: number,
  effect: string, // freeze, death, penalty, damage
  value: number
}
class Poison {
  readonly id: string = getRandomId()
  readonly type: string = 'poison'
  name: string
  dr: number
  effect: string
  value: number
  constructor({ name, dr, effect, value }: PoisonType) {
    this.name = name
    this.dr = dr
    this.effect = effect
    this.value = value
  }
  rollEffect(modifier: number) {
    switch(this.effect) {
      case 'penalty':
        return 0
      case 'freeze':
        if (this.value > 0) {
          this.value -= 1
        }
        return 0
      case 'death':
        if (this.value <= 0) {
          return 666
        } else {
          this.value -= 1
          return 0
        }
      case 'damage':
      default:
        const roll = random(1, 20)
        if ((roll+modifier) < this.dr) {
          return random(1, this.value)
        } else {
          return 0
        }
    }

  }
}

type Equipment = Weapon|Armor|Shield|Poison|Healing|Item|undefined

type Tile = {
  up: boolean,
  down: boolean,
  left: boolean,
  right: boolean
}

const EQUIP1: any[] = [
  new Healing({ name: "Medicine Chest", quantity: 4, cure: 6 }),
  new Healing({ name: "Herbal Potion", quantity: 4, cure: 6 }),
  new Healing({ name: "Life Elixir", cure: 6, quantity: 4 }),
  new Healing({ name: "Breath in Vapor", cure: 6, quantity: 4 }),
  new Healing({ name: "Herbal Decoction", cure: 4, quantity: 8 }),
  new Weapon({ name: "Bomb", damage: 10, ammo: 5 }),
  new Weapon({ name: "Molotov", damage: 5, ammo: 5 }),
  new Shield({ name: "Small Shield", protection: 1 }),
  new Shield({ name: "Medium Shield", protection: 2 }),
  new Shield({ name: "Big Shield", protection: 3 }),
  ...WEAPON.map(w => new Weapon(w)),
  ...ARMOR.map(a => new Armor(a))
]

class Character {
  readonly id: string = getRandomId()
  name: string
  level: number
  xp: number
  strength: number
  agility: number
  toughness: number
  presence: number
  hp: number
  maxHp: number
  equipment: Equipment[]
  silver: number
  infections: Poison[]
  armor: string|undefined
  weapon: string|undefined
  shield: string|undefined

  constructor() {
    this.name = `${randomArray(NAMES)} ${randomArray(NAMES)}`
    this.level = 1
    this.xp = 0
    this.strength = random(8, 18)
    this.agility = random(8, 18)
    this.toughness = random(8, 18)
    this.presence = random(8, 18)
    this.maxHp = random(1, 8) + this.toughness
    this.hp = this.maxHp

    const armor = new Armor(randomArray(ARMOR))
    const weapon = new Weapon(randomArray(WEAPON))
    const shield = new Shield({ name: "Small Shield", protection: 1 })
    this.armor = armor.id
    this.weapon = weapon.id
    this.shield = shield.id

    this.equipment = [
      armor,
      weapon,
      new Weapon(randomArray(WEAPON)),
      new Weapon({ name: "Bare hands", damage: 2 }),
    ]
    for (let i = 0; i < 3; i++) {
      let item = {...randomArray(EQUIP1)}
      item.id = getRandomId()
      this.equipment.push(item)
    }

    this.silver = random(20, 120)
    this.infections = []
  }
}

function getArmor(character: Character) {
  return character.equipment.find((e: Equipment) => e?.id === character.armor)
}
function getWeapon(character: Character) {
  return character.equipment.find((e: Equipment) => e?.id === character.weapon)
}

type CreatureType = {
  name: string,
  morale: number,
  hp: number,
  armor: ArmorType,
  attacks: WeaponType[],
  dr: number
  extra?: PoisonType[]|undefined
}
class Creature {
  readonly id: string = getRandomId()
  name: string
  type: string
  morale: number
  hp: number
  maxHp: number
  armor: Armor
  attacks: Weapon[]
  dr: number
  extra: Poison[]
  constructor({ name, morale, hp, armor, attacks, dr, extra }: CreatureType) {
    this.name = `${randomArray(NAMES)}, the ${name}`
    this.type = name
    this.morale = morale
    this.hp = hp
    this.maxHp = hp
    this.armor = new Armor(armor)
    this.attacks = attacks.map(a => new Weapon(a))
    this.dr = dr
    if (extra) {
      this.extra = extra.map(e => new Poison(e))
    } else {
      this.extra = []
    }
  }
}
type Position = {
  x: number,
  y: number
}
type GameState = {
  win: boolean,
  turns: any[],
  character: Character,
  enemy: Creature,
  map: Tile[][],
  position: Position
}

const emptyTile = { up: false, left: false, down: false, right: false }
let initialMap: Tile[][] = []
for (let y = 0; y < 4; y++) {
  initialMap.push([])
  for (let x = 0; x < 3; x++) {
    initialMap[y][x] = { ...emptyTile }
  }
}

function getNeighbors(state: GameState): Position[] {
  const { position, map } = state
  // Check what tiles around are totally empty (available to jump in)
  const tileUp: Tile|null = map[position.y-1]?map[position.y-1][position.x]:null
  const tileDown: Tile|null = map[position.y+1]?map[position.y+1][position.x]:null
  const tileLeft: Tile|null = map[position.y]?map[position.y][position.x-1]:null
  const tileRight: Tile|null = map[position.y]?map[position.y][position.x+1]:null

  const result: Position[] = []
  if (tileUp != null && !tileUp.up && !tileUp.down && !tileUp.right && !tileUp.left ) {
    result.push({ x: position.x, y: position.y-1 })
  }
  if (tileDown != null && !tileDown.up && !tileDown.down && !tileDown.right && !tileDown.left ) {
    result.push({ x: position.x, y: position.y+1 })
  }
  if (tileLeft != null && !tileLeft.up && !tileLeft.down && !tileLeft.right && !tileLeft.left ) {
    result.push({ x: position.x-1, y: position.y })
  }
  if (tileRight != null && !tileRight.up && !tileRight.down && !tileRight.right && !tileRight.left ) {
    result.push({ x: position.x+1, y: position.y })
  }

  return result
}


const gameState: GameState = {
  win: false,
  turns: [],
  character: new Character(),
  enemy: new Creature(randomArray(CREATURES)),
  map: [...initialMap],
  position: { x: random(0, 2), y: random(0, 3) }
}

switch(random(0, 3)) {
  case 0:
    gameState.map[gameState.position.y][gameState.position.x].up = true
  break;
  case 1:
    gameState.map[gameState.position.y][gameState.position.x].down = true
  break;
  case 2:
    gameState.map[gameState.position.y][gameState.position.x].left = true
  break;
  case 3:
    gameState.map[gameState.position.y][gameState.position.x].right = true
  break;
}

function attack(state: GameState): GameState {
  const newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  const e: Creature = newState.enemy

  let equipedWeapon = getWeapon(c)

  // If there is no equiped weapon, resort to bare hands, if you can
  if (!equipedWeapon) {
    const bareHands = c.equipment.find(e => e?.name == "Bare hands") as Equipment
    if (bareHands) {
      c.weapon = bareHands.id
    }
  }

  // Get the weapon object
  const weapon: Weapon = equipedWeapon as Weapon
  turn.push([1,' attacking with', weapon?.name])
  let attackModifier = calculateModifier(c.strength)
  // Check if weapon has ammo
  if (weapon && weapon.ammo != undefined) {
    if (weapon.ammo < 1) {
      turn.push([1,' No more ammo!'])
      return newState
    }
    // use presence modifier for attack
    attackModifier = calculateModifier(c.presence)
    // consume ammo
    weapon.ammo -= 1
  }

  const attackRoll = random(1, 20)
  turn.push([0,' attack roll', attackRoll, 'modifier', attackModifier, 'dr', e.dr])
  if (attackRoll == 1) {
    turn.push([1,' attack fumbled'])
    // Drop current weapon
    if (equipedWeapon) {
      c.weapon = undefined
      const bareHands = c.equipment.find(e => e?.name == "Bare hands")
      if (bareHands) {
        c.weapon = bareHands.id
      }
    }
  } else {
    // Check roll against enemy dr
    if (attackRoll + attackModifier >= e.dr) {
      turn.push([0,' attacked succeeded'])
      let damage = random(1, weapon.damage)
      turn.push([0,' damage roll', damage])
      if (attackRoll == 20) {
        turn.push([1,' critical!'])
        damage *= 2
        turn.push([0,' doubles damage!', damage])
        e.armor.tier = Math.max(0, e.armor.tier-1)
        turn.push([0,' wears 1 tier from enemy armor'])
      }
      let armorRoll = 0
      if (e.armor.tier) {
        armorRoll = random(1, e.armor.tier*2)
      }
      turn.push([0,' enemy armor roll', armorRoll])
      damage = Math.max(0, damage - armorRoll)
      turn.push([1,' enemy taking', damage, 'damage'])
      e.hp -= damage
      c.xp += damage * 10
    } else {
      turn.push([1,' attack failed'])
    }
  }
  newState.turns.push(turn)
  newState.character = c
  newState.enemy = e
  return newState
}

function defense(state: GameState): GameState {
  const newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  const e: Creature = newState.enemy
  e.attacks.forEach((weapon: Weapon) => {
    turn.push([1,' defending against weapon', weapon.name])
    const defenseRoll = random(1, 20)
    const equipedArmor = getArmor(c)
    const armor = equipedArmor as Armor
    let penalty = 0
    const agiMod = calculateModifier(c.agility)
    if (armor) penalty = armor.penalty
    turn.push([0,' defense roll', defenseRoll, 'mod', agiMod, 'penalty', penalty, 'dc', 12])
    if ( (defenseRoll + agiMod - penalty) < 12 ) {
      turn.push([1,' defense failed'])
      let damage = random(1, weapon.damage)
      turn.push([0,' damage roll', damage])
      if (defenseRoll == 1) {
        turn.push([1,' enemy critical'])
        damage *= 2
        turn.push([0,' doubles the damage to', damage])
        armor.tier = Math.max(0, armor.tier-1)
        turn.push([0,' wearing character armor tier 1'])
      }
      let armorRoll = 0
      if (armor?.tier) {
        armorRoll = random(1, armor.tier*2)
      }
      turn.push([0,' armor roll', armorRoll])
      damage = Math.max(0, damage - armorRoll)
      c.hp -= damage
      turn.push([1,' taking', damage, 'damage'])
      if (damage > 0 && e.extra.length > 0) {
        // Check for poison and curses
        e.extra.forEach((poison) => {
          turn.push([0,' resisting poison', poison.name])
          const currentInfection = c.infections.find(i => i.id == poison.id)
          if (!currentInfection) {
            const toughRoll = random(1, 20) + calculateModifier(c.toughness)
            turn.push([0,' roll to resist', poison.name, 'dr', poison.dr, 'rolled', toughRoll])
            if (toughRoll < poison.dr) {
              turn.push([1,' got infected by', poison.name])
              c.infections.push(structuredClone(poison))
            } else {
              turn.push([0,' resisted', poison.name])
            }
          } else {
            turn.push([0,' already infected', poison.name])
          }
        })
      }
    } else {
      turn.push([1,' defense succeded'])
      if (defenseRoll == 20) {
        turn.push([1,' defense critical!'])
        e.attacks = [ new Weapon({ name: "Bare hands", damage: 2 }) ]
      }
    }
  })
  newState.turns.push(turn)
  newState.character = c
  newState.enemy = e
  return newState
}

function equip(state: GameState, item: any): GameState {
  console.log('equip')
  let newState: GameState = {...state}
  const turn: any[][] = []
  const c: Character = newState.character
  if (item.type == "weapon") c.weapon = item.id
  if (item.type == "armor") c.armor = item.id
  turn.push([0,' equipping', item.name])
  newState.turns.push(turn)
  newState.character = c
  return newState
}

function unequip(state: GameState, item: any): GameState {
  let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  if (item.type == "weapon") c.weapon = undefined
  if (item.type == "armor") c.armor = undefined
  turn.push([0,' dropping', item.name])
  newState.turns.push(turn)
  newState.character = c
  return newState
}

function useHealing(state: GameState, item: Healing): GameState {
  let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  turn.push([0,' use Healing'])
  const healRoll = random(1, item.cure)
  turn.push([1,' healing', healRoll])
  c.hp = Math.min(c.maxHp, c.hp + healRoll)
  const healingItem = (c.equipment.find(e => e?.id == item.id)) as Healing
  healingItem.quantity -= 1
  newState.turns.push(turn)
  // TODO: Remove infection
  c.infections.pop()
  newState.character = c
  return newState
}

function takeInfectionDamage(state: GameState): GameState {
  const newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  if (c.infections.length > 0) {
    c.infections.forEach(poison => {
      if (poison.effect == 'damage') {
        turn.push([0,' resisting damage from', poison.name])
        const toughRoll = random(1, 20) + calculateModifier(c.toughness)
        turn.push([0,' toughness roll', toughRoll, 'DR', poison.dr])
        if (toughRoll <= poison.dr) {
          let damage = random(1, poison.value)
          turn.push([1,' taking', damage, 'damage from', poison.name])
          c.hp -= damage
        } else {
          turn.push([0,' resisted', poison.name])
        }
      }

      if (poison.effect == 'death') {
        if (poison.value > 0) {
          turn.push([0, poison.value, 'turns left before death by', poison.name])
          poison.value -= 1
        } else {
          turn.push([1,' death by', poison.name])
          c.hp = 0
        }
      }

    });
    newState.character = c
    newState.turns.push(turn)
  }
  return newState
}

function dealWithEnemyDead(state: GameState): GameState {
  let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  let character: Character = newState.character
  if (newState.enemy.hp < 1) {
    turn.push([1, newState.enemy.name, 'is dead'])
    const healRoll = random(1, 6)
    character.hp = Math.min(character.maxHp, character.hp + healRoll)
    turn.push([1,' you catch your breath and heal', healRoll])
    const silverRoll = random(2, 12)
    turn.push([1,' you find', silverRoll, 'silver'])
    const requiredXP = 200*character.level
    if (character.xp >= requiredXP) {
      newState = levelUp(newState)
      character = newState.character
    } else {
      turn.push([0,' you have some xp', character.xp, 'but you need at least', requiredXP])
    }
    for (let i = 0; i < random(1, 3); i++) {
      let item = {...randomArray(EQUIP1)}
      item.id = getRandomId()
      character.equipment.push(item)
      turn.push([1,' getting item', item.name])
    }
    newState.character = character

    newState = moveCharacter(newState)

    if (!newState.win) {
      newState.enemy = new Creature(randomArray(CREATURES))
      turn.push([1, newState.enemy.name, 'rises'])
      newState.turns.push(turn)
    }

  }
  return newState
}

function moveCharacter(state: GameState): GameState {
  const newState = { ...state }
  const neighbors = getNeighbors(newState)
  if (neighbors.length > 0 ) {
    const selected: Position = randomArray(neighbors)
    let direction: string|null = null
    if (selected.x > newState.position.x) {
      direction = 'right'
      newState.map[selected.y][selected.x].left = true
    }
    if (selected.x < newState.position.x) {
      direction = 'left'
      newState.map[selected.y][selected.x].right = true
    }
    if (selected.y > newState.position.y) {
      direction = 'down'
      newState.map[selected.y][selected.x].up = true
    }
    if (selected.y < newState.position.y) {
      direction = 'up'
      newState.map[selected.y][selected.x].down = true
    }
    if (direction != null) {
      switch(direction) {
        case 'up':
          newState.map[newState.position.y][newState.position.x].up = true
          break
        case 'down':
          newState.map[newState.position.y][newState.position.x].down = true
          break
        case 'left':
          newState.map[newState.position.y][newState.position.x].left = true
          break
        case 'right':
          newState.map[newState.position.y][newState.position.x].right = true
          break
      }
      newState.position = selected
    }
  } else {
    newState.win = true
  }
  return newState
}

function getTile(tile: Tile): string {
  let tileString: string = ''
  tileString += tile.up ? '1' : '0'
  tileString += tile.right ? '1' : '0'
  tileString += tile.down ? '1' : '0'
  tileString += tile.left ? '1' : '0'
  if (TILES[tileString]) {
    return TILES[tileString]
  }
  return ''
}

function levelUp(state: GameState): GameState {
  let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const character: Character = structuredClone(newState.character)

  turn.push([1,' you level up'])
  character.level += 1
  character.xp = 0

  const hpRoll = random(6, 60)
  if (hpRoll >= character.maxHp) {
    const hpUpgrade = random(1, 6)
    character.maxHp += hpUpgrade
    character.hp = character.maxHp
    turn.push([1,' getting more hp', hpUpgrade])
  }

  const strengthRoll = random(1, 20)
  if (strengthRoll >= character.strength) {
    character.strength += 1
    turn.push([1,' getting strength'])
  }

  const agilityRoll = random(1, 20)
  if (agilityRoll >= character.agility) {
    character.agility += 1
    turn.push([1,' getting agility'])
  }

  const presenceRoll = random(1, 20)
  if (presenceRoll >= character.presence) {
    character.presence += 1
    turn.push([1,' getting presence'])
  }

  const toughnessRoll = random(1, 20)
  if (toughnessRoll >= character.toughness) {
    character.toughness += 1
    turn.push([1,' getting toughness'])
  }

  for (let i = 0; i < 3; i++) {
    let item = {...randomArray(EQUIP1)}
    item.id = getRandomId()
    character.equipment.push(item)
    turn.push([1,' getting item', item.name])
  }

  newState.character = character
  newState.turns.push(turn)
  return newState

}

function dealWithCharacterDeath(state: GameState): GameState {
let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const character: Character = newState.character

  if (character.hp < 1) {
    turn.push([1, character.name, 'is dead'])
    // turn.push([1,' level', character.level, 'xp', character.xp, 'max hp', character.maxHp])
    // console.log(character)
    // newState.character = new Character()
    // turn.push([newState.character.name, 'rises'])
    newState.turns.push(turn)
  }

  return newState
}

const AlwaysScrollToBottom = () => {
  const elementRef = useRef<HTMLDivElement|null>(null)
  useEffect(() => elementRef?.current?.scrollIntoView());
  return <div ref={elementRef} />;
}

type VerticalBarArg = {
  value: number
}
function VerticalBar(args: VerticalBarArg) {
  const { value } = args
  const bodyStyle: Record<string, string> = {
    "minWidth": '1em',
    "width": '100%',
    "height": '100%',
    "position": 'relative',
    "background": 'grey'
  }
  const markStyle: Record<string, string> = {
    "width": '100%',
    "height": `${Math.max(0, value)}%`,
    "position": 'absolute',
    "bottom": '0',
    "background": 'yellow'
  }
  return (
    <div style={bodyStyle}>
      <div style={markStyle}></div>
    </div>
  )
}

type ValueDisplayArg = {
  number: number|string,
  label: string
}
function ValueDisplay(args: ValueDisplayArg) {
  const { label, number } = args
  return (
    <div className="fw fh tc">
      <div>
        {label?<><span className="f05">{label}:</span><br/></>:null}
      </div>
      <div>
        {number}
      </div>
    </div>
  )
}

type InfectionDisplayArg = {
  infection: Poison
}
function InfectionDisplay(args: InfectionDisplayArg) {
  const { infection } = args
  return (
    <div className="tc">
      <div>
        {infection.effect}
      </div>
      <div>
        {infection.value}
      </div>
    </div>
  )
}

type HorizontalBarArg = {
  value: number
}
function HorizontalBar(args: HorizontalBarArg) {
  const { value } = args
  const bodyStyle: Record<string, string> = {
    "position": 'relative',
    "background": 'grey',
    "display": 'block'
  }
  const markStyle: Record<string, string> = {
    "height": '100%',
    "width": `${value}%`,
    "position": 'absolute',
    "left": '0',
    "background": 'yellow',
    "display": 'block'
  }
  return (
    <div className="fw fh" style={bodyStyle}>
      <div style={markStyle}></div>
    </div>
  )
}

function App() {
  const [ state, setState ] = useState(gameState)
  const { character, enemy, turns, win } = state

  const weapon: Weapon = getWeapon(character) as Weapon
  const armor: Armor = getArmor(character) as Armor

  function handleAttack() {
    if (state.win) return
    let newState = takeInfectionDamage(state)
    newState = attack(newState)
    if (!newState.win) {
      newState = defense(newState)
    }
    newState = dealWithEnemyDead(newState)
    newState = dealWithCharacterDeath(newState)
    setState(newState)
  }

  function handleEquip(item: any): () => undefined {
    return () => {
      let newState = equip(state, item)
      if (!newState.win) {
        newState = defense(newState)
      }
      newState = dealWithCharacterDeath(newState)
      setState(newState)
    }
  }

  function handleUnequip(item: any): () => undefined {
    return () => {
      let newState = unequip(state, item)
      if (!newState.win) {
        newState = defense(newState)
      }
      newState = dealWithCharacterDeath(newState)
      setState(newState)
    }
  }

  function handleHealing(item: Healing): () => undefined {
    return () => {
      let newState = useHealing(state, item)
      if (!newState.win) {
        newState = defense(newState)
      }
      newState = dealWithCharacterDeath(newState)
      setState(newState)
    }
  }

  const dead = character.hp < 1

  return (
    <>
      <div className="row fw fh">

        <div className="character col fw fh p1">
            <div className="col fw character-lore tc">
              <h2>{character.name}</h2>
            </div>

            <div className="row character-attributes">
              <div className="col fw border"><ValueDisplay number={character.strength} label="STR" /></div>
              <div className="col fw border"><ValueDisplay number={character.agility} label="AGI" /></div>
              <div className="col fw border"><ValueDisplay number={character.presence} label="PRE" /></div>
              <div className="col fw border"><ValueDisplay number={character.toughness} label="THO" /></div>
            </div>

            <div className="row character-modifiers">
              <div className="col fw border"><ValueDisplay number={calculateModifier(character.strength)} label="mod" /></div>
              <div className="col fw border"><ValueDisplay number={calculateModifier(character.agility)} label="mod" /></div>
              <div className="col fw border"><ValueDisplay number={calculateModifier(character.presence)} label="mod" /></div>
              <div className="col fw border"><ValueDisplay number={calculateModifier(character.toughness)} label="mod" /></div>
            </div>

            <div className="row character-infections">
              <div className="col border fw fh p05">HP: {character.hp}</div>
              <div className="col border fw fh p05">Silver: {character.silver}</div>
            </div>

            <div className="row character-infections p05 border f075">
              <div className="col">Inf:</div>
              {state.character.infections.map((i: Poison, j: number) => <div key={j} className="col fw"><InfectionDisplay infection={i} /></div>)}
            </div>

            <div className="col character-weapon p025 border f075">
              <div>Weapon: {weapon?.name} {weapon?.ammo} (1d{weapon?.damage})</div>
            </div>

            <div className="col character-armor p025 border f075">
              <div>Armor: {armor?.name} ({armor?.tier})</div>
            </div>

            <div className="row character-equipment p025 fh scroll-y border">
              <div className="col g025">
                {character.equipment.map((e: Equipment, i:number) => {
                  switch (e?.type) {
                    case 'weapon':
                    e = e as Weapon
                    if (e?.id == character.weapon) {
                      return <>
                        <div key={i} className="row">
                          <div className="col">
                            <button disabled={dead} className='btn' onClick={handleUnequip(e)}>DROP</button>
                          </div>
                          <div className='col fw f075 p025'>
                            {e?.name}
                            {e?.damage ? ` (1d${e.damage})` : null}
                            {e?.ammo ? ` (${e.ammo})` : null}
                          </div>
                        </div>
                      </>
                    }
                    return <>
                      <div key={i} className="row">
                        <div className="col">
                          <button disabled={dead} className='btn' onClick={handleEquip(e)}>EQUIP</button>
                        </div>
                        <div className='col fw f075 p025'>
                          {e?.name}
                          {e?.damage ? ` (1d${e.damage})` : null}
                          {e?.ammo ? ` (${e.ammo})` : null}
                        </div>
                      </div>
                    </>
                    case 'armor':
                      e = e as Armor
                      if (e?.id == character.armor) {
                        return <>
                          <div key={i} className="row">
                            <div className="col">
                              <button disabled={dead} className='btn' onClick={handleUnequip(e)}>DROP</button>
                            </div>
                            <div className='col fw f075 p025'>
                              {e?.name}
                              {e?.tier ? ` (T${e.tier})` : null}
                            </div>
                          </div>
                        </>
                      }
                      return <>
                        <div key={i} className="row">
                          <div className="col">
                            <button disabled={dead} className='btn' onClick={handleEquip(e)}>EQUIP</button>
                          </div>
                          <div className='col fw f075 p025'>
                            {e?.name}
                            {e?.tier ? ` (T${e.tier})` : null}
                          </div>
                        </div>
                      </>
                    case 'healing':
                      e = e as Healing
                      if (e.quantity > 0) {
                        return <>
                          <div key={i} className="row">
                            <div className="col">
                              <button disabled={dead || e.quantity == 0} className='btn' onClick={handleHealing(e)}>TAKE</button>
                            </div>
                            <div className='col fw f075 p025'>{e?.name} ({e.quantity} doses)</div>
                          </div>
                        </>
                      } else {
                        return <></>
                      }
                  }
                })}
              </div>
            </div>

        </div>

        <div className="actions col fw fh p1">

          <div className="row fh action-display jc">
            <div className="col p1"><VerticalBar value={(character.hp/character.maxHp)*100} /></div>

            <div className="col fw fh border" style={{width: '230px'}}>
              {
                state.map.map(row => (
                  <div className="row fw fh">
                    {
                      row.map(
                        tile => (
                          <div className="col fw fh tile tc">
                            {getTile(tile)}
                          </div>
                        )
                      )
                    }
                  </div>
                ))
              }
            </div>
            <div className="col p1"><VerticalBar value={(enemy.hp/enemy.maxHp)*100} /></div>
          </div>

          <div className="row character-development g1" style={{padding: '0.5em 0'}}>
            <div className="col"><ValueDisplay number={character.level} label="LEVEL" /></div>
            <div className="col fw"><HorizontalBar value={Math.min(1, character.xp/(200*character.level))*100} /></div>
          </div>

          <div className="row fight">
            <button disabled={win||dead} className="btn fw f15" onClick={handleAttack}>FIGHT!</button>
          </div>

        </div>

        <div className="enemy col fw fh p1">

          <div className="row enemy-lore">
            <div className="col fw tc">{enemy.name}</div>
          </div>

          <div className="row ememy-image">
            <div className="col">
              <img src={`${enemy.type}.png`} />
            </div>
          </div>

          <div className="row enemy-attributes">
            <div className="col fw"><ValueDisplay number={enemy.hp} label="HP" /></div>
            <div className="col fw"><ValueDisplay number={enemy.morale} label="MOR" /></div>
            <div className="col fw"><ValueDisplay number={enemy.dr} label="DR" /></div>
            <div className="col fw"><ValueDisplay number={enemy.extra[0]?.name} label="EXTRA" /></div>
          </div>

          <h5>LOGS</h5>
          <div className="row fh" style={{overflow: 'hidden'}}>
            <div className="col fw fh p05 logs border">
              {turns.map((turn, i) => {
                return (
                  <div key={i} className="p025 fw border col">
                    {
                      turn.map((t: any[], j: number) => {
                        if (t[0] > 0) {
                          return <div key={j} className="fw">{t.slice(1).join(' ')}</div>
                        }
                      })
                    }
                  </div>
                )
              })}
              <AlwaysScrollToBottom />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default App
