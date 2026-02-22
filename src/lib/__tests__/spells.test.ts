import { describe, it, expect } from 'vitest'
import {
  SPELL_LIBRARY,
  POTION_LIBRARY,
  SPELL_SCHOOLS_INFO,
  TIER_INFO,
  getSpellsByTier,
  getSpellsBySchool,
  getStartingSpells,
  type SpellTier,
  type SpellSchool,
} from '../spells'

// ============================================
// SPELL LIBRARY DATA INTEGRITY
// ============================================

describe('SPELL_LIBRARY', () => {
  it('should not be empty', () => {
    expect(SPELL_LIBRARY.length).toBeGreaterThan(0)
  })

  it('should have unique spell IDs', () => {
    const ids = SPELL_LIBRARY.map(s => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have all required fields on every spell', () => {
    for (const spell of SPELL_LIBRARY) {
      expect(spell.id, `spell missing id`).toBeTruthy()
      expect(spell.name, `${spell.id} missing name`).toBeTruthy()
      expect(spell.incantation, `${spell.id} missing incantation`).toBeTruthy()
      expect(spell.description, `${spell.id} missing description`).toBeTruthy()
      expect(spell.school, `${spell.id} missing school`).toBeTruthy()
      expect(spell.tier, `${spell.id} missing tier`).toBeTruthy()
      expect(spell.icon, `${spell.id} missing icon`).toBeTruthy()
      expect(typeof spell.manaCost).toBe('number')
      expect(spell.castTime, `${spell.id} missing castTime`).toBeTruthy()
      expect(spell.range, `${spell.id} missing range`).toBeTruthy()
      expect(spell.duration, `${spell.id} missing duration`).toBeTruthy()
      expect(Array.isArray(spell.effects)).toBe(true)
      expect(typeof spell.castingPractice).toBe('number')
      expect(spell.castingPractice).toBeGreaterThanOrEqual(0)
    }
  })

  it('should have manaCost >= 0 on every spell', () => {
    for (const spell of SPELL_LIBRARY) {
      expect(spell.manaCost).toBeGreaterThanOrEqual(0)
    }
  })

  it('should contain at least one cantrip', () => {
    const cantrips = SPELL_LIBRARY.filter(s => s.tier === 'cantrip')
    expect(cantrips.length).toBeGreaterThan(0)
  })

  it('each spell school should be a valid SpellSchool', () => {
    const validSchools = Object.keys(SPELL_SCHOOLS_INFO)
    for (const spell of SPELL_LIBRARY) {
      expect(validSchools).toContain(spell.school)
    }
  })

  it('each spell tier should be a valid SpellTier', () => {
    const validTiers = Object.keys(TIER_INFO)
    for (const spell of SPELL_LIBRARY) {
      expect(validTiers).toContain(spell.tier)
    }
  })
})

// ============================================
// POTION LIBRARY DATA INTEGRITY
// ============================================

describe('POTION_LIBRARY', () => {
  it('should not be empty', () => {
    expect(POTION_LIBRARY.length).toBeGreaterThan(0)
  })

  it('should have unique recipe IDs', () => {
    const ids = POTION_LIBRARY.map(p => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have all required fields on every recipe', () => {
    for (const recipe of POTION_LIBRARY) {
      expect(recipe.id, `recipe missing id`).toBeTruthy()
      expect(recipe.name, `${recipe.id} missing name`).toBeTruthy()
      expect(recipe.description, `${recipe.id} missing description`).toBeTruthy()
      expect(recipe.icon, `${recipe.id} missing icon`).toBeTruthy()
      expect(recipe.tier, `${recipe.id} missing tier`).toBeTruthy()
      expect(recipe.brewTime, `${recipe.id} missing brewTime`).toBeTruthy()
      expect(Array.isArray(recipe.ingredients)).toBe(true)
      expect(recipe.ingredients.length).toBeGreaterThan(0)
      expect(Array.isArray(recipe.effects)).toBe(true)
      expect(recipe.duration, `${recipe.id} missing duration`).toBeTruthy()
      expect(typeof recipe.brewPractice).toBe('number')
    }
  })

  it('each ingredient should have itemId, itemName, and quantity', () => {
    for (const recipe of POTION_LIBRARY) {
      for (const ingredient of recipe.ingredients) {
        expect(ingredient.itemId).toBeTruthy()
        expect(ingredient.itemName).toBeTruthy()
        expect(ingredient.quantity).toBeGreaterThan(0)
      }
    }
  })
})

// ============================================
// getSpellsByTier
// ============================================

describe('getSpellsByTier', () => {
  it('returns only spells of the requested tier', () => {
    const tiers: SpellTier[] = ['cantrip', 'novice', 'apprentice', 'adept', 'master', 'archmage']
    for (const tier of tiers) {
      const result = getSpellsByTier(tier)
      expect(result.every(s => s.tier === tier)).toBe(true)
    }
  })

  it('returns an empty array for a tier with no spells', () => {
    // archmage has no spells in the library
    const result = getSpellsByTier('archmage')
    expect(result).toEqual([])
  })

  it('returns all cantrips', () => {
    const cantrips = getSpellsByTier('cantrip')
    expect(cantrips.length).toBeGreaterThan(0)
    expect(cantrips.every(s => s.tier === 'cantrip')).toBe(true)
  })

  it('result does not include spells from other tiers', () => {
    const novice = getSpellsByTier('novice')
    expect(novice.every(s => s.tier !== 'cantrip')).toBe(true)
  })
})

// ============================================
// getSpellsBySchool
// ============================================

describe('getSpellsBySchool', () => {
  it('returns only spells of the requested school', () => {
    const schools: SpellSchool[] = [
      'elemental', 'divination', 'transmutation', 'conjuration',
      'enchantment', 'abjuration', 'necromancy',
    ]
    for (const school of schools) {
      const result = getSpellsBySchool(school)
      expect(result.every(s => s.school === school)).toBe(true)
    }
  })

  it('returns an empty array for schools with no spells', () => {
    const result = getSpellsBySchool('ritual')
    expect(result).toEqual([])
  })

  it('returns elemental spells', () => {
    const elementalSpells = getSpellsBySchool('elemental')
    expect(elementalSpells.length).toBeGreaterThan(0)
  })
})

// ============================================
// getStartingSpells
// ============================================

describe('getStartingSpells', () => {
  it('returns only cantrips', () => {
    const starting = getStartingSpells()
    expect(starting.every(s => s.tier === 'cantrip')).toBe(true)
  })

  it('returns at least one spell', () => {
    const starting = getStartingSpells()
    expect(starting.length).toBeGreaterThan(0)
  })

  it('sets castingPractice to 10 for all starting spells', () => {
    const starting = getStartingSpells()
    expect(starting.every(s => s.castingPractice === 10)).toBe(true)
  })

  it('sets learnedAt timestamp on all starting spells', () => {
    const before = Date.now()
    const starting = getStartingSpells()
    const after = Date.now()
    for (const spell of starting) {
      expect(spell.learnedAt).toBeGreaterThanOrEqual(before)
      expect(spell.learnedAt).toBeLessThanOrEqual(after)
    }
  })

  it('does not mutate the original SPELL_LIBRARY entries', () => {
    const originalCantrip = SPELL_LIBRARY.find(s => s.tier === 'cantrip')!
    const originalPractice = originalCantrip.castingPractice
    getStartingSpells()
    expect(originalCantrip.castingPractice).toBe(originalPractice)
  })
})

// ============================================
// SPELL_SCHOOLS_INFO
// ============================================

describe('SPELL_SCHOOLS_INFO', () => {
  const expectedSchools: SpellSchool[] = [
    'elemental', 'divination', 'transmutation', 'conjuration',
    'enchantment', 'abjuration', 'necromancy', 'potion', 'ritual',
  ]

  it('contains an entry for every spell school', () => {
    for (const school of expectedSchools) {
      expect(SPELL_SCHOOLS_INFO[school]).toBeDefined()
    }
  })

  it('every entry has name, description, icon, and color', () => {
    for (const school of expectedSchools) {
      const info = SPELL_SCHOOLS_INFO[school]
      expect(info.name).toBeTruthy()
      expect(info.description).toBeTruthy()
      expect(info.icon).toBeTruthy()
      expect(info.color).toBeTruthy()
    }
  })
})

// ============================================
// TIER_INFO
// ============================================

describe('TIER_INFO', () => {
  const expectedTiers: SpellTier[] = ['cantrip', 'novice', 'apprentice', 'adept', 'master', 'archmage']

  it('contains an entry for every spell tier', () => {
    for (const tier of expectedTiers) {
      expect(TIER_INFO[tier]).toBeDefined()
    }
  })

  it('every tier entry has name, description, and color', () => {
    for (const tier of expectedTiers) {
      const info = TIER_INFO[tier]
      expect(info.name).toBeTruthy()
      expect(info.description).toBeTruthy()
      expect(info.color).toBeTruthy()
    }
  })
})
