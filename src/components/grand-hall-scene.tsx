'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Simple hydration check - returns true after first client render
function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    requestAnimationFrame(() => {
      setHydrated(true)
    })
  }, [])
  
  return hydrated
}

// ============================================
// GRAND HALL SCENE
// ============================================

interface GrandHallSceneProps {
  playerName: string
  hasMetHeadmistress: boolean
  onContinue?: () => void
  onMetHeadmistress?: () => void
}

export function GrandHallScene({ playerName, hasMetHeadmistress, onContinue, onMetHeadmistress }: GrandHallSceneProps) {
  const hydrated = useHydrated()
  // If already met headmistress, start at 'explore' phase
  const [phase, setPhase] = useState<'entrance' | 'headmistress' | 'supplies' | 'timetable' | 'explore'>(
    hasMetHeadmistress ? 'explore' : 'entrance'
  )
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 500)
    return () => {
      clearTimeout(t1)
    }
  }, [phase])

  const handleEntranceContinue = () => {
    setShowContent(false)
    setTimeout(() => {
      setPhase('headmistress')
      setShowContent(true)
    }, 500)
  }

  const handleReceiveSupplies = () => {
    // Mark as having met headmistress
    onMetHeadmistress?.()
    setShowContent(false)
    setTimeout(() => {
      setPhase('supplies')
      setShowContent(true)
    }, 500)
  }

  const handleViewTimetable = () => {
    setShowContent(false)
    setTimeout(() => {
      setPhase('timetable')
      setShowContent(true)
    }, 500)
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/grand-hall.png"
          alt="Grand Hall"
          fill
          className="object-cover"
          priority
        />
        {/* Warm overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Floating candles effect */}
      {hydrated && <FloatingCandles />}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-8 pb-16">
        
        {/* Phase 1: Entrance description (first visit only) */}
        {phase === 'entrance' && (
          <div className={`max-w-2xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-amber-900/40">
              <p className="font-crimson text-amber-100/90 text-lg leading-relaxed mb-4">
                The massive oak doors swing open, revealing the Grand Hall of Arcana Mystica. 
                Hundreds of candles float lazily near the vaulted ceiling, casting dancing shadows 
                across walls lined with portraits of ancient wizards.
              </p>
              <p className="font-crimson text-amber-200/70 text-base italic mb-6">
                Leather chairs and weathered desks cluster in intimate circles, while a figure 
                in flowing robes approaches with purpose...
              </p>
              <button
                onClick={handleEntranceContinue}
                className="w-full py-3 px-6 font-cinzel text-base tracking-wider bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 cursor-pointer"
              >
                Approach the Figure
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Headmistress greeting (first visit only) */}
        {phase === 'headmistress' && (
          <div className={`max-w-2xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-amber-900/40">
              {/* Headmistress portrait */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center border-2 border-amber-600/50 shadow-lg">
                  <span className="text-2xl">👩‍🏫</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-cinzel text-amber-100 text-lg tracking-wide">Headmistress Seraphina Vale</h3>
                  <p className="font-crimson text-amber-400/70 text-sm italic">Mistress of the Inner Circle</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="font-crimson text-amber-100/90 text-lg leading-relaxed">
                  &quot;Ah, {playerName}. We have been expecting you.&quot; Her voice carries the weight of centuries, 
                  yet remains surprisingly warm. &quot;Welcome to Arcana Mystica. You stand among the chosen few 
                  who possess the gift.&quot;
                </p>
                <p className="font-crimson text-amber-200/70 text-base leading-relaxed">
                  &quot;Before you begin your studies, you will need these...&quot; She produces a parchment 
                  sealed with wax and an ornate scroll. &quot;Your supply list and timetable. Choose your 
                  supplies wisely—you will find the school shop in the east wing.&quot;
                </p>
                <button
                  onClick={handleReceiveSupplies}
                  className="w-full py-3 px-6 font-cinzel text-base tracking-wider bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 cursor-pointer"
                >
                  Accept the Parchments
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Supply List */}
        {phase === 'supplies' && (
          <div className={`max-w-2xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <SupplyList playerName={playerName} onViewTimetable={handleViewTimetable} />
          </div>
        )}

        {/* Phase 4: Timetable */}
        {phase === 'timetable' && (
          <div className={`max-w-3xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Timetable playerName={playerName} onContinue={onContinue} hasMetHeadmistress={hasMetHeadmistress} />
          </div>
        )}

        {/* Phase 5: Explore (return visits) */}
        {phase === 'explore' && (
          <div className={`max-w-2xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-amber-900/40">
              <div className="text-center mb-4">
                <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">The Grand Hall</h2>
                <p className="font-crimson text-amber-400/60 text-sm italic">Heart of Arcana Mystica</p>
              </div>
              
              <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4 text-center">
                The Grand Hall stretches before you, its vaulted ceiling adorned with hundreds of floating 
                candles. Students cluster around worn desks, poring over ancient texts and practicing 
                their wand movements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-amber-950/30 rounded-lg p-4 border border-amber-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📚</span>
                    <span className="font-cinzel text-amber-200 text-sm">Notice Board</span>
                  </div>
                  <p className="font-crimson text-amber-200/60 text-xs">
                    Today: First-year orientation complete. Classes begin at dawn tomorrow.
                  </p>
                </div>
                <div className="bg-amber-950/30 rounded-lg p-4 border border-amber-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔥</span>
                    <span className="font-cinzel text-amber-200 text-sm">The Fireplace</span>
                  </div>
                  <p className="font-crimson text-amber-200/60 text-xs">
                    A roaring fire crackles in the massive hearth, casting warm shadows.
                  </p>
                </div>
              </div>

              <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-800/30 text-center">
                <p className="font-crimson text-amber-200/70 text-sm">
                  Use the <span className="text-amber-400">navigation menu</span> on the left to visit other areas 
                  of the school, check your inventory, or view your timetable.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SUPPLY LIST COMPONENT
// ============================================

interface SupplyListProps {
  playerName: string
  onViewTimetable: () => void
}

function SupplyList({ playerName, onViewTimetable }: SupplyListProps) {
  const supplies = [
    { item: 'Wand (core of your choosing)', essential: true, icon: '🪄' },
    { item: 'Robes (midnight blue, silver trim)', essential: true, icon: '🧥' },
    { item: 'Cauldron (pewter, size 2)', essential: true, icon: '⚗️' },
    { item: 'Crystal Phials (set of 7)', essential: true, icon: '🔮' },
    { item: 'Grimoire (bound in dragonhide)', essential: true, icon: '📕' },
    { item: 'Brass Scales', essential: false, icon: '⚖️' },
    { item: 'Telescope (brass, collapsible)', essential: false, icon: '🔭' },
    { item: 'Quill Set (phoenix feather)', essential: false, icon: '🪶' },
    { item: 'Ink (midnight black, 3 vials)', essential: false, icon: '🖋️' },
  ]

  return (
    <div className="bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-900/40 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="scroll-edge py-3 px-4 text-center">
        <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">Required Supplies</h2>
        <p className="font-crimson text-amber-200/60 text-sm italic mt-1">First Year Student</p>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <p className="font-crimson text-amber-100/80 text-sm mb-4 text-center">
          Student: <span className="font-cinzel text-amber-300">{playerName}</span>
        </p>
        
        <div className="space-y-2">
          {supplies.map((supply, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-amber-900/20 ${
                supply.essential ? 'border-l-2 border-amber-600' : 'border-l-2 border-amber-900/30'
              }`}
            >
              <span className="text-xl">{supply.icon}</span>
              <span className="font-crimson text-amber-100/90 flex-1">{supply.item}</span>
              {supply.essential && (
                <span className="text-xs font-cinzel text-amber-400 bg-amber-900/30 px-2 py-1 rounded">
                  ESSENTIAL
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Total cost */}
        <div className="mt-4 pt-4 border-t border-amber-900/30 flex justify-between items-center">
          <span className="font-crimson text-amber-200/60 text-sm italic">Estimated Cost:</span>
          <span className="font-cinzel text-amber-300 text-lg">42 Gold Sovereigns</span>
        </div>

        <button
          onClick={onViewTimetable}
          className="w-full mt-6 py-3 px-6 font-cinzel text-base tracking-wider bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 cursor-pointer"
        >
          View Your Timetable
        </button>
      </div>
    </div>
  )
}

// ============================================
// TIMETABLE COMPONENT
// ============================================

interface TimetableProps {
  playerName: string
  onContinue?: () => void
  hasMetHeadmistress: boolean
}

function Timetable({ playerName, onContinue, hasMetHeadmistress }: TimetableProps) {
  const timetable = [
    { day: 'Moonday', classes: ['Elemental Theory', 'Potions I', 'Astral Navigation'], icon: '🌙' },
    { day: 'Tiwsday', classes: ['Transmutation', 'Ancient Runes', 'Free Period'], icon: '⚔️' },
    { day: 'Wodansday', classes: ['Divination', 'Herbology', 'Defense Arts'], icon: '📖' },
    { day: 'Thorsday', classes: ['Alchemy Lab', 'Enchantments', 'Magical History'], icon: '⚡' },
    { day: 'Friggasday', classes: ['Summoning I', 'Wand Mastery', 'Study Hall'], icon: '🌸' },
    { day: 'Saturnsday', classes: ['Elective', 'Elective', 'Club Activities'], icon: '🪐' },
    { day: 'Sunday', classes: ['Rest', 'Rest', 'Rest'], icon: '☀️' },
  ]

  const classColors: Record<string, string> = {
    'Elemental Theory': 'from-blue-900/40 to-blue-800/20',
    'Potions I': 'from-green-900/40 to-green-800/20',
    'Astral Navigation': 'from-purple-900/40 to-purple-800/20',
    'Transmutation': 'from-amber-900/40 to-amber-800/20',
    'Ancient Runes': 'from-red-900/40 to-red-800/20',
    'Free Period': 'from-gray-800/40 to-gray-700/20',
    'Divination': 'from-indigo-900/40 to-indigo-800/20',
    'Herbology': 'from-emerald-900/40 to-emerald-800/20',
    'Defense Arts': 'from-orange-900/40 to-orange-800/20',
    'Alchemy Lab': 'from-yellow-900/40 to-yellow-800/20',
    'Enchantments': 'from-pink-900/40 to-pink-800/20',
    'Magical History': 'from-stone-900/40 to-stone-800/20',
    'Summoning I': 'from-violet-900/40 to-violet-800/20',
    'Wand Mastery': 'from-cyan-900/40 to-cyan-800/20',
    'Study Hall': 'from-slate-800/40 to-slate-700/20',
    'Elective': 'from-teal-900/40 to-teal-800/20',
    'Club Activities': 'from-rose-900/40 to-rose-800/20',
    'Rest': 'from-gray-700/40 to-gray-600/20',
  }

  return (
    <div className="bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-900/40 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="scroll-edge py-3 px-4 text-center">
        <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">Weekly Schedule</h2>
        <p className="font-crimson text-amber-200/60 text-sm italic mt-1">First Year • Term One</p>
      </div>
      
      {/* Student info */}
      <div className="px-6 py-3 border-b border-amber-900/30 bg-black/20">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-crimson text-amber-200/60 text-sm">Student:</span>
            <span className="font-cinzel text-amber-300 ml-2">{playerName}</span>
          </div>
          <div>
            <span className="font-crimson text-amber-200/60 text-sm">House:</span>
            <span className="font-cinzel text-amber-300 ml-2">Unsorted</span>
          </div>
        </div>
      </div>
      
      {/* Timetable grid */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Time slots header */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="p-2 text-center">
              <span className="font-cinzel text-amber-400/60 text-sm">Day</span>
            </div>
            <div className="p-2 text-center bg-black/20 rounded">
              <span className="font-cinzel text-amber-100 text-sm">Morning</span>
            </div>
            <div className="p-2 text-center bg-black/20 rounded">
              <span className="font-cinzel text-amber-100 text-sm">Afternoon</span>
            </div>
            <div className="p-2 text-center bg-black/20 rounded">
              <span className="font-cinzel text-amber-100 text-sm">Evening</span>
            </div>
          </div>

          {/* Schedule rows */}
          {timetable.map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2">
              {/* Day column */}
              <div className="p-3 bg-amber-900/20 rounded flex items-center justify-center gap-2">
                <span className="text-lg">{row.icon}</span>
                <span className="font-cinzel text-amber-200 text-sm">{row.day}</span>
              </div>
              
              {/* Classes */}
              {row.classes.map((className, j) => (
                <div 
                  key={j}
                  className={`p-2 rounded bg-gradient-to-b ${classColors[className] || 'from-gray-800/40 to-gray-700/20'} 
                    flex items-center justify-center text-center min-h-[50px] transition-all duration-300 hover:scale-[1.02]`}
                >
                  <span className="font-crimson text-amber-100/90 text-sm">{className}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="px-6 pb-4">
        <p className="font-crimson text-amber-200/50 text-sm italic text-center">
          ※ Classes begin at dawn. Tardiness will result in detention with the groundskeeper.
        </p>
      </div>

      <div className="px-6 pb-6">
        {onContinue && !hasMetHeadmistress ? (
          <button
            onClick={onContinue}
            className="w-full py-4 px-8 font-cinzel text-lg tracking-widest bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 shadow-lg hover:shadow-amber-900/50 transition-all duration-300 cursor-pointer"
          >
            Proceed to the School Shop
          </button>
        ) : (
          <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-800/30 text-center">
            <p className="font-crimson text-amber-200/70 text-sm">
              Use the <span className="text-amber-400">navigation menu</span> on the left to visit the School Shop, 
              check your inventory, or return to your dormitory.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// FLOATING CANDLES EFFECT
// ============================================

function FloatingCandles() {
  const [candles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: ((i * 13 + 7) % 100),
      top: ((i * 7 + 3) % 40),
      delay: ((i * 2) % 5),
      size: 8 + ((i * 3) % 8),
      flickerSpeed: 0.3 + ((i * 0.1) % 0.5),
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
            animation: `float ${6 + candle.delay}s ease-in-out infinite`,
          }}
        >
          {/* Candle body */}
          <div 
            className="relative"
            style={{
              width: `${candle.size}px`,
              height: `${candle.size * 2}px`,
            }}
          >
            {/* Wax */}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-100 to-amber-50 rounded-t-sm"
              style={{
                width: `${candle.size * 0.4}px`,
                height: `${candle.size * 1.5}px`,
              }}
            />
            
            {/* Flame */}
            <div 
              className="absolute -top-1 left-1/2 -translate-x-1/2"
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
                  boxShadow: `0 0 ${candle.size}px rgba(251, 191, 36, 0.6), 0 0 ${candle.size * 2}px rgba(251, 191, 36, 0.3)`,
                }}
              />
            </div>
            
            {/* Glow */}
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400/20 blur-md"
              style={{
                width: `${candle.size * 2}px`,
                height: `${candle.size * 2}px`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
