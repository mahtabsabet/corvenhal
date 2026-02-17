'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Spell, PotionRecipe, SpellSchool, SPELL_SCHOOLS_INFO, TIER_INFO, SPELL_LIBRARY, POTION_LIBRARY } from '@/lib/spells'
import { PotionBrewing } from './potion-brewing'

// ============================================
// TYPES
// ============================================

export type ClassType = 'elemental' | 'potions' | 'divination' | 'transmutation' | 'enchantment' | 'abjuration' | 'conjuration'

interface ClassroomSceneProps {
  playerName: string
  classType: ClassType
  learnedSpells: Spell[]
  learnedPotions: PotionRecipe[]
  onLearnSpell: (spell: Spell) => void
  onLearnPotion: (potion: PotionRecipe) => void
  onPracticeSpell: (spellId: string) => void
  onLeave: () => void
}

interface ClassInfo {
  name: string
  professor: string
  description: string
  icon: string
  school: SpellSchool
  classroomImage: string
}

// ============================================
// CLASS DEFINITIONS
// ============================================

const CLASS_INFO: Record<ClassType, ClassInfo> = {
  elemental: {
    name: 'Elemental Theory',
    professor: 'Professor Ignis Flameheart',
    description: 'Master the fundamental forces of fire, water, earth, and air.',
    icon: '🔥',
    school: 'elemental',
    classroomImage: '/images/classroom-elemental.png',
  },
  potions: {
    name: 'Potions I',
    professor: 'Professor Selene Moonwater',
    description: 'Brew magical concoctions with precise technique and rare ingredients.',
    icon: '⚗️',
    school: 'potion',
    classroomImage: '/images/classroom-potions.png',
  },
  divination: {
    name: 'Astral Navigation',
    professor: 'Professor Orion Starweaver',
    description: 'Peer beyond the veil to glimpse possible futures and distant places.',
    icon: '🔮',
    school: 'divination',
    classroomImage: '/images/classroom-divination.png',
  },
  transmutation: {
    name: 'Transmutation',
    professor: 'Professor Mercury Alchemius',
    description: 'Transform matter from one form to another through arcane transmutation.',
    icon: '🌀',
    school: 'transmutation',
    classroomImage: '/images/classroom-transmutation.png',
  },
  enchantment: {
    name: 'Enchantments',
    professor: 'Professor Lyra Charmwell',
    description: 'Imbue objects with magical properties and affect minds.',
    icon: '💜',
    school: 'enchantment',
    classroomImage: '/images/classroom-enchantment.png',
  },
  abjuration: {
    name: 'Defense Arts',
    professor: 'Professor Victor Wardshield',
    description: 'Learn protective wards, shields, and defensive spellwork.',
    icon: '🛡️',
    school: 'abjuration',
    classroomImage: '/images/classroom-abjuration.png',
  },
  conjuration: {
    name: 'Summoning I',
    professor: 'Professor Caspian Portalis',
    description: 'Summon objects and creatures from across space and planes.',
    icon: '✨',
    school: 'conjuration',
    classroomImage: '/images/classroom-conjuration.png',
  },
}

// ============================================
// CLASSROOM SCENE COMPONENT
// ============================================

export function ClassroomScene({
  playerName,
  classType,
  learnedSpells,
  learnedPotions,
  onLearnSpell,
  onLearnPotion,
  onPracticeSpell,
  onLeave
}: ClassroomSceneProps) {
  const [phase, setPhase] = useState<'entrance' | 'lecture' | 'practice' | 'complete'>('entrance')
  const [showContent, setShowContent] = useState(false)
  const [lectureIndex, setLectureIndex] = useState(0)
  const [practiceSpell, setPracticeSpell] = useState<Spell | null>(null)
  const [castingProgress, setCastingProgress] = useState(0)
  const [isCasting, setIsCasting] = useState(false)
  const [castResult, setCastResult] = useState<'success' | 'fail' | null>(null)

  const classInfo = CLASS_INFO[classType]
  const schoolInfo = SPELL_SCHOOLS_INFO[classInfo.school]

  // Get available spells to learn
  const availableSpells = SPELL_LIBRARY.filter(
    s => s.school === classInfo.school && !learnedSpells.find(ls => ls.id === s.id)
  )

  // Get spells available for practice
  const practiceSpells = learnedSpells.filter(s => s.school === classInfo.school)

  // Lecture content based on class type
  const lectureContent = getLectureContent(classType, playerName, classInfo.professor)

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(t)
  }, [phase])

  // Handle casting animation
  const handleCast = useCallback(() => {
    if (!practiceSpell || isCasting) return

    setIsCasting(true)
    setCastingProgress(0)
    setCastResult(null)

    // Simulate casting progress
    const interval = setInterval(() => {
      setCastingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCasting(false)
          // Success based on practice level + random factor
          const successChance = Math.min(95, 50 + practiceSpell.castingPractice * 0.4)
          const success = Math.random() * 100 < successChance
          setCastResult(success ? 'success' : 'fail')
          if (success) {
            onPracticeSpell(practiceSpell.id)
          }
          return 100
        }
        return prev + 5
      })
    }, 100)

    return () => clearInterval(interval)
  }, [practiceSpell, isCasting, onPracticeSpell])

  // Entrance phase
  if (phase === 'entrance') {
    return (
      <div className="relative h-full w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09] via-[#1a1410] to-[#0d0b09]" />

        <div className="relative z-10 h-full flex items-center justify-center p-4 pb-16">
          <div className={`max-w-2xl w-full transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Class card */}
            <div className="bg-black/70 backdrop-blur-sm rounded-lg border border-amber-900/40 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className={`p-6 bg-gradient-to-r ${schoolInfo.color} bg-opacity-20`}>
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{classInfo.icon}</span>
                  <div>
                    <h2 className="font-cinzel text-amber-100 text-2xl tracking-wider">{classInfo.name}</h2>
                    <p className="font-crimson text-amber-200/70 text-sm italic">taught by {classInfo.professor}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="font-crimson text-amber-100/80 text-lg leading-relaxed mb-6">
                  You enter the {classInfo.name.toLowerCase()} classroom. {classInfo.description}
                </p>

                <div className="bg-amber-950/30 rounded-lg p-4 mb-6 border border-amber-900/20">
                  <p className="font-crimson text-amber-200/60 text-sm">
                    <span className="text-amber-400">📚 Available to learn:</span>{' '}
                    {availableSpells.length > 0 
                      ? `${availableSpells.length} new spell${availableSpells.length > 1 ? 's' : ''}`
                      : 'All spells in this school mastered!'}
                  </p>
                  <p className="font-crimson text-amber-200/60 text-sm mt-1">
                    <span className="text-amber-400">⚡ Practice available:</span>{' '}
                    {practiceSpells.length > 0 
                      ? `${practiceSpells.length} spell${practiceSpells.length > 1 ? 's' : ''}`
                      : 'None learned yet'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowContent(false)
                      setTimeout(() => setPhase('lecture'), 300)
                    }}
                    className="flex-1 py-3 px-6 font-cinzel text-base tracking-wider bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 transition-all cursor-pointer"
                  >
                    Begin Class
                  </button>
                  <button
                    onClick={onLeave}
                    className="py-3 px-6 font-crimzel text-sm bg-amber-900/20 text-amber-300 rounded-lg border border-amber-800/30 hover:bg-amber-900/30 transition-all cursor-pointer"
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Lecture phase
  if (phase === 'lecture') {
    const currentLecture = lectureContent[lectureIndex]

    return (
      <div className="relative h-full w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09] via-[#1a1410] to-[#0d0b09]" />

        {/* Floating candles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${10 + i * 12}%`,
                top: `${5 + (i % 3) * 10}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <div className="w-2 h-3 rounded-full bg-gradient-to-t from-orange-500 to-yellow-300 shadow-lg shadow-amber-400/50" />
            </div>
          ))}
        </div>

        <div className="relative z-10 h-full flex items-center justify-center p-4 pb-16">
          <div className={`max-w-3xl w-full transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Professor speaking */}
            <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-amber-900/40 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-amber-900/30 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-2xl border-2 border-amber-600/30">
                  🧙
                </div>
                <div>
                  <h3 className="font-cinzel text-amber-100 text-lg">{classInfo.professor}</h3>
                  <p className="font-crimson text-amber-400/60 text-sm">{classInfo.name}</p>
                </div>
              </div>

              {/* Lecture content */}
              <div className="p-6">
                {currentLecture.type === 'dialogue' && (
                  <div className="space-y-4">
                    <p className="font-crimson text-amber-100/90 text-lg leading-relaxed">
                      &ldquo;{currentLecture.text}&rdquo;
                    </p>
                  </div>
                )}

                {currentLecture.type === 'demonstration' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl animate-pulse">{currentLecture.spellIcon}</span>
                      <div>
                        <h4 className="font-cinzel text-amber-100 text-lg">{currentLecture.spellName}</h4>
                        <p className="font-great-vibes text-amber-300 text-lg italic">{currentLecture.incantation}</p>
                      </div>
                    </div>
                    <p className="font-crimson text-amber-100/80 text-base leading-relaxed">
                      {currentLecture.description}
                    </p>
                    {currentLecture.effects && (
                      <div className="bg-green-900/20 rounded-lg p-3 border border-green-800/30 mt-4">
                        <p className="font-crimson text-green-400/60 text-xs uppercase mb-2">Spell Effects</p>
                        <ul className="space-y-1">
                          {currentLecture.effects.map((effect: string, i: number) => (
                            <li key={i} className="font-crimson text-green-200/80 text-sm flex items-center gap-2">
                              <span className="text-green-400">✦</span>
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress indicator */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex gap-1">
                    {lectureContent.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i <= lectureIndex ? 'bg-amber-500' : 'bg-amber-800/30'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {lectureIndex > 0 && (
                      <button
                        onClick={() => {
                          setShowContent(false)
                          setTimeout(() => {
                            setLectureIndex(prev => prev - 1)
                            setShowContent(true)
                          }, 300)
                        }}
                        className="px-4 py-2 font-crimson text-sm bg-amber-900/20 text-amber-300 rounded-lg hover:bg-amber-900/30 transition-all cursor-pointer"
                      >
                        ← Back
                      </button>
                    )}
                    
                    {lectureIndex < lectureContent.length - 1 ? (
                      <button
                        onClick={() => {
                          setShowContent(false)
                          setTimeout(() => {
                            setLectureIndex(prev => prev + 1)
                            setShowContent(true)
                          }, 300)
                        }}
                        className="px-4 py-2 font-cinzel text-sm bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg hover:from-amber-600 hover:to-amber-800 transition-all cursor-pointer"
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowContent(false)
                          setTimeout(() => setPhase('practice'), 300)
                        }}
                        className="px-4 py-2 font-cinzel text-sm bg-gradient-to-b from-green-700 to-green-900 text-green-100 rounded-lg hover:from-green-600 hover:to-green-800 transition-all cursor-pointer"
                      >
                        Begin Practice ⚡
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Practice phase
  if (phase === 'practice') {
    // Special handling for Potions class - show brewing interface
    if (classType === 'potions') {
      return (
        <div className="relative h-full w-full overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09] via-[#1a1410] to-[#0d0b09]" />

          {/* Potion brewing interface */}
          <div className="relative z-10 h-full">
            <PotionBrewing
              learnedPotions={learnedPotions}
              onLearnPotion={onLearnPotion}
              onPracticePotion={(potionId) => {
                // Update practice for the potion
                const potion = learnedPotions.find(p => p.id === potionId)
                if (potion) {
                  onLearnPotion({
                    ...potion,
                    brewPractice: Math.min(100, (potion.brewPractice || 0) + 5),
                  })
                }
              }}
              onClose={() => setPhase('complete')}
            />
          </div>
        </div>
      )
    }

    // Standard spell practice for other classes
    return (
      <div className="relative h-full w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09] via-[#1a1410] to-[#0d0b09]" />

        <div className="relative z-10 h-full flex flex-col p-4 pb-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-cinzel text-amber-100 text-xl">Practice Session</h2>
              <p className="font-crimson text-amber-400/60 text-sm">{classInfo.name}</p>
            </div>
            <button
              onClick={() => setPhase('complete')}
              className="px-4 py-2 font-crimson text-sm bg-amber-900/20 text-amber-300 rounded-lg hover:bg-amber-900/30 transition-all cursor-pointer"
            >
              End Session
            </button>
          </div>

          <div className="flex-1 flex gap-4">
            {/* Spell selection */}
            <div className="w-64 bg-black/60 backdrop-blur-sm rounded-lg border border-amber-900/40 p-4">
              <h3 className="font-cinzel text-amber-100 text-sm mb-3">Select Spell to Practice</h3>
              
              <div className="space-y-2">
                {practiceSpells.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="font-crimson text-amber-200/40 text-sm italic">
                      No spells learned yet. Complete the lecture to learn your first spell!
                    </p>
                  </div>
                ) : (
                  practiceSpells.map(spell => (
                    <button
                      key={spell.id}
                      onClick={() => {
                        setPracticeSpell(spell)
                        setCastingProgress(0)
                        setCastResult(null)
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        practiceSpell?.id === spell.id
                          ? 'bg-amber-900/40 border-amber-600/50'
                          : 'bg-amber-950/20 border-amber-900/20 hover:border-amber-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{spell.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-amber-100 text-sm truncate">{spell.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-amber-400/60">Mastery:</span>
                            <div className="flex-1 h-1 bg-amber-900/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500"
                                style={{ width: `${spell.castingPractice}%` }}
                              />
                            </div>
                            <span className="text-xs text-amber-300">{spell.castingPractice}%</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Learn new spell option */}
              {availableSpells.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-900/30">
                  <h3 className="font-cinzel text-amber-100 text-sm mb-3">Learn New Spell</h3>
                  <div className="space-y-2">
                    {availableSpells.slice(0, 2).map(spell => (
                      <button
                        key={spell.id}
                        onClick={() => {
                          const newSpell: Spell = {
                            ...spell,
                            learnedAt: Date.now(),
                            castingPractice: 0,
                          }
                          onLearnSpell(newSpell)
                          setPracticeSpell(newSpell)
                        }}
                        className="w-full text-left p-3 rounded-lg border border-green-800/30 bg-green-950/20 hover:bg-green-950/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{spell.icon}</span>
                          <div>
                            <p className="font-cinzel text-green-100 text-sm">{spell.name}</p>
                            <p className="font-crimson text-green-300/60 text-xs">Click to learn</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Practice area */}
            <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-lg border border-amber-900/40 p-6 flex flex-col items-center justify-center">
              {practiceSpell ? (
                <div className="text-center">
                  {/* Spell icon */}
                  <div className="mb-6">
                    <span className="text-8xl block mb-4">{practiceSpell.icon}</span>
                    <h3 className="font-cinzel text-amber-100 text-2xl mb-2">{practiceSpell.name}</h3>
                    <p className="font-great-vibes text-amber-300 text-xl italic">{practiceSpell.incantation}</p>
                  </div>

                  {/* Casting progress */}
                  {isCasting && (
                    <div className="mb-6 w-64 mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-crimson text-amber-400/60 text-sm">Casting...</span>
                        <span className="font-cinzel text-amber-300 text-sm">{castingProgress}%</span>
                      </div>
                      <div className="h-3 bg-amber-900/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-100"
                          style={{ width: `${castingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Cast result */}
                  {castResult && (
                    <div className={`mb-6 p-4 rounded-lg ${castResult === 'success' ? 'bg-green-900/30 border border-green-700/30' : 'bg-red-900/30 border border-red-700/30'}`}>
                      <p className={`font-cinzel text-lg ${castResult === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                        {castResult === 'success' ? '✨ Spell Cast Successfully!' : '💨 Spell Fizzled...'}
                      </p>
                      <p className={`font-crimson text-sm ${castResult === 'success' ? 'text-green-200/60' : 'text-red-200/60'}`}>
                        {castResult === 'success' 
                          ? 'Your mastery of this spell has increased!'
                          : 'Keep practicing to improve your success rate.'}
                      </p>
                    </div>
                  )}

                  {/* Cast button */}
                  <button
                    onClick={handleCast}
                    disabled={isCasting}
                    className={`px-8 py-4 font-cinzel text-lg tracking-wider rounded-lg transition-all cursor-pointer ${
                      isCasting
                        ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 hover:from-amber-600 hover:to-amber-800 border border-amber-600/30 shadow-lg hover:shadow-amber-900/50'
                    }`}
                  >
                    {isCasting ? 'Casting...' : `Cast ${practiceSpell.name}`}
                  </button>

                  {/* Spell info */}
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-crimson text-amber-400/60 text-xs">Mana Cost</p>
                      <p className="font-cinzel text-amber-200">💎 {practiceSpell.manaCost}</p>
                    </div>
                    <div>
                      <p className="font-crimson text-amber-400/60 text-xs">Cast Time</p>
                      <p className="font-cinzel text-amber-200">{practiceSpell.castTime}</p>
                    </div>
                    <div>
                      <p className="font-crimson text-amber-400/60 text-xs">Mastery</p>
                      <p className="font-cinzel text-amber-200">{practiceSpell.castingPractice}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-6xl block mb-4 opacity-50">🪄</span>
                  <p className="font-crimson text-amber-200/50 text-lg">Select a spell to practice</p>
                  <p className="font-crimson text-amber-400/40 text-sm italic mt-2">
                    Or learn a new spell from the list on the left
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Complete phase
  if (phase === 'complete') {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b09] via-[#1a1410] to-[#0d0b09]" />

        <div className="relative z-10 h-full flex items-center justify-center p-4 pb-16">
          <div className={`max-w-lg w-full transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg border border-amber-900/40 p-8 text-center">
              <span className="text-6xl block mb-4">✨</span>
              <h2 className="font-cinzel text-amber-100 text-2xl mb-2">Class Complete!</h2>
              <p className="font-crimson text-amber-200/70 text-base mb-6">
                You&apos;ve completed today&apos;s {classInfo.name} session with {classInfo.professor}.
              </p>

              <div className="bg-amber-950/30 rounded-lg p-4 mb-6">
                <p className="font-crimson text-amber-200/60 text-sm">
                  <span className="text-amber-400">Spells Known:</span> {learnedSpells.length}
                </p>
              </div>

              <button
                onClick={onLeave}
                className="w-full py-4 px-8 font-cinzel text-lg tracking-wider bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 rounded-lg border border-amber-600/30 hover:from-amber-600 hover:to-amber-800 shadow-lg transition-all cursor-pointer"
              >
                Return to Academy
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ============================================
// LECTURE CONTENT GENERATOR
// ============================================

function getLectureContent(classType: ClassType, playerName: string, professorName: string) {
  const lectures: Record<ClassType, LectureItem[]> = {
    elemental: [
      {
        type: 'dialogue',
        text: `Welcome, ${playerName}, to Elemental Theory. The four elements—fire, water, earth, and air—are the building blocks of all magical phenomena. Understanding them is fundamental to your education here at Arcana Mystica.`
      },
      {
        type: 'dialogue',
        text: 'Elemental magic is about more than just summoning flames or calling forth water. It is about understanding the nature of matter itself, and how magical energy can influence it.'
      },
      {
        type: 'demonstration',
        spellIcon: '💡',
        spellName: 'Lumos',
        incantation: 'LUM-os',
        description: 'Let us begin with the simplest of elemental manipulations—creating light. By channeling a small amount of magical energy through your wand, you can ignite the air itself into a sustained glow.',
        effects: ['Creates a soft white light', 'Illuminates a 15ft radius', 'Lasts for 1 hour']
      },
      {
        type: 'dialogue',
        text: 'Notice how the spell requires almost no mana. This is because you are not creating something from nothing—you are simply exciting the ambient magical particles in the air. This is the foundation of efficient spellcraft.'
      },
      {
        type: 'demonstration',
        spellIcon: '🔥',
        spellName: 'Incendio',
        incantation: 'in-SEN-dee-oh',
        description: 'Now, a more practical application. By concentrating your will and speaking the incantation with conviction, you can produce a jet of flame. The key is visualization—see the fire in your mind before you call it forth.',
        effects: ['Creates a jet of flame', 'Ignites flammable objects', 'Deals fire damage']
      },
      {
        type: 'dialogue',
        text: 'Remember, young mage, the element you call forth is not your servant—it is your partner. Treat it with respect, and it will serve you well. Disrespect it, and it may consume you. Now, let us proceed to practical exercises.'
      }
    ],
    potions: [
      {
        type: 'dialogue',
        text: `Welcome to Potions, ${playerName}. Here we learn the subtle art of combining magical ingredients to create effects that spells alone cannot achieve. A well-brewed potion can save lives—or end them.`
      },
      {
        type: 'dialogue',
        text: 'Potion brewing requires patience, precision, and an understanding of how magical properties interact. One wrong ingredient, one moment of inattention, and you may find yourself with a smoking ruin—or worse.'
      },
      {
        type: 'dialogue',
        text: 'Today we will learn the fundamentals of potion preparation. The cauldron must be clean and properly heated. Ingredients must be prepared in the correct order. And most importantly, the timing must be exact.'
      },
      {
        type: 'demonstration',
        spellIcon: '🧪',
        spellName: 'Healing Potion',
        incantation: '(No incantation - careful brewing required)',
        description: 'A fundamental potion every healer must master. The unicorn hair must be added when the cauldron reaches a simmer—not boiling—and stirred precisely seven times deosil (sunwise).',
        effects: ['Restores minor health', 'Cures minor wounds', 'Shelf life: 1 month']
      },
      {
        type: 'dialogue',
        text: 'The color will shift from clear to deep crimson when the potion is properly brewed. If it turns orange, you\'ve stirred too quickly. If it turns pink, the cauldron was too hot. Practice until you achieve consistency.'
      }
    ],
    divination: [
      {
        type: 'dialogue',
        text: `${playerName}, welcome to Astral Navigation. Here we learn to peer beyond the veil of time and space—to glimpse what has been, what is, and what may yet come to pass.`
      },
      {
        type: 'dialogue',
        text: 'Divination is perhaps the most misunderstood of the magical arts. It is not about predicting the future with certainty—the future is a river with many branching streams. Rather, it is about perceiving possibilities.'
      },
      {
        type: 'dialogue',
        text: 'The stars do not compel—they suggest. The cards do not command—they advise. A skilled diviner learns to interpret signs and symbols, helping others navigate the uncertain waters of fate.'
      },
      {
        type: 'demonstration',
        spellIcon: '🔮',
        spellName: 'Scrying',
        incantation: 'REH-veh-loh',
        description: 'By focusing your mind on a reflective surface—a crystal ball, a pool of water, even a polished mirror—you can extend your perception beyond your physical location.',
        effects: ['See distant locations', 'Perceive magical auras', 'Requires deep concentration']
      }
    ],
    transmutation: [
      {
        type: 'dialogue',
        text: `Welcome, ${playerName}, to Transmutation. Here you will learn to change one thing into another—to transform the very nature of matter through the application of magical will.`
      },
      {
        type: 'dialogue',
        text: 'Transmutation is based on a fundamental principle: all things are, at their core, magical energy given form. By understanding the true nature of a thing, you can change that nature into something else.'
      },
      {
        type: 'demonstration',
        spellIcon: '🪶',
        spellName: 'Wingardium Leviosa',
        incantation: 'win-GAR-dee-um leh-vee-OH-sa',
        description: 'The levitation charm alters the relationship between an object and gravity. The key is the swish-and-flick wand movement combined with precise pronunciation. Not "LeviOsa"—"Leviosa."',
        effects: ['Levitate objects up to 10 lbs', 'Move objects at walking speed', 'Requires concentration']
      },
      {
        type: 'demonstration',
        spellIcon: '🔧',
        spellName: 'Reparo',
        incantation: 'reh-PAH-roh',
        description: 'One of the most useful charms in daily life. It restores objects to their original state by reversing the entropy that caused the damage. All pieces must be present for it to work fully.',
        effects: ['Repairs broken objects', 'Restores original appearance', 'Cannot fix magical damage']
      }
    ],
    enchantment: [
      {
        type: 'dialogue',
        text: `${playerName}, welcome to Enchantments. Here we explore the fascinating field of imbuing objects with magical properties and, more delicately, influencing the minds of others.`
      },
      {
        type: 'dialogue',
        text: 'Enchantment magic walks a fine ethical line. A charm to make someone like you may seem harmless, but it violates their fundamental autonomy. We will discuss these ethical considerations throughout your studies.'
      },
      {
        type: 'demonstration',
        spellIcon: '💫',
        spellName: 'Stupefy',
        incantation: 'STOO-puh-fy',
        description: 'The stunning spell temporarily overwhelms the target\'s consciousness, rendering them unconscious. It is a defensive spell, not an offensive one, used to subdue without causing lasting harm.',
        effects: ['Target falls unconscious', 'Can be awakened by shaking', 'Red bolt of light']
      }
    ],
    abjuration: [
      {
        type: 'dialogue',
        text: `${playerName}, welcome to Defense Arts. In this class, you will learn to protect yourself and others from magical and physical threats. These skills may one day save your life.`
      },
      {
        type: 'dialogue',
        text: 'The best defense is often to avoid danger entirely. But when conflict is unavoidable, abjuration magic provides essential tools for survival. A well-cast shield can mean the difference between life and death.'
      },
      {
        type: 'demonstration',
        spellIcon: '🛡️',
        spellName: 'Protego',
        incantation: 'pro-TAY-go',
        description: 'The shield charm creates a magical barrier that deflects incoming spells and projectiles. The key is to visualize a wall of force extending from your wand, not just a flat plane.',
        effects: ['Blocks minor spells', 'Deflects physical projectiles', 'Visible as silvery shimmer']
      },
      {
        type: 'demonstration',
        spellIcon: '⚔️',
        spellName: 'Expelliarmus',
        incantation: 'ex-pel-ee-AR-mus',
        description: 'The disarming charm forces an opponent to release whatever they are holding. It is a staple of formal dueling and one of the most practical defensive spells you will learn.',
        effects: ['Forces target to drop item', 'Can redirect item to you', 'Works on wands and weapons']
      }
    ],
    conjuration: [
      {
        type: 'dialogue',
        text: `${playerName}, welcome to Summoning I. Conjuration is the art of calling forth objects and creatures from elsewhere—transportation across space, and occasionally, across planes of existence.`
      },
      {
        type: 'dialogue',
        text: 'Conjuration is not creation. You are not making something from nothing. You are reaching across space to bring something that already exists to you. This distinction is important both philosophically and practically.'
      },
      {
        type: 'demonstration',
        spellIcon: '✋',
        spellName: 'Accio',
        incantation: 'AH-see-oh',
        description: 'The summoning charm calls an object to your hand. You must have a clear mental image of the object and know its general location. It cannot summon living creatures or objects held by others.',
        effects: ['Summons one unattended object', 'Object must be visible or known', 'Cannot summon living creatures']
      }
    ]
  }

  return lectures[classType]
}

interface LectureItem {
  type: 'dialogue' | 'demonstration'
  text?: string
  spellIcon?: string
  spellName?: string
  incantation?: string
  description?: string
  effects?: string[]
}
