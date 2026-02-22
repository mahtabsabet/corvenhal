'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useHydrated } from '@/hooks/use-hydrated'

// ============================================
// COMMON ROOM SCENE
// ============================================

interface CommonRoomSceneProps {
  playerName: string
  inventory?: { gold: number }
  hasVisitedShop?: boolean
}

export function CommonRoomScene({ playerName, inventory, hasVisitedShop }: CommonRoomSceneProps) {
  const hydrated = useHydrated()
  const [showContent, setShowContent] = useState(false)
  const [activePanel, setActivePanel] = useState<'none' | 'fireplace' | 'board' | 'seating' | 'shelves'>('none')

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 500)
    return () => clearTimeout(t1)
  }, [])

  // Time-based ambiance messages
  const getAmbianceMessage = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return "Morning light streams through the tall windows, casting long shadows across the worn carpet."
    } else if (hour >= 12 && hour < 17) {
      return "The afternoon sun warms the common room, and students gather in clusters to study."
    } else if (hour >= 17 && hour < 21) {
      return "Evening settles over the common room. The fire crackles warmly in the hearth."
    } else {
      return "Night has fallen. The common room is quiet, lit only by the dying embers of the fire and floating candles."
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/common-room.png"
          alt="Common Room"
          fill
          className="object-cover"
          priority
        />
        {/* Warm overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Floating candles */}
      {hydrated && <CommonRoomCandles />}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-8 pb-16">
        <div className={`max-w-3xl mx-auto w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Room header */}
          <div className="text-center mb-4">
            <h2 className="font-cinzel text-amber-100 text-2xl tracking-wider">The Common Room</h2>
            <p className="font-crimson text-amber-400/60 text-sm italic">A place of rest and fellowship</p>
          </div>

          {/* Interactive room elements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => setActivePanel(activePanel === 'fireplace' ? 'none' : 'fireplace')}
              className={`p-4 rounded-lg border transition-all text-center cursor-pointer ${
                activePanel === 'fireplace' 
                  ? 'bg-amber-900/50 border-amber-600/50' 
                  : 'bg-black/50 border-amber-900/30 hover:border-amber-700/50'
              }`}
            >
              <span className="text-3xl block mb-2">🔥</span>
              <span className="font-crimson text-amber-100 text-sm">Fireplace</span>
            </button>

            <button
              onClick={() => setActivePanel(activePanel === 'seating' ? 'none' : 'seating')}
              className={`p-4 rounded-lg border transition-all text-center cursor-pointer ${
                activePanel === 'seating' 
                  ? 'bg-amber-900/50 border-amber-600/50' 
                  : 'bg-black/50 border-amber-900/30 hover:border-amber-700/50'
              }`}
            >
              <span className="text-3xl block mb-2">🛋️</span>
              <span className="font-crimson text-amber-100 text-sm">Seating Area</span>
            </button>

            <button
              onClick={() => setActivePanel(activePanel === 'board' ? 'none' : 'board')}
              className={`p-4 rounded-lg border transition-all text-center cursor-pointer ${
                activePanel === 'board' 
                  ? 'bg-amber-900/50 border-amber-600/50' 
                  : 'bg-black/50 border-amber-900/30 hover:border-amber-700/50'
              }`}
            >
              <span className="text-3xl block mb-2">📋</span>
              <span className="font-crimson text-amber-100 text-sm">Notice Board</span>
            </button>

            <button
              onClick={() => setActivePanel(activePanel === 'shelves' ? 'none' : 'shelves')}
              className={`p-4 rounded-lg border transition-all text-center cursor-pointer ${
                activePanel === 'shelves' 
                  ? 'bg-amber-900/50 border-amber-600/50' 
                  : 'bg-black/50 border-amber-900/30 hover:border-amber-700/50'
              }`}
            >
              <span className="text-3xl block mb-2">📚</span>
              <span className="font-crimson text-amber-100 text-sm">Bookshelves</span>
            </button>
          </div>

          {/* Detail panels */}
          {activePanel !== 'none' && (
            <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-amber-900/40 p-6 mb-4 animate-fade-in-up">
              {activePanel === 'fireplace' && (
                <div>
                  <h3 className="font-cinzel text-amber-100 text-lg mb-3 flex items-center gap-2">
                    <span>🔥</span> The Hearth
                  </h3>
                  <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
                    A massive stone fireplace dominates one wall, its flames dancing in perpetual enchantment. 
                    The fire never dies, a gift from the founder mages to warm students through the coldest winters.
                    Worn armchairs cluster around it, their leather cracked and comfortable from generations of use.
                  </p>
                  <p className="font-crimson text-amber-200/60 text-sm italic">
                    &quot;The fire warms not just the body, but the spirit of fellowship.&quot;
                  </p>
                </div>
              )}

              {activePanel === 'seating' && (
                <div>
                  <h3 className="font-cinzel text-amber-100 text-lg mb-3 flex items-center gap-2">
                    <span>🛋️</span> Gathering Places
                  </h3>
                  <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
                    Plush sofas and worn armchairs are arranged in intimate circles throughout the room. 
                    Low tables bear the marks of countless study sessions—ink stains, scratched runes, 
                    and the occasional scorch mark from an overenthusiastic spell practice.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-amber-950/30 rounded-lg p-3">
                      <p className="font-crimson text-amber-200/70 text-sm">Students studying</p>
                      <p className="font-cinzel text-amber-300 text-lg">3 groups</p>
                    </div>
                    <div className="bg-amber-950/30 rounded-lg p-3">
                      <p className="font-crimson text-amber-200/70 text-sm">Available seats</p>
                      <p className="font-cinzel text-amber-300 text-lg">Several</p>
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'board' && (
                <div>
                  <h3 className="font-cinzel text-amber-100 text-lg mb-3 flex items-center gap-2">
                    <span>📋</span> Notice Board
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-amber-950/30 rounded-lg p-3 border-l-2 border-amber-600">
                      <p className="font-cinzel text-amber-200 text-sm">Upcoming Event</p>
                      <p className="font-crimson text-amber-100/80 text-sm">
                        🌙 Midterm examinations begin next Moonday. Review sessions in the library.
                      </p>
                    </div>
                    <div className="bg-amber-950/30 rounded-lg p-3 border-l-2 border-purple-600">
                      <p className="font-cinzel text-purple-200 text-sm">Club Notice</p>
                      <p className="font-crimson text-amber-100/80 text-sm">
                        ✨ The Astronomy Club meets tonight at the observatory tower. All years welcome.
                      </p>
                    </div>
                    <div className="bg-amber-950/30 rounded-lg p-3 border-l-2 border-green-600">
                      <p className="font-cinzel text-green-200 text-sm">Reminder</p>
                      <p className="font-crimson text-amber-100/80 text-sm">
                        ⚗️ Potions supplies must be returned to the cupboard by sundown.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'shelves' && (
                <div>
                  <h3 className="font-cinzel text-amber-100 text-lg mb-3 flex items-center gap-2">
                    <span>📚</span> Bookshelves
                  </h3>
                  <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
                    Tall shelves line the walls, filled with worn volumes donated by generations of students. 
                    Fiction mingles with practical guides, and a small collection of board games sits dusty 
                    but well-loved on the lower shelves.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-amber-950/30 rounded-lg p-2 text-center">
                      <span className="text-xl block">📖</span>
                      <span className="font-crimson text-amber-200/70 text-xs">Novels</span>
                    </div>
                    <div className="bg-amber-950/30 rounded-lg p-2 text-center">
                      <span className="text-xl block">🎲</span>
                      <span className="font-crimson text-amber-200/70 text-xs">Games</span>
                    </div>
                    <div className="bg-amber-950/30 rounded-lg p-2 text-center">
                      <span className="text-xl block">📜</span>
                      <span className="font-crimson text-amber-200/70 text-xs">Scrolls</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {activePanel === 'none' && (
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-amber-900/30 text-center">
              <p className="font-crimson text-amber-200/50 text-sm italic mb-2">
                {getAmbianceMessage()}
              </p>
              <p className="font-crimson text-amber-200/40 text-xs">
                Click on an area to examine it more closely...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// FLOATING CANDLES
// ============================================

function CommonRoomCandles() {
  const [candles] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: ((i * 13 + 7) % 100),
      top: ((i * 7 + 3) % 30),
      delay: ((i * 2) % 5),
      size: 6 + ((i * 3) % 8),
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
      ))}
    </div>
  )
}
