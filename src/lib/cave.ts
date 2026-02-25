// ============================================
// CAVE SYSTEM — Types, Monsters & Combat
// ============================================

import type { SpellTier } from './spells'

export type CaveLevel = 1 | 2 | 3

// ============================================
// MONSTER TYPES
// ============================================

export interface CaveLootEntry {
  itemId: string
  itemName: string
  icon: string
  dropChance: number // 0–1
}

export interface CaveMonsterDef {
  id: string
  name: string
  icon: string
  description: string
  level: CaveLevel
  maxHp: number
  baseAttack: number
  /** Subtracts from player spell damage before applying */
  defense: number
  loot: CaveLootEntry[]
  goldMin: number
  goldMax: number
  /** Narrative shown when the player enters the room */
  flavorText: string
}

/** Live instance of a monster during a combat encounter */
export interface CaveMonster extends CaveMonsterDef {
  currentHp: number
}

// ============================================
// MONSTER ROSTER
// ============================================

export const CAVE_MONSTERS: CaveMonsterDef[] = [
  // ── Level 1 ──────────────────────────────
  {
    id: 'shadow-bat',
    name: 'Shadow Bat',
    icon: '🦇',
    description: 'A large cave bat with leathery obsidian wings and razor-sharp talons.',
    level: 1,
    maxHp: 20,
    baseAttack: 4,
    defense: 0,
    loot: [
      { itemId: 'moonpetals',  itemName: 'Moonpetals',  icon: '🌸', dropChance: 0.45 },
      { itemId: 'fluxroot',    itemName: 'Fluxroot',    icon: '🌿', dropChance: 0.30 },
    ],
    goldMin: 5,
    goldMax: 12,
    flavorText: 'The shadow bat drops from the stalactites above, its chittering scream echoing through the stone.',
  },
  {
    id: 'cave-sprite',
    name: 'Cave Sprite',
    icon: '👺',
    description: 'A mischievous fey creature that haunts the shallows, hurling bolts of wild magic.',
    level: 1,
    maxHp: 16,
    baseAttack: 5,
    defense: 1,
    loot: [
      { itemId: 'shadowmoss',    itemName: 'Shadowmoss',   icon: '🍀', dropChance: 0.50 },
      { itemId: 'crystal-phials', itemName: 'Crystal Phial', icon: '🫙', dropChance: 0.35 },
    ],
    goldMin: 4,
    goldMax: 10,
    flavorText: 'The cave sprite bares its jagged teeth, eyes glinting with malice in the dark.',
  },

  // ── Level 2 ──────────────────────────────
  {
    id: 'stone-lurker',
    name: 'Stone Lurker',
    icon: '🪨',
    description: 'A creature that blends perfectly with the cave walls until the moment it strikes.',
    level: 2,
    maxHp: 42,
    baseAttack: 7,
    defense: 3,
    loot: [
      { itemId: 'fluxroot',      itemName: 'Fluxroot',      icon: '🌿', dropChance: 0.55 },
      { itemId: 'phoenix-ash',   itemName: 'Phoenix Ash',   icon: '🔥', dropChance: 0.22 },
      { itemId: 'mandrake-root', itemName: 'Mandrake Root', icon: '🥕', dropChance: 0.30 },
    ],
    goldMin: 12,
    goldMax: 22,
    flavorText: 'The cave wall trembles — and three pale eyes open in the stone before it lunges.',
  },
  {
    id: 'mud-golem',
    name: 'Mud Golem',
    icon: '🟤',
    description: 'An elemental born of underground mud, slow but devastatingly powerful.',
    level: 2,
    maxHp: 48,
    baseAttack: 9,
    defense: 4,
    loot: [
      { itemId: 'shadowmoss',    itemName: 'Shadowmoss',    icon: '🍀', dropChance: 0.45 },
      { itemId: 'mandrake-root', itemName: 'Mandrake Root', icon: '🥕', dropChance: 0.40 },
    ],
    goldMin: 10,
    goldMax: 20,
    flavorText: 'The golem rises from the underground pool, its clay fists as heavy as millstones.',
  },

  // ── Level 3 ──────────────────────────────
  {
    id: 'elder-basilisk',
    name: 'Elder Basilisk',
    icon: '🐍',
    description: 'An ancient serpent whose gaze slows a mage\'s spellwork and freezes the blood.',
    level: 3,
    maxHp: 75,
    baseAttack: 13,
    defense: 5,
    loot: [
      { itemId: 'phoenix-ash',       itemName: 'Phoenix Ash',       icon: '🔥', dropChance: 0.45 },
      { itemId: 'mandrake-root',     itemName: 'Mandrake Root',     icon: '🥕', dropChance: 0.40 },
      { itemId: 'starlight-essence', itemName: 'Starlight Essence', icon: '⭐', dropChance: 0.20 },
    ],
    goldMin: 22,
    goldMax: 38,
    flavorText: 'The elder basilisk uncoils from the deep dark, its ancient eyes blazing with petrifying light.',
  },
  {
    id: 'cave-wyvern',
    name: 'Cave Wyvern',
    icon: '🐉',
    description: 'A juvenile wyvern that has claimed the deepest chamber as its lair.',
    level: 3,
    maxHp: 65,
    baseAttack: 16,
    defense: 3,
    loot: [
      { itemId: 'serpent-venom',     itemName: 'Serpent Venom',     icon: '🐍', dropChance: 0.35 },
      { itemId: 'phoenix-ash',       itemName: 'Phoenix Ash',       icon: '🔥', dropChance: 0.50 },
      { itemId: 'starlight-essence', itemName: 'Starlight Essence', icon: '⭐', dropChance: 0.25 },
    ],
    goldMin: 25,
    goldMax: 45,
    flavorText: 'The wyvern\'s wings crack open like thunder, scattering stalactites across the chamber floor.',
  },
]

/** Pick a random monster for the given level */
export function getMonsterForLevel(level: CaveLevel): CaveMonsterDef {
  const pool = CAVE_MONSTERS.filter(m => m.level === level)
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Create a live monster instance from its definition */
export function spawnMonster(def: CaveMonsterDef): CaveMonster {
  return { ...def, currentHp: def.maxHp }
}

// ============================================
// COMBAT FORMULAS
// ============================================

/** Result of a d20 combat roll */
export interface CombatRollResult {
  roll: number
  category: 'fumble' | 'miss' | 'glancing' | 'solid' | 'strong' | 'critical'
  multiplier: number
  label: string
}

/** Base damage range [min, max] per spell tier */
const TIER_BASE_DAMAGE: Record<SpellTier, [number, number]> = {
  cantrip:    [3,  7],
  novice:     [6,  12],
  apprentice: [10, 18],
  adept:      [16, 26],
  master:     [24, 38],
  archmage:   [32, 50],
}

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

export function getCombatRoll(d20: number): CombatRollResult {
  if (d20 === 1)  return { roll: d20, category: 'fumble',   multiplier: 0,    label: '💨 FUMBLE!' }
  if (d20 <= 5)   return { roll: d20, category: 'miss',     multiplier: 0.4,  label: '💫 Glancing Miss' }
  if (d20 <= 10)  return { roll: d20, category: 'glancing', multiplier: 0.75, label: 'Glancing Blow' }
  if (d20 <= 15)  return { roll: d20, category: 'solid',    multiplier: 1.0,  label: 'Solid Hit' }
  if (d20 <= 19)  return { roll: d20, category: 'strong',   multiplier: 1.3,  label: '✨ Strong Hit' }
  /* d20 === 20 */ return { roll: d20, category: 'critical', multiplier: 2.0,  label: '🌟 CRITICAL HIT!' }
}

/**
 * Calculate player spell damage for one attack.
 *
 * Factors in:
 *  - Spell tier (base range)
 *  - castingPractice (up to +25% bonus at 100)
 *  - Moon phase spell-failure modifier (positive = higher chance of fumble)
 *  - Potion mastery bonus (+2 flat per 2 known recipes, max +6)
 *  - Monster defense (subtracted after all multipliers)
 */
export function calculatePlayerDamage(
  tier: SpellTier,
  castingPractice: number,
  moonSpellFailureMod: number,
  monsterDefense: number,
  potionBonus: number,
): { damage: number; roll: CombatRollResult } {
  let d20 = rollD20()

  // Moon phase shifts the effective roll
  if (moonSpellFailureMod > 0) {
    // Positive = more failures: chance to clamp into fumble/miss range
    if (Math.random() * 100 < moonSpellFailureMod) {
      d20 = Math.floor(Math.random() * 5) + 1
    }
  } else if (moonSpellFailureMod < 0) {
    // Negative = more reliable: chance to boost a very low roll
    if (Math.random() * 100 < Math.abs(moonSpellFailureMod)) {
      d20 = Math.max(d20, Math.floor(Math.random() * 5) + 11)
    }
  }

  const rollResult = getCombatRoll(d20)
  const [minDmg, maxDmg] = TIER_BASE_DAMAGE[tier]
  const baseDamage = minDmg + Math.floor(Math.random() * (maxDmg - minDmg + 1))
  const practiceBonus = 1 + (castingPractice / 100) * 0.25 // up to +25%
  const rawDamage = (baseDamage + potionBonus) * rollResult.multiplier * practiceBonus
  const finalDamage = Math.max(0, Math.floor(rawDamage) - monsterDefense)

  return { damage: finalDamage, roll: rollResult }
}

/** Calculate monster attack damage for one turn */
export function calculateMonsterDamage(
  baseAttack: number,
  moonMonsterMod: number, // percentage; e.g. +20 for full moon
  playerShieldBonus: number, // flat reduction from ward shield etc.
): { damage: number; isCritical: boolean; isMiss: boolean } {
  const d20 = rollD20()
  let multiplier = 1.0
  let isCritical = false
  let isMiss = false

  if (d20 <= 3)        { isMiss = true; multiplier = 0 }
  else if (d20 <= 10)  { multiplier = 0.8 }
  else if (d20 <= 16)  { multiplier = 1.0 }
  else if (d20 <= 19)  { multiplier = 1.3 }
  else                 { isCritical = true; multiplier = 1.8 }

  const moonMult = 1 + moonMonsterMod / 100
  const raw = Math.floor(baseAttack * multiplier * moonMult)
  const finalDamage = Math.max(0, raw - playerShieldBonus)
  return { damage: finalDamage, isCritical, isMiss }
}

/**
 * Moon phase modifier to monster combat strength (percentage).
 * Full moon = monsters are 20% stronger; new moon = 20% weaker.
 */
export function getMonsterMoonMod(moonPhase: string): number {
  switch (moonPhase) {
    case 'full-moon': return +20
    case 'waning':    return -10
    case 'new-moon':  return -20
    default:          return 0  // waxing = baseline
  }
}

/** Roll loot drops from a defeated monster */
export function rollLoot(
  monster: CaveMonster,
  fullMoonBonus: boolean,
): { itemId: string; itemName: string; icon: string }[] {
  const bonusMult = fullMoonBonus ? 1.25 : 1.0
  return monster.loot.filter(entry => Math.random() < entry.dropChance * bonusMult)
    .map(({ itemId, itemName, icon }) => ({ itemId, itemName, icon }))
}

/** Roll gold reward from a defeated monster */
export function rollGold(monster: CaveMonster): number {
  return monster.goldMin + Math.floor(Math.random() * (monster.goldMax - monster.goldMin + 1))
}
