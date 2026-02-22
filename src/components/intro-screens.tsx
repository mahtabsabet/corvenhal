'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useHydrated } from '@/hooks/use-hydrated'
import { MagicalParticle, Candle, FloatingRune, RUNE_POSITIONS, PARTICLE_DATA } from '@/components/ui-decorations'

// ============================================
// NAME INPUT SCREEN
// ============================================

interface NamePromptProps {
  onSubmit: (name: string) => void
  hasExistingSave: boolean
  onLoadSave: () => void
  savedPlayerName?: string
}

export function NamePrompt({ onSubmit, hasExistingSave, onLoadSave, savedPlayerName }: NamePromptProps) {
  const [name, setName] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const hydrated = useHydrated()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09] via-[#1a1410] to-[#0d0b09]" />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating runes - fixed positions */}
      {RUNE_POSITIONS.map((rune, i) => (
        <FloatingRune
          key={i}
          symbol={rune.symbol}
          top={rune.top}
          left={rune.left}
          delay={rune.delay}
          duration={rune.duration}
        />
      ))}

      {/* Magical particles - use pre-generated data */}
      {hydrated && PARTICLE_DATA.map((particle, i) => (
        <MagicalParticle
          key={i}
          delay={particle.delay}
          duration={particle.duration}
          left={particle.left}
        />
      ))}

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(13,11,9,0.8)_100%)]" />

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full animate-fade-in-up">
        {/* Decorative header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />
            <span className="text-amber-600/60 text-2xl">✦</span>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />
          </div>
          <h1 className="font-cinzel text-3xl md:text-4xl text-amber-100 mb-2 tracking-widest">
            ARCANA MYSTICA
          </h1>
          <p className="text-amber-200/50 text-sm font-crimson italic tracking-wide">
            Academy of the Arcane Arts
          </p>
        </div>

        {/* Load save prompt if exists */}
        {hasExistingSave && (
          <div className="mb-4 bg-gradient-to-r from-amber-900/30 to-amber-800/20 rounded-lg p-4 border border-amber-700/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📜</span>
              <div>
                <p className="font-cinzel text-amber-100 text-sm">Continue Your Journey</p>
                <p className="font-crimson text-amber-300/70 text-xs">Welcome back, {savedPlayerName}</p>
              </div>
            </div>
            <button
              onClick={onLoadSave}
              className="w-full py-3 px-6 font-cinzel text-base tracking-wider bg-gradient-to-b from-green-700 to-green-900 text-green-100 rounded-lg border border-green-600/30 hover:from-green-600 hover:to-green-800 shadow-lg transition-all duration-300 cursor-pointer"
            >
              Load Saved Game
            </button>
          </div>
        )}

        {/* The prompt card */}
        <div className="relative">
          {/* Outer decorative border */}
          <div className="absolute -inset-2 border border-amber-800/30 rounded-lg" />
          <div className="absolute -inset-4 border border-amber-900/20 rounded-lg" />

          {/* Main card */}
          <div className="relative bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg p-8 border border-amber-900/40 shadow-2xl">
            {/* Corner decorations */}
            <div className="absolute top-2 left-2 text-amber-700/40 text-lg">❧</div>
            <div className="absolute top-2 right-2 text-amber-700/40 text-lg transform scale-x-[-1]">❧</div>
            <div className="absolute bottom-2 left-2 text-amber-700/40 text-lg transform rotate-180">❧</div>
            <div className="absolute bottom-2 right-2 text-amber-700/40 text-lg transform rotate-180 scale-x-[-1]">❧</div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <p className="font-crimson text-amber-100/90 text-lg leading-relaxed">
                  {hasExistingSave ? 'Begin a new journey...' : 'The ancient wards sense a new presence...'}
                </p>
                <p className="font-crimson text-amber-200/60 text-base mt-2 italic">
                  Speak your name, young mage, that the gates may open.
                </p>
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Your name..."
                  className={`
                    w-full px-6 py-4
                    bg-[#0d0b09]
                    border-2
                    ${isFocused ? 'border-amber-600 shadow-[0_0_20px_rgba(201,162,39,0.2)]' : 'border-amber-900/50'}
                    rounded-lg
                    text-amber-100 text-center text-xl font-crimson
                    placeholder:text-amber-800/40
                    outline-none
                    transition-all duration-500
                  `}
                  autoFocus
                />

                {/* Mystical glow effect on focus */}
                {isFocused && (
                  <div className="absolute inset-0 rounded-lg pointer-events-none animate-glow-pulse">
                    <div className="absolute inset-0 rounded-lg border border-amber-500/20" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className={`
                  w-full py-4 px-8
                  font-cinzel text-lg tracking-widest
                  rounded-lg
                  transition-all duration-500
                  ${name.trim()
                    ? 'bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 hover:from-amber-600 hover:to-amber-800 shadow-lg hover:shadow-amber-900/50 cursor-pointer'
                    : 'bg-amber-900/30 text-amber-800/50 cursor-not-allowed'
                  }
                  border border-amber-600/30
                `}
              >
                {hasExistingSave ? 'Start New Game' : 'Enter the Academy'}
              </button>
            </form>

            {/* Decorative quill */}
            <div className="absolute -right-6 -bottom-4 text-amber-700/30 text-4xl transform rotate-12">
              ✒
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center mt-6 text-amber-800/40 text-sm font-crimson italic">
          Est. 1247 • Per Aspera Ad Astra
        </p>
      </div>

      {/* Candles */}
      <Candle position="left" />
      <Candle position="right" />
    </div>
  )
}

// ============================================
// ACCEPTANCE SCROLL
// ============================================

// Pre-generated scroll particle data (SSR-safe)
const SCROLL_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  delay: i * 0.6,
  duration: 10 + ((i * 7) % 5),
  left: ((i * 13 + 7) % 100),
}))

export function AcceptanceScroll({ studentName, onContinue }: { studentName: string; onContinue: () => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const hydrated = useHydrated()

  useEffect(() => {
    const t1 = setTimeout(() => setIsVisible(true), 100)
    const t2 = setTimeout(() => setShowContent(true), 800)
    const t3 = setTimeout(() => setShowSignature(true), 2500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#0d0b09]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,20,16,0.5)_0%,rgba(13,11,9,0.95)_100%)]" />

      {/* Ambient particles */}
      {hydrated && SCROLL_PARTICLES.map((particle, i) => (
        <MagicalParticle
          key={i}
          delay={particle.delay}
          duration={particle.duration}
          left={particle.left}
        />
      ))}

      {/* Scroll container */}
      <div className={`relative z-10 max-w-2xl w-full transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* The scroll */}
        <div className="relative">
          {/* Top scroll rod */}
          <div className="scroll-edge h-4 md:h-6 rounded-t-lg relative z-20 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-amber-200/30 to-transparent" />
          </div>

          {/* Scroll body with parchment texture */}
          <div className="relative bg-gradient-to-b from-[#e8dcc4] via-[#d4c4a8] to-[#c9b896] -mt-1 py-8 md:py-12 px-6 md:px-12 shadow-2xl">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />

            {/* Aged edge effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(139,69,19,0.3)]" />
              <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-amber-900/10 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-amber-900/10 to-transparent" />
            </div>

            {/* Content */}
            <div className={`relative transition-all duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              {/* Header emblem */}
              <div className="text-center mb-6 md:mb-8">
                <div className="inline-block">
                  <div className="text-4xl md:text-5xl text-amber-800/80 mb-2">☽ ✦ ☾</div>
                  <h1 className="font-cinzel text-2xl md:text-3xl text-amber-900 tracking-wider">
                    ARCANA MYSTICA
                  </h1>
                  <p className="font-crimson text-amber-800/70 text-sm md:text-base italic mt-1">
                    Academy of the Arcane Arts
                  </p>
                </div>
              </div>

              {/* Decorative line */}
              <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
                <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-amber-700 to-amber-700" />
                <span className="text-amber-700/60 text-sm">❦</span>
                <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent via-amber-700 to-amber-700" />
              </div>

              {/* Main content */}
              <div className="text-center space-y-4 md:space-y-6 text-amber-900">
                <p className="font-crimson text-lg md:text-xl">
                  <span className="text-2xl md:text-3xl font-cinzel">T</span>o
                </p>

                <p className="font-cinzel text-2xl md:text-3xl text-amber-800 tracking-wide animate-glow-pulse magical-glow px-4 py-2 inline-block">
                  {studentName}
                </p>

                <p className="font-crimson text-base md:text-lg leading-relaxed px-2">
                  You are hereby granted admission to the esteemed halls of
                  <span className="font-cinzel font-semibold text-amber-800"> Arcana Mystica</span>,
                  where the ancient mysteries await those with the gift.
                </p>

                <div className="py-4">
                  <p className="font-crimson italic text-base md:text-lg text-amber-800/80 leading-relaxed px-2">
                    Within these enchanted walls, you shall learn to wield the elemental forces,
                    commune with spirits of the aether, and unlock the secrets written in starlight.
                    Your journey into the arcane begins now.
                  </p>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center justify-center gap-3 py-4">
                  <span className="text-amber-700/40">✧</span>
                  <span className="text-amber-700/40">✦</span>
                  <span className="text-amber-700/40">✧</span>
                </div>

                {/* Signature section */}
                <div className={`transition-all duration-700 ${showSignature ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <p className="font-crimson text-sm text-amber-800/70 mb-2">
                    Given this day by the Order of the Silver Quill
                  </p>
                  <p className="font-crimson text-sm text-amber-700/60 mb-4">
                    {currentDate}
                  </p>

                  {/* Wax seal */}
                  <div className="flex justify-center mt-6 mb-4">
                    <div className="wax-seal w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transform rotate-[-5deg]">
                      <span className="font-cinzel text-amber-100/90 text-lg md:text-xl font-bold">AM</span>
                    </div>
                  </div>

                  <p className="font-medieval text-amber-800/60 text-sm">
                    Headmaster Alaric Thornwood
                  </p>
                  <p className="font-crimson text-amber-700/50 text-xs italic">
                    Keeper of the Seventh Seal
                  </p>
                </div>
              </div>
            </div>

            {/* Corner flourishes */}
            <div className="absolute top-4 left-4 text-amber-700/20 text-2xl md:text-3xl">❦</div>
            <div className="absolute top-4 right-4 text-amber-700/20 text-2xl md:text-3xl transform scale-x-[-1]">❦</div>
            <div className="absolute bottom-4 left-4 text-amber-700/20 text-2xl md:text-3xl transform rotate-180">❦</div>
            <div className="absolute bottom-4 right-4 text-amber-700/20 text-2xl md:text-3xl transform rotate-180 scale-x-[-1]">❦</div>
          </div>

          {/* Bottom scroll rod */}
          <div className="scroll-edge h-4 md:h-6 rounded-b-lg relative z-20 shadow-lg">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-t from-amber-200/30 to-transparent" />
          </div>
        </div>

        {/* Continue button */}
        <div className={`text-center mt-8 transition-all duration-700 ${showSignature ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={onContinue}
            className="
              px-8 py-4
              font-cinzel text-lg tracking-wider
              bg-gradient-to-b from-amber-700 to-amber-900
              text-amber-100
              rounded-lg
              border border-amber-600/30
              shadow-lg shadow-amber-900/30
              hover:from-amber-600 hover:to-amber-800
              hover:shadow-amber-900/50
              transition-all duration-300
              cursor-pointer
            "
          >
            Begin Your Journey
          </button>

          <p className="mt-4 text-amber-800/40 text-sm font-crimson italic">
            The academy awaits within...
          </p>
        </div>
      </div>

      {/* Candles */}
      <Candle position="left" />
      <Candle position="right" />
    </div>
  )
}
