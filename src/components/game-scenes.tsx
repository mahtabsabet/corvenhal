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
// SCENE 1: THE DEPARTURE (Cottage & Carriage)
// ============================================

interface DepartureSceneProps {
  playerName: string
  onContinue: () => void
}

export function DepartureScene({ playerName, onContinue }: DepartureSceneProps) {
  const [phase, setPhase] = useState<'cottage' | 'carriage' | 'board'>('cottage')
  const hydrated = useHydrated()
  const [showText, setShowText] = useState(false)
  const [carriageAppeared, setCarriageAppeared] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 500)
    return () => clearTimeout(t1)
  }, [])

  const handleStepOutside = () => {
    setShowText(false)
    setPhase('carriage')
    setTimeout(() => {
      setCarriageAppeared(true)
      setShowText(true)
    }, 2000)
  }

  const handleBoardCarriage = () => {
    setShowText(false)
    setPhase('board')
    setTimeout(() => {
      onContinue()
    }, 1500)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/cottage-dawn.png"
          alt="Cottage at Dawn"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Floating particles */}
      {hydrated && <MistParticles />}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end p-4 md:p-8">
        {phase === 'cottage' && (
          <div className={`max-w-xl transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-amber-900/40">
              <p className="font-crimson text-amber-100/90 text-lg leading-relaxed mb-4">
                You awaken in your humble cottage, the first rays of dawn creeping through the window. 
                A strange energy lingers in the air...
              </p>
              <p className="font-crimson text-amber-200/70 text-base italic mb-6">
                The letter from Arcana Mystica rests on your nightstand. Today, everything changes.
              </p>
              <button
                onClick={handleStepOutside}
                className="w-full py-3 px-6 font-cinzel text-base tracking-wider bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 cursor-pointer"
              >
                Step Outside
              </button>
            </div>
          </div>
        )}

        {phase === 'carriage' && (
          <>
            {/* The Carriage appearing */}
            <div className={`absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 transition-all duration-[2000ms] ${carriageAppeared ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <Image
                  src="/images/magical-carriage.png"
                  alt="Magical Carriage"
                  fill
                  className="object-contain drop-shadow-[0_0_30px_rgba(201,162,39,0.5)]"
                />
                {/* Magical glow effect */}
                <div className="absolute inset-0 animate-glow-pulse">
                  <div className="absolute -inset-4 bg-amber-400/20 rounded-full blur-xl" />
                </div>
              </div>
            </div>

            {/* Text box */}
            <div className={`max-w-xl transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-amber-900/40">
                <p className="font-crimson text-amber-100/90 text-lg leading-relaxed mb-4">
                  A carriage materializes from golden particles before your eyes. A magnificent 
                  ethereal steed pulls it, its form shimmering with arcane energy. A hooded figure sits at the reins.
                </p>
                <p className="font-crimson text-amber-200/70 text-base italic mb-6">
                  &quot;{playerName}&quot;, the driver calls, voice like wind through ancient halls. &quot;The academy awaits. 
                  Board now, or forfeit your destiny.&quot;
                </p>
                <button
                  onClick={handleBoardCarriage}
                  className="w-full py-3 px-6 font-cinzel text-base tracking-wider bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 transition-all duration-300 cursor-pointer"
                >
                  Board the Carriage
                </button>
              </div>
            </div>
          </>
        )}

        {phase === 'board' && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center animate-fade-in-up">
              <p className="font-cinzel text-2xl md:text-3xl text-amber-100 magical-glow">
                The journey begins...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SCENE 2: THE JOURNEY
// ============================================

interface JourneySceneProps {
  onArrive: () => void
}

export function JourneyScene({ onArrive }: JourneySceneProps) {
  const hydrated = useHydrated()
  const [showText, setShowText] = useState(false)
  const [textIndex, setTextIndex] = useState(0)

  const journeyTexts = [
    "The carriage rises into the clouds, leaving the mortal world behind...",
    "Through the window, you glimpse floating islands and forests of crystal trees...",
    "A bridge of starlight stretches across an endless void...",
    "As twilight descends, the first towers of Arcana Mystica pierce the horizon...",
  ]

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 500)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (textIndex < journeyTexts.length - 1 && showText) {
      const timer = setTimeout(() => {
        setShowText(false)
        setTimeout(() => {
          setTextIndex(prev => prev + 1)
          setShowText(true)
        }, 500)
      }, 4000)
      return () => clearTimeout(timer)
    } else if (textIndex === journeyTexts.length - 1 && showText) {
      const timer = setTimeout(() => {
        onArrive()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [textIndex, showText, journeyTexts.length, onArrive])

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/carriage-journey.png"
          alt="Magical Journey"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay with subtle animation */}
        <div className="absolute inset-0 bg-black/40 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Floating sparkles */}
      {hydrated && <SparkleParticles />}

      {/* Progress indicator */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {journeyTexts.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i <= textIndex ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-amber-900/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Carriage window frame effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 border-[40px] md:border-[80px] border-black/30 rounded-lg" />
      </div>

      {/* Text content */}
      <div className="relative z-10 min-h-screen flex items-end justify-center p-4 md:p-16">
        <div className={`max-w-2xl w-full transition-all duration-700 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-amber-900/40 text-center">
            <p className="font-crimson text-amber-100 text-xl md:text-2xl leading-relaxed italic">
              {journeyTexts[textIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SCENE 3: THE CASTLE REVEAL
// ============================================

interface CastleRevealProps {
  playerName: string
  onEnter: () => void
}

export function CastleReveal({ playerName, onEnter }: CastleRevealProps) {
  const hydrated = useHydrated()
  const [phase, setPhase] = useState<'approach' | 'reveal' | 'gates'>('approach')
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 500)
    const t2 = setTimeout(() => setPhase('reveal'), 2000)
    const t3 = setTimeout(() => setPhase('gates'), 5000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/arcana-mystica-castle.png"
          alt="Arcana Mystica Castle"
          fill
          className="object-cover"
          priority
        />
        {/* Cinematic reveal overlay */}
        <div className={`absolute inset-0 bg-black transition-opacity duration-[3000ms] ${phase !== 'approach' ? 'opacity-0' : 'opacity-70'}`} />
      </div>

      {/* Magical particles */}
      {hydrated && <MagicalAuraParticles />}

      {/* Twin moons glow */}
      <div className="absolute top-10 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 opacity-60 blur-sm animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-16 right-40 w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 opacity-50 blur-sm animate-pulse" style={{ animationDuration: '5s' }} />

      {/* Castle name overlay */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-1000 ${phase === 'reveal' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <h1 className="font-cinzel text-4xl md:text-6xl text-amber-100 tracking-[0.3em] magical-glow animate-glow-pulse">
          ARCANA MYSTICA
        </h1>
        <p className="font-crimson text-amber-200/60 text-lg md:text-xl italic mt-2 tracking-wider">
          Academy of the Arcane Arts
        </p>
      </div>

      {/* Content at bottom */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end p-4 md:p-8">
        <div className={`max-w-2xl mx-auto w-full transition-all duration-1000 ${showContent && phase === 'gates' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-amber-900/40">
            <p className="font-crimson text-amber-100/90 text-lg leading-relaxed mb-4">
              The carriage descends through the clouds, and there it stands—Arcana Mystica, 
              its obsidian spires reaching toward the twin moons above.
            </p>
            <p className="font-crimson text-amber-200/70 text-base italic mb-6">
              Welcome, {playerName}. Your education in the arcane arts begins now. 
              The gates stand open for those who dare to enter.
            </p>
            <button
              onClick={onEnter}
              className="w-full py-4 px-8 font-cinzel text-lg tracking-widest bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 shadow-lg hover:shadow-amber-900/50 transition-all duration-300 cursor-pointer"
            >
              Enter the Academy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PARTICLE EFFECTS
// ============================================

function MistParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: ((i * 17 + 31) % 100),
      delay: ((i * 3) % 5),
      duration: 15 + ((i * 11) % 10),
      size: 2 + ((i * 3) % 4),
    }))
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-amber-100/10 animate-particle-rise"
          style={{
            left: `${p.left}%`,
            bottom: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function SparkleParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: ((i * 13 + 7) % 100),
      top: ((i * 17 + 11) % 100),
      delay: ((i * 2) % 3),
      duration: 2 + ((i * 3) % 2),
    }))
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-1 h-1 bg-amber-300 rounded-full animate-sparkle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow: '0 0 4px rgba(251, 191, 36, 0.8)',
          }}
        />
      ))}
    </div>
  )
}

function MagicalAuraParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: ((i * 19 + 13) % 100),
      delay: ((i * 5) % 8),
      duration: 10 + ((i * 7) % 8),
      size: 3 + ((i * 4) % 6),
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
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.6) 0%, transparent 70%)',
            boxShadow: '0 0 10px rgba(201, 162, 39, 0.4)',
          }}
        />
      ))}
    </div>
  )
}
