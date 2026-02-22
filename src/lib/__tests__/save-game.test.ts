import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Next.js image component used by journal-writing.tsx
vi.mock('next/image', () => ({ default: () => null }))

// Mock journal-writing to avoid pulling in Next.js-specific UI code
vi.mock('@/components/journal-writing', () => ({
  JournalEntry: {},
}))

import {
  saveGame,
  loadGame,
  clearSave,
  SAVE_KEY,
  SAVE_VERSION,
  type SaveGame,
} from '../save-game'

// ============================================
// Helpers
// ============================================

function makeSave(overrides: Partial<SaveGame> = {}): SaveGame {
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    playerName: 'Elara',
    gameState: 'school',
    currentLocation: 'dormitory',
    inventory: {
      gold: 100,
      items: [],
      currentTerm: 1,
      termProgress: 0,
    },
    hasMetHeadmistress: false,
    hasVisitedShop: false,
    journalEntries: [],
    learnedSpells: [],
    learnedPotions: [],
    currentMana: 50,
    maxMana: 100,
    gameTime: {
      day: 'Moonday',
      hour: 10,
      minute: 0,
      dayNumber: 1,
    },
    ...overrides,
  }
}

// ============================================
// saveGame
// ============================================

describe('saveGame', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns true on successful save', () => {
    const result = saveGame(makeSave())
    expect(result).toBe(true)
  })

  it('persists save data to localStorage under the correct key', () => {
    const save = makeSave({ playerName: 'Theron' })
    saveGame(save)
    const raw = localStorage.getItem(SAVE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.playerName).toBe('Theron')
  })

  it('overwrites a previous save with new data', () => {
    saveGame(makeSave({ playerName: 'Elara' }))
    saveGame(makeSave({ playerName: 'Theron' }))
    const raw = localStorage.getItem(SAVE_KEY)
    const parsed = JSON.parse(raw!)
    expect(parsed.playerName).toBe('Theron')
  })

  it('stores the correct save version', () => {
    saveGame(makeSave())
    const raw = localStorage.getItem(SAVE_KEY)
    const parsed = JSON.parse(raw!)
    expect(parsed.version).toBe(SAVE_VERSION)
  })

  it('serialises and restores nested inventory data', () => {
    const save = makeSave({ inventory: { gold: 999, items: [], currentTerm: 3, termProgress: 75 } })
    saveGame(save)
    const raw = localStorage.getItem(SAVE_KEY)
    const parsed = JSON.parse(raw!)
    expect(parsed.inventory.gold).toBe(999)
    expect(parsed.inventory.termProgress).toBe(75)
  })
})

// ============================================
// loadGame
// ============================================

describe('loadGame', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no save exists', () => {
    expect(loadGame()).toBeNull()
  })

  it('returns the saved data when a valid save exists', () => {
    const save = makeSave({ playerName: 'Lyra' })
    saveGame(save)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded!.playerName).toBe('Lyra')
  })

  it('returns null when save version does not match', () => {
    const outdated = makeSave({ version: SAVE_VERSION - 1 })
    localStorage.setItem(SAVE_KEY, JSON.stringify(outdated))
    expect(loadGame()).toBeNull()
  })

  it('returns null for a future save version', () => {
    const future = makeSave({ version: SAVE_VERSION + 1 })
    localStorage.setItem(SAVE_KEY, JSON.stringify(future))
    expect(loadGame()).toBeNull()
  })

  it('returns null when localStorage contains malformed JSON', () => {
    localStorage.setItem(SAVE_KEY, '{not valid json}')
    expect(loadGame()).toBeNull()
  })

  it('restores all top-level fields correctly', () => {
    const save = makeSave({
      playerName: 'Seraphina',
      gameState: 'classroom',
      currentLocation: 'classroom',
      hasMetHeadmistress: true,
      hasVisitedShop: true,
      currentMana: 80,
      maxMana: 150,
    })
    saveGame(save)
    const loaded = loadGame()!
    expect(loaded.playerName).toBe('Seraphina')
    expect(loaded.gameState).toBe('classroom')
    expect(loaded.currentLocation).toBe('classroom')
    expect(loaded.hasMetHeadmistress).toBe(true)
    expect(loaded.hasVisitedShop).toBe(true)
    expect(loaded.currentMana).toBe(80)
    expect(loaded.maxMana).toBe(150)
  })

  it('round-trips journal entries correctly', () => {
    const entries = [
      { id: 'e1', date: 'Day 1', content: 'First day!', createdAt: 1000 },
    ]
    saveGame(makeSave({ journalEntries: entries }))
    const loaded = loadGame()!
    expect(loaded.journalEntries).toHaveLength(1)
    expect(loaded.journalEntries[0].content).toBe('First day!')
  })

  it('round-trips game time correctly', () => {
    const time = { day: 'Thorsday' as const, hour: 19, minute: 30, dayNumber: 5 }
    saveGame(makeSave({ gameTime: time }))
    const loaded = loadGame()!
    expect(loaded.gameTime.day).toBe('Thorsday')
    expect(loaded.gameTime.hour).toBe(19)
    expect(loaded.gameTime.minute).toBe(30)
  })
})

// ============================================
// clearSave
// ============================================

describe('clearSave', () => {
  it('removes the save from localStorage', () => {
    saveGame(makeSave())
    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull()
    clearSave()
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
  })

  it('does not throw when there is no save to clear', () => {
    localStorage.clear()
    expect(() => clearSave()).not.toThrow()
  })

  it('loadGame returns null after clearSave', () => {
    saveGame(makeSave())
    clearSave()
    expect(loadGame()).toBeNull()
  })
})

// ============================================
// SAVE_KEY / SAVE_VERSION constants
// ============================================

describe('constants', () => {
  it('SAVE_KEY is a non-empty string', () => {
    expect(typeof SAVE_KEY).toBe('string')
    expect(SAVE_KEY.length).toBeGreaterThan(0)
  })

  it('SAVE_VERSION is a positive integer', () => {
    expect(typeof SAVE_VERSION).toBe('number')
    expect(SAVE_VERSION).toBeGreaterThan(0)
    expect(Number.isInteger(SAVE_VERSION)).toBe(true)
  })
})
