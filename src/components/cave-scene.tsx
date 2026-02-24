'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Spell, PotionRecipe } from '@/lib/spells'
import { GameTime, getMoonPhaseInfo } from '@/lib/game-time'
import { InventoryState, InventoryItem, createInventoryItem } from '@/lib/inventory'
import {
  CaveLevel,
  CaveMonster,
  CombatRollResult,
  getMonsterForLevel,
  spawnMonster,
  calculatePlayerDamage,
  calculateMonsterDamage,
  getMonsterMoonMod,
  rollLoot,
  rollGold,
} from '@/lib/cave'

// ============================================
// TYPES
// ============================================

type CavePhase = 'entry' | 'combat' | 'victory' | 'defeat' | 'cleared'

interface CombatLogEntry {
  id: number
  message: string
  type: 'player' | 'monster' | 'info' | 'loot' | 'heal'
}

interface LevelLoot {
  items: { itemId: string; itemName: string; icon: string }[]
  gold: number
}

// ============================================
// CAVE SCENE
// ============================================

interface CaveSceneProps {
  playerName: string
  learnedSpells: Spell[]
  learnedPotions: PotionRecipe[]
  currentMana: number
  maxMana: number
  inventory: InventoryState
  gameTime: GameTime
  onLeaveCave: () => void
  onUpdateMana: (newMana: number) => void
  onGainGold: (amount: number) => void
  onGainItems: (items: InventoryItem[]) => void
}

const PLAYER_MAX_HP_BASE = 30
const WARD_SHIELD_BLOCK = 8
const SPIRIT_GUARDIAN_BLOCK = 5
const SPIRIT_GUARDIAN_TURNS = 3
const HEALING_SALVE_RESTORE = 20

export function CaveScene({
  playerName,
  learnedSpells,
  learnedPotions,
  currentMana,
  maxMana,
  inventory,
  gameTime,
  onLeaveCave,
  onUpdateMana,
  onGainGold,
  onGainItems,
}: CaveSceneProps) {
  // ── Derived constants ─────────────────────
  const moonInfo = getMoonPhaseInfo(gameTime.dayNumber)
  const monsterMoonMod = getMonsterMoonMod(moonInfo.phase)
  const isFullMoon = moonInfo.phase === 'full-moon'
  /** Flat bonus damage from potion knowledge: +2 per 2 recipes, max +6 */
  const potionBonus = Math.min(6, Math.floor(learnedPotions.length / 2) * 2)
  /** Player max HP: base + 2 per learned spell, capped at 80 */
  const playerMaxHp = Math.min(80, PLAYER_MAX_HP_BASE + learnedSpells.length * 2)

  // ── Phase & level ─────────────────────────
  const [phase, setPhase] = useState<CavePhase>('entry')
  const [currentLevel, setCurrentLevel] = useState<CaveLevel>(1)

  // ── Combat state ──────────────────────────
  const [monster, setMonster] = useState<CaveMonster | null>(null)
  const [playerHp, setPlayerHp] = useState(playerMaxHp)
  const [mana, setMana] = useState(currentMana)
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null)
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [shieldActive, setShieldActive] = useState(false)          // ward shield (1 attack block)
  const [guardianTurns, setGuardianTurns] = useState(0)            // spirit guardian turns remaining
  const [potionUsesLeft, setPotionUsesLeft] = useState(1)          // 1 healing salve use per run
  const [collectedLoot, setCollectedLoot] = useState<LevelLoot[]>([])
  const [currentLevelLoot, setCurrentLevelLoot] = useState<LevelLoot | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)
  const logIdRef = useRef(0)

  const hasHealingSalve = learnedPotions.some(p => p.id === 'healing-potion')
  const hasWardShield = learnedSpells.some(s => s.id === 'ward-shield')
  const hasSpiritGuardian = learnedSpells.some(s => s.id === 'spirit-guardian')

  // ── Combat log helpers ────────────────────
  const addLog = useCallback((message: string, type: CombatLogEntry['type']) => {
    setCombatLog(prev => [...prev, { id: ++logIdRef.current, message, type }])
  }, [])

  // Auto-scroll combat log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [combatLog])

  // ── Initialise a level ────────────────────
  const enterLevel = useCallback((level: CaveLevel) => {
    const def = getMonsterForLevel(level)
    const live = spawnMonster(def)
    setMonster(live)
    setCombatLog([])
    setSelectedSpell(null)
    setShieldActive(false)
    setGuardianTurns(0)
    setCurrentLevel(level)
    setPhase('combat')
    addLog(`You descend to Level ${level}. ${live.flavorText}`, 'info')
  }, [addLog])

  // Enter the first level
  const handleEnterCave = () => {
    setPlayerHp(playerMaxHp)
    setMana(currentMana)
    setPotionUsesLeft(1)
    setCollectedLoot([])
    enterLevel(1)
  }

  // ── Player attacks ────────────────────────
  const handleCastSpell = () => {
    if (!selectedSpell || !monster || isProcessing) return
    if (mana < selectedSpell.manaCost) {
      addLog('Not enough mana!', 'info')
      return
    }

    setIsProcessing(true)
    const newMana = Math.max(0, mana - selectedSpell.manaCost)
    setMana(newMana)
    onUpdateMana(newMana)

    // Ward Shield: defensive turn — no damage but blocks next hit
    if (selectedSpell.id === 'ward-shield') {
      setShieldActive(true)
      addLog(`You cast ${selectedSpell.name} — a silver barrier shimmers around you!`, 'player')
      monsterTurn(monster, 0, newMana)
      return
    }

    // Spirit Guardian: defensive buff for several turns
    if (selectedSpell.id === 'spirit-guardian') {
      setGuardianTurns(SPIRIT_GUARDIAN_TURNS)
      addLog(`You cast ${selectedSpell.name} — a luminous guardian spirit materialises at your side!`, 'player')
      monsterTurn(monster, 0, newMana)
      return
    }

    // Offensive spell
    const { damage, roll } = calculatePlayerDamage(
      selectedSpell.tier,
      selectedSpell.castingPractice,
      moonInfo.spellFailureModifier,
      monster.defense,
      potionBonus,
    )

    const rollDetail = `(d20: ${roll.roll} — ${roll.label})`
    if (damage === 0) {
      addLog(`You cast ${selectedSpell.name}! ${roll.label} — the spell dissipates harmlessly. ${rollDetail}`, 'player')
    } else {
      addLog(`You cast ${selectedSpell.name}! ${roll.label} — ${damage} damage! ${rollDetail}`, 'player')
    }

    const newMonsterHp = monster.currentHp - damage
    const updatedMonster: CaveMonster = { ...monster, currentHp: Math.max(0, newMonsterHp) }
    setMonster(updatedMonster)

    if (updatedMonster.currentHp <= 0) {
      handleVictory(updatedMonster, newMana)
      return
    }

    monsterTurn(updatedMonster, damage, newMana)
  }

  // ── Player uses healing salve ─────────────
  const handleUsePotion = () => {
    if (!monster || isProcessing || potionUsesLeft <= 0) return
    setIsProcessing(true)
    setPotionUsesLeft(0)
    const healed = Math.min(playerMaxHp - playerHp, HEALING_SALVE_RESTORE)
    const newHp = playerHp + healed
    setPlayerHp(newHp)
    addLog(`You drink your Healing Salve — restoring ${healed} HP! (${newHp}/${playerMaxHp})`, 'heal')
    monsterTurn(monster, 0, mana)
  }

  // ── Monster attacks after a delay ─────────
  const monsterTurn = (liveMonster: CaveMonster, _playerDmg: number, currentManaCopy: number) => {
    setTimeout(() => {
      const shieldBlock = shieldActive ? WARD_SHIELD_BLOCK : 0
      const guardianBlock = guardianTurns > 0 ? SPIRIT_GUARDIAN_BLOCK : 0
      const totalBlock = shieldBlock + guardianBlock

      const { damage, isCritical, isMiss } = calculateMonsterDamage(
        liveMonster.baseAttack,
        monsterMoonMod,
        totalBlock,
      )

      if (shieldActive) {
        addLog(`${liveMonster.name} attacks! Your Ward Shield absorbs the blow. ${damage} damage after shield!`, 'monster')
        setShieldActive(false)
      } else if (isMiss) {
        addLog(`${liveMonster.name} lunges — but misses! You dodge aside.`, 'monster')
      } else if (isCritical) {
        addLog(`${liveMonster.name} lands a CRUSHING BLOW for ${damage} damage!${guardianTurns > 0 ? ' (Spirit Guardian reduces impact)' : ''}`, 'monster')
      } else {
        addLog(`${liveMonster.name} strikes for ${damage} damage.${guardianTurns > 0 ? ' (Spirit Guardian reduces impact)' : ''}`, 'monster')
      }

      if (guardianTurns > 0) {
        setGuardianTurns(prev => Math.max(0, prev - 1))
      }

      setPlayerHp(prev => {
        const newHp = Math.max(0, prev - damage)
        if (newHp <= 0) {
          setTimeout(() => setPhase('defeat'), 300)
        }
        return newHp
      })

      setIsProcessing(false)
      setSelectedSpell(null)
    }, 1100)
  }

  // ── Victory handler ───────────────────────
  const handleVictory = (defeatedMonster: CaveMonster, finalMana: number) => {
    addLog(`${defeatedMonster.name} has been defeated!`, 'info')

    const drops = rollLoot(defeatedMonster, isFullMoon)
    const gold = rollGold(defeatedMonster)
    const loot: LevelLoot = { items: drops, gold }
    setCurrentLevelLoot(loot)
    setCollectedLoot(prev => [...prev, loot])

    drops.forEach(drop => addLog(`💎 Found: ${drop.icon} ${drop.itemName}`, 'loot'))
    addLog(`💰 Gained ${gold} gold!`, 'loot')

    // Propagate rewards immediately so they persist if the player leaves
    onGainGold(gold)
    if (drops.length > 0) {
      const inventoryItems: InventoryItem[] = drops.map(d =>
        createInventoryItem(d.itemId, d.itemName, `Rare ingredient found in the caves.`, d.icon, 'misc', 1)
      )
      onGainItems(inventoryItems)
    }

    setIsProcessing(false)
    setTimeout(() => setPhase(currentLevel === 3 ? 'cleared' : 'victory'), 800)
  }

  // ── Flee ──────────────────────────────────
  const handleFlee = () => {
    if (!monster || isProcessing) return
    // Monster gets a parting shot at half power
    const fleeDamage = Math.floor(monster.baseAttack * 0.5)
    const newHp = Math.max(0, playerHp - fleeDamage)
    setPlayerHp(newHp)
    addLog(`You flee! ${monster.name} takes a parting swipe for ${fleeDamage} damage as you run.`, 'monster')
    onUpdateMana(mana)
    setTimeout(onLeaveCave, 1000)
  }

  // ── Descend to next level ─────────────────
  const handleDescend = () => {
    if (currentLevel < 3) {
      enterLevel((currentLevel + 1) as CaveLevel)
    }
  }

  // ── HP bar ────────────────────────────────
  const hpPct = (current: number, max: number) => Math.max(0, Math.min(100, (current / max) * 100))
  const hpColor = (pct: number) => pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-amber-500' : 'bg-red-500'
  const manaColor = 'bg-indigo-500'

  // ── Render ────────────────────────────────

  // ──── Entry screen ──────────────────────
  if (phase === 'entry') {
    const moonMod = moonInfo.spellFailureModifier
    return (
      <div className="relative min-h-full w-full bg-[#0a0807] flex flex-col">
        {/* Dark cave atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#100d0b] via-[#0d0b09] to-black opacity-90 pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto w-full p-6 flex flex-col gap-6 mt-8">
          {/* Title */}
          <div className="text-center">
            <div className="text-5xl mb-3">🏔️</div>
            <h1 className="font-cinzel text-amber-100 text-3xl tracking-widest mb-1">Corvenhal Caves</h1>
            <p className="font-crimson text-amber-400/60 text-sm italic">Three levels. Monsters grow with every descent.</p>
          </div>

          {/* Moon phase warning */}
          <div className={`rounded-lg border p-4 ${
            isFullMoon ? 'border-orange-700/50 bg-orange-950/30' : 'border-amber-900/30 bg-amber-950/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{moonInfo.icon}</span>
              <span className="font-cinzel text-amber-100 text-sm">{moonInfo.name}</span>
            </div>
            <p className="font-crimson text-amber-300/70 text-sm">{moonInfo.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {moonInfo.effects.map((e, i) => (
                <span key={i} className="font-crimson text-amber-400/60 text-xs bg-black/30 rounded px-2 py-0.5">
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* Player stats */}
          <div className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-4 space-y-2">
            <p className="font-cinzel text-amber-400/60 text-xs uppercase tracking-wider mb-3">Your Stats</p>
            <div className="flex justify-between text-sm">
              <span className="font-crimson text-amber-200/80">Combat HP</span>
              <span className="font-cinzel text-amber-300">{playerMaxHp}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-crimson text-amber-200/80">Spells Available</span>
              <span className="font-cinzel text-amber-300">{learnedSpells.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-crimson text-amber-200/80">Mana</span>
              <span className="font-cinzel text-amber-300">{currentMana}/{maxMana}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-crimson text-amber-200/80">Potion Knowledge Bonus</span>
              <span className="font-cinzel text-amber-300">+{potionBonus} dmg</span>
            </div>
            {moonMod !== 0 && (
              <div className="flex justify-between text-sm">
                <span className="font-crimson text-amber-200/80">Moon spell modifier</span>
                <span className={`font-cinzel text-sm ${moonMod > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {moonMod > 0 ? `+${moonMod}% failure` : `${moonMod}% failure`}
                </span>
              </div>
            )}
          </div>

          {/* Cave rules */}
          <div className="rounded-lg border border-stone-800/40 bg-stone-950/20 p-4">
            <p className="font-cinzel text-stone-400/60 text-xs uppercase tracking-wider mb-2">Rules</p>
            <ul className="font-crimson text-stone-300/70 text-sm space-y-1">
              <li>• 1 room per level — defeat the monster to advance</li>
              <li>• Turn-based: you cast first, then the monster retaliates</li>
              <li>• Roll check (d20) determines hit quality and damage</li>
              <li>• The cave <span className="text-amber-300/80">resets</span> when you leave — all progress is lost</li>
              {hasHealingSalve && <li>• 🧪 You have <span className="text-green-400/80">Healing Salve</span> (1 use)</li>}
              {hasWardShield && <li>• 🛡️ <span className="text-blue-400/80">Ward Shield</span> blocks the next monster attack</li>}
              {hasSpiritGuardian && <li>• 🦌 <span className="text-purple-400/80">Spirit Guardian</span> reduces damage for 3 turns</li>}
            </ul>
          </div>

          {/* Enter / Leave */}
          <div className="flex gap-3">
            <button
              onClick={handleEnterCave}
              disabled={learnedSpells.length === 0}
              className="flex-1 py-3 font-cinzel text-sm bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/40 hover:from-amber-600 hover:to-amber-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⚔️ Enter the Caves
            </button>
            <button
              onClick={onLeaveCave}
              className="px-5 py-3 font-cinzel text-sm bg-stone-900/60 text-stone-300 rounded-lg border border-stone-700/30 hover:bg-stone-800/60 transition-all cursor-pointer"
            >
              ← Leave
            </button>
          </div>
          {learnedSpells.length === 0 && (
            <p className="font-crimson text-red-400/70 text-sm text-center -mt-3">
              You must learn at least one spell before entering the caves.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ──── Defeat screen ─────────────────────
  if (phase === 'defeat') {
    return (
      <div className="relative min-h-full w-full bg-[#0a0807] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-radial from-red-950/30 via-black to-black pointer-events-none" />
        <div className="relative z-10 max-w-md mx-auto p-8 text-center">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="font-cinzel text-red-300 text-2xl tracking-wider mb-2">Defeated</h2>
          <p className="font-crimson text-red-400/70 text-base mb-6">
            The cave claimed you, {playerName}. Your companions found you at the entrance — barely alive.
          </p>
          {collectedLoot.length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-left">
              <p className="font-cinzel text-red-400/60 text-xs uppercase mb-2">Loot already claimed</p>
              {collectedLoot.map((l, i) => (
                <div key={i} className="text-xs font-crimson text-red-300/60">
                  <span>Level {i + 1}: {l.gold}g{l.items.length > 0 ? ` · ${l.items.map(it => it.icon + ' ' + it.itemName).join(', ')}` : ''}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onLeaveCave}
            className="w-full py-3 font-cinzel text-sm bg-gradient-to-b from-stone-700 to-stone-900 text-stone-100 rounded-lg border border-stone-600/40 hover:from-stone-600 hover:to-stone-800 transition-all cursor-pointer"
          >
            ← Crawl Back to Safety
          </button>
        </div>
      </div>
    )
  }

  // ──── Cave cleared screen ───────────────
  if (phase === 'cleared') {
    const totalGold = collectedLoot.reduce((s, l) => s + l.gold, 0)
    const totalItems = collectedLoot.flatMap(l => l.items)
    return (
      <div className="relative min-h-full w-full bg-[#0a0807] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-radial from-amber-950/30 via-black to-black pointer-events-none" />
        <div className="relative z-10 max-w-md mx-auto p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="font-cinzel text-amber-200 text-2xl tracking-wider mb-2">Cave Cleared!</h2>
          <p className="font-crimson text-amber-400/70 text-base mb-6">
            You conquered all three levels, {playerName}. The cave yields its secrets to you.
          </p>
          <div className="mb-6 p-4 rounded-lg bg-amber-950/20 border border-amber-800/30 text-left space-y-2">
            <p className="font-cinzel text-amber-400/60 text-xs uppercase mb-2">Total Haul</p>
            <div className="flex justify-between text-sm">
              <span className="font-crimson text-amber-200/80">Gold Earned</span>
              <span className="font-cinzel text-amber-300">🪙 {totalGold}</span>
            </div>
            {totalItems.length > 0 && (
              <div>
                <p className="font-crimson text-amber-200/80 text-sm mb-1">Ingredients Found</p>
                <div className="flex flex-wrap gap-1">
                  {totalItems.map((it, i) => (
                    <span key={i} className="text-xs font-crimson bg-amber-950/40 border border-amber-800/30 rounded px-2 py-0.5 text-amber-300/80">
                      {it.icon} {it.itemName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onLeaveCave}
            className="w-full py-3 font-cinzel text-sm bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/40 hover:from-amber-600 hover:to-amber-800 transition-all cursor-pointer"
          >
            ← Return to the Academy
          </button>
        </div>
      </div>
    )
  }

  // ──── Victory / loot screen ─────────────
  if (phase === 'victory' && currentLevelLoot) {
    return (
      <div className="relative min-h-full w-full bg-[#0a0807] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-radial from-green-950/20 via-black to-black pointer-events-none" />
        <div className="relative z-10 max-w-md mx-auto p-8 text-center">
          <div className="text-5xl mb-4">⚔️</div>
          <h2 className="font-cinzel text-green-300 text-2xl tracking-wider mb-1">Level {currentLevel} Cleared</h2>
          <p className="font-crimson text-green-400/60 text-sm mb-6">
            The monster falls. The path deeper beckons.
          </p>

          {/* Loot summary */}
          <div className="mb-6 p-4 rounded-lg bg-green-950/20 border border-green-800/30 text-left space-y-2">
            <p className="font-cinzel text-green-400/60 text-xs uppercase mb-2">Spoils of Combat</p>
            <div className="flex justify-between text-sm">
              <span className="font-crimson text-green-200/80">Gold</span>
              <span className="font-cinzel text-amber-300">🪙 {currentLevelLoot.gold}</span>
            </div>
            {currentLevelLoot.items.length > 0 ? (
              <div>
                <p className="font-crimson text-green-200/80 text-sm mb-1">Ingredients</p>
                <div className="flex flex-wrap gap-1">
                  {currentLevelLoot.items.map((it, i) => (
                    <span key={i} className="text-xs font-crimson bg-green-950/40 border border-green-800/30 rounded px-2 py-0.5 text-green-300/80">
                      {it.icon} {it.itemName}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="font-crimson text-green-400/40 text-sm italic">No ingredients dropped.</p>
            )}
          </div>

          {/* Player status */}
          <div className="mb-6 p-3 rounded-lg bg-black/30 border border-stone-800/30 text-left">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-crimson text-stone-300/70">Your HP</span>
              <span className="font-cinzel text-stone-200">{playerHp}/{playerMaxHp}</span>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${hpColor(hpPct(playerHp, playerMaxHp))}`} style={{ width: `${hpPct(playerHp, playerMaxHp)}%` }} />
            </div>
          </div>

          <div className="flex gap-3">
            {currentLevel < 3 && (
              <button
                onClick={handleDescend}
                className="flex-1 py-3 font-cinzel text-sm bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/40 hover:from-amber-600 hover:to-amber-800 transition-all cursor-pointer"
              >
                ⬇ Descend to Level {currentLevel + 1}
              </button>
            )}
            <button
              onClick={onLeaveCave}
              className="flex-1 py-3 font-cinzel text-sm bg-stone-900/60 text-stone-300 rounded-lg border border-stone-700/30 hover:bg-stone-800/60 transition-all cursor-pointer"
            >
              ← Leave Cave
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ──── Main combat screen ─────────────────
  if (phase === 'combat' && monster) {
    const monsterHpPct = hpPct(monster.currentHp, monster.maxHp)
    const playerHpPct = hpPct(playerHp, playerMaxHp)
    const manaPct = hpPct(mana, maxMana)

    return (
      <div className="relative min-h-full w-full bg-[#080604]">
        {/* Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 to-black opacity-90 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-stone-800/40 bg-black/40">
            <span className="font-cinzel text-stone-400/80 text-xs uppercase tracking-widest">
              Cave · Level {currentLevel}/3
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{moonInfo.icon}</span>
              <span className="font-crimson text-stone-400/70 text-xs">{moonInfo.name}</span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-0">
            {/* ── Left: Monster panel ── */}
            <div className="md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-stone-800/40 p-4 flex flex-col gap-3 shrink-0">
              <div className="text-center">
                <div className="text-5xl mb-2">{monster.icon}</div>
                <h2 className="font-cinzel text-red-300/90 text-lg">{monster.name}</h2>
                <p className="font-crimson text-stone-400/60 text-xs italic mt-1">{monster.description}</p>
              </div>

              {/* Monster HP */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-crimson text-stone-400/70 text-xs">HP</span>
                  <span className="font-cinzel text-stone-300 text-xs">{monster.currentHp}/{monster.maxHp}</span>
                </div>
                <div className="h-3 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${hpColor(monsterHpPct)}`}
                    style={{ width: `${monsterHpPct}%` }}
                  />
                </div>
              </div>

              {/* Defense indicator */}
              {monster.defense > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-crimson text-stone-400/60">
                  <span>🛡️</span>
                  <span>Defense {monster.defense} (reduces your spell damage)</span>
                </div>
              )}

              {/* Moon modifier */}
              {monsterMoonMod !== 0 && (
                <div className={`text-xs font-crimson flex items-center gap-1 ${monsterMoonMod > 0 ? 'text-red-400/70' : 'text-green-400/70'}`}>
                  <span>{moonInfo.icon}</span>
                  <span>{monsterMoonMod > 0 ? `+${monsterMoonMod}%` : `${monsterMoonMod}%`} monster strength</span>
                </div>
              )}

              {/* Active buffs */}
              {(shieldActive || guardianTurns > 0) && (
                <div className="p-2 rounded bg-blue-950/30 border border-blue-800/30 space-y-1">
                  {shieldActive && (
                    <p className="text-xs font-crimson text-blue-300/80">🛡️ Ward Shield active</p>
                  )}
                  {guardianTurns > 0 && (
                    <p className="text-xs font-crimson text-purple-300/80">
                      🦌 Spirit Guardian ({guardianTurns} turn{guardianTurns !== 1 ? 's' : ''})
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: Combat panel ── */}
            <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
              {/* Player vitals */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-crimson text-stone-400/70 text-xs">Your HP</span>
                    <span className="font-cinzel text-stone-300 text-xs">{playerHp}/{playerMaxHp}</span>
                  </div>
                  <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${hpColor(playerHpPct)}`} style={{ width: `${playerHpPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-crimson text-stone-400/70 text-xs">Mana</span>
                    <span className="font-cinzel text-stone-300 text-xs">{mana}/{maxMana}</span>
                  </div>
                  <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${manaColor}`} style={{ width: `${manaPct}%` }} />
                  </div>
                </div>
              </div>

              {/* Combat log */}
              <div className="flex-1 min-h-0 bg-black/40 rounded-lg border border-stone-800/40 overflow-hidden flex flex-col">
                <p className="font-cinzel text-stone-500/60 text-[10px] uppercase tracking-wider px-3 py-1.5 border-b border-stone-800/30">
                  Combat Log
                </p>
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-sm">
                  {combatLog.map(entry => (
                    <p
                      key={entry.id}
                      className={`font-crimson leading-snug ${
                        entry.type === 'player'  ? 'text-amber-200/90' :
                        entry.type === 'monster' ? 'text-red-300/80' :
                        entry.type === 'loot'    ? 'text-green-300/80' :
                        entry.type === 'heal'    ? 'text-emerald-300/80' :
                        'text-stone-400/70 italic'
                      }`}
                    >
                      {entry.message}
                    </p>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>

              {/* Spell selection */}
              <div>
                <p className="font-cinzel text-stone-500/60 text-[10px] uppercase tracking-wider mb-1.5">
                  Choose Spell {isProcessing ? '— waiting…' : ''}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                  {learnedSpells.map(spell => {
                    const canAfford = mana >= spell.manaCost
                    const isSelected = selectedSpell?.id === spell.id
                    return (
                      <button
                        key={spell.id}
                        onClick={() => !isProcessing && canAfford && setSelectedSpell(isSelected ? null : spell)}
                        disabled={isProcessing || !canAfford}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-left transition-all text-xs ${
                          isSelected
                            ? 'bg-amber-700/40 border-amber-500/50 text-amber-100'
                            : canAfford && !isProcessing
                              ? 'bg-stone-900/60 border-stone-700/30 text-stone-300 hover:bg-stone-800/60 hover:border-stone-600/40 cursor-pointer'
                              : 'bg-stone-900/30 border-stone-800/20 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-base shrink-0">{spell.icon}</span>
                        <div className="overflow-hidden">
                          <p className="font-crimson truncate leading-tight">{spell.name}</p>
                          <p className="font-crimson text-[10px] text-stone-500/70 leading-tight">{spell.manaCost} mana · {spell.tier}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleCastSpell}
                  disabled={!selectedSpell || isProcessing}
                  className="flex-1 py-2.5 font-cinzel text-sm bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/40 hover:from-amber-600 hover:to-amber-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isProcessing ? '⏳ Casting…' : selectedSpell ? `Cast ${selectedSpell.name}` : '— Select a Spell —'}
                </button>

                {hasHealingSalve && potionUsesLeft > 0 && (
                  <button
                    onClick={handleUsePotion}
                    disabled={isProcessing || playerHp >= playerMaxHp}
                    className="px-3 py-2.5 font-cinzel text-xs bg-emerald-900/40 text-emerald-300 rounded-lg border border-emerald-700/30 hover:bg-emerald-800/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title={`Healing Salve — restores ${HEALING_SALVE_RESTORE} HP (1 use left)`}
                  >
                    🧪 Salve (+{HEALING_SALVE_RESTORE}HP)
                  </button>
                )}

                <button
                  onClick={handleFlee}
                  disabled={isProcessing}
                  className="px-4 py-2.5 font-cinzel text-xs bg-stone-900/60 text-stone-400 rounded-lg border border-stone-700/30 hover:bg-stone-800/60 hover:text-stone-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  🏃 Flee
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
