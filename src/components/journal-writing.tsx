'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
// JOURNAL ENTRY TYPE
// ============================================

export interface JournalEntry {
  id: string
  date: string
  content: string
  createdAt: number
}

// ============================================
// JOURNAL WRITING COMPONENT
// ============================================

interface JournalWritingProps {
  playerName: string
  existingEntries: JournalEntry[]
  onSave: (entry: JournalEntry) => void
  onClose: () => void
}

export function JournalWriting({ playerName, existingEntries, onSave, onClose }: JournalWritingProps) {
  const hydrated = useHydrated()
  const [content, setContent] = useState('')
  const [isErasing, setIsErasing] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [inkDrop, setInkDrop] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get current date in fantasy style
  const getFantasyDate = () => {
    const days = ['Sunday', 'Moonday', 'Tiwsday', 'Wodansday', 'Thorsday', 'Friggasday', 'Saturnsday']
    const months = ['Wintermarch', 'Frostfall', 'Thawtime', 'Blossom', 'Highspring', 'Sunsheight', 'Harvestmoon', 'Autumnfall', 'Leafturn', 'Froststart', 'Deepwinter', 'Starfall']
    const now = new Date()
    const day = days[now.getDay()]
    const month = months[now.getMonth()]
    const date = now.getDate()
    const year = now.getFullYear()
    return `${day}, ${date}${getOrdinal(date)} of ${month}, ${year}`
  }

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th'
    switch (n % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  // Handle key press for magical effects
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Block backspace - must use erasing spell
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      // Show a hint about the erasing spell
      setIsErasing(true)
      setTimeout(() => setIsErasing(false), 1000)
      return
    }
    
    // Create ink drop effect on keypress
    if (e.key.length === 1 && textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect()
      setInkDrop({
        x: Math.random() * rect.width * 0.8 + rect.width * 0.1,
        y: Math.random() * 100 + 50,
      })
      setTimeout(() => setInkDrop(null), 500)
    }
  }

  // Erasing spell - removes last character with magical effect
  const castErasingSpell = () => {
    if (content.length > 0) {
      setContent(content.slice(0, -1))
      // Visual feedback
      setIsErasing(true)
      setTimeout(() => setIsErasing(false), 300)
    }
  }

  // Save entry
  const handleSave = () => {
    if (content.trim()) {
      const entry: JournalEntry = {
        id: `entry-${Date.now()}`,
        date: getFantasyDate(),
        content: content.trim(),
        createdAt: Date.now(),
      }
      onSave(entry)
      setShowSaveConfirm(true)
      setTimeout(() => {
        setShowSaveConfirm(false)
        onClose()
      }, 1500)
    }
  }

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0d0b09]">
      {/* Background Image - dimmed study area */}
      <div className="absolute inset-0">
        <Image
          src="/images/dormitory.png"
          alt="Study Desk"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09] via-transparent to-[#0d0b09]" />
      </div>

      {/* Ambient particles */}
      {hydrated && <JournalParticles />}

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-amber-900/30 text-amber-300 hover:bg-black/70 hover:border-amber-700/50 transition-all cursor-pointer font-crimson text-sm"
          >
            ← Return to Room
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Erasing Spell Button */}
          <button
            onClick={castErasingSpell}
            disabled={content.length === 0}
            className={`px-4 py-2 rounded-lg font-crimson text-sm flex items-center gap-2 transition-all cursor-pointer ${
              content.length > 0
                ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-600/30 text-purple-200 hover:from-purple-900/70 hover:to-indigo-900/70'
                : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-lg">✨</span>
            <span>Erasing Spell</span>
          </button>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className={`px-4 py-2 rounded-lg font-crimson text-sm flex items-center gap-2 transition-all cursor-pointer ${
              content.trim()
                ? 'bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-600/30 text-amber-100 hover:from-amber-600 hover:to-amber-800'
                : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>📜</span>
            <span>Seal Entry</span>
          </button>
        </div>
      </div>

      {/* Hint about erasing spell */}
      {isErasing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-fade-in-up">
          <div className="bg-purple-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-500/30 shadow-lg">
            <p className="font-crimson text-purple-200 text-sm">
              ✨ Use the <span className="text-purple-100 font-semibold">Erasing Spell</span> to undo your words...
            </p>
          </div>
        </div>
      )}

      {/* Save confirmation */}
      {showSaveConfirm && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-fade-in-up">
          <div className="bg-amber-900/80 backdrop-blur-sm rounded-lg px-8 py-6 border border-amber-500/30 shadow-2xl text-center">
            <span className="text-4xl block mb-2">📜✨</span>
            <p className="font-cinzel text-amber-100 text-lg">Entry Sealed!</p>
            <p className="font-crimson text-amber-200/70 text-sm mt-1">Your words are preserved in magical ink...</p>
          </div>
        </div>
      )}

      {/* Main Journal/Parchment */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8 pt-20">
        <div 
          ref={containerRef}
          className="relative w-full max-w-3xl"
        >
          {/* The Parchment */}
          <div className="relative bg-gradient-to-b from-[#f5edd6] via-[#ebe3cc] to-[#ddd5be] rounded-lg shadow-2xl overflow-hidden">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-40" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />
            
            {/* Aged edge effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(139,69,19,0.25)]" />
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-amber-900/10 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-amber-900/10 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative p-8 md:p-12 min-h-[60vh]">
              {/* Header */}
              <div className="text-center mb-6 pb-4 border-b-2 border-amber-800/20">
                <h2 className="font-cinzel text-amber-900 text-2xl tracking-wide mb-1">
                  Personal Journal
                </h2>
                <p className="font-crimson text-amber-700/70 text-sm italic">
                  {playerName}&apos;s private reflections
                </p>
              </div>

              {/* Date */}
              <div className="mb-6 text-center">
                <p className="font-crimson text-amber-800/60 text-sm italic">
                  {getFantasyDate()}
                </p>
              </div>

              {/* Writing area */}
              <div className="relative">
                {/* Ink drop effect */}
                {inkDrop && (
                  <div 
                    className="absolute pointer-events-none animate-ink-drop"
                    style={{
                      left: inkDrop.x,
                      top: inkDrop.y,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-900/60" />
                  </div>
                )}

                {/* Invisible textarea for input */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Dip your quill and let your thoughts flow..."
                  className="absolute inset-0 w-full h-full bg-transparent resize-none outline-none text-transparent caret-transparent cursor-default"
                  style={{ caretColor: 'transparent' }}
                />

                {/* Visible magical script text */}
                <div className="min-h-[300px] font-great-vibes text-xl md:text-2xl text-amber-900 leading-relaxed tracking-wide">
                  {content ? (
                    <div className="whitespace-pre-wrap break-words">
                      {content.split('').map((char, i) => (
                        <span
                          key={i}
                          className="inline-block animate-ink-appear"
                          style={{
                            animationDelay: `${i * 10}ms`,
                          }}
                        >
                          {char}
                        </span>
                      ))}
                      {/* Blinking quill cursor */}
                      <span className="inline-block w-0.5 h-6 bg-amber-800/70 ml-0.5 animate-quill-blink" />
                    </div>
                  ) : (
                    <p className="font-crimson text-amber-600/40 text-lg italic">
                      ( Your quill hovers above the parchment, awaiting your thoughts... )
                    </p>
                  )}
                </div>
              </div>

              {/* Decorative corners */}
              <div className="absolute top-4 left-4 text-amber-700/20 text-xl">❦</div>
              <div className="absolute top-4 right-4 text-amber-700/20 text-xl transform scale-x-[-1]">❦</div>
              <div className="absolute bottom-4 left-4 text-amber-700/20 text-xl transform rotate-180">❦</div>
              <div className="absolute bottom-4 right-4 text-amber-700/20 text-xl transform rotate-180 scale-x-[-1]">❦</div>
            </div>
          </div>

          {/* Parchment shadow */}
          <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/20 blur-xl rounded-full" />
        </div>
      </div>

      {/* Floating quill cursor */}
      <div className="fixed bottom-8 right-8 z-20 text-4xl animate-float pointer-events-none select-none">
        🪶
      </div>
    </div>
  )
}

// ============================================
// JOURNAL PARTICLES
// ============================================

function JournalParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: ((i * 17 + 7) % 100),
      delay: ((i * 3) % 6),
      duration: 10 + ((i * 5) % 8),
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
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.5) 0%, transparent 70%)',
            boxShadow: '0 0 6px rgba(201, 162, 39, 0.3)',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// JOURNAL ENTRIES VIEWER
// ============================================

interface JournalViewerProps {
  entries: JournalEntry[]
  onClose: () => void
}

export function JournalViewer({ entries, onClose }: JournalViewerProps) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-900/40 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="scroll-edge py-3 px-4 flex items-center justify-between">
          <h2 className="font-cinzel text-amber-100 text-xl tracking-wider flex items-center gap-2">
            <span>📖</span> Your Journal
          </h2>
          <button 
            onClick={onClose}
            className="text-amber-400 hover:text-amber-200 transition-colors cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block opacity-50">📓</span>
              <p className="font-crimson text-amber-200/60">Your journal is empty</p>
              <p className="font-crimson text-amber-400/40 text-sm italic mt-2">
                Sit at your desk to write your first entry...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.slice().reverse().map(entry => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="w-full text-left bg-amber-950/30 hover:bg-amber-950/50 rounded-lg p-4 border border-amber-900/20 hover:border-amber-700/30 transition-all cursor-pointer"
                >
                  <p className="font-crimson text-amber-400/60 text-xs mb-1">{entry.date}</p>
                  <p className="font-great-vibes text-amber-100 text-lg line-clamp-2">
                    {entry.content}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected entry modal */}
        {selectedEntry && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1f1a14] to-[#161310] p-6 overflow-y-auto">
            <button
              onClick={() => setSelectedEntry(null)}
              className="mb-4 font-crimson text-amber-300 hover:text-amber-100 text-sm transition-colors cursor-pointer"
            >
              ← Back to entries
            </button>
            <p className="font-crimson text-amber-400/60 text-sm mb-4">{selectedEntry.date}</p>
            <div className="font-great-vibes text-amber-100 text-xl leading-relaxed whitespace-pre-wrap">
              {selectedEntry.content}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
