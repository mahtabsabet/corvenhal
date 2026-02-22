'use client'

import { useState, useEffect, useCallback } from 'react'
import { useHydrated } from '@/hooks/use-hydrated'
import { DepartureScene, JourneyScene, CastleReveal } from '@/components/game-scenes'
import { GrandHallScene } from '@/components/grand-hall-scene'
import { SchoolShop } from '@/components/school-shop'
import { DormitoryScene } from '@/components/dormitory-scene'
import { CommonRoomScene } from '@/components/common-room-scene'
import { ClassroomScene, ClassType } from '@/components/classroom-scene'
import {
  NavigationSidebar,
  InventoryPanel,
  GameLocation,
  InventoryState,
  InventoryItem,
  addItemToInventory
} from '@/components/game-navigation'
import { JournalEntry } from '@/components/journal-writing'
import { Spellbook } from '@/components/spellbook'
import { SpellToolbar } from '@/components/spell-toolbar'
import { Spell, PotionRecipe, getStartingSpells } from '@/lib/spells'
import { GameTime, getDefaultGameTime, advanceTime } from '@/lib/game-time'
import { SaveGame, SAVE_VERSION, saveGame, loadGame, clearSave } from '@/lib/save-game'
import { RestartModal } from '@/components/restart-modal'
import { NamePrompt, AcceptanceScroll } from '@/components/intro-screens'

// ============================================
// MAIN GAME COMPONENT
// ============================================

// Check if player has required materials for class
function checkHasRequiredMaterials(inventory: InventoryState): boolean {
  const requiredCategories = ['wands', 'robes', 'cauldrons', 'books']
  const hasAll = requiredCategories.every(category =>
    inventory.items.some(item => item.category === category)
  )
  return hasAll
}

const defaultInventory: InventoryState = {
  gold: 100,
  items: [],
  currentTerm: 1,
  termProgress: 0,
}

export default function Home() {
  // Hydration state
  const hydrated = useHydrated()

  // Game progression state
  const [gameState, setGameState] = useState<'prompt' | 'scroll' | 'departure' | 'journey' | 'castle' | 'school'>('prompt')
  const [playerName, setPlayerName] = useState('')

  // Current location within school
  const [currentLocation, setCurrentLocation] = useState<GameLocation>('academy')

  // Inventory state
  const [inventory, setInventory] = useState<InventoryState>(defaultInventory)

  // Event flags - track what the player has experienced
  const [hasMetHeadmistress, setHasMetHeadmistress] = useState(false)
  const [hasVisitedShop, setHasVisitedShop] = useState(false)

  // Journal entries
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])

  // Spells and potions
  const [learnedSpells, setLearnedSpells] = useState<Spell[]>([])
  const [learnedPotions, setLearnedPotions] = useState<PotionRecipe[]>([])
  const [currentMana, setCurrentMana] = useState(100)
  const [maxMana, setMaxMana] = useState(100)

  // Game time
  const [gameTime, setGameTime] = useState<GameTime>(getDefaultGameTime())

  // Current class type for classroom
  const [currentClassType, setCurrentClassType] = useState<ClassType>('elemental')

  // UI state
  const [showInventory, setShowInventory] = useState(false)
  const [showSpellbook, setShowSpellbook] = useState(false)
  const [showRestartModal, setShowRestartModal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [savedPlayerName, setSavedPlayerName] = useState<string | undefined>()

  // Load saved game on mount
  useEffect(() => {
    const saved = loadGame()
    if (saved) {
      setSavedPlayerName(saved.playerName) // eslint-disable-line react-hooks/set-state-in-effect
    }
    setIsLoaded(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  // Load saved game
  const handleLoadSave = useCallback(() => {
    const saved = loadGame()
    if (saved) {
      setPlayerName(saved.playerName)
      setGameState(saved.gameState)
      setCurrentLocation(saved.currentLocation)
      setInventory(saved.inventory)
      setHasMetHeadmistress(saved.hasMetHeadmistress ?? false)
      setHasVisitedShop(saved.hasVisitedShop ?? false)
      setJournalEntries(saved.journalEntries ?? [])
      setLearnedSpells(saved.learnedSpells ?? getStartingSpells())
      setLearnedPotions(saved.learnedPotions ?? [])
      setCurrentMana(saved.currentMana ?? 100)
      setMaxMana(saved.maxMana ?? 100)
      setGameTime(saved.gameTime ?? getDefaultGameTime())
    }
  }, [])

  // Auto-save whenever relevant state changes
  useEffect(() => {
    if (!isLoaded || gameState === 'prompt') return

    const saveData: SaveGame = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      playerName,
      gameState,
      currentLocation,
      inventory,
      hasMetHeadmistress,
      hasVisitedShop,
      journalEntries,
      learnedSpells,
      learnedPotions,
      currentMana,
      maxMana,
      gameTime,
    }

    saveGame(saveData)
  }, [isLoaded, playerName, gameState, currentLocation, inventory, hasMetHeadmistress, hasVisitedShop, journalEntries, learnedSpells, learnedPotions, currentMana, maxMana, gameTime])

  const handleNameSubmit = (name: string) => {
    setPlayerName(name)
    setGameState('scroll')
  }

  const handleScrollContinue = () => {
    setGameState('departure')
  }

  const handleDepartureContinue = () => {
    setGameState('journey')
  }

  const handleJourneyArrive = () => {
    setGameState('castle')
  }

  const handleCastleEnter = () => {
    setGameState('school')
    setCurrentLocation('academy')
  }

  const handleNavigate = useCallback((location: GameLocation) => {
    // Check if navigating to classroom and get selected class BEFORE setting location
    if (location === 'classroom' && typeof window !== 'undefined') {
      const selectedClass = sessionStorage.getItem('selectedClass') as ClassType | null
      if (selectedClass) {
        setCurrentClassType(selectedClass)
        sessionStorage.removeItem('selectedClass')
      }
    }
    setCurrentLocation(location)
  }, [])

  const handlePurchaseComplete = (goldRemaining: number, purchasedItems: InventoryItem[]) => {
    setInventory(prev => {
      let newItems = [...prev.items]
      for (const item of purchasedItems) {
        newItems = addItemToInventory(newItems, item)
      }
      return {
        ...prev,
        gold: goldRemaining,
        items: newItems,
      }
    })
    setCurrentLocation('dormitory')
  }

  const handleSaveJournalEntry = useCallback((entry: JournalEntry) => {
    setJournalEntries(prev => [...prev, entry])
  }, [])

  const handleRestart = useCallback(() => {
    clearSave()
    setPlayerName('')
    setGameState('prompt')
    setCurrentLocation('academy')
    setInventory(defaultInventory)
    setHasMetHeadmistress(false)
    setHasVisitedShop(false)
    setJournalEntries([])
    setLearnedSpells([])
    setLearnedPotions([])
    setCurrentMana(100)
    setMaxMana(100)
    setGameTime(getDefaultGameTime())
    setShowRestartModal(false)
    setSavedPlayerName(undefined)
  }, [])

  // Handle leaving class - advance time by 2 hours
  const handleLeaveClass = useCallback(() => {
    setGameTime(prev => advanceTime(prev, 2))
    setCurrentLocation('academy')
  }, [])

  // Spell handlers
  const handleLearnSpell = useCallback((spell: Spell) => {
    setLearnedSpells(prev => {
      if (prev.find(s => s.id === spell.id)) return prev
      return [...prev, { ...spell, learnedAt: Date.now(), castingPractice: 0 }]
    })
  }, [])

  const handleLearnPotion = useCallback((potion: PotionRecipe) => {
    setLearnedPotions(prev => {
      if (prev.find(p => p.id === potion.id)) return prev
      return [...prev, { ...potion, learnedAt: Date.now(), brewPractice: 0 }]
    })
  }, [])

  const handlePracticeSpell = useCallback((spellId: string) => {
    setLearnedSpells(prev => prev.map(spell => {
      if (spell.id === spellId) {
        return {
          ...spell,
          castingPractice: Math.min(100, spell.castingPractice + Math.floor(Math.random() * 10) + 5)
        }
      }
      return spell
    }))
  }, [])

  const handleToggleFavorite = useCallback((spellId: string) => {
    setLearnedSpells(prev => prev.map(spell => {
      if (spell.id === spellId) {
        return { ...spell, isFavorite: !spell.isFavorite }
      }
      return spell
    }))
  }, [])

  const handleCastSpell = useCallback((spell: Spell) => {
    if (currentMana >= spell.manaCost) {
      setCurrentMana(prev => Math.max(0, prev - spell.manaCost))
      // Could add visual effect or game logic here
    }
  }, [currentMana])

  const handleRemoveFavorite = useCallback((spellId: string) => {
    setLearnedSpells(prev => prev.map(spell => {
      if (spell.id === spellId) {
        return { ...spell, isFavorite: false }
      }
      return spell
    }))
  }, [])

  // Show loading state during hydration
  if (!hydrated || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#0d0b09] flex items-center justify-center">
        <div className="text-amber-600/60 font-cinzel text-xl animate-pulse">
          Loading...
        </div>
      </div>
    )
  }

  // Pre-school scenes (no navigation)
  if (gameState === 'prompt') {
    return (
      <NamePrompt
        onSubmit={handleNameSubmit}
        hasExistingSave={!!savedPlayerName}
        onLoadSave={handleLoadSave}
        savedPlayerName={savedPlayerName}
      />
    )
  }

  if (gameState === 'scroll') {
    return <AcceptanceScroll studentName={playerName} onContinue={handleScrollContinue} />
  }

  if (gameState === 'departure') {
    return <DepartureScene playerName={playerName} onContinue={handleDepartureContinue} />
  }

  if (gameState === 'journey') {
    return <JourneyScene onArrive={handleJourneyArrive} />
  }

  if (gameState === 'castle') {
    return <CastleReveal playerName={playerName} onEnter={handleCastleEnter} />
  }

  // School scenes (with navigation)
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        currentLocation={currentLocation}
        onNavigate={handleNavigate}
        gold={inventory.gold}
        onOpenInventory={() => setShowInventory(true)}
        onOpenTimetable={() => {}}
        onOpenSpellbook={() => setShowSpellbook(true)}
        onRestart={() => setShowRestartModal(true)}
        playerName={playerName}
        learnedSpellsCount={learnedSpells.length}
        gameTime={gameTime}
        hasVisitedShop={hasVisitedShop}
        hasRequiredMaterials={checkHasRequiredMaterials(inventory)}
      />

      {/* Main content area - offset for sidebar on desktop */}
      <div className="flex-1 md:ml-56 overflow-y-auto">
        {currentLocation === 'academy' && (
          <GrandHallScene
            playerName={playerName}
            hasMetHeadmistress={hasMetHeadmistress}
            onContinue={() => setCurrentLocation('shop')}
            onMetHeadmistress={() => setHasMetHeadmistress(true)}
          />
        )}

        {currentLocation === 'shop' && (
          <SchoolShop
            playerName={playerName}
            inventory={inventory}
            hasVisitedShop={hasVisitedShop}
            onContinue={handlePurchaseComplete}
            onVisitedShop={() => setHasVisitedShop(true)}
          />
        )}

        {currentLocation === 'dormitory' && (
          <DormitoryScene
            playerName={playerName}
            inventory={inventory}
            journalEntries={journalEntries}
            onSaveJournalEntry={handleSaveJournalEntry}
            onHeadToClass={() => setCurrentLocation('classroom')}
            onAdvanceTime={() => setGameTime(prev => advanceTime(prev, 12))}
            onGoToCommonRoom={() => setCurrentLocation('common-room')}
            hasVisitedShop={hasVisitedShop}
            hasRequiredMaterials={checkHasRequiredMaterials(inventory)}
            gameTime={gameTime}
          />
        )}

        {currentLocation === 'common-room' && (
          <CommonRoomScene
            playerName={playerName}
            inventory={inventory}
            hasVisitedShop={hasVisitedShop}
          />
        )}

        {currentLocation === 'classroom' && (
          <ClassroomScene
            playerName={playerName}
            classType={currentClassType}
            learnedSpells={learnedSpells}
            learnedPotions={learnedPotions}
            onLearnSpell={handleLearnSpell}
            onLearnPotion={handleLearnPotion}
            onPracticeSpell={handlePracticeSpell}
            onLeave={handleLeaveClass}
          />
        )}
      </div>

      {/* Inventory Panel */}
      <InventoryPanel
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        inventory={inventory}
      />

      {/* Spellbook */}
      {showSpellbook && (
        <Spellbook
          learnedSpells={learnedSpells}
          learnedPotions={learnedPotions}
          onClose={() => setShowSpellbook(false)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Spell Toolbar */}
      <SpellToolbar
        favoriteSpells={learnedSpells.filter(s => s.isFavorite)}
        onOpenSpellbook={() => setShowSpellbook(true)}
        onCastSpell={handleCastSpell}
        onRemoveFavorite={handleRemoveFavorite}
        currentMana={currentMana}
        maxMana={maxMana}
      />

      {/* Restart Modal */}
      <RestartModal
        isOpen={showRestartModal}
        onConfirm={handleRestart}
        onCancel={() => setShowRestartModal(false)}
        playerName={playerName}
      />
    </div>
  )
}
