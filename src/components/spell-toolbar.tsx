'use client'

import { useState, useRef, useEffect } from 'react'
import { Spell, SPELL_SCHOOLS_INFO, TIER_INFO } from '@/lib/spells'

// ============================================
// TYPES
// ============================================

interface SpellToolbarProps {
  favoriteSpells: Spell[]
  onOpenSpellbook: () => void
  onCastSpell?: (spell: Spell) => void
  onRemoveFavorite?: (spellId: string) => void
  currentMana?: number
  maxMana?: number
}

// ============================================
// SPELL TOOLBAR COMPONENT
// ============================================

export function SpellToolbar({
  favoriteSpells,
  onOpenSpellbook,
  onCastSpell,
  onRemoveFavorite,
  currentMana = 100,
  maxMana = 100
}: SpellToolbarProps) {
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null)
  const [hoveredSpell, setHoveredSpell] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showManaBar, setShowManaBar] = useState(false)

  // Max 8 slots for quick access
  const slots = Array.from({ length: 8 }, (_, i) => favoriteSpells[i] || null)

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setExpandedSpell(null)
    if (expandedSpell) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [expandedSpell])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:left-56">
      {/* Mana bar (shown on hover) */}
      <div
        className="absolute bottom-full left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-amber-900/30 px-3 py-1.5 transition-all duration-200"
        style={{ opacity: showManaBar ? 1 : 0, pointerEvents: showManaBar ? 'auto' : 'none' }}
        onMouseEnter={() => setShowManaBar(true)}
        onMouseLeave={() => setShowManaBar(false)}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="font-crimson text-blue-300 text-xs">Mana</span>
            <span className="font-cinzel text-blue-200 text-xs">{currentMana} / {maxMana}</span>
          </div>
          <div className="h-1.5 bg-blue-950/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
              style={{ width: `${(currentMana / maxMana) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main toolbar */}
      <div
        className="bg-black/90 backdrop-blur-sm border-t border-amber-900/40 px-3 py-1.5"
        onMouseEnter={() => setShowManaBar(true)}
        onMouseLeave={() => setShowManaBar(false)}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-1.5">
          {/* Mana indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-950/30 rounded border border-blue-800/30">
            <span className="text-blue-400 text-sm">💎</span>
            <span className="font-cinzel text-blue-200 text-xs">{currentMana}</span>
          </div>

          {/* Spell slots */}
          <div className="flex-1 flex items-center gap-1 overflow-x-auto">
            {slots.map((spell, i) => (
              <div key={i} className="relative">
                {spell ? (
                  <>
                    {/* Filled slot */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (expandedSpell === spell.id) {
                          onCastSpell?.(spell)
                          setExpandedSpell(null)
                        } else {
                          setExpandedSpell(spell.id)
                        }
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top })
                        setHoveredSpell(spell.id)
                      }}
                      onMouseLeave={() => setHoveredSpell(null)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all cursor-pointer border-2 ${
                        expandedSpell === spell.id
                          ? 'bg-amber-700/40 border-amber-500 scale-110'
                          : 'bg-amber-950/30 border-amber-800/30 hover:border-amber-600/50 hover:bg-amber-900/30'
                      }`}
                      title={spell.name}
                    >
                      {spell.icon}
                    </button>

                    {/* Slot number */}
                    <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-cinzel text-amber-400/40 bg-black/50 px-0.5 rounded">
                      {i + 1}
                    </span>
                  </>
                ) : (
                  /* Empty slot */
                  <button
                    onClick={onOpenSpellbook}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-amber-600/30 hover:text-amber-400/50 transition-all cursor-pointer border-2 border-dashed border-amber-800/20 hover:border-amber-700/40 bg-transparent hover:bg-amber-950/20"
                    title="Open spellbook"
                  >
                    <span className="text-base">+</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Spellbook button */}
          <button
            onClick={onOpenSpellbook}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-800 to-amber-950 border-2 border-amber-600/40 flex items-center justify-center text-xl hover:border-amber-500/60 transition-all cursor-pointer shadow-lg"
            title="Open Grimoire"
          >
            📖
          </button>
        </div>
      </div>

      {/* Tooltip Portal - rendered at root level */}
      {hoveredSpell && !expandedSpell && (
        <SpellTooltip
          spell={favoriteSpells.find(s => s.id === hoveredSpell)!}
          position={tooltipPosition}
        />
      )}

      {/* Expanded Action Menu Portal */}
      {expandedSpell && (
        <SpellActionMenu
          spell={favoriteSpells.find(s => s.id === expandedSpell)!}
          onCast={() => {
            onCastSpell?.(favoriteSpells.find(s => s.id === expandedSpell)!)
            setExpandedSpell(null)
          }}
          onRemove={() => {
            onRemoveFavorite?.(expandedSpell)
            setExpandedSpell(null)
          }}
          onClose={() => setExpandedSpell(null)}
        />
      )}
    </div>
  )
}

// ============================================
// SPELL TOOLTIP COMPONENT
// ============================================

function SpellTooltip({ spell, position }: { spell: Spell; position: { x: number; y: number } }) {
  if (!spell) return null

  return (
    <div
      className="fixed z-[200] pointer-events-none animate-fade-in-up"
      style={{
        left: position.x,
        bottom: `calc(100vh - ${position.y}px + 8px)`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="w-48 bg-gradient-to-b from-[#2a241e] to-[#1a1610] rounded-lg border border-amber-700/60 p-3 shadow-2xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xl">{spell.icon}</span>
          <div>
            <h4 className="font-cinzel text-amber-100 text-sm">{spell.name}</h4>
            <p className="font-crimson text-amber-400/70 text-xs">{SPELL_SCHOOLS_INFO[spell.school].name}</p>
          </div>
        </div>
        <p className="font-crimson text-amber-200/70 text-xs line-clamp-2 mb-2">{spell.description}</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-blue-400 flex items-center gap-1">💎{spell.manaCost}</span>
          <span className="text-amber-400">{spell.castTime}</span>
        </div>
        <p className="text-amber-500/50 text-[10px] text-center mt-2 italic">Click to cast • Hold for options</p>
      </div>
    </div>
  )
}

// ============================================
// SPELL ACTION MENU COMPONENT
// ============================================

function SpellActionMenu({
  spell,
  onCast,
  onRemove,
  onClose
}: {
  spell: Spell
  onCast: () => void
  onRemove: () => void
  onClose: () => void
}) {
  if (!spell) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[150]" onClick={onClose} />

      {/* Menu */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[200] animate-fade-in-up">
        <div className="w-52 bg-gradient-to-b from-[#2a241e] to-[#1a1610] rounded-lg border border-amber-600/60 p-2 shadow-2xl">
          {/* Spell header */}
          <div className="flex items-center gap-2 p-2 border-b border-amber-700/30 mb-2">
            <span className="text-2xl">{spell.icon}</span>
            <div>
              <p className="font-cinzel text-amber-100 text-sm">{spell.name}</p>
              <p className="font-crimson text-amber-400/60 text-xs">💎 {spell.manaCost} mana</p>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={onCast}
            className="w-full text-left px-3 py-2.5 rounded-lg font-crimson text-amber-200 text-sm hover:bg-amber-900/40 transition-colors cursor-pointer flex items-center gap-2 border border-transparent hover:border-amber-700/30"
          >
            <span className="text-lg">✨</span>
            <span>Cast Spell</span>
          </button>
          <button
            onClick={onRemove}
            className="w-full text-left px-3 py-2.5 rounded-lg font-crimson text-red-300 text-sm hover:bg-red-900/30 transition-colors cursor-pointer flex items-center gap-2 border border-transparent hover:border-red-700/30"
          >
            <span className="text-lg">✕</span>
            <span>Remove from Bar</span>
          </button>
        </div>
      </div>
    </>
  )
}

// ============================================
// MINI SPELL CARD (for notifications/toasts)
// ============================================

interface MiniSpellCardProps {
  spell: Spell
  message?: string
}

export function MiniSpellCard({ spell, message }: MiniSpellCardProps) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900/30 to-amber-950/30 rounded-lg p-3 border border-amber-700/30">
      <span className="text-2xl">{spell.icon}</span>
      <div>
        <h4 className="font-cinzel text-amber-100 text-sm">{spell.name}</h4>
        {message && <p className="font-crimson text-amber-200/60 text-xs">{message}</p>}
      </div>
    </div>
  )
}

// ============================================
// SPELL CAST ANIMATION
// ============================================

interface SpellCastEffectProps {
  spell: Spell
  onComplete: () => void
}

export function SpellCastEffect({ spell, onComplete }: SpellCastEffectProps) {
  const schoolInfo = SPELL_SCHOOLS_INFO[spell.school]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 animate-spell-flash"
        style={{
          background: `radial-gradient(circle at center, ${schoolInfo.color.includes('orange') ? 'rgba(251, 146, 60, 0.3)' : schoolInfo.color.includes('blue') ? 'rgba(59, 130, 246, 0.3)' : 'rgba(201, 162, 39, 0.3)'} 0%, transparent 70%)`
        }}
      />
      <div className="relative animate-spell-cast">
        <span className="text-8xl">{spell.icon}</span>
        <div className="absolute -inset-8 animate-ping">
          <span className="text-8xl opacity-30">{spell.icon}</span>
        </div>
      </div>
      <div className="absolute bottom-1/3 font-cinzel text-amber-100 text-2xl animate-fade-in-up tracking-wider">
        {spell.incantation}
      </div>
    </div>
  )
}
