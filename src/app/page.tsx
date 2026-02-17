'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
import { GameTime, getDefaultGameTime, advanceTime, isClassAvailableNow, getCurrentClass, CLASS_SCHEDULE, DAYS_IN_ORDER } from '@/lib/game-time'

// ============================================
// SAVE GAME TYPES
// ============================================

interface SaveGame {
  version: number
  savedAt: number
  playerName: string
  gameState: 'prompt' | 'scroll' | 'departure' | 'journey' | 'castle' | 'school'
  currentLocation: GameLocation
  inventory: InventoryState
  hasMetHeadmistress: boolean
  hasVisitedShop: boolean
  journalEntries: JournalEntry[]
  learnedSpells: Spell[]
  learnedPotions: PotionRecipe[]
  currentMana: number
  maxMana: number
  gameTime: GameTime
}

const SAVE_KEY = 'arcana-mystica-save'
const SAVE_VERSION = 7  // Bumped for original spell names (IP-safe)

// ============================================
// SAVE/LOAD FUNCTIONS
// ============================================

function saveGame(saveData: SaveGame): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    return true
  } catch {
    console.error('Failed to save game')
    return false
  }
}

function loadGame(): SaveGame | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(SAVE_KEY)
    if (!saved) return null
    const data = JSON.parse(saved) as SaveGame
    // Version check for future compatibility
    if (data.version !== SAVE_VERSION) {
      console.warn('Save version mismatch, starting fresh')
      return null
    }
    return data
  } catch {
    console.error('Failed to load saved game')
    return null
  }
}

function clearSave(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SAVE_KEY)
}

// ============================================
// HOOKS
// ============================================

// Simple hydration check - returns true after first client render
function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    // Use requestAnimationFrame to ensure we're after paint
    requestAnimationFrame(() => {
      setHydrated(true)
    })
  }, [])
  
  return hydrated
}

// ============================================
// VISUAL COMPONENTS
// ============================================

// Magical particle component
function MagicalParticle({ delay, duration, left }: { delay: number; duration: number; left: number }) {
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
function Candle({ position }: { position: 'left' | 'right' }) {
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

// Floating rune symbols - uses fixed positions for SSR
const RUNE_POSITIONS = [
  { symbol: '⟁', top: 10, left: 5, delay: 0, duration: 8 },
  { symbol: '◇', top: 22, left: 85, delay: 0.7, duration: 9 },
  { symbol: '○', top: 34, left: 15, delay: 1.4, duration: 7 },
  { symbol: '△', top: 46, left: 75, delay: 2.1, duration: 10 },
  { symbol: '☆', top: 58, left: 25, delay: 2.8, duration: 8 },
  { symbol: '✧', top: 70, left: 90, delay: 3.5, duration: 9 },
  { symbol: '⬡', top: 82, left: 40, delay: 4.2, duration: 7 },
  { symbol: '⬢', top: 15, left: 60, delay: 4.9, duration: 10 },
]

function FloatingRune({ symbol, top, left, delay, duration }: { symbol: string; top: number; left: number; delay: number; duration: number }) {
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

// Pre-generated particle data for SSR safety
const PARTICLE_DATA = Array.from({ length: 20 }, (_, i) => ({
  delay: i * 0.4,
  duration: 8 + ((i * 7) % 4),
  left: ((i * 17 + 13) % 100),
}))

// ============================================
// RESTART CONFIRMATION MODAL
// ============================================

interface RestartModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  playerName?: string
}

function RestartModal({ isOpen, onConfirm, onCancel, playerName }: RestartModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-900/40 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="scroll-edge py-3 px-4 flex items-center justify-center">
          <h2 className="font-cinzel text-amber-100 text-lg tracking-wider flex items-center gap-2">
            <span className="text-amber-400">⚠</span>
            Restart Journey?
          </h2>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4 text-center">
            Are you certain you wish to begin anew? All progress will be lost forever in the aether.
          </p>
          
          {playerName && (
            <p className="font-crimson text-amber-200/60 text-sm text-center mb-4 italic">
              Current journey: <span className="text-amber-300">{playerName}</span>
            </p>
          )}
          
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 mb-6">
            <p className="font-crimson text-red-300/80 text-sm text-center">
              This action cannot be undone. Your save data will be permanently erased.
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 font-cinzel text-sm bg-amber-900/30 text-amber-300 rounded-lg hover:bg-amber-900/50 transition-colors cursor-pointer border border-amber-800/30"
            >
              Continue Journey
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 font-cinzel text-sm bg-gradient-to-b from-red-700 to-red-900 text-red-100 rounded-lg hover:from-red-600 hover:to-red-800 transition-all cursor-pointer border border-red-600/30"
            >
              Restart Game
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// NAME INPUT SCREEN
// ============================================

interface NamePromptProps {
  onSubmit: (name: string) => void
  hasExistingSave: boolean
  onLoadSave: () => void
  savedPlayerName?: string
}

function NamePrompt({ onSubmit, hasExistingSave, onLoadSave, savedPlayerName }: NamePromptProps) {
  const [name, setName] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const hydrated = useHydrated()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
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

function AcceptanceScroll({ studentName, onContinue }: { studentName: string; onContinue: () => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const hydrated = useHydrated()
  
  // Pre-generated particle data
  const particles = Array.from({ length: 15 }, (_, i) => ({
    delay: i * 0.6,
    duration: 10 + ((i * 7) % 5),
    left: ((i * 13 + 7) % 100),
  }))

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
      {hydrated && particles.map((particle, i) => (
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
      <>
        <NamePrompt 
          onSubmit={handleNameSubmit} 
          hasExistingSave={!!savedPlayerName}
          onLoadSave={handleLoadSave}
          savedPlayerName={savedPlayerName}
        />
      </>
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
      <div className="flex-1 md:ml-56 overflow-hidden">
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
