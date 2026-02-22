import { describe, it, expect, beforeEach } from 'vitest'
import {
  isConsumable,
  getConsumableConfig,
  createInventoryItem,
  addItemToInventory,
  advanceTermProgress,
  type InventoryItem,
  type InventoryState,
} from '../inventory'

// ============================================
// isConsumable
// ============================================

describe('isConsumable', () => {
  it('returns true for known consumables', () => {
    expect(isConsumable('parchment')).toBe(true)
    expect(isConsumable('ink-set')).toBe(true)
    expect(isConsumable('quill-set')).toBe(true)
    expect(isConsumable('crystal-phials')).toBe(true)
  })

  it('returns false for non-consumables', () => {
    expect(isConsumable('wand')).toBe(false)
    expect(isConsumable('robe')).toBe(false)
    expect(isConsumable('cauldron')).toBe(false)
    expect(isConsumable('unknown-item')).toBe(false)
  })
})

// ============================================
// getConsumableConfig
// ============================================

describe('getConsumableConfig', () => {
  it('returns config for parchment', () => {
    const config = getConsumableConfig('parchment')
    expect(config).toBeDefined()
    expect(config.maxUses).toBe(50)
    expect(config.termDecayRate).toBe(12)
  })

  it('returns config for ink-set', () => {
    const config = getConsumableConfig('ink-set')
    expect(config).toBeDefined()
    expect(config.maxUses).toBe(30)
    expect(config.termDecayRate).toBe(8)
  })

  it('returns config for quill-set', () => {
    const config = getConsumableConfig('quill-set')
    expect(config).toBeDefined()
    expect(config.maxUses).toBe(100)
    expect(config.termDecayRate).toBe(5)
  })

  it('returns config for crystal-phials', () => {
    const config = getConsumableConfig('crystal-phials')
    expect(config).toBeDefined()
    expect(config.maxUses).toBe(7)
    expect(config.termDecayRate).toBe(1)
  })

  it('returns undefined for non-consumable items', () => {
    expect(getConsumableConfig('wand')).toBeUndefined()
  })
})

// ============================================
// createInventoryItem
// ============================================

describe('createInventoryItem', () => {
  it('creates a basic non-consumable item correctly', () => {
    const item = createInventoryItem('basic-wand', 'Basic Wand', 'A simple wand', '🪄', 'wands', 1)
    expect(item.id).toBe('basic-wand')
    expect(item.name).toBe('Basic Wand')
    expect(item.description).toBe('A simple wand')
    expect(item.icon).toBe('🪄')
    expect(item.category).toBe('wands')
    expect(item.quantity).toBe(1)
    expect(item.isConsumable).toBe(false)
    expect(item.maxUses).toBeUndefined()
    expect(item.currentUses).toBeUndefined()
  })

  it('creates a consumable item with maxUses and currentUses', () => {
    const item = createInventoryItem('parchment', 'Parchment', 'Writing parchment', '📜', 'misc', 1)
    expect(item.isConsumable).toBe(true)
    expect(item.maxUses).toBe(50)
    expect(item.currentUses).toBe(50)
  })

  it('sets purchaseDate to approximately now', () => {
    const before = Date.now()
    const item = createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands', 1)
    const after = Date.now()
    expect(item.purchaseDate).toBeGreaterThanOrEqual(before)
    expect(item.purchaseDate).toBeLessThanOrEqual(after)
  })

  it('defaults quantity to 1 when omitted', () => {
    const item = createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands')
    expect(item.quantity).toBe(1)
  })

  it('accepts custom quantity greater than 1', () => {
    const item = createInventoryItem('parchment', 'Parchment', 'Parchment sheets', '📜', 'misc', 3)
    expect(item.quantity).toBe(3)
  })

  it('creates ink-set as consumable with correct uses', () => {
    const item = createInventoryItem('ink-set', 'Ink Set', 'Writing ink', '🖊️', 'misc', 1)
    expect(item.isConsumable).toBe(true)
    expect(item.maxUses).toBe(30)
    expect(item.currentUses).toBe(30)
  })
})

// ============================================
// addItemToInventory
// ============================================

describe('addItemToInventory', () => {
  let inventory: InventoryItem[]

  beforeEach(() => {
    inventory = []
  })

  it('adds a new item when inventory is empty', () => {
    const item = createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands', 1)
    const result = addItemToInventory(inventory, item)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('basic-wand')
  })

  it('adds a new item that does not yet exist in inventory', () => {
    const wand = createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands', 1)
    const robe = createInventoryItem('basic-robe', 'Basic Robe', 'A robe', '👘', 'robes', 1)
    const after = addItemToInventory([wand], robe)
    expect(after).toHaveLength(2)
  })

  it('stacks quantity when adding an existing non-consumable item', () => {
    const wand = createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands', 1)
    const result = addItemToInventory([wand], { ...wand, quantity: 2 })
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(3)
  })

  it('stacks uses and quantity when adding an existing consumable', () => {
    const parchment = createInventoryItem('parchment', 'Parchment', 'Writing parchment', '📜', 'misc', 1)
    const moreParchment = createInventoryItem('parchment', 'Parchment', 'Writing parchment', '📜', 'misc', 1)
    const result = addItemToInventory([parchment], moreParchment)
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(2)
    expect(result[0].currentUses).toBe(100) // 50 + 50
    expect(result[0].maxUses).toBe(100)
  })

  it('does not mutate the original inventory array', () => {
    const item = createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands', 1)
    const original = [...inventory]
    addItemToInventory(inventory, item)
    expect(inventory).toEqual(original)
  })
})

// ============================================
// advanceTermProgress
// ============================================

describe('advanceTermProgress', () => {
  const baseInventory: InventoryState = {
    gold: 100,
    items: [],
    currentTerm: 1,
    termProgress: 0,
  }

  it('advances termProgress by 25 per quarter', () => {
    const result = advanceTermProgress(baseInventory, 1)
    expect(result.termProgress).toBe(25)
  })

  it('advances termProgress by 50 for two quarters', () => {
    const result = advanceTermProgress(baseInventory, 2)
    expect(result.termProgress).toBe(50)
  })

  it('caps termProgress at 100', () => {
    const result = advanceTermProgress(baseInventory, 10)
    expect(result.termProgress).toBe(100)
  })

  it('decays consumable uses by termDecayRate per quarter', () => {
    const parchment = createInventoryItem('parchment', 'Parchment', 'Parchment', '📜', 'misc', 1)
    const inventoryWithParchment: InventoryState = { ...baseInventory, items: [parchment] }

    // parchment termDecayRate = 12; 1 quarter → currentUses = 50 - 12 = 38
    const result = advanceTermProgress(inventoryWithParchment, 1)
    const updatedParchment = result.items.find(i => i.id === 'parchment')!
    expect(updatedParchment.currentUses).toBe(38)
  })

  it('decays over multiple quarters', () => {
    const inkSet = createInventoryItem('ink-set', 'Ink Set', 'Ink', '🖊️', 'misc', 1)
    const inv: InventoryState = { ...baseInventory, items: [inkSet] }

    // ink-set termDecayRate = 8; 3 quarters → 30 - 24 = 6
    const result = advanceTermProgress(inv, 3)
    const updated = result.items.find(i => i.id === 'ink-set')!
    expect(updated.currentUses).toBe(6)
  })

  it('does not let currentUses fall below 0', () => {
    const phials = createInventoryItem('crystal-phials', 'Crystal Phials', 'Phials', '🧪', 'misc', 1)
    const inv: InventoryState = { ...baseInventory, items: [phials] }

    // crystal-phials maxUses=7, termDecayRate=1; 20 quarters → floor at 0
    const result = advanceTermProgress(inv, 20)
    const updated = result.items.find(i => i.id === 'crystal-phials')!
    expect(updated.currentUses).toBe(0)
  })

  it('does not affect non-consumable items', () => {
    const wand = createInventoryItem('basic-wand', 'Basic Wand', 'A wand', '🪄', 'wands', 1)
    const inv: InventoryState = { ...baseInventory, items: [wand] }
    const result = advanceTermProgress(inv, 2)
    const updatedWand = result.items.find(i => i.id === 'basic-wand')!
    expect(updatedWand.currentUses).toBeUndefined()
  })

  it('preserves gold and currentTerm', () => {
    const inv: InventoryState = { ...baseInventory, gold: 250, currentTerm: 2 }
    const result = advanceTermProgress(inv, 1)
    expect(result.gold).toBe(250)
    expect(result.currentTerm).toBe(2)
  })

  it('does not mutate the original inventory state', () => {
    const parchment = createInventoryItem('parchment', 'Parchment', 'Parchment', '📜', 'misc', 1)
    const inv: InventoryState = { ...baseInventory, items: [parchment] }
    const originalUses = parchment.currentUses
    advanceTermProgress(inv, 1)
    // The original item in the original array should be unchanged
    expect(parchment.currentUses).toBe(originalUses)
  })
})
