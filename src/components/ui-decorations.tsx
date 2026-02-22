'use client'

// ============================================
// SHARED DECORATIVE VISUAL COMPONENTS
// ============================================

// Magical particle component
export function MagicalParticle({ delay, duration, left }: { delay: number; duration: number; left: number }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full animate-particle-rise"
      style={{
        left: `${left}%`,
        bottom: '-10px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        background: 'radial-gradient(circle, rgba(201, 162, 39, 0.9) 0%, rgba(201, 162, 39, 0) 70%)',
        boxShadow: '0 0 6px rgba(201, 162, 39, 0.8), 0 0 12px rgba(201, 162, 39, 0.4)',
      }}
    />
  )
}

// Candle component
export function Candle({ position }: { position: 'left' | 'right' }) {
  return (
    <div className={`absolute ${position === 'left' ? '-left-8 md:left-4' : '-right-8 md:right-4'} bottom-0`}>
      {/* Candle holder */}
      <div className="relative w-6 h-24">
        {/* Candle body */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-20 bg-gradient-to-b from-amber-100 to-amber-50 rounded-sm shadow-lg">
          {/* Dripping wax */}
          <div className="absolute -left-0.5 top-2 w-1.5 h-4 bg-amber-100 rounded-b-full" />
          <div className="absolute -right-0.5 top-4 w-1.5 h-3 bg-amber-100 rounded-b-full" />
        </div>

        {/* Flame */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-candle-flicker">
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-gradient-radial from-amber-400/30 to-transparent rounded-full blur-md" />
            {/* Flame shape */}
            <div className="w-3 h-5 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full blur-[0.5px]"
                 style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }} />
            {/* Inner bright core */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-gradient-to-t from-amber-300 to-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Light cast on surroundings */}
      <div className="absolute -top-20 -left-10 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
    </div>
  )
}

// Floating rune symbol
export function FloatingRune({ symbol, top, left, delay, duration }: { symbol: string; top: number; left: number; delay: number; duration: number }) {
  return (
    <div
      className="absolute text-amber-600/20 font-medieval text-2xl md:text-4xl animate-float select-none pointer-events-none"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {symbol}
    </div>
  )
}

// Fixed rune positions - SSR-safe (no random values)
export const RUNE_POSITIONS = [
  { symbol: '⟁', top: 10, left: 5, delay: 0, duration: 8 },
  { symbol: '◇', top: 22, left: 85, delay: 0.7, duration: 9 },
  { symbol: '○', top: 34, left: 15, delay: 1.4, duration: 7 },
  { symbol: '△', top: 46, left: 75, delay: 2.1, duration: 10 },
  { symbol: '☆', top: 58, left: 25, delay: 2.8, duration: 8 },
  { symbol: '✧', top: 70, left: 90, delay: 3.5, duration: 9 },
  { symbol: '⬡', top: 82, left: 40, delay: 4.2, duration: 7 },
  { symbol: '⬢', top: 15, left: 60, delay: 4.9, duration: 10 },
]

// Pre-generated particle data - SSR-safe (no random values)
export const PARTICLE_DATA = Array.from({ length: 20 }, (_, i) => ({
  delay: i * 0.4,
  duration: 8 + ((i * 7) % 4),
  left: ((i * 17 + 13) % 100),
}))
