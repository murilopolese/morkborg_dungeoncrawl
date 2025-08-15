// import { useState } from 'react'
import { useState } from 'react';
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
function modifier(value: number): number {
  if (value < 5) return -3
  if (value < 7) return -2
  if (value < 9) return -1
  if (value < 13) return 0
  if (value < 15) return 1
  if (value < 17) return 2
  return 3
}

// Tables
const NAMES : string[] = ["Aerg-Tval","Agn","Arvant","Belsum","Belum","Brint","Börda","Daeru","Eldar","Felban","Gotven","Graft","Grin","Grittr","Haerü","Hargha","Harmug","Jotna","Karg","Karva","Katla","Keftar","Klort","Kratar","Kutz","Kvetin","Lygan","Margar","Merkari","Nagl","Niduk","Nifehl","Prügl","Qillnach","Risten","Svind","Theras","Therg","Torvul","Törn","Urm","Urvarg","Vagal","Vatan","Von","Vrakh","Vresi","Wemut"]
const CLASSES: string[] = ["Fanged Deserter", "Gutterborn Scum", "Esoteric Hermit", "Wretched Royality", "Heretic Priest", "Occult Herbmaster"]
const WEAPON : Weapon[] = [
  { name: "Femur", damage: 4 },
  { name: "Staff", damage: 4 },
  { name: "Shortsword", damage: 4 },
  { name: "Knife", damage: 4 },
  { name: "Warhammer", damage: 6 },
  { name: "Sword", damage: 6 },
  { name: "Bow", damage: 6, ammo: 10 },
  { name: "Flail", damage: 8 },
  { name: "Crossbow", damage: 8, ammo: 10 },
  { name: "Zweihänder", damage: 10 },
]
const ARMOR: Armor[] = [
  { name: "No armor", tier: 0, penality: 0, wear: 0 },
  { name: "Light armor", tier: 1, penality: 0, wear: 0 },
  { name: "Medium armor", tier: 2, penality: 2, wear: 0 },
  { name: "Heavy armor", tier: 3, penality: 4, wear: 0 },
]
const EQUIP1: Equipment[] = [
  { equiped: false, item: { name: "Rope", description: "10m" } },
  { equiped: false, item: { name: "Torch" } },
  { equiped: false, item: { name: "Lantern with oil" } },
  { equiped: false, item: { name: "Magnesium strip" } },
  // randomUncleanScroll(),
  { equiped: false, item: { name: "Sharp needle" } },
  { equiped: false, item: { name: "Medicine chest", quantity: 4, cure: 6, measure: "patches" } },
  { equiped: false, item: { name: "Metal file" } },
  { equiped: false, item: { name: "Lockpicks" } },
  // Bear trap,
  { equiped: false, item: { name: "Bomb", damage: 10, ammo: 1 } },
  // { equiped: false, type: 'poison', item: { name: "Bottle of red poison", dr: 14, damage: 10, quantity: 4 } },
  { equiped: false, item: { name: "Silver crucifix", value: 60 } }
]
const EQUIP2: Equipment[] = [
  { equiped: false, item: { name: "Life elixir", cure: 6, quantity: 4, measure: "doses" } },
  // random sacred scroll
  // vicious dog
  // monkey
  { equiped: false, item: { name: "Exquisite perfume", value: 25 } },
  { equiped: false, item: { name: "Toolbox" } },
  { equiped: false, item: { name: "Heavy chain", description: "5m" } },
  { equiped: false, item: { name: "Grappling hook" } },
  { equiped: false, item: { name: "Shield", protection: 1 } },
  { equiped: false, item: { name: "Crowbar", damage: 4 } },
  { equiped: false, item: { name: "Tent" } }
]
const BERSERKER_WEAPON: Weapon[] = [
  { name: "Long flail", damage: 8 },
  { name: "Heavy mace", damage: 6 },
  { name: "Chained sword", damage: 6 },
  { name: "Huge warhammer", damage: 10 }
]

const CREATURES: Creature[] = [
  { 
    name: "Goblin", 
    morale: 7, 
    hp: 6,
    armor: { name: "Ropy skin", tier: 1, penality: 0, wear: 0 },
    attacks: [{ name: "Knife", damage: 4 }],
    dr: 14,
    extra: { name: "Curse", value: 15, dr: 12, effect: "death" } 
  },
  { 
    name: "Bent, Scum", 
    morale: 8, 
    hp: 7,
    armor: { name: "No armor", tier: 0, penality: 0, wear: 0 },
    attacks: [{ name: "Poisoned knife", damage: 4 }],
    dr: 12,
    extra: { name: "Poison", value: 4, dr: 10, effect: "damage" }
  },
  {
    name: "Zukuma, berserker", 
    morale: 9, 
    hp: 13,
    armor: { name: "Hardened skin", tier: 1, penality: 0, wear: 0 },
    attacks: [randomArray(BERSERKER_WEAPON), randomArray(BERSERKER_WEAPON)],
    dr: 10
  }
]

// Types
type Weapon = {
  name: string,
  damage: number, // d(damage)
  modifier?: number,
  ammo?: number
}
function isWeapon(item: Weapon|any): item is Weapon {
  return (item as Weapon).damage !== undefined && (item as Poison).dr === undefined
}

type Poison = {
  name: string,
  value: number,
  dr: number,
  effect: string 
  // freeze for d(value) turns 
  // death in d(value*6) time
  // reduce all habilities in value
  // default to damage d(value)
}
function isPoison(item: Poison|any): item is Poison {
  return (item as Poison).dr !== undefined
}

type Armor = {
  name: string,
  tier: number, // -d(tier*2)
  penality: number,
  wear: number
}
function isArmor(item: Armor|any): item is Armor {
  return (item as Armor).tier !== undefined
}

type Shield = {
  name: string,
  protection: number
}
function isShield(item: Shield|any): item is Shield {
  return (item as Shield).protection !== undefined
}

type Healing = {
  name: string,
  cure: number,
  quantity: number,
  measure: string
}
function isHealing(item: Healing|any): item is Healing {
  return (item as Healing).cure !== undefined
}

type Item = {
  name: string,
  description?: string,
  value?: number
}
function isItem(item: Item|any): item is Item {
  return !isWeapon(item) && !isArmor(item) && !isShield(item) && !isPoison(item) && !isHealing(item)
}

type Equipment = {
  equiped: boolean,
  item: Weapon|Armor|Shield|Poison|Healing|Item|undefined
}

type Character = {
  name: string,
  description: string,
  level: number,
  xp: number,
  class: string,
  strength: number,
  agility: number,
  toughness: number,
  presence: number,
  hp: number,
  maxHp: number,
  equipment: Equipment[],
  silver: number,
  infections: Poison[]
}

function generateCharacter(): Character {
  const str = random(1, 20)
  const tough = random(1, 20)
  const char: Character = {
    name: `${randomArray(NAMES)} ${randomArray(NAMES)}`,
    description: '',
    class: randomArray(CLASSES),
    level: 1,
    xp: 0,
    strength: str,
    agility: random(1, 20),
    toughness: tough,
    presence: random(1, 20),
    hp: 8 + tough,
    maxHp: 8 + tough,
    equipment: [], // str + 8
    silver: random(20, 120),
    infections: []
  }
  char.equipment.push({ equiped: true, item: randomArray(WEAPON) })
  char.equipment.push({ equiped: true, item: randomArray(ARMOR) })
  char.equipment.push({ equiped: true, item: { name: "Shield", protection: 1 } })
  char.equipment.push(randomArray(EQUIP1))
  char.equipment.push(randomArray(EQUIP2))
  return char
}

type Creature = {
  name: string,
  morale: number,
  hp: number,
  dr: number,
  armor: Armor,
  attacks: Weapon[],
  extra?: Poison
}

function getEquipedWeapon(char: Character): Equipment|undefined {
  return char.equipment.find((equip: Equipment) => {
    return isWeapon(equip.item) && equip.equiped
  })
}

function getEquipedArmor(char: Character): Equipment|undefined {
  return char.equipment.find((equip: Equipment) => {
    return isArmor(equip.item) && equip.equiped
  })
}

function getEquipedShield(char: Character): Equipment|undefined {
  return char.equipment.find((equip: Equipment) => {
    return isShield(equip.item) && equip.equiped
  })
}

function App() {
  const [ dead, setDead ] = useState(false)
  const [ char, setChar ] = useState(generateCharacter)
  const [ enemy, setEnemy ] = useState(randomArray(CREATURES))
  const [ logs, setLogs ] = useState<string[]>([])

  function fight(char: Character, enemy: Creature) {
    return function() {
      // get current weapon
      const nChar: Character = structuredClone(char)
      let nEnemy: Creature = structuredClone(enemy)
      const nLogs: string[] = []

      // Get current equipped weapon and modifier
      const weaponEquiped: Equipment|undefined = getEquipedWeapon(nChar)
      let weapon: Weapon
      let mod: number = modifier(nChar.strength)
      if (weaponEquiped) {
        weapon = weaponEquiped.item as Weapon
        if (weapon.ammo) {
          mod = modifier(nChar.presence)
        }
      } else {
        weapon = { name: "Bare hands", damage: 2 }
      }

      // Get current equipped armor and penalty
      let armorEquiped: Equipment|undefined = getEquipedArmor(char)
      let armor: Armor|undefined = undefined
      let armorPenalty = 0
      if (armorEquiped) {
        armor = armorEquiped.item as Armor
        armorPenalty = armor.penality
      }

      // Get current equipped shield
      let shieldEquiped: Equipment|undefined = getEquipedShield(char)
      let shield: Shield|undefined = undefined
      if (shieldEquiped) shield = shieldEquiped.item as Shield
      
      const attackRoll = random(1, 20) 
      nLogs.push(`🎲 Attack roll: ${attackRoll} + ${mod}`)

      if (attackRoll + mod >= nEnemy.dr) {
        let damage = 0
        if (weapon) {
          damage += random(1, weapon.damage)
        } else {
          damage += random(1, 2)
        }
        nLogs.push(`🎲 Damage roll: ${damage}`)
        if (enemy.armor.tier > 0) {
          let armorRoll = random(1, enemy.armor.tier*2)
          nLogs.push(`🎲 Enemy armor roll: ${armorRoll}`)
          damage -= armorRoll
        }
        if (attackRoll == 20) {
          nLogs.push(`🟢 CRITICAL`)
          nEnemy.armor.tier -= 1
          nEnemy.armor.tier = Math.max(nEnemy.armor.tier, 0)
          damage *= 2
        }
        damage = Math.max(damage, 0)
        if (damage > 0) {
          nEnemy.hp -= damage
          nLogs.push(`⚔️ Enemy took ${damage} damage`)
        }
        setEnemy(nEnemy)
      } else {
        if (attackRoll == 1) {
          nLogs.push(`🔴 FUMBLE`)
          const index = nChar.equipment.findIndex((equip: Equipment) => {
            return isWeapon(equip.item) && equip.equiped
          })
          if (index != -1) {
            nChar.equipment.splice(index, 1)
            nChar.equipment.push({ equiped: true, item: { name: "Bare hands", damage: 2 }})
          }
          setChar(nChar)
        }
        nLogs.push(`🔴 Attack missed`)
      }

      nEnemy.attacks.forEach((weapon: Weapon) => {
        let defenseRoll = random(1, 20)
        nLogs.push(`🎲 Defense roll: ${defenseRoll} + ${modifier(nChar.agility)}`)
        console.log(defenseRoll + modifier(char.agility), 12 + armorPenalty)
        if (( defenseRoll + modifier(char.agility) ) >= ( 12 + armorPenalty )) {
          nLogs.push(`🛡️ Defended from attack`)
          if (defenseRoll == 20) {
            nLogs.push(`🟢 ENEMY FUMBLE`)
            nEnemy.attacks = [{ name: "Bare hands", damage: 2 }]
            setEnemy(nEnemy)
          }
        } else {
          let damage = 0
          if (weapon) {
            damage += random(1, weapon.damage)
          } else {
            damage += random(1, 2)
          }
          nLogs.push(`🎲 Enemy damage roll: ${damage}`)
          if (defenseRoll == 1) {
            nLogs.push(`🔴 ENEMY CRITICAL`)
            damage *= 2
          }
          if (armor) {
            if (armor.tier > 0) {
              let armorRoll = random(1, armor.tier*2)
              nLogs.push(`🎲 Armor roll: ${armorRoll}`)
              damage -= armorRoll
            }
          }
          if (shield) {
            nLogs.push(`🛡️ Deffend with shield: ${shield.protection}`)
            damage -= shield.protection
          }
          damage = Math.max(damage, 0)
          if (damage > 0) {
            nChar.hp -= damage
            nLogs.push(`🤕 Character took ${damage} damage`)
          } else {
            nLogs.push(`🛡️ Character took no damage`)
          }
          
          if (nEnemy?.extra) {
            const infection = nEnemy.extra as Poison
            const toughRoll = random(1, 20)
            nLogs.push(`🎲 Toughness roll: ${toughRoll} + ${modifier(nChar.toughness)}`)
            if (toughRoll + modifier(nChar.toughness) >= infection.dr) {
              nLogs.push(`💪 Character resisted an infection: ${nEnemy.extra.name}`)
            } else {
              if (!nChar.infections.find((infection: Poison) => nEnemy.extra?.name == infection.name)) {
                nLogs.push(`🤮 Character got infected: ${nEnemy.extra.name}`)
                nChar.infections.push(nEnemy.extra)
              }
            }
          }
          setChar(nChar)
        }
      })

      nChar.infections.forEach((infection: Poison) => {
        switch(infection.effect) {
          case 'death':
            if (infection.value < 1) {
              nLogs.push(`☠️ Died from ${infection.name}`)
              nChar.hp = 0
            } else {
              infection.value -= 1
              nLogs.push(`⏳️ The clock is ticking for ${infection.name}. ${infection.value} more turns...`)
            }
            break
          case 'damage':
            const toughRoll = random(1, 20)
            nLogs.push(`🎲 Toughness roll: ${toughRoll} + ${modifier(nChar.toughness)}`)
            if (toughRoll + modifier(nChar.toughness) >= infection.dr) {
              const damage = random(1, infection.value)
              nChar.hp -= damage
              nLogs.push(`🤮 Character got ${damage} damage from ${infection.name}`)
            } else {
              nLogs.push(`💪 Character resisted ${infection.name}`)
            }
            break
        }
      })
      setChar(nChar)

      // Check for deaths
      if (nEnemy.hp < 1) {
        nLogs.push(`${enemy.name} is dead`)
        nEnemy = randomArray(CREATURES)
        setEnemy(nEnemy)
        nChar.hp += random(1, 6)
        nChar.hp = Math.min(nChar.hp, nChar.maxHp)
        setChar(nChar)
      }
      if (nChar.hp < 1) {
        nLogs.push(`${nChar.name} is dead`)
        setDead(true)
      }

      // nLogs.push('------')
      setLogs(nLogs)
    }
  }

  function newCharacter() {
    setChar(generateCharacter())
    setDead(false)
  }

  return (
    <div className="row">
      <div>
        <h2>Character</h2>
        <table id="char">
          <tbody>
          <tr key="name"><td>name</td><td>{char.name}</td></tr>
          <tr key="class"><td>class</td><td>{char.class}</td></tr>
          <tr key="level"><td>level</td><td>{char.level}</td></tr>
          <tr key="Strength"><td>Strength</td><td>{char.strength} ({modifier(char.strength)})</td></tr>
          <tr key="Agility"><td>Agility</td><td>{char.agility} ({modifier(char.agility)})</td></tr>
          <tr key="Toughness"><td>Toughness</td><td>{char.toughness} ({modifier(char.toughness)})</td></tr>
          <tr key="Presence"><td>Presence</td><td>{char.presence} ({modifier(char.presence)})</td></tr>
          <tr key="HitPoints"><td>Hit Points</td><td>{char.hp} / {char.maxHp}</td></tr>
          <tr key="Silver"><td>Silver</td><td>{char.silver}</td></tr>
          <tr key="Infections"><td>Infections</td><td>{
            char.infections.map((poison) => <p>{poison.name} ({poison.effect} {poison.value})</p>)
          }</td></tr>
          </tbody>
        </table>
        <h2>Equipment</h2>
        <table>
          <tbody>
          {
            char.equipment.map((equip: Equipment, i: number) => {
              const { item, equiped } = equip
              const e = equiped ? '(equiped)' : ''
              if (isWeapon(item)) return <tr key={i}><td>{e}</td><td>{item.name} (1d{item.damage})</td></tr>
              if (isArmor(item)) return <tr key={i}><td>{e}</td><td>{item.name} (-1d{item.tier*2} damage)</td></tr>
              if (isShield(item)) return <tr key={i}><td>{e}</td><td>{item.name} (-{item.protection})</td></tr>
              if (isPoison(item)) return <tr key={i}><td>{e}</td><td>{item.name}, {item.value} doses (DR {item.dr} / 1d{item.value})</td></tr>
              if (isHealing(item)) return <tr key={i}><td>{e}</td><td>{item.name}, {item.quantity} doses (1d{item.cure})</td></tr>
              if (isItem(item)) return <tr key={i}><td>{e}</td><td>{item.name} {item.description}</td></tr>
            })
          }
          </tbody>
        </table>
        <button onClick={newCharacter}>New</button>
      </div>
      <div>
        <h2>Enemy</h2>
        <table>
          <tbody>
            <tr><td>name</td><td>{enemy.name}</td></tr>
            <tr><td>morale</td><td>{enemy.morale}</td></tr>
            <tr><td>hp</td><td>{enemy.hp}</td></tr>
            <tr><td>DR</td><td>{enemy.dr}</td></tr>
            <tr><td>armor</td><td>{enemy.armor.name} (-d{enemy.armor.tier*2})</td></tr>
            {enemy.attacks.map((weapon: Weapon, i: number) => <tr key={i}><td>attack</td><td>{weapon.name} (1d{weapon.damage})</td></tr>)}
            {enemy.extra ? <tr><td>extra</td><td>{enemy.extra.name} (DR {enemy.extra.dr} 1d{enemy.extra.damage})</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div>
        {!dead ? <button onClick={fight(char, enemy)}>Fight!</button> : null}
        <h2>Logs</h2>
        {logs.map((log: string, i: number) => <p key={i}>{log}</p>)}
      </div>
    </div>
  )
}

export default App
