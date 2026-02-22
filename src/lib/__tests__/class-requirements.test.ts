import { describe, it, expect } from 'vitest'
import {
  checkHasRequiredMaterials,
  REQUIRED_CLASS_CATEGORIES,
} from '../class-requirements'
import { createInventoryItem } from '../inventory'
import type { InventoryState } from '../inventory'

// ============================================
// Helpers
// ============================================

function makeInventory(categories: string[]): InventoryState {
  return {
    gold: 100,
    currentTerm: 1,
    termProgress: 0,
    items: categories.map(cat =>
      createInventoryItem(`${cat}-item`, `${cat} Item`, `A ${cat}`, '⚪', cat as never, 1)
    ),
  }
}

// ============================================
// REQUIRED_CLASS_CATEGORIES constant
// ============================================

describe('REQUIRED_CLASS_CATEGORIES', () => {
  it('contains wands, robes, cauldrons, and books', () => {
    expect(REQUIRED_CLASS_CATEGORIES).toContain('wands')
    expect(REQUIRED_CLASS_CATEGORIES).toContain('robes')
    expect(REQUIRED_CLASS_CATEGORIES).toContain('cauldrons')
    expect(REQUIRED_CLASS_CATEGORIES).toContain('books')
  })

  it('has exactly four required categories', () => {
    expect(REQUIRED_CLASS_CATEGORIES).toHaveLength(4)
  })
})

// ============================================
// checkHasRequiredMaterials
// ============================================

describe('checkHasRequiredMaterials', () => {
  it('returns false when inventory is empty', () => {
    expect(checkHasRequiredMaterials(makeInventory([]))).toBe(false)
  })

  it('returns false when only some categories are present', () => {
    expect(checkHasRequiredMaterials(makeInventory(['wands']))).toBe(false)
    expect(checkHasRequiredMaterials(makeInventory(['wands', 'robes']))).toBe(false)
    expect(checkHasRequiredMaterials(makeInventory(['wands', 'robes', 'cauldrons']))).toBe(false)
  })

  it('returns true when all four required categories are present', () => {
    expect(checkHasRequiredMaterials(makeInventory(['wands', 'robes', 'cauldrons', 'books']))).toBe(true)
  })

  it('returns true when required categories plus extra categories are present', () => {
    const inv = makeInventory(['wands', 'robes', 'cauldrons', 'books', 'misc'])
    expect(checkHasRequiredMaterials(inv)).toBe(true)
  })

  it('returns false when three required categories are present but books is missing', () => {
    expect(checkHasRequiredMaterials(makeInventory(['wands', 'robes', 'cauldrons', 'misc']))).toBe(false)
  })

  it('returns false when three required categories are present but cauldrons is missing', () => {
    expect(checkHasRequiredMaterials(makeInventory(['wands', 'robes', 'books']))).toBe(false)
  })

  it('returns false when three required categories are present but robes is missing', () => {
    expect(checkHasRequiredMaterials(makeInventory(['wands', 'cauldrons', 'books']))).toBe(false)
  })

  it('returns false when three required categories are present but wands is missing', () => {
    expect(checkHasRequiredMaterials(makeInventory(['robes', 'cauldrons', 'books']))).toBe(false)
  })

  it('requires at least one item per category, not just any item', () => {
    // Three wands but no robes/cauldrons/books → false
    const inv: InventoryState = {
      gold: 100,
      currentTerm: 1,
      termProgress: 0,
      items: [
        createInventoryItem('wand-1', 'Wand 1', 'A wand', '🪄', 'wands', 1),
        createInventoryItem('wand-2', 'Wand 2', 'Another wand', '🪄', 'wands', 1),
        createInventoryItem('wand-3', 'Wand 3', 'Yet another wand', '🪄', 'wands', 1),
      ],
    }
    expect(checkHasRequiredMaterials(inv)).toBe(false)
  })

  it('treats each required category independently', () => {
    // Exactly one item per required category
    const inv: InventoryState = {
      gold: 50,
      currentTerm: 1,
      termProgress: 0,
      items: [
        createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands', 1),
        createInventoryItem('school-robes', 'School Robes', 'Robes', '👘', 'robes', 1),
        createInventoryItem('pewter-cauldron', 'Pewter Cauldron', 'Cauldron', '🫙', 'cauldrons', 1),
        createInventoryItem('spellbook', 'Spellbook', 'A book', '📚', 'books', 1),
      ],
    }
    expect(checkHasRequiredMaterials(inv)).toBe(true)
  })
})
