import { InventoryState } from '@/lib/inventory'
import { JournalEntry } from '@/components/journal-writing'
import { Spell, PotionRecipe } from '@/lib/spells'
import { GameTime } from '@/lib/game-time'

// GameLocation is defined in game-navigation - inline the type here to avoid circular deps
type GameLocation = 'academy' | 'shop' | 'dormitory' | 'common-room' | 'classroom'

// ============================================
// SAVE GAME TYPES
// ============================================

export interface SaveGame {
  version: number
  savedAt: number
  playerName: string
  gameState: 'prompt' | 'scroll' | 'departure' | 'journey' | 'castle' | 'school'
  currentLocation: GameLocation
  inventory: InventoryState
  hasMetHeadmistress: boolean
  hasVisitedShop: boolean
  journalEntries: JournalEntry[]
  learnedSpells: Spell[]
  learnedPotions: PotionRecipe[]
  currentMana: number
  maxMana: number
  gameTime: GameTime
  /** 0 = no training, 1 = Beginner, 2 = Intermediate, 3 = Advanced, 4 = Mastery */
  astralNavigationLevel: number
}

export const SAVE_KEY = 'arcana-mystica-save'
export const SAVE_VERSION = 8  // Bumped for moon phase system + astral navigation level

// ============================================
// SAVE/LOAD FUNCTIONS
// ============================================

export function saveGame(saveData: SaveGame): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    return true
  } catch {
    console.error('Failed to save game')
    return false
  }
}

export function loadGame(): SaveGame | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(SAVE_KEY)
    if (!saved) return null
    const data = JSON.parse(saved) as SaveGame
    // Version check for future compatibility
    if (data.version !== SAVE_VERSION) {
      console.warn('Save version mismatch, starting fresh')
      return null
    }
    return data
  } catch {
    console.error('Failed to load saved game')
    return null
  }
}

export function clearSave(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SAVE_KEY)
}
