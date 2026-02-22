'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { InventoryItem, InventoryState, createInventoryItem } from './game-navigation'
import { useHydrated } from '@/hooks/use-hydrated'

// ============================================
// SHOP ITEM TYPES
// ============================================

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: 'wands' | 'robes' | 'cauldrons' | 'instruments' | 'books' | 'misc'
  icon: string
  essential: boolean
  stock: number
}

// ============================================
// SHOP SCENE
// ============================================

interface SchoolShopProps {
  playerName: string
  inventory: InventoryState
  hasVisitedShop: boolean
  onContinue: (goldRemaining: number, purchasedItems: InventoryItem[]) => void
  onVisitedShop?: () => void
}

export function SchoolShop({ playerName, inventory, hasVisitedShop, onContinue, onVisitedShop }: SchoolShopProps) {
  const hydrated = useHydrated()
  // If already visited, skip entrance and go directly to browsing
  const [phase, setPhase] = useState<'entrance' | 'browsing' | 'cart' | 'checkout'>(
    hasVisitedShop ? 'browsing' : 'entrance'
  )
  const [showContent, setShowContent] = useState(false)
  const [gold, setGold] = useState(inventory.gold)
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 500)
    return () => {
      clearTimeout(t1)
    }
  }, [phase])

  // Mark shop as visited when entering browsing mode for the first time
  useEffect(() => {
    if (phase === 'browsing' && !hasVisitedShop) {
      onVisitedShop?.()
    }
  }, [phase, hasVisitedShop, onVisitedShop])

  const handleEntranceContinue = () => {
    setShowContent(false)
    setTimeout(() => {
      setPhase('browsing')
      setShowContent(true)
    }, 500)
  }

  const categories = [
    { id: 'wands', name: 'Wands', icon: '🪄' },
    { id: 'robes', name: 'Robes', icon: '🧥' },
    { id: 'cauldrons', name: 'Cauldrons', icon: '⚗️' },
    { id: 'instruments', name: 'Instruments', icon: '🔮' },
    { id: 'books', name: 'Books', icon: '📕' },
    { id: 'misc', name: 'Supplies', icon: '🪶' },
  ]

  const shopItems: ShopItem[] = [
    // Wands
    { id: 'wand-phoenix', name: 'Phoenix Feather Wand', description: 'Yew wood, 12 inches. Excellent for transmutation.', price: 15, category: 'wands', icon: '🪄', essential: true, stock: 5 },
    { id: 'wand-dragon', name: 'Drake Core Wand', description: 'Oak wood, 11 inches. Powerful for combat magic.', price: 18, category: 'wands', icon: '🪄', essential: true, stock: 3 },
    { id: 'wand-moonstone', name: 'Moonstone Wand', description: 'Willow wood, 10 inches. Ideal for healing arts.', price: 14, category: 'wands', icon: '🪄', essential: true, stock: 7 },
    
    // Robes
    { id: 'robes-standard', name: 'Standard Robes', description: 'Midnight blue with silver trim. Full set.', price: 12, category: 'robes', icon: '🧥', essential: true, stock: 20 },
    { id: 'robes-premium', name: 'Premium Robes', description: 'Midnight blue with enchanted silver threading. Self-cleaning.', price: 25, category: 'robes', icon: '🧥', essential: false, stock: 8 },
    
    // Cauldrons
    { id: 'cauldron-pewter', name: 'Pewter Cauldron', description: 'Size 2. Standard issue for all students.', price: 8, category: 'cauldrons', icon: '⚗️', essential: true, stock: 15 },
    { id: 'cauldron-copper', name: 'Copper Cauldron', description: 'Size 2. Better heat distribution for precise brewing.', price: 15, category: 'cauldrons', icon: '⚗️', essential: false, stock: 6 },
    
    // Instruments
    { id: 'crystal-phials', name: 'Crystal Phials', description: 'Set of 7. Essential for potion storage.', price: 6, category: 'instruments', icon: '🔮', essential: true, stock: 25 },
    { id: 'brass-scales', name: 'Brass Scales', description: 'Precision weighing for alchemical work.', price: 5, category: 'instruments', icon: '⚖️', essential: false, stock: 18 },
    { id: 'telescope', name: 'Brass Telescope', description: 'Collapsible. For astral navigation class.', price: 10, category: 'instruments', icon: '🔭', essential: false, stock: 10 },
    
    // Books
    { id: 'grimoire', name: 'Student Grimoire', description: 'Dragonhide bound. 500 blank pages that self-index.', price: 8, category: 'books', icon: '📕', essential: true, stock: 30 },
    { id: 'arithmetic', name: 'Magical Arithmetic', description: 'By Professor Mendelbaum. Required reading.', price: 4, category: 'books', icon: '📘', essential: false, stock: 40 },
    
    // Misc
    { id: 'quill-set', name: 'Enchanted Quill Set', description: 'Set of 3 quills. Never needs sharpening.', price: 4, category: 'misc', icon: '🪶', essential: false, stock: 35 },
    { id: 'ink-set', name: 'Ink Vials', description: '3 vials of midnight black ink.', price: 2, category: 'misc', icon: '🖋️', essential: false, stock: 50 },
    { id: 'parchment', name: 'Enchanted Parchment', description: '50 sheets. Messages fade after reading.', price: 3, category: 'misc', icon: '📜', essential: false, stock: 45 },
  ]

  const addToCart = (itemId: string) => {
    const newCart = new Map(cart)
    const current = newCart.get(itemId) || 0
    const item = shopItems.find(i => i.id === itemId)
    if (item && current < item.stock) {
      newCart.set(itemId, current + 1)
      setCart(newCart)
    }
  }

  const removeFromCart = (itemId: string) => {
    const newCart = new Map(cart)
    const current = newCart.get(itemId) || 0
    if (current > 0) {
      if (current === 1) {
        newCart.delete(itemId)
      } else {
        newCart.set(itemId, current - 1)
      }
      setCart(newCart)
    }
  }

  const getCartTotal = () => {
    let total = 0
    cart.forEach((quantity, itemId) => {
      const item = shopItems.find(i => i.id === itemId)
      if (item) {
        total += item.price * quantity
      }
    })
    return total
  }

  const getCartCount = () => {
    let count = 0
    cart.forEach(quantity => count += quantity)
    return count
  }

  const handlePurchase = () => {
    const total = getCartTotal()
    if (total <= gold) {
      const newGold = gold - total
      
      // Create inventory items from cart
      const purchasedItems: InventoryItem[] = []
      cart.forEach((quantity, itemId) => {
        const shopItem = shopItems.find(i => i.id === itemId)
        if (shopItem) {
          const inventoryItem = createInventoryItem(
            shopItem.id,
            shopItem.name,
            shopItem.description,
            shopItem.icon,
            shopItem.category,
            quantity
          )
          purchasedItems.push(inventoryItem)
        }
      })
      
      setGold(newGold)
      setCart(new Map())
      onContinue(newGold, purchasedItems)
    }
  }

  const filteredItems = selectedCategory 
    ? shopItems.filter(item => item.category === selectedCategory)
    : shopItems

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/school-shop.png"
          alt="School Shop"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Floating particles */}
      {hydrated && <ShopParticles />}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-8 pb-16">
        
        {/* Entrance phase (first visit only) */}
        {phase === 'entrance' && (
          <div className={`max-w-2xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-amber-900/40">
              {/* Shopkeeper */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center border-2 border-amber-500/50 shadow-lg">
                  <span className="text-2xl">🧙‍♂️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-cinzel text-amber-100 text-lg tracking-wide">Cornelius Ashford</h3>
                  <p className="font-crimson text-amber-400/70 text-sm italic">Proprietor of Arcane Supplies</p>
                </div>
              </div>
              
              <p className="font-crimson text-amber-100/90 text-lg leading-relaxed mb-6">
                &quot;Welcome, welcome! A new student, yes? I can always tell.&quot; The old shopkeeper&apos;s eyes 
                twinkle behind spectacles thick as bottle bottoms. &quot;Everything you need for your first year 
                is here. Take your time, browse carefully—and mind the self-aware artifacts on shelf three.&quot;
              </p>
              
              <button
                onClick={handleEntranceContinue}
                className="w-full py-3 px-6 font-cinzel text-base tracking-wider bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 cursor-pointer"
              >
                Begin Shopping
              </button>
            </div>
          </div>
        )}

        {/* Browsing phase */}
        {phase === 'browsing' && (
          <div className={`max-w-4xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-amber-900/40 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="scroll-edge py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">Arcane Supplies</h2>
                  {hasVisitedShop && (
                    <span className="text-sm font-crimson text-amber-400/60 italic">
                      &quot;Welcome back, {playerName}!&quot;
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-amber-900/30 px-3 py-1.5 rounded-lg">
                    <span className="text-lg">🪙</span>
                    <span className="font-cinzel text-amber-300">{gold}</span>
                  </div>
                  <button 
                    onClick={() => setPhase('cart')}
                    className="flex items-center gap-2 bg-amber-900/50 hover:bg-amber-900/70 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="text-lg">🛒</span>
                    <span className="font-cinzel text-amber-100">{getCartCount()}</span>
                    {getCartCount() > 0 && (
                      <span className="font-crimson text-amber-300 text-sm">{getCartTotal()} gold</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 p-4 overflow-x-auto border-b border-amber-900/30">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg font-crimson text-sm whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === null ? 'bg-amber-700 text-amber-100' : 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                  }`}
                >
                  All Items
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-crimson text-sm whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                      selectedCategory === cat.id ? 'bg-amber-700 text-amber-100' : 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Items grid */}
              <div className="p-4 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map(item => {
                    const inCart = cart.get(item.id) || 0
                    return (
                      <div 
                        key={item.id}
                        className={`bg-gradient-to-br from-amber-950/50 to-black/50 rounded-lg p-4 border transition-all hover:border-amber-600/50 ${
                          item.essential ? 'border-amber-600/40' : 'border-amber-900/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-cinzel text-amber-100 text-sm">{item.name}</h4>
                              {item.essential && (
                                <span className="text-xs font-cinzel text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded whitespace-nowrap">
                                  REQUIRED
                                </span>
                              )}
                            </div>
                            <p className="font-crimson text-amber-200/60 text-xs mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="font-cinzel text-amber-300 text-sm">{item.price} 🪙</span>
                              <div className="flex items-center gap-2">
                                {inCart > 0 && (
                                  <>
                                    <button 
                                      onClick={() => removeFromCart(item.id)}
                                      className="w-7 h-7 rounded bg-amber-900/50 hover:bg-amber-900 text-amber-100 text-sm flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      −
                                    </button>
                                    <span className="font-cinzel text-amber-100 w-6 text-center">{inCart}</span>
                                  </>
                                )}
                                <button 
                                  onClick={() => addToCart(item.id)}
                                  disabled={inCart >= item.stock}
                                  className={`px-3 py-1 rounded text-xs font-cinzel transition-colors cursor-pointer ${
                                    inCart >= item.stock 
                                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                      : 'bg-amber-700 hover:bg-amber-600 text-amber-100'
                                  }`}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-amber-900/30 flex justify-between items-center">
                <p className="font-crimson text-amber-200/50 text-sm italic">
                  &quot;Quality goods for quality mages!&quot;
                </p>
                <button
                  onClick={() => setPhase('cart')}
                  disabled={getCartCount() === 0}
                  className={`px-6 py-2 rounded-lg font-cinzel text-sm tracking-wider transition-all cursor-pointer ${
                    getCartCount() > 0 
                      ? 'bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 hover:from-amber-600 hover:to-amber-800' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Review Cart ({getCartCount()})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart phase */}
        {phase === 'cart' && (
          <div className={`max-w-2xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-amber-900/40 shadow-2xl overflow-hidden">
              <div className="scroll-edge py-3 px-4 flex items-center justify-between">
                <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">Your Cart</h2>
                <button 
                  onClick={() => setPhase('browsing')}
                  className="font-crimson text-amber-300 hover:text-amber-100 text-sm transition-colors cursor-pointer"
                >
                  ← Continue Shopping
                </button>
              </div>

              <div className="p-4 max-h-[350px] overflow-y-auto">
                {cart.size === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">🛒</span>
                    <p className="font-crimson text-amber-200/60">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(cart.entries()).map(([itemId, quantity]) => {
                      const item = shopItems.find(i => i.id === itemId)
                      if (!item) return null
                      return (
                        <div key={itemId} className="flex items-center gap-4 bg-amber-950/30 rounded-lg p-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-cinzel text-amber-100 text-sm">{item.name}</h4>
                            <p className="font-crimson text-amber-300 text-xs">{item.price} gold × {quantity}</p>
                          </div>
                          <span className="font-cinzel text-amber-300">{item.price * quantity} 🪙</span>
                          <button 
                            onClick={() => removeFromCart(itemId)}
                            className="w-8 h-8 rounded bg-red-900/30 hover:bg-red-900/50 text-red-300 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-amber-900/30 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-crimson text-amber-200/70">Total:</span>
                  <span className="font-cinzel text-amber-300 text-xl">{getCartTotal()} 🪙</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-crimson text-amber-200/50">Your gold:</span>
                  <span className="font-cinzel text-amber-100">{gold} 🪙</span>
                </div>
                {getCartTotal() > gold && (
                  <p className="font-crimson text-red-400 text-sm text-center">Not enough gold! Remove some items.</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPhase('browsing')}
                    className="flex-1 py-3 px-4 font-cinzel text-sm bg-amber-900/30 text-amber-300 rounded-lg hover:bg-amber-900/50 transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={getCartCount() === 0 || getCartTotal() > gold}
                    className={`flex-1 py-3 px-4 font-cinzel text-sm tracking-wider rounded-lg transition-all cursor-pointer ${
                      getCartCount() > 0 && getCartTotal() <= gold
                        ? 'bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 hover:from-amber-600 hover:to-amber-800' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SHOP PARTICLES
// ============================================

function ShopParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: ((i * 17 + 7) % 100),
      delay: ((i * 3) % 6),
      duration: 8 + ((i * 5) % 6),
      size: 2 + ((i * 2) % 3),
    }))
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-rise"
          style={{
            left: `${p.left}%`,
            bottom: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.7) 0%, transparent 70%)',
            boxShadow: '0 0 8px rgba(201, 162, 39, 0.5)',
          }}
        />
      ))}
    </div>
  )
}
