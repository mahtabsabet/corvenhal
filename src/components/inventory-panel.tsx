'use client'

import { useState } from 'react'
import { InventoryItem, InventoryState } from '@/lib/inventory'

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
