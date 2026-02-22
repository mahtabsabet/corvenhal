// ============================================
// INVENTORY TYPES
// ============================================

export interface InventoryItem {
  id: string
  name: string
  description: string
  icon: string
  category: 'wands' | 'robes' | 'cauldrons' | 'instruments' | 'books' | 'misc'
  quantity: number
  isConsumable: boolean
  maxUses?: number
  currentUses?: number
  purchaseDate: number // timestamp
}

export interface InventoryState {
  gold: number
  items: InventoryItem[]
  currentTerm: number
  termProgress: number // 0-100, represents percentage through term
}

// ============================================
// CONSUMABLE DEFINITIONS
// ============================================

const CONSUMABLE_CONFIG: Record<string, { maxUses: number; termDecayRate: number }> = {
  'parchment': { maxUses: 50, termDecayRate: 12 }, // loses 12 uses per quarter term
  'ink-set': { maxUses: 30, termDecayRate: 8 },
  'quill-set': { maxUses: 100, termDecayRate: 5 },
  'crystal-phials': { maxUses: 7, termDecayRate: 1 },
}

// Helper to determine if item is consumable
export function isConsumable(itemId: string): boolean {
  return itemId in CONSUMABLE_CONFIG
}

// Get consumable config
export function getConsumableConfig(itemId: string) {
  return CONSUMABLE_CONFIG[itemId]
}

// ============================================
// INVENTORY HELPER FUNCTIONS
// ============================================

export function createInventoryItem(
  id: string,
  name: string,
  description: string,
  icon: string,
  category: InventoryItem['category'],
  quantity: number = 1
): InventoryItem {
  const consumable = isConsumable(id)
  const config = consumable ? getConsumableConfig(id) : null

  return {
    id,
    name,
    description,
    icon,
    category,
    quantity,
    isConsumable: consumable,
    maxUses: config?.maxUses,
    currentUses: config?.maxUses,
    purchaseDate: Date.now(),
  }
}

export function addItemToInventory(
  currentInventory: InventoryItem[],
  newItem: InventoryItem
): InventoryItem[] {
  const existing = currentInventory.find(i => i.id === newItem.id)

  if (existing) {
    // Stack items - increase quantity
    // For consumables, add uses
    if (existing.isConsumable && existing.currentUses !== undefined && newItem.currentUses !== undefined) {
      existing.currentUses += newItem.currentUses
      existing.maxUses = (existing.maxUses || 0) + (newItem.maxUses || 0)
    }
    existing.quantity += newItem.quantity
    return [...currentInventory]
  }

  return [...currentInventory, newItem]
}

// Simulate term progress - decay consumables
export function advanceTermProgress(inventory: InventoryState, quartersPassed: number): InventoryState {
  const newItems = inventory.items.map(item => {
    if (!item.isConsumable || !item.currentUses) return item

    const config = getConsumableConfig(item.id)
    if (!config) return item

    const decayAmount = config.termDecayRate * quartersPassed
    const newUses = Math.max(0, item.currentUses - decayAmount)

    return {
      ...item,
      currentUses: newUses,
    }
  })

  return {
    ...inventory,
    items: newItems,
    termProgress: Math.min(100, inventory.termProgress + (quartersPassed * 25)),
  }
}
