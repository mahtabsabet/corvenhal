import { InventoryState } from '@/lib/inventory'

// ============================================
// CLASS ATTENDANCE REQUIREMENTS
// ============================================

// Item categories a student must own before they can attend any class
export const REQUIRED_CLASS_CATEGORIES = ['wands', 'robes', 'cauldrons', 'books'] as const

export type RequiredCategory = typeof REQUIRED_CLASS_CATEGORIES[number]

// Returns true only when the inventory contains at least one item in every
// required category (wand, robes, cauldron, grimoire/book).
export function checkHasRequiredMaterials(inventory: InventoryState): boolean {
  return REQUIRED_CLASS_CATEGORIES.every(category =>
    inventory.items.some(item => item.category === category)
  )
}
