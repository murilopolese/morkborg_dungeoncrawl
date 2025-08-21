// import { useState } from 'react'
import { useEffect, useRef, useState } from 'react';
import './App.css'

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

function getEquipedWeapon(char: Character) {
  return char.equipment.find(equip => equip.equiped && equip?.item?.type == 'weapon')
}

function getEquipedArmor(char: Character) {
  return char.equipment.find(equip => equip.equiped && equip?.item?.type == 'armor')
}

// Tables
const NAMES : string[] = ["Aerg-Tval","Agn","Arvant","Belsum","Belum","Brint","Börda","Daeru","Eldar","Felban","Gotven","Graft","Grin","Grittr","Haerü","Hargha","Harmug","Jotna","Karg","Karva","Katla","Keftar","Klort","Kratar","Kutz","Kvetin","Lygan","Margar","Merkari","Nagl","Niduk","Nifehl","Prügl","Qillnach","Risten","Svind","Theras","Therg","Torvul","Törn","Urm","Urvarg","Vagal","Vatan","Von","Vrakh","Vresi","Wemut"]
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
  { name: "Zweihänder", damage: 10 },
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
  rollArmor() {
    return random(1, this.tier*2)
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

type Equipment = {
  equiped: boolean,
  item: Weapon|Armor|Shield|Poison|Healing|Item|undefined
}

const EQUIP1: any[] = [
  new Healing({ name: "Medicine chest", quantity: 4, cure: 6 }),
  new Healing({ name: "Herbal Potion", quantity: 4, cure: 6 }),
  new Healing({ name: "Life elixir", cure: 6, quantity: 4 }),
  new Healing({ name: "Breath in vapor", cure: 6, quantity: 4 }),
  new Healing({ name: "Herbal Decoction", cure: 4, quantity: 8 }),
  new Weapon({ name: "Bomb", damage: 10, ammo: 5 }),
  new Weapon({ name: "Molotov", damage: 5, ammo: 5 }),
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
    this.equipment = [
      { equiped: true, item: new Weapon(randomArray(WEAPON))},
      { equiped: false, item: new Weapon(randomArray(WEAPON))},
      { equiped: false, item: new Weapon({ name: "Bare hands", damage: 2 })},
      { equiped: true, item: new Armor(randomArray(ARMOR))}
    ]
    for (let i = 0; i < random(1, 10); i++) {
      let item = structuredClone(randomArray(EQUIP1))
      item.id = getRandomId()
      this.equipment.push({ equiped: false, item })
    }
    this.silver = random(20, 120)
    this.infections = []
  }
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
  armor: Armor
  attacks: Weapon[]
  dr: number
  extra: Poison[]
  constructor({ name, morale, hp, armor, attacks, dr, extra }: CreatureType) {
    this.name = `${randomArray(NAMES)}, the ${name}`
    this.type = name
    this.morale = morale
    this.hp = hp
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

type GameState = {
  turns: any[],
  character: Character,
  enemy: Creature
}

const gameState: GameState = {
  turns: [],
  character: new Character(),
  enemy: new Creature(randomArray(CREATURES))
}

function attack(state: GameState): GameState {
  const newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  const e: Creature = newState.enemy

  let equipedWeapon = getEquipedWeapon(c)

  // If there is no equiped weapon, resort to bare hands, if you can
  if (!equipedWeapon) {
    const bareHands = c.equipment.find(e => e.item?.name == "Bare hands") as Equipment
    if (bareHands) {
      equipedWeapon = bareHands
      equipedWeapon.equiped = true
    }
  }

  // Get the weapon object
  const weapon: Weapon = equipedWeapon?.item as Weapon
  turn.push(['attacking with', weapon?.name])
  let attackModifier = calculateModifier(c.strength)
  // Check if weapon has ammo
  if (weapon && weapon.ammo != undefined) {
    if (weapon.ammo < 1) {
      turn.push(['No more ammo!'])
      return newState
    }
    // use presence modifier for attack
    attackModifier = calculateModifier(c.presence)
    // consume ammo
    weapon.ammo -= 1
  }

  const attackRoll = random(1, 20)
  turn.push(['attack roll', attackRoll, 'modifier', attackModifier, 'dr', e.dr])
  if (attackRoll == 1) {
    turn.push(['attack fumbled'])
    // Drop current weapon
    if (equipedWeapon) {
      equipedWeapon.equiped = false
      const bareHands = c.equipment.find(e => e?.item?.name == "Bare hands")
      if (bareHands) {
        bareHands.equiped = true
      }
    }
  } else {
    // Check roll against enemy dr
    if (attackRoll + attackModifier >= e.dr) {
      turn.push(['attacked succeeded'])
      let damage = random(1, weapon.damage)
      turn.push(['damage roll', damage])
      if (attackRoll == 20) {
        turn.push(['critical!'])
        damage *= 2
        turn.push(['doubles damage!', damage])
        e.armor.tier = Math.max(0, e.armor.tier-1)
        turn.push(['wears 1 tier from enemy armor'])
      }
      let armorRoll = 0
      if (e.armor.tier) {
        armorRoll = random(1, e.armor.tier*2)
      }
      turn.push(['enemy armor roll', armorRoll])
      damage = Math.max(0, damage - armorRoll)
      turn.push(['enemy taking', damage, 'damage'])
      e.hp -= damage
      c.xp += damage * 10
    } else {
      turn.push(['attack failed'])
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
    turn.push(['defending against weapon', weapon.name])
    const defenseRoll = random(1, 20)
    const equipedArmor = getEquipedArmor(c)
    const armor = equipedArmor?.item as Armor
    let penalty = 0
    const agiMod = calculateModifier(c.agility)
    if (armor) penalty = armor.penalty
    turn.push(['defense roll', defenseRoll, 'mod', agiMod, 'penalty', penalty, 'dc', 12])
    if ( (defenseRoll + agiMod - penalty) < 12 ) {
      turn.push(['defense failed'])
      let damage = random(1, weapon.damage)
      turn.push(['damage roll', damage])
      if (defenseRoll == 1) {
        turn.push(['enemy critical'])
        damage *= 2
        turn.push(['doubles the damage to', damage])
        armor.tier = Math.max(0, armor.tier-1)
        turn.push(['wearing character armor tier 1'])
      }
      let armorRoll = 0
      if (armor?.tier) {
        armorRoll = random(1, armor.tier*2)
      }
      turn.push(['armor roll', armorRoll])
      damage = Math.max(0, damage - armorRoll)
      c.hp -= damage
      turn.push(['taking', damage, 'damage'])
      if (damage > 0 && e.extra.length > 0) {
        // Check for poison and curses
        e.extra.forEach((poison) => {
          turn.push(['resisting poison', poison.name])
          const currentInfection = c.infections.find(i => i.id == poison.id)
          if (!currentInfection) {
            const toughRoll = random(1, 20) + calculateModifier(c.toughness)
            turn.push(['roll to resist', poison.name, 'dr', poison.dr, 'rolled', toughRoll])
            if (toughRoll < poison.dr) {
              turn.push(['got infected by', poison.name])
              c.infections.push(structuredClone(poison))
            } else {
              turn.push(['resisted', poison.name])
            }
          } else {
            turn.push(['already infected', poison.name])
          }
        })
      }
    } else {
      turn.push(['defense succeded'])
      if (defenseRoll == 20) {
        turn.push(['defense critical!'])
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
  let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  if (item.type == "weapon" || item.type == "armor" || item.type == "shield") {
    const equipedWeapon = getEquipedWeapon(c)
    if (equipedWeapon) {
      turn.push(['unequiping', equipedWeapon?.item?.name])
      equipedWeapon.equiped = false
    }
    const newEquipedWeapon = c.equipment.find(e => e.item?.id == item.id) as Equipment
    newEquipedWeapon.equiped = true
    turn.push(['equiping', newEquipedWeapon?.item?.name])
  }
  newState.turns.push(turn)
  newState.character = c
  return newState
}

function unequip(state: GameState, item: any): GameState {
  let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  if (item.type == "weapon" || item.type == "armor" || item.type == "shield") {
    turn.push(['unequiping', item.name])
    const equiped = c.equipment.find(e => e.item?.id == item.id) as Equipment
    equiped.equiped = false
  }
  newState.turns.push(turn)
  newState.character = c
  return newState
}

function useHealing(state: GameState, item: Healing): GameState {
  let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const c: Character = newState.character
  turn.push(['use Healing'])
  const healRoll = random(1, item.cure)
  turn.push(['heal roll', healRoll])
  c.hp = Math.min(c.maxHp, c.hp + healRoll)
  const healingItem = (c.equipment.find(e => e.item?.id == item.id) as Equipment).item as Healing
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
        turn.push(['resisting damage from', poison.name])
        const toughRoll = random(1, 20) + calculateModifier(c.toughness)
        turn.push(['toughness roll', toughRoll, 'DR', poison.dr])
        if (toughRoll <= poison.dr) {
          let damage = random(1, poison.value)
          turn.push(['taking', damage, 'damage from', poison.name])
          c.hp -= damage
        } else {
          turn.push(['resisted', poison.name])
        }
      }

      if (poison.effect == 'death') {
        if (poison.value > 0) {
          turn.push([poison.value, 'turns left before death by', poison.name])
          poison.value -= 1
        } else {
          turn.push(['death by', poison.name])
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
    turn.push([newState.enemy.name, 'is dead'])
    const healRoll = random(1, 6)
    character.hp = Math.min(character.maxHp, character.hp + healRoll)
    turn.push(['you catch your breath and heal', healRoll])
    const silverRoll = random(2, 12)
    turn.push(['you find', silverRoll, 'silver'])
    if (character.xp >= (200*character.level)) {
      newState = levelUp(newState)
      character = newState.character
    } else {
      turn.push(['you have some xp', character.xp, 'but you need at least', 200*character.level])
    }
    newState.character = character
    newState.enemy = new Creature(randomArray(CREATURES))
    turn.push([newState.enemy.name, 'rises'])
    newState.turns.push(turn)
  }
  return newState
}

function levelUp(state: GameState): GameState {
  let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const character: Character = structuredClone(newState.character)

  turn.push(['you level up'])
  character.level += 1
  character.xp = 0

  const hpRoll = random(6, 60)
  if (hpRoll >= character.maxHp) {
    const hpUpgrade = random(1, 6)
    character.maxHp += hpUpgrade
    character.hp = character.maxHp
    turn.push(['getting more hp', hpUpgrade])
  }

  const strengthRoll = random(1, 20)
  if (strengthRoll >= character.strength) {
    character.strength += 1
    turn.push(['getting strength'])
  }

  const agilityRoll = random(1, 20)
  if (agilityRoll >= character.agility) {
    character.agility += 1
    turn.push(['getting agility'])
  }

  const presenceRoll = random(1, 20)
  if (presenceRoll >= character.presence) {
    character.presence += 1
    turn.push(['getting presence'])
  }

  const toughnessRoll = random(1, 20)
  if (toughnessRoll >= character.toughness) {
    character.toughness += 1
    turn.push(['getting toughness'])
  }

  const item = randomArray(EQUIP1)
  character.equipment.push({ equiped: false, item: item })
  turn.push(['getting item', item.name])


  newState.character = character
  newState.turns.push(turn)
  return newState

}

function dealWithCharacterDeath(state: GameState): GameState {
let newState: GameState = structuredClone(state)
  const turn: any[][] = []
  const character: Character = newState.character

  if (character.hp < 1) {
    turn.push([character.name, 'is dead'])
    turn.push(['level', character.level, 'xp', character.xp, 'max hp', character.maxHp])
    console.log(character)
    newState.character = new Character()
    turn.push([newState.character.name, 'rises'])
    newState.turns.push(turn)
  }

  return newState
}

const AlwaysScrollToBottom = () => {
  const elementRef = useRef<HTMLDivElement|null>(null)
  useEffect(() => elementRef?.current?.scrollIntoView());
  return <div ref={elementRef} />;
}

function App() {
  const [ state, setState ] = useState(gameState)
  const { character, enemy, turns } = state

  function handleAttack() {
    let newState = takeInfectionDamage(state)
    newState = attack(newState)
    newState = defense(newState)
    newState = dealWithEnemyDead(newState)
    newState = dealWithCharacterDeath(newState)
    setState(newState)
  }

  function handleEquip(item: any): () => undefined {
    return () => {
      let newState = equip(state, item)
      newState = defense(newState)
      newState = dealWithCharacterDeath(newState)
      setState(newState)
    }
  }

  function handleUnequip(item: any): () => undefined {
    return () => {
      let newState = unequip(state, item)
      newState = defense(newState)
      newState = dealWithCharacterDeath(newState)
      setState(newState)
    }
  }

  function handleHealing(item: Healing): () => undefined {
    return () => {
      let newState = useHealing(state, item)
      newState = defense(newState)
      newState = dealWithCharacterDeath(newState)
      setState(newState)
    }
  }


  return (
    <div className="row">
      <div className="col">
        <h2>C H A R A C T E R</h2>
        <table id="char">
          <tbody>
          <tr key="name"><td>name</td><td>{character.name}</td></tr>
          <tr key="level"><td>level</td><td>{character.level}</td></tr>
          <tr key="level"><td>xp</td><td>{character.xp}</td></tr>
          <tr key="Strength"><td>Strength</td><td>{character.strength} ({calculateModifier(character.strength)})</td></tr>
          <tr key="Agility"><td>Agility</td><td>{character.agility} ({calculateModifier(character.agility)})</td></tr>
          <tr key="Toughness"><td>Toughness</td><td>{character.toughness} ({calculateModifier(character.toughness)})</td></tr>
          <tr key="Presence"><td>Presence</td><td>{character.presence} ({calculateModifier(character.presence)})</td></tr>
          <tr key="HitPoints"><td>Hit Points</td><td>{character.hp} / {character.maxHp}</td></tr>
          <tr key="Silver"><td>Silver</td><td>{character.silver}</td></tr>
          <tr key="Infections"><td>Infections</td><td>{
            character.infections.map((poison: Poison, i: number) => <p key={i}>{poison.name} ({poison.effect} {poison.value})</p>)
          }</td></tr>
          </tbody>
        </table>
        {/* <h2>E Q U I P M E N T</h2> */}
        <table>
          <tbody>
          {
            character.equipment.map((equip: Equipment, i: number) => {
              const { item, equiped } = equip
              let e, it
              switch (item?.type) {
                case 'weapon':
                  it = item as Weapon
                  e = equiped ? <><button onClick={handleUnequip(item)}>store</button></> : <button onClick={handleEquip(item)}>equip</button>
                  return <tr key={i}><td>{e}</td><td>{item?.name} (1d{it.damage}) {it.ammo != undefined ? `(${it.ammo})` : null}</td></tr>
                case 'armor':
                  it = item as Armor
                  e = equiped ? <><button onClick={handleUnequip(item)}>store</button></> : <button onClick={handleEquip(item)}>equip</button>
                  return <tr key={i}><td>{e}</td><td>{it.name} (Tier {it.tier}) (1d{it.tier*2})</td></tr>
                case 'shield':
                  it = item as Shield
                  e = equiped ? <><button onClick={handleUnequip(item)}>store</button></> : <button onClick={handleEquip(item)}>equip</button>
                  return <tr key={i}><td>{e}</td><td>{it.name} (-{it.protection})</td></tr>
                case 'healing':
                  it = item as Healing
                  e = it.quantity > 0 ? <button onClick={handleHealing(it)}>use</button> : <></>
                  return <tr key={i}><td>{e}</td><td>{it.name} (1d{it.cure}) {it.quantity ? `(${it.quantity})` : null}</td></tr>
                case 'item':
                  return <tr key={i}><td>{e}</td><td>{item?.name}</td></tr>
                default:
                  break;
              }
            })
          }
          </tbody>
        </table>
      </div>
      <div className='col'>
        <h2>E N E M Y</h2>
        <img src={`${enemy.type}.png`} />
        <table>
          <tbody>
            <tr><td>name</td><td>{enemy.name}</td></tr>
            <tr><td>morale</td><td>{enemy.morale}</td></tr>
            <tr><td>hp</td><td>{enemy.hp}</td></tr>
            <tr><td>DR</td><td>{enemy.dr}</td></tr>
            <tr><td>armor</td><td>{enemy.armor.name} (-d{enemy.armor.tier*2})</td></tr>
            {enemy.attacks.map((weapon: Weapon, i: number) => <tr key={i}><td>attack</td><td>{weapon.name} (1d{weapon.damage})</td></tr>)}
            {enemy.extra.length ? enemy.extra.map((extra: Poison, i: number) => <tr key={i}><td>extra</td><td>{extra.name} (DR {extra.dr} {extra.value})</td></tr>) : null}
          </tbody>
        </table>
        <button className='fight' disabled={character.hp <= 0} onClick={handleAttack}>Fight</button>
      </div>
      <div style={{height: '80%'}}>
        <h2>T A L E</h2>
        <div className='col'>
          {
          turns.map(
            (log, i) => log.map(
              (l: string[], j: number) => <p key={`${i}_${j}`}>{l.join(' ')}</p>
              ).concat(<hr key={i}></hr>)
            )
          }
          <AlwaysScrollToBottom />
        </div>
      </div>
    </div>
  )
}

export default App
