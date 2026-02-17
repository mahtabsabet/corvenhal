// ============================================
// SPELL AND ABILITY SYSTEM
// ============================================

export type SpellSchool = 
  | 'elemental'    // Fire, Water, Earth, Air
  | 'divination'   // Seeing, predicting, scrying
  | 'transmutation' // Transforming, changing
  | 'conjuration'  // Summoning, creating
  | 'enchantment'  // Mind affecting, charming
  | 'abjuration'   // Protection, wards
  | 'necromancy'   // Death magic (restricted)
  | 'potion'       // Potion recipes
  | 'ritual'       // Complex ceremonial magic

export type SpellTier = 'cantrip' | 'novice' | 'apprentice' | 'adept' | 'master' | 'archmage'

export interface Spell {
  id: string
  name: string
  incantation: string // The words to speak
  description: string
  school: SpellSchool
  tier: SpellTier
  icon: string
  manaCost: number
  castTime: string // e.g., "Instant", "1 round", "10 minutes"
  range: string
  duration: string
  requirements?: string[] // Items or conditions needed
  effects: string[]
  lore?: string // Background lore
  learnedAt?: number // Timestamp when learned
  castingPractice: number // 0-100, how well practiced
  isFavorite?: boolean // Quick access toolbar
}

export interface PotionRecipe {
  id: string
  name: string
  description: string
  icon: string
  tier: SpellTier
  brewTime: string
  ingredients: {
    itemId: string
    itemName: string
    quantity: number
  }[]
  effects: string[]
  duration: string
  learnedAt?: number
  brewPractice: number // 0-100
}

// ============================================
// SPELL LIBRARY - All available spells
// ============================================

export const SPELL_LIBRARY: Spell[] = [
  // === CANTRIPS (Basic spells everyone learns) ===
  {
    id: 'starlight-orb',
    name: 'Starlight Orb',
    incantation: 'AETH-el-LOOM',
    description: 'Creates a small sphere of soft starlight at the tip of your wand.',
    school: 'elemental',
    tier: 'cantrip',
    icon: '✨',
    manaCost: 1,
    castTime: 'Instant',
    range: 'Touch',
    duration: '1 hour',
    effects: ['Creates a soft silver-white light', 'Can illuminate a 15ft radius', 'Dismissible at will'],
    lore: 'One of the oldest spells known to magekind, developed by ancient astronomers who needed gentle light to read star charts without ruining their night vision.',
    castingPractice: 0,
  },
  {
    id: 'shadow-veil',
    name: 'Shadow Veil',
    incantation: 'NOX-ee-UM',
    description: 'Extinguishes magical light sources you have created.',
    school: 'elemental',
    tier: 'cantrip',
    icon: '🌙',
    manaCost: 0,
    castTime: 'Instant',
    range: '30 feet',
    duration: 'Instant',
    effects: ['Extinguishes your Starlight Orb', 'Can dim other light sources you control'],
    lore: 'The counter to Starlight Orb, created by a student who needed darkness to sneak to the kitchen for midnight snacks.',
    castingPractice: 0,
  },
  {
    id: 'arcane-fetch',
    name: 'Arcane Fetch',
    incantation: 'VEER-ah-KOH-nee',
    description: 'Summons an object to your hand from a distance.',
    school: 'conjuration',
    tier: 'cantrip',
    icon: '✋',
    manaCost: 2,
    castTime: 'Instant',
    range: '30 feet',
    duration: 'Instant',
    effects: ['Summons one unattended object', 'Object must be visible or known location', 'Cannot summon living creatures'],
    requirements: ['Clear path to object'],
    lore: 'Invented by a lazy wizard who didn\'t want to get up from his chair to fetch his tea. Now essential for every mage.',
    castingPractice: 0,
  },
  {
    id: 'aether-float',
    name: 'Aether Float',
    incantation: 'SOO-spen-DER-ah',
    description: 'Levitates and moves objects through the air.',
    school: 'transmutation',
    tier: 'cantrip',
    icon: '🪶',
    manaCost: 2,
    castTime: '1 action',
    range: '30 feet',
    duration: 'Concentration, up to 1 minute',
    effects: ['Levitate object up to 10 pounds', 'Move object at walking speed', 'Must maintain concentration'],
    requirements: ['Wand movement: Gentle upward arc'],
    lore: 'A fundamental spell for any young mage. Practice makes perfect - many students accidentally launch their practice feathers across the room.',
    castingPractice: 0,
  },

  // === NOVICE SPELLS (First year) ===
  {
    id: 'flame-jet',
    name: 'Flame Jet',
    incantation: 'PY-ros-VEEN',
    description: 'Creates a jet of flame from your wand.',
    school: 'elemental',
    tier: 'novice',
    icon: '🔥',
    manaCost: 3,
    castTime: '1 action',
    range: '30 feet',
    duration: 'Instant',
    effects: ['Creates a flame jet', 'Ignites flammable objects', 'Deals fire damage'],
    requirements: ['Fire-resistant gloves recommended'],
    lore: 'A fundamental elemental spell taught in the first year. Students practice over water buckets for safety.',
    castingPractice: 0,
  },
  {
    id: 'water-stream',
    name: 'Water Stream',
    incantation: 'A-quah-FLOW',
    description: 'Produces a jet of clear water from your wand.',
    school: 'elemental',
    tier: 'novice',
    icon: '💧',
    manaCost: 2,
    castTime: '1 action',
    range: '30 feet',
    duration: 'Concentration, up to 1 minute',
    effects: ['Produces clean water', 'Extinguishes small fires', 'Can fill containers'],
    lore: 'Essential for desert travelers and those who forget to hydrate during long study sessions.',
    castingPractice: 0,
  },
  {
    id: 'mending-weave',
    name: 'Mending Weave',
    incantation: 'REH-pah-RAH-toe',
    description: 'Repairs broken objects to their original state.',
    school: 'transmutation',
    tier: 'novice',
    icon: '🔧',
    manaCost: 3,
    castTime: '1 minute',
    range: 'Touch',
    duration: 'Permanent',
    effects: ['Repairs broken non-magical objects', 'Restores original appearance', 'Cannot repair complex mechanisms'],
    requirements: ['All pieces must be present'],
    lore: 'A favorite of clumsy students everywhere. Does not work on broken hearts or failed exams.',
    castingPractice: 0,
  },

  // === APPRENTICE SPELLS (Second year) ===
  {
    id: 'force-blast',
    name: 'Force Blast',
    incantation: 'PUL-sah-REE',
    description: 'Disarms an opponent by forcing them to drop what they hold.',
    school: 'abjuration',
    tier: 'apprentice',
    icon: '⚔️',
    manaCost: 4,
    castTime: '1 action',
    range: '60 feet',
    duration: 'Instant',
    effects: ['Forces target to drop held item', 'Can redirect the item to you', 'Works on wands and weapons'],
    lore: 'The signature spell of many famous duelists. Simple yet devastatingly effective in the right hands.',
    castingPractice: 0,
  },
  {
    id: 'ward-shield',
    name: 'Ward Shield',
    incantation: 'PROH-teh-GAH',
    description: 'Creates a magical barrier that deflects physical and magical attacks.',
    school: 'abjuration',
    tier: 'apprentice',
    icon: '🛡️',
    manaCost: 4,
    castTime: '1 reaction',
    range: 'Self',
    duration: '1 round',
    effects: ['Blocks minor spells', 'Deflects physical projectiles', 'Visible as a silvery shimmer'],
    lore: 'The foundation of all defensive magic. Students practice forming the shield before learning to move while casting it.',
    castingPractice: 0,
  },
  {
    id: 'dream-weave',
    name: 'Dream Weave',
    incantation: 'SOM-nee-AH-toe',
    description: 'Stuns the target, rendering them unconscious.',
    school: 'enchantment',
    tier: 'apprentice',
    icon: '💫',
    manaCost: 5,
    castTime: '1 action',
    range: '60 feet',
    duration: '1 minute',
    effects: ['Target falls unconscious', 'Can be awakened by shaking', 'Blue-white bolt of light'],
    lore: 'A combat staple developed by medieval peacekeepers who needed a non-lethal way to subdue magical criminals.',
    castingPractice: 0,
  },

  // === ADEPT SPELLS (Third year) ===
  {
    id: 'spirit-guardian',
    name: 'Spirit Guardian',
    incantation: 'AH-nee-mah PROH-teh-geh',
    description: 'Conjures a spirit guardian that protects against dark creatures.',
    school: 'conjuration',
    tier: 'adept',
    icon: '🦌',
    manaCost: 10,
    castTime: '1 action',
    range: '60 feet',
    duration: 'Concentration, up to 10 minutes',
    effects: ['Creates a spirit guardian', 'Drives away shadow creatures', 'Form reflects caster\'s inner self'],
    requirements: ['Strong emotional focus', 'Clear mental image'],
    lore: 'One of the most powerful defensive charms known. The form of the guardian is unique to each caster, often appearing as an animal with personal significance.',
    castingPractice: 0,
  },
  {
    id: 'phase-step',
    name: 'Phase Step',
    incantation: '(Silent - visualization required)',
    description: 'Teleports the caster instantly to a known location.',
    school: 'transmutation',
    tier: 'adept',
    icon: '⚡',
    manaCost: 8,
    castTime: '1 action',
    range: 'Special (any known location)',
    duration: 'Instant',
    effects: ['Instant transportation', 'Must know destination clearly', 'Risk of partial materialization if distracted'],
    requirements: ['License required', 'Clear visualization of destination'],
    lore: 'Also called "phasing." Improper teleportation can result in partial materialization - a painful condition healers call "ghost-walking."',
    castingPractice: 0,
  },

  // === MASTER SPELLS (Advanced) ===
  {
    id: 'void-strike',
    name: 'Void Strike',
    incantation: 'MOOR-tah-LISS',
    description: 'FORBIDDEN - Tears a hole in reality, consuming the target.',
    school: 'necromancy',
    tier: 'master',
    icon: '☠️',
    manaCost: 50,
    castTime: '1 action',
    range: '60 feet',
    duration: 'Instant',
    effects: ['Instant death on hit', 'Nearly unblockable', 'Dark violet bolt of light'],
    requirements: ['Intent to harm', 'Forbidden knowledge'],
    lore: 'One of the Five Void Arts, forbidden by the Council of Archmages. Use results in permanent exile from the magical community.',
    castingPractice: 0,
  },
]

// ============================================
// POTION RECIPES
// ============================================

export const POTION_LIBRARY: PotionRecipe[] = [
  {
    id: 'healing-potion',
    name: 'Healing Salve',
    description: 'A soothing balm that accelerates natural healing.',
    icon: '🧪',
    tier: 'novice',
    brewTime: '2 hours',
    ingredients: [
      { itemId: 'moonpetals', itemName: 'Moonpetals', quantity: 3 },
      { itemId: 'crystal-phials', itemName: 'Crystal Phial', quantity: 1 },
    ],
    effects: ['Restores minor health', 'Cures minor wounds'],
    duration: 'Instant',
    brewPractice: 0,
  },
  {
    id: 'form-shift-potion',
    name: 'Form-Shift Elixir',
    description: 'Allows the drinker to assume the physical appearance of another person.',
    icon: '🧪',
    tier: 'adept',
    brewTime: '3 weeks',
    ingredients: [
      { itemId: 'fluxroot', itemName: 'Fluxroot', quantity: 3 },
      { itemId: 'shadowmoss', itemName: 'Shadowmoss', quantity: 2 },
      { itemId: 'essence-drop', itemName: 'Essence of Target', quantity: 1 },
    ],
    effects: ['Transform appearance for 1 hour', 'Exact physical copy', 'Does not grant memories or abilities'],
    duration: '1 hour',
    brewPractice: 0,
  },
  {
    id: 'truth-serum',
    name: 'Veracity Serum',
    description: 'A powerful serum that compels the drinker to speak only truth.',
    icon: '🧪',
    tier: 'master',
    brewTime: '27 days',
    ingredients: [
      { itemId: 'moonseed', itemName: 'Moonseed', quantity: 7 },
      { itemId: 'starlight-essence', itemName: 'Starlight Essence', quantity: 1 },
      { itemId: 'serpent-venom', itemName: 'Serpent Venom', quantity: 3 },
    ],
    effects: ['Forces truth-telling', 'Cannot resist', 'Lasts until antidote given'],
    duration: 'Until antidote',
    brewPractice: 0,
  },
]

// ============================================
// SPELL CATEGORIES FOR UI
// ============================================

export const SPELL_SCHOOLS_INFO: Record<SpellSchool, { name: string; description: string; icon: string; color: string }> = {
  elemental: {
    name: 'Elemental Magic',
    description: 'Control over fire, water, earth, and air',
    icon: '🔥',
    color: 'from-orange-600 to-red-700',
  },
  divination: {
    name: 'Divination',
    description: 'Peering into the future and far places',
    icon: '🔮',
    color: 'from-purple-600 to-indigo-700',
  },
  transmutation: {
    name: 'Transmutation',
    description: 'Transforming and changing matter',
    icon: '🌀',
    color: 'from-teal-600 to-cyan-700',
  },
  conjuration: {
    name: 'Conjuration',
    description: 'Summoning objects and creatures',
    icon: '✨',
    color: 'from-amber-600 to-yellow-700',
  },
  enchantment: {
    name: 'Enchantment',
    description: 'Affecting minds and emotions',
    icon: '💜',
    color: 'from-pink-600 to-rose-700',
  },
  abjuration: {
    name: 'Abjuration',
    description: 'Protective wards and defenses',
    icon: '🛡️',
    color: 'from-blue-600 to-sky-700',
  },
  necromancy: {
    name: 'Necromancy',
    description: 'Death magic - RESTRICTED',
    icon: '💀',
    color: 'from-gray-600 to-slate-800',
  },
  potion: {
    name: 'Potion Brewing',
    description: 'Magical concoctions and elixirs',
    icon: '⚗️',
    color: 'from-green-600 to-emerald-700',
  },
  ritual: {
    name: 'Ritual Magic',
    description: 'Complex ceremonial spellwork',
    icon: '📿',
    color: 'from-violet-600 to-purple-700',
  },
}

export const TIER_INFO: Record<SpellTier, { name: string; description: string; color: string }> = {
  cantrip: {
    name: 'Cantrip',
    description: 'Basic spells every mage knows',
    color: 'text-gray-300',
  },
  novice: {
    name: 'Novice',
    description: 'First-year spells',
    color: 'text-green-400',
  },
  apprentice: {
    name: 'Apprentice',
    description: 'Second-year spells',
    color: 'text-blue-400',
  },
  adept: {
    name: 'Adept',
    description: 'Third-year spells',
    color: 'text-purple-400',
  },
  master: {
    name: 'Master',
    description: 'Advanced spells',
    color: 'text-amber-400',
  },
  archmage: {
    name: 'Archmage',
    description: 'Legendary spells',
    color: 'text-red-400',
  },
}

// Helper function to get spells by tier
export function getSpellsByTier(tier: SpellTier): Spell[] {
  return SPELL_LIBRARY.filter(s => s.tier === tier)
}

// Helper function to get spells by school
export function getSpellsBySchool(school: SpellSchool): Spell[] {
  return SPELL_LIBRARY.filter(s => s.school === school)
}

// Helper function to get starting spells
export function getStartingSpells(): Spell[] {
  return SPELL_LIBRARY.filter(s => s.tier === 'cantrip').map(s => ({
    ...s,
    learnedAt: Date.now(),
    castingPractice: 10, // Starting practice
  }))
}
