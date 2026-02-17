'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  Spell, 
  PotionRecipe, 
  SpellSchool, 
  SpellTier, 
  SPELL_SCHOOLS_INFO, 
  TIER_INFO 
} from '@/lib/spells'

// ============================================
// TYPES
// ============================================

interface SpellbookProps {
  learnedSpells: Spell[]
  learnedPotions: PotionRecipe[]
  onClose: () => void
  onToggleFavorite?: (spellId: string) => void
}

// ============================================
// SPELLBOOK COMPONENT
// ============================================

export function Spellbook({ learnedSpells, learnedPotions, onClose, onToggleFavorite }: SpellbookProps) {
  const [activeTab, setActiveTab] = useState<'spells' | 'potions'>('spells')
  const [selectedSchool, setSelectedSchool] = useState<SpellSchool | 'all'>('all')
  const [selectedTier, setSelectedTier] = useState<SpellTier | 'all'>('all')
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null)
  const [selectedPotion, setSelectedPotion] = useState<PotionRecipe | null>(null)
  const [pageFlip, setPageFlip] = useState(false)

  // Filter spells
  const filteredSpells = learnedSpells.filter(spell => {
    if (selectedSchool !== 'all' && spell.school !== selectedSchool) return false
    if (selectedTier !== 'all' && spell.tier !== selectedTier) return false
    return true
  })

  // Animate page flip
  const handleTabChange = (tab: 'spells' | 'potions') => {
    if (tab !== activeTab) {
      setPageFlip(true)
      setTimeout(() => {
        setActiveTab(tab)
        setPageFlip(false)
        setSelectedSpell(null)
        setSelectedPotion(null)
      }, 200)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Main Spellbook */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Book spine and cover effect */}
        <div className="relative bg-gradient-to-br from-[#2a1f1a] via-[#1f1814] to-[#161210] rounded-lg shadow-2xl border-2 border-amber-900/50 overflow-hidden">
          {/* Leather texture overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }} />

          {/* Decorative border */}
          <div className="absolute inset-2 border border-amber-700/30 rounded pointer-events-none" />
          <div className="absolute inset-4 border border-amber-800/20 rounded pointer-events-none" />

          {/* Corner ornaments */}
          <div className="absolute top-3 left-3 text-amber-600/40 text-2xl font-serif">❧</div>
          <div className="absolute top-3 right-3 text-amber-600/40 text-2xl font-serif transform scale-x-[-1]">❧</div>
          <div className="absolute bottom-3 left-3 text-amber-600/40 text-2xl font-serif transform rotate-180">❧</div>
          <div className="absolute bottom-3 right-3 text-amber-600/40 text-2xl font-serif transform rotate-180 scale-x-[-1]">❧</div>

          {/* Header with tabs */}
          <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-800/30">
            <div className="flex items-center gap-2">
              <span className="text-3xl">📖</span>
              <div>
                <h2 className="font-cinzel text-amber-100 text-xl tracking-wider">Grimoire Arcanum</h2>
                <p className="font-crimson text-amber-400/60 text-xs italic">Your personal spell reference</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange('spells')}
                className={`px-4 py-2 rounded-t-lg font-cinzel text-sm transition-all cursor-pointer ${
                  activeTab === 'spells'
                    ? 'bg-amber-900/50 text-amber-100 border-t border-l border-r border-amber-700/50'
                    : 'bg-amber-950/30 text-amber-400/60 hover:text-amber-100 hover:bg-amber-900/30'
                }`}
              >
                ⚡ Spells ({learnedSpells.length})
              </button>
              <button
                onClick={() => handleTabChange('potions')}
                className={`px-4 py-2 rounded-t-lg font-cinzel text-sm transition-all cursor-pointer ${
                  activeTab === 'potions'
                    ? 'bg-amber-900/50 text-amber-100 border-t border-l border-r border-amber-700/50'
                    : 'bg-amber-950/30 text-amber-400/60 hover:text-amber-100 hover:bg-amber-900/30'
                }`}
              >
                ⚗️ Potions ({learnedPotions.length})
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-200 transition-colors cursor-pointer text-xl p-2"
            >
              ✕
            </button>
          </div>

          {/* Content area with page flip animation */}
          <div 
            className={`relative transition-all duration-200 ${pageFlip ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            {/* Spells Tab */}
            {activeTab === 'spells' && (
              <div className="flex h-[70vh]">
                {/* Left page - Filters and list */}
                <div className="w-1/2 border-r border-amber-800/20 p-4 flex flex-col">
                  {/* Filters */}
                  <div className="flex gap-3 mb-4">
                    {/* School filter */}
                    <select
                      value={selectedSchool}
                      onChange={(e) => setSelectedSchool(e.target.value as SpellSchool | 'all')}
                      className="flex-1 bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2 font-crimson text-amber-200 text-sm outline-none focus:border-amber-600/50 cursor-pointer"
                    >
                      <option value="all">All Schools</option>
                      {Object.entries(SPELL_SCHOOLS_INFO).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.icon} {info.name}
                        </option>
                      ))}
                    </select>

                    {/* Tier filter */}
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value as SpellTier | 'all')}
                      className="flex-1 bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2 font-crimson text-amber-200 text-sm outline-none focus:border-amber-600/50 cursor-pointer"
                    >
                      <option value="all">All Tiers</option>
                      {Object.entries(TIER_INFO).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Spell list */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredSpells.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-4 block opacity-50">📚</span>
                        <p className="font-crimson text-amber-200/50">No spells found</p>
                        <p className="font-crimson text-amber-400/40 text-sm italic mt-1">
                          Attend classes to learn new spells
                        </p>
                      </div>
                    ) : (
                      filteredSpells.map(spell => (
                        <SpellCard
                          key={spell.id}
                          spell={spell}
                          isSelected={selectedSpell?.id === spell.id}
                          onSelect={() => setSelectedSpell(spell)}
                          onToggleFavorite={onToggleFavorite}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Right page - Spell details */}
                <div className="w-1/2 p-4">
                  {selectedSpell ? (
                    <SpellDetail spell={selectedSpell} onToggleFavorite={onToggleFavorite} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl mb-4 block opacity-30">🪄</span>
                        <p className="font-crimson text-amber-200/40 italic">
                          Select a spell to view its details...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Potions Tab */}
            {activeTab === 'potions' && (
              <div className="flex h-[70vh]">
                {/* Left page - Potions list */}
                <div className="w-1/2 border-r border-amber-800/20 p-4 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {learnedPotions.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-4xl mb-4 block opacity-50">⚗️</span>
                        <p className="font-crimson text-amber-200/50">No potions learned</p>
                        <p className="font-crimson text-amber-400/40 text-sm italic mt-1">
                          Attend Potions class to learn recipes
                        </p>
                      </div>
                    ) : (
                      learnedPotions.map(potion => (
                        <PotionCard
                          key={potion.id}
                          potion={potion}
                          isSelected={selectedPotion?.id === potion.id}
                          onSelect={() => setSelectedPotion(potion)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Right page - Potion details */}
                <div className="w-1/2 p-4">
                  {selectedPotion ? (
                    <PotionDetail potion={selectedPotion} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl mb-4 block opacity-30">🧪</span>
                        <p className="font-crimson text-amber-200/40 italic">
                          Select a potion to view its recipe...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="relative z-10 px-6 py-3 border-t border-amber-800/20 flex items-center justify-between">
            <p className="font-crimson text-amber-400/40 text-xs italic">
              &quot;Knowledge is the true magic&quot; — Archmage Aldric
            </p>
            <div className="flex items-center gap-4 text-amber-600/40 text-xs">
              <span>⭐ = Favorited for quick access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SPELL CARD COMPONENT
// ============================================

interface SpellCardProps {
  spell: Spell
  isSelected: boolean
  onSelect: () => void
  onToggleFavorite?: (spellId: string) => void
}

function SpellCard({ spell, isSelected, onSelect, onToggleFavorite }: SpellCardProps) {
  const schoolInfo = SPELL_SCHOOLS_INFO[spell.school]
  const tierInfo = TIER_INFO[spell.tier]

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-lg p-3 border transition-all cursor-pointer ${
        isSelected
          ? 'bg-amber-900/40 border-amber-600/50'
          : 'bg-amber-950/20 border-amber-900/20 hover:border-amber-700/30 hover:bg-amber-900/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{spell.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-cinzel text-amber-100 text-sm truncate">{spell.name}</h4>
            {spell.isFavorite && (
              <span className="text-amber-400 text-sm">⭐</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs">{schoolInfo.icon}</span>
            <span className={`text-xs ${tierInfo.color}`}>{tierInfo.name}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ============================================
// SPELL DETAIL COMPONENT
// ============================================

interface SpellDetailProps {
  spell: Spell
  onToggleFavorite?: (spellId: string) => void
}

function SpellDetail({ spell, onToggleFavorite }: SpellDetailProps) {
  const schoolInfo = SPELL_SCHOOLS_INFO[spell.school]
  const tierInfo = TIER_INFO[spell.tier]

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{spell.icon}</span>
          <div>
            <h3 className="font-cinzel text-amber-100 text-xl">{spell.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded bg-gradient-to-r ${schoolInfo.color} text-white`}>
                {schoolInfo.name}
              </span>
              <span className={`text-xs ${tierInfo.color}`}>{tierInfo.name}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite?.(spell.id)}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            spell.isFavorite
              ? 'bg-amber-600/30 text-amber-300'
              : 'bg-amber-900/20 text-amber-400/40 hover:text-amber-400'
          }`}
        >
          {spell.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {/* Incantation */}
      <div className="bg-amber-950/30 rounded-lg p-4 mb-4 border border-amber-800/20">
        <p className="font-crimson text-amber-400/60 text-xs uppercase tracking-wider mb-1">Incantation</p>
        <p className="font-great-vibes text-amber-100 text-2xl italic">{spell.incantation}</p>
      </div>

      {/* Description */}
      <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
        {spell.description}
      </p>

      {/* Spell stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-900/20">
          <p className="font-crimson text-amber-400/60 text-xs mb-1">Mana Cost</p>
          <p className="font-cinzel text-amber-200 text-lg flex items-center gap-2">
            <span className="text-blue-400">💎</span>
            {spell.manaCost}
          </p>
        </div>
        <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-900/20">
          <p className="font-crimson text-amber-400/60 text-xs mb-1">Cast Time</p>
          <p className="font-cinzel text-amber-200 text-lg">{spell.castTime}</p>
        </div>
        <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-900/20">
          <p className="font-crimson text-amber-400/60 text-xs mb-1">Range</p>
          <p className="font-crimson text-amber-200 text-sm">{spell.range}</p>
        </div>
        <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-900/20">
          <p className="font-crimson text-amber-400/60 text-xs mb-1">Duration</p>
          <p className="font-crimson text-amber-200 text-sm">{spell.duration}</p>
        </div>
      </div>

      {/* Requirements */}
      {spell.requirements && spell.requirements.length > 0 && (
        <div className="bg-purple-900/20 rounded-lg p-3 mb-4 border border-purple-800/30">
          <p className="font-crimson text-purple-400/60 text-xs uppercase tracking-wider mb-2">Requirements</p>
          <ul className="space-y-1">
            {spell.requirements.map((req, i) => (
              <li key={i} className="font-crimson text-purple-200/80 text-sm flex items-center gap-2">
                <span className="text-purple-400">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Effects */}
      <div className="bg-green-900/20 rounded-lg p-3 mb-4 border border-green-800/30">
        <p className="font-crimson text-green-400/60 text-xs uppercase tracking-wider mb-2">Effects</p>
        <ul className="space-y-1">
          {spell.effects.map((effect, i) => (
            <li key={i} className="font-crimson text-green-200/80 text-sm flex items-center gap-2">
              <span className="text-green-400">✦</span>
              {effect}
            </li>
          ))}
        </ul>
      </div>

      {/* Lore */}
      {spell.lore && (
        <div className="bg-amber-950/20 rounded-lg p-4 border border-amber-900/20">
          <p className="font-crimson text-amber-400/60 text-xs uppercase tracking-wider mb-2">Arcane Lore</p>
          <p className="font-crimson text-amber-200/70 text-sm italic leading-relaxed">
            &ldquo;{spell.lore}&rdquo;
          </p>
        </div>
      )}

      {/* Practice meter */}
      <div className="mt-4 bg-amber-950/20 rounded-lg p-3 border border-amber-900/20">
        <div className="flex items-center justify-between mb-2">
          <p className="font-crimson text-amber-400/60 text-xs">Casting Practice</p>
          <p className="font-cinzel text-amber-300 text-sm">{spell.castingPractice}%</p>
        </div>
        <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
            style={{ width: `${spell.castingPractice}%` }}
          />
        </div>
        <p className="font-crimson text-amber-400/40 text-xs mt-1 italic">
          Practice this spell in class to improve your mastery
        </p>
      </div>
    </div>
  )
}

// ============================================
// POTION CARD COMPONENT
// ============================================

interface PotionCardProps {
  potion: PotionRecipe
  isSelected: boolean
  onSelect: () => void
}

function PotionCard({ potion, isSelected, onSelect }: PotionCardProps) {
  const tierInfo = TIER_INFO[potion.tier]

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-lg p-3 border transition-all cursor-pointer ${
        isSelected
          ? 'bg-amber-900/40 border-amber-600/50'
          : 'bg-amber-950/20 border-amber-900/20 hover:border-amber-700/30 hover:bg-amber-900/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{potion.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-cinzel text-amber-100 text-sm truncate">{potion.name}</h4>
          <span className={`text-xs ${tierInfo.color}`}>{tierInfo.name}</span>
        </div>
      </div>
    </button>
  )
}

// ============================================
// POTION DETAIL COMPONENT
// ============================================

interface PotionDetailProps {
  potion: PotionRecipe
}

function PotionDetail({ potion }: PotionDetailProps) {
  const tierInfo = TIER_INFO[potion.tier]

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{potion.icon}</span>
        <div>
          <h3 className="font-cinzel text-amber-100 text-xl">{potion.name}</h3>
          <span className={`text-xs ${tierInfo.color}`}>{tierInfo.name} Recipe</span>
        </div>
      </div>

      {/* Description */}
      <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4">
        {potion.description}
      </p>

      {/* Brew time and duration */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-900/20">
          <p className="font-crimson text-amber-400/60 text-xs mb-1">Brew Time</p>
          <p className="font-cinzel text-amber-200 text-lg">⏱️ {potion.brewTime}</p>
        </div>
        <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-900/20">
          <p className="font-crimson text-amber-400/60 text-xs mb-1">Duration</p>
          <p className="font-cinzel text-amber-200 text-lg">{potion.duration}</p>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-green-900/20 rounded-lg p-3 mb-4 border border-green-800/30">
        <p className="font-crimson text-green-400/60 text-xs uppercase tracking-wider mb-2">Ingredients</p>
        <ul className="space-y-2">
          {potion.ingredients.map((ing, i) => (
            <li key={i} className="font-crimson text-green-200/80 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-green-400">🌿</span>
                {ing.itemName}
              </span>
              <span className="font-cinzel text-green-300 text-xs bg-green-900/30 px-2 py-0.5 rounded">
                ×{ing.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Effects */}
      <div className="bg-purple-900/20 rounded-lg p-3 mb-4 border border-purple-800/30">
        <p className="font-crimson text-purple-400/60 text-xs uppercase tracking-wider mb-2">Effects</p>
        <ul className="space-y-1">
          {potion.effects.map((effect, i) => (
            <li key={i} className="font-crimson text-purple-200/80 text-sm flex items-center gap-2">
              <span className="text-purple-400">✦</span>
              {effect}
            </li>
          ))}
        </ul>
      </div>

      {/* Practice meter */}
      <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-900/20">
        <div className="flex items-center justify-between mb-2">
          <p className="font-crimson text-amber-400/60 text-xs">Brewing Practice</p>
          <p className="font-cinzel text-amber-300 text-sm">{potion.brewPractice}%</p>
        </div>
        <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
            style={{ width: `${potion.brewPractice}%` }}
          />
        </div>
        <p className="font-crimson text-amber-400/40 text-xs mt-1 italic">
          Practice brewing in Potions class to improve your mastery
        </p>
      </div>
    </div>
  )
}

// ============================================
// SPELL TOOLTIP (for quick access toolbar)
// ============================================

interface SpellTooltipProps {
  spell: Spell
}

export function SpellTooltip({ spell }: SpellTooltipProps) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-700/50 p-3 shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{spell.icon}</span>
        <div>
          <h4 className="font-cinzel text-amber-100 text-sm">{spell.name}</h4>
          <p className="font-crimson text-amber-400/60 text-xs">{SPELL_SCHOOLS_INFO[spell.school].name}</p>
        </div>
      </div>
      <p className="font-crimson text-amber-200/70 text-xs mb-2">{spell.description}</p>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-blue-400">💎 {spell.manaCost}</span>
        <span className="text-amber-400">{spell.castTime}</span>
      </div>
    </div>
  )
}
