'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { InventoryState } from './game-navigation'
import { JournalEntry, JournalWriting, JournalViewer } from './journal-writing'
import { useHydrated } from '@/hooks/use-hydrated'
import { GameTime, getTimeSlot, getMoonPhaseInfo, getMoonForecast, MOON_PHASE_DATA, MoonPhase } from '@/lib/game-time'

// ============================================
// DORMITORY SCENE
// ============================================

interface DormitorySceneProps {
  playerName: string
  inventory: InventoryState
  journalEntries: JournalEntry[]
  onSaveJournalEntry: (entry: JournalEntry) => void
  onHeadToClass?: () => void
  onAdvanceTime?: () => void
  onGoToCommonRoom?: () => void
  hasVisitedShop?: boolean
  hasRequiredMaterials?: boolean
  gameTime?: GameTime
  /** 0 = no training, 1 = Beginner, 2 = Intermediate, 3 = Advanced, 4 = Mastery */
  astralNavigationLevel?: number
}

export function DormitoryScene({ playerName, inventory, journalEntries, onSaveJournalEntry, onHeadToClass, onAdvanceTime, onGoToCommonRoom, hasVisitedShop = false, hasRequiredMaterials = false, gameTime, astralNavigationLevel = 0 }: DormitorySceneProps) {
  const hydrated = useHydrated()
  const [phase, setPhase] = useState<'explore' | 'sleep'>('explore')
  const [showContent, setShowContent] = useState(true)
  const [activePanel, setActivePanel] = useState<'none' | 'desk' | 'window' | 'trunk' | 'bed'>('none')
  const [timeOfDay, setTimeOfDay] = useState<'night' | 'dawn'>('night')
  const [showJournalWriting, setShowJournalWriting] = useState(false)
  const [showJournalViewer, setShowJournalViewer] = useState(false)

  const isNightTime = gameTime ? getTimeSlot(gameTime.hour) === 'night' : true

  const handleSleep = () => {
    if (!isNightTime) return
    setShowContent(false)
    setTimeout(() => {
      setTimeOfDay('dawn')
      setPhase('sleep')
      setShowContent(true)
      onAdvanceTime?.()
    }, 1000)
  }

  // Calculate total items and low supplies
  const totalItems = inventory.items.reduce((sum, item) => sum + item.quantity, 0)
  const lowSupplies = inventory.items.filter(
    i => i.isConsumable && i.currentUses && i.maxUses && i.currentUses < i.maxUses * 0.3
  ).length

  // If journal writing is active, show that instead
  if (showJournalWriting) {
    return (
      <JournalWriting
        playerName={playerName}
        existingEntries={journalEntries}
        onSave={(entry) => {
          onSaveJournalEntry(entry)
          setShowJournalWriting(false)
        }}
        onClose={() => setShowJournalWriting(false)}
      />
    )
  }

  return (
    <>
      <div className="relative min-h-full w-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/dormitory.png"
            alt="Dormitory Room"
            fill
            className="object-cover"
            priority
          />
          {/* Time-based overlay */}
          <div className={`absolute inset-0 transition-all duration-[2000ms] ${timeOfDay === 'night' ? 'bg-black/30' : 'bg-amber-900/20'}`} />
        </div>

        {/* Floating candles */}
        {hydrated && <DormitoryCandles />}

        {/* Moonlight/Starlight effect */}
        {timeOfDay === 'night' && (
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-gradient-radial from-blue-200/20 to-transparent blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
        )}

        {/* Dawn light effect */}
        {timeOfDay === 'dawn' && (
          <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-amber-400/20 to-transparent animate-fade-in-up" />
        )}

        {/* Content */}
        <div className="relative z-10 min-h-full flex flex-col justify-end p-4 md:p-8 pb-16">
          
          {/* Explore phase */}
          {phase === 'explore' && (
            <div className={`max-w-4xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Room name */}
              <div className="text-center mb-4">
                <h2 className="font-cinzel text-amber-100 text-2xl tracking-wider">Your Dormitory</h2>
                <p className="font-crimson text-amber-400/60 text-sm italic">North Tower • Room 7</p>
              </div>

              {/* Interactive room elements */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <button
                  onClick={() => setActivePanel(activePanel === 'desk' ? 'none' : 'desk')}
                  className={`p-4 rounded-lg border transition-all text-center cursor-pointer ${
                    activePanel === 'desk' 
                      ? 'bg-amber-900/50 border-amber-600/50' 
                      : 'bg-black/50 border-amber-900/30 hover:border-amber-700/50'
                  }`}
                >
                  <span className="text-3xl block mb-2">📚</span>
                  <span className="font-crimson text-amber-100 text-sm">Study Desk</span>
                </button>

                <button
                  onClick={() => setActivePanel(activePanel === 'window' ? 'none' : 'window')}
                  className={`p-4 rounded-lg border transition-all text-center cursor-pointer ${
                    activePanel === 'window' 
                      ? 'bg-amber-900/50 border-amber-600/50' 
                      : 'bg-black/50 border-amber-900/30 hover:border-amber-700/50'
                  }`}
                >
                  <span className="text-3xl block mb-2">🌙</span>
                  <span className="font-crimson text-amber-100 text-sm">Window</span>
                </button>

                <button
                  onClick={() => setActivePanel(activePanel === 'trunk' ? 'none' : 'trunk')}
                  className={`p-4 rounded-lg border transition-all text-center cursor-pointer ${
                    activePanel === 'trunk' 
                      ? 'bg-amber-900/50 border-amber-600/50' 
                      : 'bg-black/50 border-amber-900/30 hover:border-amber-700/50'
                  }`}
                >
                  <span className="text-3xl block mb-2">🧳</span>
                  <span className="font-crimson text-amber-100 text-sm">Your Trunk</span>
                </button>

                <button
                  onClick={() => setActivePanel(activePanel === 'bed' ? 'none' : 'bed')}
                  className={`p-4 rounded-lg border transition-all text-center cursor-pointer ${
                    activePanel === 'bed' 
                      ? 'bg-amber-900/50 border-amber-600/50' 
                      : 'bg-black/50 border-amber-900/30 hover:border-amber-700/50'
                  }`}
                >
                  <span className="text-3xl block mb-2">🛏️</span>
                  <span className="font-crimson text-amber-100 text-sm">Your Bed</span>
                </button>
              </div>

              {/* Door to Common Room */}
              {onGoToCommonRoom && (
                <button
                  onClick={onGoToCommonRoom}
                  className="w-full py-3 px-6 mb-4 font-crimson text-base bg-gradient-to-r from-amber-900/50 to-amber-800/30 text-amber-200 rounded-lg border border-amber-700/30 hover:from-amber-800/50 hover:to-amber-700/40 hover:border-amber-600/50 transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🚪</span>
                  <span>Step Outside to the Common Room</span>
                </button>
              )}

              {/* Detail panels */}
              {activePanel !== 'none' && (
                <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-amber-900/40 p-6 mb-4 animate-fade-in-up">
                  {activePanel === 'desk' && (
                    <div>
                      <h3 className="font-cinzel text-amber-100 text-lg mb-3 flex items-center gap-2">
                        <span>📚</span> Study Desk
                      </h3>
                      <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
                        A sturdy oak desk sits by the window, illuminated by a floating candle. Your grimoire 
                        lies open, its pages blank and waiting. Your wand rests in its case, and your quill 
                        and ink are arranged neatly beside a stack of enchanted parchment.
                      </p>
                      
                      {/* Journal actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <button
                          onClick={() => setShowJournalWriting(true)}
                          className="p-4 rounded-lg bg-gradient-to-br from-amber-900/40 to-amber-950/40 border border-amber-700/30 hover:border-amber-600/50 transition-all cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🪶</span>
                            <span className="font-cinzel text-amber-100 text-sm">Write in Journal</span>
                          </div>
                          <p className="font-crimson text-amber-200/50 text-xs">
                            Record your thoughts and experiences...
                          </p>
                        </button>
                        
                        <button
                          onClick={() => setShowJournalViewer(true)}
                          disabled={journalEntries.length === 0}
                          className={`p-4 rounded-lg border transition-all cursor-pointer text-left ${
                            journalEntries.length > 0
                              ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700/30 hover:border-purple-600/50'
                              : 'bg-gray-800/20 border-gray-700/20 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">📖</span>
                            <span className="font-cinzel text-amber-100 text-sm">Read Past Entries</span>
                          </div>
                          <p className="font-crimson text-amber-200/50 text-xs">
                            {journalEntries.length > 0 
                              ? `${journalEntries.length} ${journalEntries.length === 1 ? 'entry' : 'entries'} recorded`
                              : 'No entries yet...'
                            }
                          </p>
                        </button>
                      </div>
                      
                      {/* Show items on desk from inventory */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {inventory.items.filter(i => ['books', 'misc', 'wands'].includes(i.category)).slice(0, 4).map(item => (
                          <div key={item.id} className="bg-amber-950/30 rounded-lg p-3 text-center">
                            <span className="text-xl block mb-1">{item.icon}</span>
                            <span className="font-crimson text-amber-200/70 text-xs">{item.name}</span>
                            {item.isConsumable && item.currentUses !== undefined && (
                              <div className="mt-1">
                                <div className="h-1 bg-amber-900/30 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${item.currentUses > (item.maxUses || 0) * 0.6 ? 'bg-green-500' : item.currentUses > (item.maxUses || 0) * 0.3 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${((item.currentUses / (item.maxUses || 1)) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {inventory.items.filter(i => ['books', 'misc', 'wands'].includes(i.category)).length === 0 && (
                          <div className="col-span-4 text-center py-4">
                            <p className="font-crimson text-amber-200/40 text-sm italic">No items yet. Visit the shop to purchase supplies.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activePanel === 'window' && (
                    <WindowPanel
                      inventory={inventory}
                      gameTime={gameTime}
                      astralNavigationLevel={astralNavigationLevel}
                    />
                  )}

                  {activePanel === 'trunk' && (
                    <div>
                      <h3 className="font-cinzel text-amber-100 text-lg mb-3 flex items-center gap-2">
                        <span>🧳</span> Personal Trunk
                      </h3>
                      <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
                        Your trunk sits at the foot of your bed, slightly open. Inside, you find your robes 
                        neatly folded, your cauldron and phials, and a small pouch containing your remaining 
                        gold sovereigns. A letter from home is tucked into the lid.
                      </p>
                      {/* Inventory summary */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-amber-950/30 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-crimson text-amber-200/60 text-sm">Gold:</span>
                            <span className="font-cinzel text-amber-300 text-lg">{inventory.gold} 🪙</span>
                          </div>
                        </div>
                        <div className="bg-amber-950/30 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-crimson text-amber-200/60 text-sm">Items:</span>
                            <span className="font-cinzel text-amber-300 text-lg">{totalItems}</span>
                          </div>
                        </div>
                      </div>
                      {/* Low supplies warning */}
                      {lowSupplies > 0 && (
                        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                          <p className="font-crimson text-red-300 text-sm flex items-center gap-2">
                            <span>⚠️</span>
                            {lowSupplies} supply{lowSupplies > 1 ? 's' : ''} running low! Visit the shop to restock.
                          </p>
                        </div>
                      )}
                      {/* Show robes status */}
                      {inventory.items.some(i => i.category === 'robes') && (
                        <div className="mt-3 bg-amber-950/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-crimson text-amber-200/60 text-sm">Robes:</span>
                            <span className="font-cinzel text-green-400 text-sm">Ready ✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activePanel === 'bed' && (
                    <div>
                      <h3 className="font-cinzel text-amber-100 text-lg mb-3 flex items-center gap-2">
                        <span>🛏️</span> Four-Poster Bed
                      </h3>
                      <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
                        A magnificent four-poster bed draped in midnight blue velvet curtains. The sheets 
                        are enchanted to stay perfectly warm, and the pillows adjust to your preferred 
                        firmness. A small card on the pillow reads: &quot;Rest well, young mage. Tomorrow 
                        awaits.&quot;
                      </p>
                      <button
                        onClick={handleSleep}
                        disabled={!isNightTime}
                        className={`w-full py-3 px-6 font-cinzel text-base tracking-wider rounded-lg border transition-all duration-300 ${
                          isNightTime
                            ? 'bg-gradient-to-b from-indigo-700 to-indigo-900 text-indigo-100 border-indigo-600/30 hover:from-indigo-600 hover:to-indigo-800 cursor-pointer'
                            : 'bg-gray-800/50 text-gray-500 border-gray-700/30 cursor-not-allowed'
                        }`}
                      >
                        {isNightTime ? '🌙 Sleep Until Dawn' : '🌙 Sleep Until Dawn (only at night)'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              {activePanel === 'none' && (
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-amber-900/30 text-center">
                  <p className="font-crimson text-amber-200/50 text-sm italic">
                    Click on an area to examine it more closely...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sleep phase - Next day */}
          {phase === 'sleep' && (
            <div className={`max-w-2xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-amber-900/40 shadow-2xl overflow-hidden">
                <div className="p-6 text-center">
                  {/* Dawn transition */}
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border-2 border-amber-300/50 shadow-lg animate-glow-pulse">
                    <span className="text-2xl">☀️</span>
                  </div>
                  
                  <h2 className="font-cinzel text-amber-100 text-xl tracking-wider mb-1">A New Day Dawns</h2>
                  <p className="font-crimson text-amber-400/70 text-sm mb-3">Moonday • First Day of Term</p>
                  
                  <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
                    Sunlight streams through your window. The breakfast bell echoes through the tower. 
                    Today is your first day of classes, {playerName}.
                  </p>

                  <div className="bg-amber-950/30 rounded-lg p-3 mb-4">
                    <h4 className="font-cinzel text-amber-300 text-xs mb-2">Today&apos;s Classes</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-crimson text-amber-100/70">Morning</span>
                        <span className="font-crimson text-amber-200">🔥 Elemental Theory</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-crimson text-amber-100/70">Afternoon</span>
                        <span className="font-crimson text-amber-200">⚗️ Potions I</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-crimson text-amber-100/70">Evening</span>
                        <span className="font-crimson text-amber-200">🔮 Astral Navigation</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning if not ready for class */}
                  {(!hasVisitedShop || !hasRequiredMaterials) && (
                    <div className="bg-red-900/30 border border-red-700/30 rounded-lg p-3 mb-4">
                      <p className="font-crimson text-red-300/80 text-sm text-center">
                        ⚠️ You need supplies before attending class!
                      </p>
                      <p className="font-crimson text-red-200/60 text-xs text-center mt-1">
                        {!hasVisitedShop
                          ? 'Visit the School Shop to purchase required items.'
                          : 'Make sure you have a wand, robes, cauldron, and grimoire.'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => onHeadToClass?.()}
                    disabled={!hasVisitedShop || !hasRequiredMaterials}
                    className={`w-full py-3 px-6 font-cinzel text-base tracking-wider rounded-lg border shadow-lg transition-all ${
                      hasVisitedShop && hasRequiredMaterials
                        ? 'bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 border-amber-600/30 hover:from-amber-600 hover:to-amber-800 cursor-pointer'
                        : 'bg-gray-800/50 text-gray-400 border-gray-700/30 cursor-not-allowed'
                    }`}
                  >
                    {hasVisitedShop && hasRequiredMaterials ? 'Head to Class' : 'Need Supplies First'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Journal Viewer Modal */}
      {showJournalViewer && (
        <JournalViewer
          entries={journalEntries}
          onClose={() => setShowJournalViewer(false)}
        />
      )}
    </>
  )
}

// ============================================
// WINDOW PANEL WITH TELESCOPE
// ============================================

interface WindowPanelProps {
  inventory: InventoryState
  gameTime?: GameTime
  astralNavigationLevel: number
}

function WindowPanel({ inventory, gameTime, astralNavigationLevel }: WindowPanelProps) {
  const [telescopeActive, setTelescopeActive] = useState(false)
  const hasTelescope = inventory.items.some(i => i.id === 'telescope')
  const dayNumber = gameTime?.dayNumber ?? 0
  const phaseInfo = getMoonPhaseInfo(dayNumber)
  const forecast = getMoonForecast(dayNumber, 12)

  return (
    <div>
      <h3 className="font-cinzel text-amber-100 text-lg mb-3 flex items-center gap-2">
        <span>🌙</span> Arched Window
      </h3>
      <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
        Through the gothic arched window, you can see the sprawling grounds of Corvenhal Academy.
        The twin moons hang low in the sky, casting silver light across the courtyard below.
        In the distance, you can make out the Forbidden Forest, its trees whispering secrets
        to the night wind.
      </p>

      {/* Windowsill inscription */}
      <div className="bg-amber-950/30 rounded-lg p-3 mb-4">
        <p className="font-crimson text-amber-200/60 text-sm italic text-center">
          &quot;The stars remember what mortals forget.&quot; — Inscribed on the windowsill
        </p>
      </div>

      {/* Moon display — shown if player has any astral training or uses telescope */}
      {astralNavigationLevel >= 1 && !telescopeActive && (
        <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{phaseInfo.icon}</span>
            <div>
              <p className="font-cinzel text-indigo-200 text-base">{phaseInfo.name}</p>
              <p className="font-crimson text-indigo-300/60 text-xs italic">{phaseInfo.theme}</p>
            </div>
          </div>
          {astralNavigationLevel >= 2 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-black/30 rounded p-2 text-center">
                <p className="font-crimson text-amber-400/60 text-xs">Spell Failure</p>
                <p className={`font-cinzel text-sm ${phaseInfo.spellFailureModifier > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {phaseInfo.spellFailureModifier > 0 ? '+' : ''}{phaseInfo.spellFailureModifier}%
                </p>
              </div>
              <div className="bg-black/30 rounded p-2 text-center">
                <p className="font-crimson text-amber-400/60 text-xs">Potion Potency</p>
                <p className={`font-cinzel text-sm ${phaseInfo.potionPotencyModifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {phaseInfo.potionPotencyModifier >= 0 ? '+' : ''}{phaseInfo.potionPotencyModifier}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Telescope section */}
      {hasTelescope && !telescopeActive && (
        <button
          onClick={() => setTelescopeActive(true)}
          className="w-full py-3 px-4 mb-3 font-cinzel text-sm tracking-wide bg-gradient-to-r from-indigo-900/50 to-indigo-800/30 text-indigo-200 rounded-lg border border-indigo-700/30 hover:from-indigo-800/50 hover:to-indigo-700/30 hover:border-indigo-600/50 transition-all cursor-pointer flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🔭</span>
          <span>Use Brass Telescope</span>
        </button>
      )}

      {!hasTelescope && astralNavigationLevel === 0 && (
        <div className="text-center py-2">
          <p className="font-crimson text-amber-200/40 text-sm italic">
            A telescope would help you study the moons more closely...
          </p>
        </div>
      )}

      {!hasTelescope && astralNavigationLevel >= 1 && (
        <div className="text-center py-2">
          <p className="font-crimson text-amber-200/40 text-sm italic">
            A brass telescope from the school shop would let you study the moons in greater detail.
          </p>
        </div>
      )}

      {/* Telescope view */}
      {telescopeActive && (
        <div className="bg-black/70 rounded-lg border border-indigo-700/40 p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔭</span>
              <h4 className="font-cinzel text-indigo-200 text-base">Brass Telescope View</h4>
            </div>
            <button
              onClick={() => setTelescopeActive(false)}
              className="text-amber-400/60 hover:text-amber-300 font-crimson text-sm cursor-pointer"
            >
              ✕ Lower telescope
            </button>
          </div>

          {/* Big moon display */}
          <div className="text-center mb-4">
            <div className="text-7xl mb-3 inline-block" style={{ filter: 'drop-shadow(0 0 16px rgba(147,197,253,0.4))' }}>
              {phaseInfo.icon}
            </div>
            <h4 className="font-cinzel text-amber-100 text-xl mb-1">{phaseInfo.name}</h4>
            <p className="font-crimson text-indigo-300/70 text-sm italic mb-3">{phaseInfo.description}</p>
          </div>

          {/* Phase effects */}
          <div className="bg-indigo-950/30 rounded-lg p-4 mb-4">
            <p className="font-crimson text-indigo-300/60 text-xs uppercase mb-2">
              {astralNavigationLevel === 0 ? 'What you observe' : 'Phase Effects'}
            </p>
            {astralNavigationLevel === 0 ? (
              <p className="font-crimson text-amber-200/70 text-sm leading-relaxed">
                The twin moons are in their {phaseInfo.name.toLowerCase()} phase. Without training in Astral Navigation,
                you cannot fully interpret what this means for your magic. Enrol in Astral Navigation to learn more.
              </p>
            ) : (
              <ul className="space-y-1">
                {phaseInfo.effects.map((effect, i) => (
                  <li key={i} className="font-crimson text-indigo-200/80 text-sm flex items-center gap-2">
                    <span className="text-indigo-400">◆</span> {effect}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Numerical modifiers (Intermediate+) */}
          {astralNavigationLevel >= 2 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/40 rounded-lg p-3 text-center">
                <p className="font-crimson text-amber-400/60 text-xs mb-1">Spell Failure</p>
                <p className={`font-cinzel text-lg ${phaseInfo.spellFailureModifier > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {phaseInfo.spellFailureModifier > 0 ? '+' : ''}{phaseInfo.spellFailureModifier}%
                </p>
              </div>
              <div className="bg-black/40 rounded-lg p-3 text-center">
                <p className="font-crimson text-amber-400/60 text-xs mb-1">Potion Potency</p>
                <p className={`font-cinzel text-lg ${phaseInfo.potionPotencyModifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {phaseInfo.potionPotencyModifier >= 0 ? '+' : ''}{phaseInfo.potionPotencyModifier}%
                </p>
              </div>
            </div>
          )}

          {/* Forecast (Intermediate+) */}
          {astralNavigationLevel >= 2 && forecast.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4">
              <p className="font-crimson text-indigo-300/60 text-xs uppercase mb-3">
                {astralNavigationLevel >= 3 ? 'Full Cycle Forecast' : 'Upcoming Phases'}
              </p>
              <div className="flex flex-wrap gap-2">
                {forecast.slice(0, astralNavigationLevel >= 3 ? forecast.length : 2).map(({ dayOffset, phase }) => (
                  <div key={dayOffset} className="flex items-center gap-2 bg-indigo-950/40 rounded-lg px-3 py-2">
                    <span className="text-2xl">{phase.icon}</span>
                    <div>
                      <p className="font-cinzel text-amber-100 text-xs">{phase.name}</p>
                      <p className="font-crimson text-indigo-300/60 text-xs">in {dayOffset} day{dayOffset !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt to take the class if untrained */}
          {astralNavigationLevel === 0 && (
            <div className="mt-3 bg-amber-950/20 border border-amber-800/20 rounded-lg p-3 text-center">
              <p className="font-crimson text-amber-300/60 text-sm">
                Enrol in <span className="text-amber-300">Astral Navigation</span> (Moonday evenings) to understand what you see.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// DORMITORY CANDLES
// ============================================

function DormitoryCandles() {
  const [candles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 15 + ((i * 17) % 70),
      top: 5 + ((i * 11) % 30),
      delay: ((i * 3) % 6),
      size: 6 + ((i * 2) % 6),
      flickerSpeed: 0.3 + ((i * 0.07) % 0.4),
    }))
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {candles.map(candle => (
        <div
          key={candle.id}
          className="absolute"
          style={{
            left: `${candle.left}%`,
            top: `${candle.top}%`,
            animationDelay: `${candle.delay}s`,
            animation: `float ${5 + candle.delay}s ease-in-out infinite`,
          }}
        >
          {/* Flame */}
          <div 
            className="relative"
            style={{
              animation: `candle-flicker ${candle.flickerSpeed}s ease-in-out infinite`,
            }}
          >
            <div 
              className="rounded-full"
              style={{
                width: `${candle.size * 0.3}px`,
                height: `${candle.size * 0.5}px`,
                background: 'linear-gradient(to top, #f97316, #fbbf24, #fef08a)',
                boxShadow: `0 0 ${candle.size}px rgba(251, 191, 36, 0.7), 0 0 ${candle.size * 2}px rgba(251, 191, 36, 0.4)`,
              }}
            />
          </div>
          
          {/* Glow */}
          <div 
            className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400/30 blur-md"
            style={{
              width: `${candle.size * 1.5}px`,
              height: `${candle.size * 1.5}px`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
