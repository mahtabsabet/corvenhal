'use client'

import { useState, useEffect } from 'react'
import { PotionRecipe, POTION_LIBRARY } from '@/lib/spells'

// ============================================
// TYPES
// ============================================

export interface BrewState {
  selectedPotion: PotionRecipe | null
  phase: 'setup' | 'brewing' | 'result'
  fireLevel: number // 0-100 (off to max)
  addedIngredients: Map<string, number> // ingredientId -> amount
  stirDirection: 'clockwise' | 'counter-clockwise' | null
  stirCount: number
  stirSpeed: number // 1-5
  brewTime: number // seconds elapsed
  cauldronColor: string
  cauldronState: 'empty' | 'heating' | 'brewing' | 'ready' | 'failed'
  result: 'success' | 'partial' | 'failed' | null
  resultMessage: string
}

interface PotionBrewingProps {
  learnedPotions: PotionRecipe[]
  onLearnPotion: (potion: PotionRecipe) => void
  onPracticePotion: (potionId: string) => void
  onClose: () => void
}

// ============================================
// INGREDIENT DEFINITIONS
// ============================================

const AVAILABLE_INGREDIENTS = [
  { id: 'moonpetals', name: 'Moonpetals', icon: '🌸', description: 'Delicate petals that bloom only under moonlight' },
  { id: 'crystal-phials', name: 'Crystal Phial', icon: '💎', description: 'Pure crystal container for essences' },
  { id: 'fluxroot', name: 'Fluxroot', icon: '🌿', description: 'A root that aids transformation' },
  { id: 'shadowmoss', name: 'Shadowmoss', icon: '🌑', description: 'Moss that grows in eternal darkness' },
  { id: 'essence-drop', name: 'Essence Drop', icon: '💧', description: 'Captured essence of a living being' },
  { id: 'moonseed', name: 'Moonseed', icon: '🌙', description: 'Seeds gathered during a full moon' },
  { id: 'starlight-essence', name: 'Starlight Essence', icon: '✨', description: 'Condensed light from distant stars' },
  { id: 'serpent-venom', name: 'Serpent Venom', icon: '🐍', description: 'Venom from a magical serpent' },
  { id: 'phoenix-ash', name: 'Phoenix Ash', icon: '🔥', description: 'Ash from a phoenix rebirth' },
  { id: 'mandrake-root', name: 'Mandrake Root', icon: '🌱', description: 'A screaming root with potent properties' },
]

type BrewTab = 'controls' | 'cauldron' | 'recipe'

// ============================================
// POTION BREWING COMPONENT
// ============================================

export function PotionBrewing({
  learnedPotions,
  onLearnPotion,
  onPracticePotion,
  onClose
}: PotionBrewingProps) {
  const [brewState, setBrewState] = useState<BrewState>({
    selectedPotion: null,
    phase: 'setup',
    fireLevel: 0,
    addedIngredients: new Map(),
    stirDirection: null,
    stirCount: 0,
    stirSpeed: 3,
    brewTime: 0,
    cauldronColor: '#1a1a2e',
    cauldronState: 'empty',
    result: null,
    resultMessage: '',
  })
  const [activeTab, setActiveTab] = useState<BrewTab>('cauldron')

  // Timer for brewing
  useEffect(() => {
    if (brewState.phase === 'brewing' && brewState.cauldronState === 'brewing') {
      const timer = setInterval(() => {
        setBrewState(prev => ({ ...prev, brewTime: prev.brewTime + 1 }))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [brewState.phase, brewState.cauldronState])

  // Calculate cauldron color based on state (no useEffect needed)
  const cauldronColor = (() => {
    if (brewState.cauldronState === 'empty') {
      return '#1a1a2e'
    } else if (brewState.cauldronState === 'heating') {
      const hue = 20 + (brewState.fireLevel / 100) * 30 // Orange to red
      return `hsl(${hue}, 70%, 30%)`
    } else if (brewState.cauldronState === 'brewing') {
      // Color changes based on ingredients and brewing progress
      const ingredientCount = brewState.addedIngredients.size
      const hue = 280 - (ingredientCount * 40) + (brewState.stirCount * 5)
      return `hsl(${Math.max(0, Math.min(360, hue))}, 60%, 35%)`
    }
    return brewState.cauldronColor
  })()

  // Set fire level
  const setFireLevel = (level: number) => {
    const newLevel = Math.max(0, Math.min(100, level))
    setBrewState(prev => ({
      ...prev,
      fireLevel: newLevel,
      cauldronState: newLevel > 0 && prev.cauldronState === 'empty' ? 'heating' :
                      newLevel > 0 ? prev.cauldronState : 'empty',
    }))
  }

  // Add ingredient
  const addIngredient = (ingredientId: string) => {
    setBrewState(prev => {
      const newIngredients = new Map(prev.addedIngredients)
      const current = newIngredients.get(ingredientId) || 0
      newIngredients.set(ingredientId, current + 1)
      return {
        ...prev,
        addedIngredients: newIngredients,
        cauldronState: prev.fireLevel > 0 ? 'brewing' : prev.cauldronState,
      }
    })
  }

  // Remove ingredient
  const removeIngredient = (ingredientId: string) => {
    setBrewState(prev => {
      const newIngredients = new Map(prev.addedIngredients)
      const current = newIngredients.get(ingredientId) || 0
      if (current <= 1) {
        newIngredients.delete(ingredientId)
      } else {
        newIngredients.set(ingredientId, current - 1)
      }
      return { ...prev, addedIngredients: newIngredients }
    })
  }

  // Stir the cauldron
  const stir = (direction: 'clockwise' | 'counter-clockwise') => {
    setBrewState(prev => ({
      ...prev,
      stirDirection: direction,
      stirCount: prev.stirCount + 1,
    }))

    // Reset stir direction after animation
    setTimeout(() => {
      setBrewState(prev => ({ ...prev, stirDirection: null }))
    }, 500)
  }

  // Set stir speed
  const setStirSpeed = (speed: number) => {
    setBrewState(prev => ({ ...prev, stirSpeed: Math.max(1, Math.min(5, speed)) }))
  }

  // Complete brewing and evaluate result
  const completeBrew = () => {
    if (!brewState.selectedPotion) return

    // Calculate success based on various factors
    const potion = brewState.selectedPotion
    let successScore = 50 // Base score

    // Check fire level (optimal is 50-70%)
    if (brewState.fireLevel >= 50 && brewState.fireLevel <= 70) {
      successScore += 20
    } else if (brewState.fireLevel >= 30 && brewState.fireLevel <= 80) {
      successScore += 10
    } else {
      successScore -= 10
    }

    // Check ingredients
    const requiredIngredients = potion.ingredients
    let ingredientScore = 0
    for (const req of requiredIngredients) {
      const added = brewState.addedIngredients.get(req.itemId) || 0
      if (added === req.quantity) {
        ingredientScore += 15
      } else if (added > 0) {
        ingredientScore += 5
      }
    }
    successScore += ingredientScore

    // Check stir count (optimal is 7-14 stirs)
    if (brewState.stirCount >= 7 && brewState.stirCount <= 14) {
      successScore += 15
    } else if (brewState.stirCount >= 5 && brewState.stirCount <= 20) {
      successScore += 5
    } else {
      successScore -= 10
    }

    // Check brew time (should be at least 30 seconds for practice)
    if (brewState.brewTime >= 30) {
      successScore += 10
    }

    // Add practice bonus
    const practiceBonus = (potion.brewPractice || 0) * 0.2
    successScore += practiceBonus

    // Determine result
    let result: 'success' | 'partial' | 'failed'
    let resultMessage: string

    if (successScore >= 80) {
      result = 'success'
      resultMessage = `Perfect! You've successfully brewed ${potion.name}! The potion shimmers with the correct properties.`
      onLearnPotion({ ...potion, learnedAt: Date.now(), brewPractice: Math.min(100, (potion.brewPractice || 0) + 10) })
    } else if (successScore >= 60) {
      result = 'partial'
      resultMessage = `Almost there! The ${potion.name} is usable but not perfectly brewed. Keep practicing!`
      onPracticePotion(potion.id)
    } else {
      result = 'failed'
      resultMessage = `The potion has failed. The ingredients have congealed into a useless sludge. Try again with more care.`
    }

    setBrewState(prev => ({
      ...prev,
      phase: 'result',
      cauldronState: result === 'success' ? 'ready' : 'failed',
      result,
      resultMessage,
    }))
  }

  // Reset brewing
  const resetBrew = () => {
    setBrewState({
      selectedPotion: brewState.selectedPotion,
      phase: 'brewing',
      fireLevel: 0,
      addedIngredients: new Map(),
      stirDirection: null,
      stirCount: 0,
      stirSpeed: 3,
      brewTime: 0,
      cauldronColor: '#1a1a2e',
      cauldronState: 'empty',
      result: null,
      resultMessage: '',
    })
    setActiveTab('cauldron')
  }

  // Select a potion to brew
  const selectPotion = (potion: PotionRecipe) => {
    setBrewState({
      selectedPotion: potion,
      phase: 'brewing',
      fireLevel: 0,
      addedIngredients: new Map(),
      stirDirection: null,
      stirCount: 0,
      stirSpeed: 3,
      brewTime: 0,
      cauldronColor: '#1a1a2e',
      cauldronState: 'empty',
      result: null,
      resultMessage: '',
    })
    setActiveTab('cauldron')
  }

  // ============================================
  // SETUP PHASE - select potion
  // ============================================
  if (brewState.phase === 'setup' || !brewState.selectedPotion) {
    return (
      <div className="h-full flex flex-col p-3 md:p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-cinzel text-amber-100 text-xl">Potion Brewing</h2>
            <p className="font-crimson text-amber-400/60 text-sm">Select a potion to brew</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2.5 font-crimson text-sm bg-amber-900/20 text-amber-300 rounded-lg hover:bg-amber-900/30 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            Leave Station
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {POTION_LIBRARY.map(potion => {
              const isLearned = learnedPotions.some(p => p.id === potion.id)
              return (
                <button
                  key={potion.id}
                  onClick={() => selectPotion(potion)}
                  className={`p-4 rounded-lg border text-left transition-all cursor-pointer min-h-[80px] active:scale-95 ${
                    isLearned
                      ? 'bg-green-950/30 border-green-700/30 hover:border-green-600/50'
                      : 'bg-amber-950/20 border-amber-900/30 hover:border-amber-700/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{potion.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-cinzel text-amber-100 text-sm">{potion.name}</h3>
                      <p className="font-crimson text-amber-200/60 text-xs mt-1 line-clamp-2">{potion.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-amber-400/60">Tier: {potion.tier}</span>
                        <span className="text-xs text-amber-400/60">•</span>
                        <span className="text-xs text-amber-400/60">{potion.brewTime}</span>
                      </div>
                      {isLearned && (
                        <span className="text-green-400 text-xs mt-2 block">✓ Learned</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // RESULT PHASE
  // ============================================
  if (brewState.phase === 'result') {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className={`text-6xl mb-4 ${brewState.result === 'success' ? 'animate-bounce' : ''}`}>
            {brewState.result === 'success' ? '✨' : brewState.result === 'partial' ? '⚗️' : '💨'}
          </div>
          <h2 className={`font-cinzel text-2xl mb-2 ${
            brewState.result === 'success' ? 'text-green-400' :
            brewState.result === 'partial' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {brewState.result === 'success' ? 'Potion Complete!' :
             brewState.result === 'partial' ? 'Partial Success' : 'Brewing Failed'}
          </h2>
          <p className="font-crimson text-amber-200/70 text-base mb-6">{brewState.resultMessage}</p>

          <div className="flex gap-3">
            <button
              onClick={resetBrew}
              className="flex-1 py-3 px-4 font-cinzel text-sm bg-amber-900/30 text-amber-300 rounded-lg hover:bg-amber-900/40 active:scale-95 transition-all cursor-pointer min-h-[52px]"
            >
              Try Again
            </button>
            <button
              onClick={() => setBrewState(prev => ({ ...prev, phase: 'setup', selectedPotion: null }))}
              className="flex-1 py-3 px-4 font-cinzel text-sm bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg hover:from-amber-600 hover:to-amber-800 active:scale-95 transition-all cursor-pointer min-h-[52px]"
            >
              Choose Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // BREWING PHASE
  // ============================================

  const canComplete = brewState.addedIngredients.size > 0 && brewState.fireLevel > 0

  return (
    <div className="h-full flex flex-col p-3 md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-cinzel text-amber-100 text-lg md:text-xl">{brewState.selectedPotion.name}</h2>
          <p className="font-crimson text-amber-400/60 text-sm">
            Time: {Math.floor(brewState.brewTime / 60)}:{(brewState.brewTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBrewState(prev => ({ ...prev, phase: 'setup', selectedPotion: null }))}
            className="px-3 py-2 font-crimson text-xs bg-amber-900/20 text-amber-300 rounded-lg hover:bg-amber-900/30 active:scale-95 transition-all cursor-pointer min-h-[40px]"
          >
            Change
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 font-crimson text-xs bg-red-900/20 text-red-300 rounded-lg hover:bg-red-900/30 active:scale-95 transition-all cursor-pointer min-h-[40px]"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex md:hidden gap-1 mb-3 bg-black/20 rounded-lg p-1">
        {([
          { id: 'controls' as BrewTab, icon: '⚗️', label: 'Controls' },
          { id: 'cauldron' as BrewTab, icon: '🫧', label: 'Cauldron' },
          { id: 'recipe' as BrewTab, icon: '📜', label: 'Recipe' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 font-cinzel rounded-md transition-all cursor-pointer active:scale-95 ${
              activeTab === tab.id
                ? 'bg-amber-700/50 text-amber-100'
                : 'text-amber-400/60 hover:text-amber-300'
            }`}
          >
            <span className="block text-base">{tab.icon}</span>
            <span className="block text-[10px] mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden min-h-0">
        {/* ── Left Panel – Controls ── */}
        <div className={`md:w-64 flex-col gap-3 overflow-y-auto ${activeTab === 'controls' ? 'flex' : 'hidden'} md:flex`}>

          {/* Fire Control */}
          <div className="bg-black/40 rounded-lg p-3 border border-amber-900/30">
            <h3 className="font-cinzel text-amber-100 text-xs mb-3 flex items-center gap-2">
              <span>🔥</span> Fire Control
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setFireLevel(0)}
                className="px-3 py-2 text-xs bg-gray-800 text-gray-300 rounded hover:bg-gray-700 active:scale-95 cursor-pointer min-h-[40px]"
              >
                Off
              </button>
              <button
                onClick={() => setFireLevel(brewState.fireLevel - 10)}
                className="w-10 h-10 text-lg bg-amber-900/30 text-amber-300 rounded hover:bg-amber-900/50 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                −
              </button>
              {/* Clickable progress bar */}
              <div
                className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pct = Math.round(((e.clientX - rect.left) / rect.width) * 10) * 10
                  setFireLevel(Math.max(0, Math.min(100, pct)))
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all"
                  style={{ width: `${brewState.fireLevel}%` }}
                />
              </div>
              <button
                onClick={() => setFireLevel(brewState.fireLevel + 10)}
                className="w-10 h-10 text-lg bg-amber-900/30 text-amber-300 rounded hover:bg-amber-900/50 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-amber-400/60 text-center">
              {brewState.fireLevel === 0 ? 'No heat' :
               brewState.fireLevel < 30 ? 'Low heat' :
               brewState.fireLevel < 70 ? 'Optimal heat' :
               brewState.fireLevel < 90 ? 'High heat' : 'Boiling!'}
            </p>
          </div>

          {/* Ingredients */}
          <div className="bg-black/40 rounded-lg p-3 border border-amber-900/30">
            <h3 className="font-cinzel text-amber-100 text-xs mb-2 flex items-center gap-2">
              <span>🧪</span> Ingredients
            </h3>
            <div className="space-y-2 max-h-52 md:max-h-32 overflow-y-auto">
              {AVAILABLE_INGREDIENTS.slice(0, 6).map(ing => {
                const added = brewState.addedIngredients.get(ing.id) || 0
                return (
                  <div key={ing.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base shrink-0">{ing.icon}</span>
                      <span className="font-crimson text-amber-200/70 text-xs truncate">{ing.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {added > 0 && (
                        <>
                          <button
                            onClick={() => removeIngredient(ing.id)}
                            className="w-8 h-8 rounded bg-amber-900/30 text-amber-300 hover:bg-amber-900/50 active:scale-95 cursor-pointer text-base flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-amber-300 text-sm">{added}</span>
                        </>
                      )}
                      <button
                        onClick={() => addIngredient(ing.id)}
                        className="w-8 h-8 rounded bg-green-900/30 text-green-300 hover:bg-green-900/50 active:scale-95 cursor-pointer text-base flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stirring */}
          <div className="bg-black/40 rounded-lg p-3 border border-amber-900/30">
            <h3 className="font-cinzel text-amber-100 text-xs mb-3 flex items-center gap-2">
              <span>🥄</span> Stirring
            </h3>
            <div className="flex items-center justify-center gap-4 mb-3">
              <button
                onClick={() => stir('counter-clockwise')}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl transition-all cursor-pointer active:scale-95 ${
                  brewState.stirDirection === 'counter-clockwise'
                    ? 'bg-amber-700/40 border-amber-500 scale-110'
                    : 'bg-amber-900/20 border-amber-700/30 hover:border-amber-600/50'
                }`}
              >
                ↺
              </button>
              <div className="text-center">
                <p className="font-cinzel text-amber-300 text-xl">{brewState.stirCount}</p>
                <p className="text-[10px] text-amber-400/60">stirs</p>
              </div>
              <button
                onClick={() => stir('clockwise')}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl transition-all cursor-pointer active:scale-95 ${
                  brewState.stirDirection === 'clockwise'
                    ? 'bg-amber-700/40 border-amber-500 scale-110'
                    : 'bg-amber-900/20 border-amber-700/30 hover:border-amber-600/50'
                }`}
              >
                ↻
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] text-amber-400/60">Speed:</span>
              {[1, 2, 3, 4, 5].map(speed => (
                <button
                  key={speed}
                  onClick={() => setStirSpeed(speed)}
                  className={`w-8 h-8 rounded text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                    brewState.stirSpeed === speed
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-amber-900/20 text-amber-400/60 hover:bg-amber-900/40'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center – Cauldron ── */}
        <div className={`flex-1 flex-col items-center justify-center gap-6 ${activeTab === 'cauldron' ? 'flex' : 'hidden'} md:flex`}>
          {/* Cauldron visualization */}
          <div className="relative">
            {/* Steam */}
            {brewState.fireLevel > 50 && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-white/20 rounded-full animate-float"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            )}

            {/* Cauldron */}
            <div
              className={`w-36 h-28 md:w-32 md:h-24 rounded-b-full border-4 border-amber-800 transition-all duration-500 relative overflow-hidden ${
                brewState.stirDirection ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: cauldronColor }}
            >
              {/* Bubbles */}
              {brewState.fireLevel > 30 && brewState.cauldronState === 'brewing' && (
                <div className="absolute inset-0 flex items-end justify-center gap-1 pb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-white/30 rounded-full animate-bounce"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: `${0.5 + i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Stirring effect */}
              {brewState.stirDirection && (
                <div
                  className="absolute inset-2 border-2 border-dashed border-white/20 rounded-full animate-spin"
                  style={{
                    animationDirection: brewState.stirDirection === 'clockwise' ? 'normal' : 'reverse',
                    animationDuration: `${1 / brewState.stirSpeed}s`,
                  }}
                />
              )}
            </div>

            {/* Fire */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
              <div
                className="flex gap-1"
                style={{ opacity: brewState.fireLevel / 100 }}
              >
                {Array.from({ length: Math.ceil(brewState.fireLevel / 20) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-4 bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent rounded-t-full animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Complete button – visible on desktop and on the Cauldron tab on mobile */}
          <button
            onClick={completeBrew}
            disabled={!canComplete}
            className={`px-8 py-3 font-cinzel text-sm tracking-wider rounded-lg transition-all cursor-pointer min-h-[52px] active:scale-95 ${
              canComplete
                ? 'bg-gradient-to-b from-green-700 to-green-900 text-green-100 hover:from-green-600 hover:to-green-800 border border-green-600/30 shadow-lg'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            Complete Brewing
          </button>
        </div>

        {/* ── Right Panel – Recipe ── */}
        <div className={`md:w-56 bg-black/40 rounded-lg p-3 border border-amber-900/30 overflow-y-auto ${activeTab === 'recipe' ? 'flex flex-col' : 'hidden'} md:block`}>
          <h3 className="font-cinzel text-amber-100 text-xs mb-3">Recipe: {brewState.selectedPotion.name}</h3>

          <div className="mb-3">
            <p className="text-[10px] text-amber-400/60 uppercase mb-1">Required Ingredients</p>
            <div className="space-y-1">
              {brewState.selectedPotion.ingredients.map(ing => {
                const added = brewState.addedIngredients.get(ing.itemId) || 0
                const isCorrect = added === ing.quantity
                const isPartial = added > 0 && added !== ing.quantity
                return (
                  <div
                    key={ing.itemId}
                    className={`text-xs flex items-center justify-between px-2 py-1.5 rounded ${
                      isCorrect ? 'bg-green-900/20 text-green-300' :
                      isPartial ? 'bg-amber-900/20 text-amber-300' :
                      'text-amber-400/60'
                    }`}
                  >
                    <span>{ing.itemName}</span>
                    <span>
                      {added}/{ing.quantity}
                      {isCorrect && ' ✓'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-[10px] text-amber-400/60 uppercase mb-1">Effects</p>
            <div className="space-y-1">
              {brewState.selectedPotion.effects.map((effect, i) => (
                <p key={i} className="text-xs text-amber-200/70">• {effect}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-amber-400/60 uppercase mb-1">Tips</p>
            <ul className="text-[10px] text-amber-200/50 space-y-1">
              <li>• Heat: 50-70% is optimal</li>
              <li>• Stir: 7-14 times</li>
              <li>• Balance ingredients carefully</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile sticky footer – Complete Brewing accessible from all tabs */}
      {activeTab !== 'cauldron' && (
        <div className="md:hidden mt-3 pt-3 border-t border-amber-900/20">
          <button
            onClick={canComplete ? completeBrew : () => setActiveTab('cauldron')}
            className={`w-full py-3 font-cinzel text-sm rounded-lg transition-all cursor-pointer active:scale-95 min-h-[48px] ${
              canComplete
                ? 'bg-gradient-to-b from-green-700 to-green-900 text-green-100 hover:from-green-600 hover:to-green-800 border border-green-600/30'
                : 'bg-amber-900/20 text-amber-300 hover:bg-amber-900/30 border border-amber-900/30'
            }`}
          >
            {canComplete ? 'Complete Brewing' : 'Go to Cauldron →'}
          </button>
        </div>
      )}
    </div>
  )
}
