'use client'

import { useState, useEffect } from 'react'
import { GameTime, DAY_ICONS, formatHour, getTimeSlot, isClassAvailableNow, getCurrentClass, getTimeSlotShort, CLASS_SCHEDULE, getTimeUntilNextClass, TimeUntilClass } from '@/lib/game-time'

// ============================================
// TYPES
// ============================================

export type GameLocation = 'academy' | 'shop' | 'dormitory' | 'common-room' | 'classroom'

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
// NAVIGATION SIDEBAR
// ============================================

interface NavigationSidebarProps {
  currentLocation: GameLocation
  onNavigate: (location: GameLocation) => void
  gold: number
  onOpenInventory: () => void
  onOpenTimetable: () => void
  onOpenSpellbook: () => void
  onRestart: () => void
  playerName: string
  learnedSpellsCount?: number
  gameTime?: GameTime
  hasVisitedShop?: boolean
  hasRequiredMaterials?: boolean
}

export function NavigationSidebar({ 
  currentLocation, 
  onNavigate, 
  gold, 
  onOpenInventory,
  onOpenTimetable,
  onOpenSpellbook,
  onRestart,
  playerName,
  learnedSpellsCount = 0,
  gameTime,
  hasVisitedShop = false,
  hasRequiredMaterials = false
}: NavigationSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTimetable, setShowTimetable] = useState(false)
  const [showClassroomMenu, setShowClassroomMenu] = useState(false)

  const locations: { id: GameLocation; name: string; icon: string }[] = [
    { id: 'academy', name: 'Grand Hall', icon: '🏛️' },
    { id: 'common-room', name: 'Common Room', icon: '🛋️' },
    { id: 'shop', name: 'School Shop', icon: '🏪' },
    { id: 'classroom', name: 'Classrooms', icon: '📚' },
    { id: 'dormitory', name: 'Dormitory', icon: '🛏️' },
  ]

  const classroomOptions = [
    { id: 'elemental', name: 'Elemental Theory', icon: '🔥' },
    { id: 'potions', name: 'Potions I', icon: '⚗️' },
    { id: 'divination', name: 'Astral Navigation', icon: '🔮' },
    { id: 'transmutation', name: 'Transmutation', icon: '🌀' },
    { id: 'enchantment', name: 'Enchantments', icon: '💜' },
    { id: 'abjuration', name: 'Defense Arts', icon: '🛡️' },
    { id: 'conjuration', name: 'Summoning I', icon: '✨' },
  ]

  // Check if a class is available at current time
  const checkClassAvailable = (classId: string): boolean => {
    if (!gameTime) return true // If no time set, allow all
    return isClassAvailableNow(classId, gameTime)
  }

  // Get the current available class
  const currentClassInfo = gameTime ? getCurrentClass(gameTime) : null

  const timetable = [
    { day: 'Moonday', classes: ['Elemental Theory', 'Potions I', 'Astral Navigation'], icon: '🌙' },
    { day: 'Tiwsday', classes: ['Transmutation', 'Ancient Runes', 'Free Period'], icon: '⚔️' },
    { day: 'Wodansday', classes: ['Divination', 'Herbology', 'Defense Arts'], icon: '📖' },
    { day: 'Thorsday', classes: ['Alchemy Lab', 'Enchantments', 'Magical History'], icon: '⚡' },
    { day: 'Friggasday', classes: ['Summoning I', 'Wand Mastery', 'Study Hall'], icon: '🌸' },
    { day: 'Saturnsday', classes: ['Elective', 'Elective', 'Club Activities'], icon: '🪐' },
    { day: 'Sunday', classes: ['Rest', 'Rest', 'Rest'], icon: '☀️' },
  ]

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-black/80 backdrop-blur-sm rounded-lg border border-amber-900/40 flex items-center justify-center text-amber-100 hover:border-amber-600/50 transition-all cursor-pointer md:hidden"
      >
        <span className="text-xl">{isExpanded ? '✕' : '☰'}</span>
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-black/90 backdrop-blur-sm border-r border-amber-900/40 z-40
        transform transition-transform duration-300
        ${isExpanded ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:w-56
      `}>
        <div className="flex flex-col h-full p-3 overflow-y-auto">
          {/* Logo - compact */}
          <div className="text-center py-2 border-b border-amber-900/30 mb-2">
            <h1 className="font-cinzel text-amber-100 text-base tracking-wider">Arcana Mystica</h1>
          </div>

          {/* Player info + Gold combined */}
          <div className="flex items-center justify-between bg-amber-900/10 rounded-lg px-3 py-2 mb-2 border border-amber-800/20">
            <div className="flex items-center gap-2">
              <span className="text-sm">👤</span>
              <span className="font-cinzel text-amber-300 text-sm">{playerName}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm">🪙</span>
              <span className="font-cinzel text-amber-300 text-sm">{gold}</span>
            </div>
          </div>

          {/* Time display - compact */}
          {gameTime && (
            <TimeDisplay 
              gameTime={gameTime} 
              currentClassInfo={currentClassInfo}
              onNavigate={onNavigate}
              setIsExpanded={setIsExpanded}
              hasRequiredMaterials={hasVisitedShop && hasRequiredMaterials}
            />
          )}

          {/* Navigation */}
          <nav className="flex-1">
            <p className="font-cinzel text-amber-400/60 text-[10px] uppercase tracking-wider mb-1">Locations</p>
            <div className="space-y-0.5">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => {
                    // Special handling for classroom - show selection menu
                    if (loc.id === 'classroom') {
                      setShowClassroomMenu(true)
                    } else {
                      onNavigate(loc.id)
                    }
                    setIsExpanded(false)
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer
                    ${currentLocation === loc.id 
                      ? 'bg-amber-700/30 border border-amber-600/40 text-amber-100' 
                      : 'hover:bg-amber-900/20 text-amber-200/70 hover:text-amber-100'
                    }
                  `}
                >
                  <span className="text-lg">{loc.icon}</span>
                  <span className="font-crimson text-sm">{loc.name}</span>
                  {currentLocation === loc.id && (
                    <span className="ml-auto text-amber-400 text-xs">◆</span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-3">
              <p className="font-cinzel text-amber-400/60 text-[10px] uppercase tracking-wider mb-1">Quick Actions</p>
              <div className="space-y-0.5">
                <button
                  onClick={onOpenSpellbook}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-900/20 text-amber-200/70 hover:text-amber-100 transition-all cursor-pointer"
                >
                  <span className="text-lg">📖</span>
                  <span className="font-crimson text-sm">Spellbook</span>
                  <span className="font-cinzel text-amber-400/60 text-[10px] ml-auto">{learnedSpellsCount}</span>
                </button>
                <button
                  onClick={onOpenInventory}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-900/20 text-amber-200/70 hover:text-amber-100 transition-all cursor-pointer"
                >
                  <span className="text-lg">🎒</span>
                  <span className="font-crimson text-sm">Inventory</span>
                </button>
                <button
                  onClick={() => setShowTimetable(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-900/20 text-amber-200/70 hover:text-amber-100 transition-all cursor-pointer"
                >
                  <span className="text-lg">📅</span>
                  <span className="font-crimson text-sm">Timetable</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Restart button - compact */}
          <div className="pt-2 border-t border-amber-900/30">
            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/30 border border-red-800/30 text-red-300/70 hover:text-red-200 transition-all cursor-pointer"
            >
              <span className="text-xs">🔄</span>
              <span className="font-crimson text-xs">Restart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Classroom Menu Popup */}
      {showClassroomMenu && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowClassroomMenu(false)} />
          <div className="relative bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-900/40 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="scroll-edge py-3 px-4 flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">Choose a Class</h2>
                {gameTime && (
                  <p className="font-crimson text-amber-400/60 text-xs mt-1">
                    Current time: {DAY_ICONS[gameTime.day]} {formatHour(gameTime.hour)}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setShowClassroomMenu(false)}
                className="text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Current class highlight */}
            {currentClassInfo && hasVisitedShop && hasRequiredMaterials && (
              <div className="mx-4 mb-2 p-3 rounded-lg bg-green-900/30 border border-green-700/30">
                <p className="font-crimson text-green-400/80 text-xs mb-2">Currently Available:</p>
                <button
                  onClick={() => {
                    onNavigate('classroom')
                    setShowClassroomMenu(false)
                    setIsExpanded(false)
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('selectedClass', currentClassInfo.id)
                    }
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg bg-green-800/30 hover:bg-green-700/30 border border-green-600/30 transition-all cursor-pointer"
                >
                  <span className="text-2xl">{currentClassInfo.icon}</span>
                  <div className="text-left">
                    <span className="font-cinzel text-green-100 text-sm">{currentClassInfo.name}</span>
                    <p className="font-crimson text-green-300/60 text-xs">Click to attend</p>
                  </div>
                </button>
              </div>
            )}
            
            {/* Warning if not ready for class */}
            {(!hasVisitedShop || !hasRequiredMaterials) && (
              <div className="mx-4 mb-2 p-3 rounded-lg bg-red-900/30 border border-red-700/30">
                <p className="font-crimson text-red-400/80 text-xs mb-2">⚠️ Not Ready for Class</p>
                {!hasVisitedShop && (
                  <p className="font-crimson text-red-300/60 text-xs">
                    Visit the <span className="text-red-300">School Shop</span> to purchase required supplies.
                  </p>
                )}
                {hasVisitedShop && !hasRequiredMaterials && (
                  <p className="font-crimson text-red-300/60 text-xs">
                    You need a <span className="text-red-300">wand, robes, cauldron, and grimoire</span> to attend class.
                  </p>
                )}
              </div>
            )}
            
            <div className="p-4">
              <p className="font-crimson text-amber-400/60 text-xs mb-2 uppercase tracking-wider">All Classes</p>
              <div className="grid grid-cols-2 gap-2">
                {classroomOptions.map(cls => {
                  const isAvailable = checkClassAvailable(cls.id)
                  const isCurrentClass = currentClassInfo?.id === cls.id
                  const canAttend = hasVisitedShop && hasRequiredMaterials
                  
                  return (
                    <button
                      key={cls.id}
                      onClick={() => {
                        if (isAvailable && canAttend) {
                          onNavigate('classroom')
                          setShowClassroomMenu(false)
                          setIsExpanded(false)
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem('selectedClass', cls.id)
                          }
                        }
                      }}
                      disabled={!isAvailable || !canAttend}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        isCurrentClass && canAttend
                          ? 'bg-green-800/30 border-green-600/30 cursor-pointer'
                          : isAvailable && canAttend
                            ? 'bg-amber-950/30 hover:bg-amber-900/30 border-amber-900/20 hover:border-amber-700/30 cursor-pointer'
                            : 'bg-gray-900/20 border-gray-800/20 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-xl">{cls.icon}</span>
                      <div className="text-left flex-1">
                        <span className={`font-crimson text-sm ${isAvailable && canAttend ? 'text-amber-200' : 'text-gray-400'}`}>
                          {cls.name}
                        </span>
                        {!isAvailable && (
                          <p className="text-[10px] text-red-400/60">Not scheduled</p>
                        )}
                        {isAvailable && !canAttend && (
                          <p className="text-[10px] text-red-400/60">Need supplies</p>
                        )}
                      </div>
                      {isAvailable && canAttend && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Modal */}
      {showTimetable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowTimetable(false)} />
          <div className="relative bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-900/40 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="scroll-edge py-3 px-4 flex items-center justify-between">
              <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">Weekly Schedule</h2>
              <button 
                onClick={() => setShowTimetable(false)}
                className="text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="min-w-[400px]">
                {/* Time slots header */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="p-2 text-center">
                    <span className="font-cinzel text-amber-400/60 text-sm">Day</span>
                  </div>
                  <div className="p-2 text-center bg-black/20 rounded">
                    <span className="font-cinzel text-amber-100 text-xs">Morning</span>
                  </div>
                  <div className="p-2 text-center bg-black/20 rounded">
                    <span className="font-cinzel text-amber-100 text-xs">Afternoon</span>
                  </div>
                  <div className="p-2 text-center bg-black/20 rounded">
                    <span className="font-cinzel text-amber-100 text-xs">Evening</span>
                  </div>
                </div>

                {/* Schedule rows */}
                {timetable.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                    <div className="p-2 bg-amber-900/20 rounded flex items-center justify-center gap-1">
                      <span className="text-sm">{row.icon}</span>
                      <span className="font-cinzel text-amber-200 text-xs">{row.day}</span>
                    </div>
                    {row.classes.map((className, j) => (
                      <div 
                        key={j}
                        className="p-1.5 rounded bg-amber-900/30 flex items-center justify-center text-center min-h-[36px]"
                      >
                        <span className="font-crimson text-amber-100/90 text-xs">{className}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================
// INVENTORY PANEL
// ============================================

interface InventoryPanelProps {
  isOpen: boolean
  onClose: () => void
  inventory: InventoryState
}

export function InventoryPanel({ isOpen, onClose, inventory }: InventoryPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: 'wands', name: 'Wands', icon: '🪄' },
    { id: 'robes', name: 'Robes', icon: '🧥' },
    { id: 'cauldrons', name: 'Cauldrons', icon: '⚗️' },
    { id: 'instruments', name: 'Instruments', icon: '🔮' },
    { id: 'books', name: 'Books', icon: '📕' },
    { id: 'misc', name: 'Supplies', icon: '🪶' },
  ]

  const filteredItems = selectedCategory 
    ? inventory.items.filter(item => item.category === selectedCategory)
    : inventory.items

  // Calculate durability percentage for consumables
  const getDurabilityPercent = (item: InventoryItem): number | null => {
    if (!item.isConsumable || !item.maxUses || !item.currentUses) return null
    return Math.round((item.currentUses / item.maxUses) * 100)
  }

  // Get durability color
  const getDurabilityColor = (percent: number): string => {
    if (percent > 60) return 'text-green-400'
    if (percent > 30) return 'text-amber-400'
    return 'text-red-400'
  }

  // Get durability bar color
  const getDurabilityBarColor = (percent: number): string => {
    if (percent > 60) return 'bg-green-500'
    if (percent > 30) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <div className="relative bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-900/40 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="scroll-edge py-3 px-4 flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">Your Inventory</h2>
                <p className="font-crimson text-amber-400/60 text-sm">Term {inventory.currentTerm} • {inventory.termProgress}% Complete</p>
              </div>
              <button 
                onClick={onClose}
                className="text-amber-400 hover:text-amber-200 transition-colors cursor-pointer text-xl"
              >
                ✕
              </button>
            </div>

            {/* Gold and stats bar */}
            <div className="px-4 py-3 border-b border-amber-900/30 bg-black/20 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <span className="font-cinzel text-amber-300 text-lg">{inventory.gold} Gold</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <span className="font-crimson text-amber-200/70 text-sm">{inventory.items.length} item types</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span className="font-crimson text-amber-200/70 text-sm">
                  {inventory.items.filter(i => i.isConsumable && i.currentUses && i.currentUses < (i.maxUses || 0) * 0.3).length} low supplies
                </span>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 p-4 overflow-x-auto border-b border-amber-900/30">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg font-crimson text-xs whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === null ? 'bg-amber-700 text-amber-100' : 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                }`}
              >
                All ({inventory.items.length})
              </button>
              {categories.map(cat => {
                const count = inventory.items.filter(i => i.category === cat.id).length
                if (count === 0) return null
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-crimson text-xs whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                      selectedCategory === cat.id ? 'bg-amber-700 text-amber-100' : 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.name} ({count})
                  </button>
                )
              })}
            </div>

            {/* Items */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block opacity-50">🎒</span>
                  <p className="font-crimson text-amber-200/50">No items in this category</p>
                  <p className="font-crimson text-amber-400/40 text-sm italic mt-1">Visit the school shop to purchase supplies</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map(item => {
                    const durability = getDurabilityPercent(item)
                    return (
                      <div 
                        key={item.id}
                        className="bg-amber-950/30 rounded-lg p-4 border border-amber-900/30 hover:border-amber-700/50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-cinzel text-amber-100 text-sm">{item.name}</h4>
                              {item.quantity > 1 && (
                                <span className="text-xs font-cinzel text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded">
                                  ×{item.quantity}
                                </span>
                              )}
                            </div>
                            <p className="font-crimson text-amber-200/50 text-xs mt-1 line-clamp-2">{item.description}</p>
                            
                            {/* Durability bar for consumables */}
                            {item.isConsumable && durability !== null && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="font-crimson text-amber-200/60">Uses remaining</span>
                                  <span className={`font-cinzel ${getDurabilityColor(durability)}`}>
                                    {item.currentUses} / {item.maxUses}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-amber-900/30 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${getDurabilityBarColor(durability)} transition-all duration-500`}
                                    style={{ width: `${durability}%` }}
                                  />
                                </div>
                                {durability < 30 && (
                                  <p className="text-red-400 text-xs font-crimson mt-1 flex items-center gap-1">
                                    <span>⚠️</span> Running low! Restock at the shop.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Non-consumable indicator */}
                            {!item.isConsumable && (
                              <div className="mt-2 flex items-center gap-1">
                                <span className="text-green-400 text-xs">✓</span>
                                <span className="font-crimson text-green-400/70 text-xs">Permanent item</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-amber-900/30 bg-black/20">
              <p className="font-crimson text-amber-200/40 text-xs text-center italic">
                Consumable supplies deplete over time. Check back regularly to monitor your stock!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================
// HELPER FUNCTIONS FOR INVENTORY MANAGEMENT
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

// ============================================
// TIME DISPLAY COMPONENT
// ============================================

interface TimeDisplayProps {
  gameTime: GameTime
  currentClassInfo: { id: string; name: string; icon: string } | null
  onNavigate: (location: GameLocation) => void
  setIsExpanded: (expanded: boolean) => void
  hasRequiredMaterials: boolean
}

function TimeDisplay({ gameTime, currentClassInfo, onNavigate, setIsExpanded, hasRequiredMaterials }: TimeDisplayProps) {
  const [showNotification, setShowNotification] = useState(false)
  const [hasNotified, setHasNotified] = useState<string | null>(null)

  // Calculate time until next class using useMemo
  const timeUntilNext = getTimeUntilNextClass(gameTime)

  useEffect(() => {
    // Show notification when class is urgent (15 min or less) and we haven't notified for this class
    // Only show if player has required materials
    if (timeUntilNext?.isUrgent && timeUntilNext.classInfo.id !== hasNotified && hasRequiredMaterials) {
      setShowNotification(true) // eslint-disable-line react-hooks/set-state-in-effect
      setHasNotified(timeUntilNext.classInfo.id)
    }

    // Reset notification tracking when class changes
    if (timeUntilNext && timeUntilNext.classInfo.id !== hasNotified && !timeUntilNext.isUrgent) {
      setHasNotified(null) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [timeUntilNext, hasNotified])

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 rounded-lg px-3 py-2 mb-2 border border-indigo-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{DAY_ICONS[gameTime.day]}</span>
            <div>
              <p className="font-cinzel text-amber-100 text-xs">{gameTime.day}</p>
              <p className="font-crimson text-indigo-300/60 text-[10px]">Day {gameTime.dayNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-cinzel text-amber-200 text-xs">{formatHour(gameTime.hour, gameTime.minute)}</p>
            <p className="font-crimson text-indigo-300/60 text-[10px]">{getTimeSlotShort(getTimeSlot(gameTime.hour))}</p>
          </div>
        </div>

        {/* Current class indicator */}
        {currentClassInfo && (
          <p className="font-crimson text-green-400/80 text-[10px] mt-1 pt-1 border-t border-indigo-800/20 flex items-center gap-1">
            <span>{currentClassInfo.icon}</span>
            <span>Now: {currentClassInfo.name}</span>
          </p>
        )}

        {/* Countdown to next class */}
        {!currentClassInfo && timeUntilNext && (
          <div className={`mt-1 pt-1 border-t border-indigo-800/20 ${timeUntilNext.isUrgent ? 'animate-pulse' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm">{timeUntilNext.classInfo.icon}</span>
                <span className={`font-crimson text-[10px] ${timeUntilNext.isUrgent ? 'text-amber-300' : 'text-amber-400/60'}`}>
                  Next: {timeUntilNext.classInfo.name}
                </span>
              </div>
              <span className={`font-cinzel text-[10px] ${timeUntilNext.isUrgent ? 'text-amber-300 font-bold' : 'text-amber-200/80'}`}>
                {timeUntilNext.hours > 0
                  ? `${timeUntilNext.hours}h ${timeUntilNext.minutes}m`
                  : `${timeUntilNext.minutes}m`
                }
              </span>
            </div>
            {timeUntilNext.isUrgent && hasRequiredMaterials && (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('selectedClass', timeUntilNext.classInfo.id)
                  }
                  onNavigate('classroom')
                  setIsExpanded(false)
                }}
                className="w-full mt-2 py-1.5 px-2 text-[10px] font-cinzel bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 rounded border border-amber-600/40 hover:from-amber-600 hover:to-amber-800 transition-all cursor-pointer"
              >
                ⚡ Go to Class Now
              </button>
            )}
            {timeUntilNext.isUrgent && !hasRequiredMaterials && (
              <p className="text-[10px] text-red-400/80 mt-2 italic">
                Visit the School Shop first
              </p>
            )}
          </div>
        )}

        {!currentClassInfo && !timeUntilNext && (
          <p className="font-crimson text-amber-400/60 text-[10px] mt-1 pt-1 border-t border-indigo-800/20 italic">No upcoming classes</p>
        )}
      </div>

      {/* Magical Notification */}
      {showNotification && timeUntilNext && (
        <ClassNotification
          timeUntil={timeUntilNext}
          onClose={() => setShowNotification(false)}
          onGoToClass={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('selectedClass', timeUntilNext.classInfo.id)
            }
            onNavigate('classroom')
            setIsExpanded(false)
            setShowNotification(false)
          }}
        />
      )}
    </>
  )
}

// ============================================
// CLASS NOTIFICATION COMPONENT
// ============================================

interface ClassNotificationProps {
  timeUntil: TimeUntilClass
  onClose: () => void
  onGoToClass: () => void
}

function ClassNotification({ timeUntil, onClose, onGoToClass }: ClassNotificationProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none">
      {/* Magical glowing border effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent animate-pulse pointer-events-none" />

      <div className="relative bg-gradient-to-b from-[#2a2015] to-[#1a1510] rounded-xl border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 w-full max-w-sm overflow-hidden pointer-events-auto animate-fade-in-up">
        {/* Animated magical border */}
        <div className="absolute inset-0 rounded-xl animate-glow-pulse" style={{
          background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.1), transparent)',
          animation: 'shimmer 2s infinite'
        }} />

        {/* Header with magical icon */}
        <div className="relative p-4 text-center border-b border-amber-700/30">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <div className="text-4xl mb-2 animate-bounce">{timeUntil.classInfo.icon}</div>
          <h3 className="font-cinzel text-amber-100 text-lg tracking-wider">Class Starting Soon!</h3>
        </div>

        {/* Content */}
        <div className="relative p-4">
          <div className="text-center mb-4">
            <p className="font-cinzel text-amber-200 text-xl">{timeUntil.classInfo.name}</p>
            <p className="font-crimson text-amber-400/70 text-sm mt-1">
              begins in{' '}
              <span className="text-amber-300 font-bold text-lg">
                {timeUntil.minutes} minute{timeUntil.minutes !== 1 ? 's' : ''}
              </span>
            </p>
          </div>

          {/* Magical particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full animate-float"
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: '0',
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 font-crimson text-sm bg-amber-900/30 text-amber-300 rounded-lg hover:bg-amber-900/40 transition-all cursor-pointer border border-amber-800/30"
            >
              Dismiss
            </button>
            <button
              onClick={onGoToClass}
              className="flex-1 py-2 px-3 font-cinzel text-sm bg-gradient-to-b from-amber-600 to-amber-800 text-amber-100 rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all cursor-pointer border border-amber-500/40 shadow-lg shadow-amber-500/20"
            >
              ⚡ Go Now
            </button>
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-2 left-2 text-amber-500/30 text-lg">✧</div>
        <div className="absolute top-2 right-2 text-amber-500/30 text-lg">✧</div>
        <div className="absolute bottom-2 left-2 text-amber-500/30 text-lg">✧</div>
        <div className="absolute bottom-2 right-2 text-amber-500/30 text-lg">✧</div>
      </div>
    </div>
  )
}
