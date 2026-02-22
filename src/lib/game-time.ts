// ============================================
// GAME TIME SYSTEM
// ============================================

export type DayOfWeek = 'Moonday' | 'Tiwsday' | 'Wodansday' | 'Thorsday' | 'Friggasday' | 'Saturnsday' | 'Sunday'

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night'

export interface GameTime {
  day: DayOfWeek
  hour: number // 0-23
  minute: number // 0-59
  dayNumber: number // Total days since start
}

// ============================================
// TIME UTILITIES
// ============================================

export const DAYS_IN_ORDER: DayOfWeek[] = ['Moonday', 'Tiwsday', 'Wodansday', 'Thorsday', 'Friggasday', 'Saturnsday', 'Sunday']

export const DAY_ICONS: Record<DayOfWeek, string> = {
  'Moonday': '🌙',
  'Tiwsday': '⚔️',
  'Wodansday': '📖',
  'Thorsday': '⚡',
  'Friggasday': '🌸',
  'Saturnsday': '🪐',
  'Sunday': '☀️',
}

export const TIME_SLOT_HOURS: Record<TimeSlot, { start: number; end: number }> = {
  'morning': { start: 6, end: 12 },
  'afternoon': { start: 12, end: 18 },
  'evening': { start: 18, end: 22 },
  'night': { start: 22, end: 6 },
}

// Actual class start hours within each slot.
// Morning class:   8 AM  – 10 AM
// Afternoon class: 1 PM  –  3 PM
// Evening class:   7 PM  –  9 PM
export const CLASS_START_HOURS: Partial<Record<TimeSlot, number>> = {
  'morning':   8,
  'afternoon': 13,
  'evening':   19,
}

// Get current time slot based on hour
export function getTimeSlot(hour: number): TimeSlot {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

// Format hour to 12-hour time
export function formatHour(hour: number, minute: number = 0): string {
  const h = hour % 12 || 12
  const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM'
  const m = minute.toString().padStart(2, '0')
  return `${h}:${m} ${ampm}`
}

// Format game time for display
export function formatGameTime(time: GameTime): string {
  const dayIcon = DAY_ICONS[time.day]
  const timeStr = formatHour(time.hour, time.minute)
  return `${dayIcon} ${time.day}, ${timeStr}`
}

// Get greeting based on time of day
export function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

// ============================================
// CLASS SCHEDULE
// ============================================

export interface ScheduledClass {
  id: string
  name: string
  icon: string
  day: DayOfWeek
  timeSlot: TimeSlot
}

export const CLASS_SCHEDULE: ScheduledClass[] = [
  // Moonday
  { id: 'elemental', name: 'Elemental Theory', icon: '🔥', day: 'Moonday', timeSlot: 'morning' },
  { id: 'potions', name: 'Potions I', icon: '⚗️', day: 'Moonday', timeSlot: 'afternoon' },
  { id: 'divination', name: 'Astral Navigation', icon: '🔮', day: 'Moonday', timeSlot: 'evening' },
  
  // Tiwsday
  { id: 'transmutation', name: 'Transmutation', icon: '🌀', day: 'Tiwsday', timeSlot: 'morning' },
  { id: 'ancient-runes', name: 'Ancient Runes', icon: 'ᚱ', day: 'Tiwsday', timeSlot: 'afternoon' },
  // Evening is free period
  
  // Wodansday
  { id: 'divination', name: 'Divination', icon: '🔮', day: 'Wodansday', timeSlot: 'morning' },
  { id: 'herbology', name: 'Herbology', icon: '🌿', day: 'Wodansday', timeSlot: 'afternoon' },
  { id: 'abjuration', name: 'Defense Arts', icon: '🛡️', day: 'Wodansday', timeSlot: 'evening' },
  
  // Thorsday
  { id: 'alchemy', name: 'Alchemy Lab', icon: '⚗️', day: 'Thorsday', timeSlot: 'morning' },
  { id: 'enchantment', name: 'Enchantments', icon: '💜', day: 'Thorsday', timeSlot: 'afternoon' },
  { id: 'history', name: 'Magical History', icon: '📜', day: 'Thorsday', timeSlot: 'evening' },
  
  // Friggasday
  { id: 'conjuration', name: 'Summoning I', icon: '✨', day: 'Friggasday', timeSlot: 'morning' },
  { id: 'wand-mastery', name: 'Wand Mastery', icon: '🪄', day: 'Friggasday', timeSlot: 'afternoon' },
  // Evening is study hall
  
  // Saturnsday - Electives and clubs
  { id: 'elective-1', name: 'Elective', icon: '🎨', day: 'Saturnsday', timeSlot: 'morning' },
  { id: 'elective-2', name: 'Elective', icon: '🎭', day: 'Saturnsday', timeSlot: 'afternoon' },
  { id: 'clubs', name: 'Club Activities', icon: '🎪', day: 'Saturnsday', timeSlot: 'evening' },
  
  // Sunday - Rest day
  // No classes
]

// Get class for a specific day and time slot
export function getClassForSlot(day: DayOfWeek, timeSlot: TimeSlot): ScheduledClass | null {
  return CLASS_SCHEDULE.find(c => c.day === day && c.timeSlot === timeSlot) || null
}

// Get current class based on game time
export function getCurrentClass(time: GameTime): ScheduledClass | null {
  const timeSlot = getTimeSlot(time.hour)
  return getClassForSlot(time.day, timeSlot)
}

// Get all classes for a specific day
export function getClassesForDay(day: DayOfWeek): ScheduledClass[] {
  return CLASS_SCHEDULE.filter(c => c.day === day)
}

// Check if a class is available now
export function isClassAvailableNow(classId: string, time: GameTime): boolean {
  const scheduledClass = CLASS_SCHEDULE.find(c => c.id === classId)
  if (!scheduledClass) return false
  
  const currentTimeSlot = getTimeSlot(time.hour)
  return scheduledClass.day === time.day && scheduledClass.timeSlot === currentTimeSlot
}

// Check if it's a rest day
export function isRestDay(day: DayOfWeek): boolean {
  return day === 'Sunday'
}

// Check if current time is during class hours
export function isDuringClassHours(hour: number): boolean {
  const slot = getTimeSlot(hour)
  return slot !== 'night'
}

// ============================================
// TIME ADVANCEMENT
// ============================================

// Advance time by specified hours
export function advanceTime(time: GameTime, hours: number): GameTime {
  let newHour = time.hour + hours
  let newMinute = time.minute
  let newDayNumber = time.dayNumber
  let dayIndex = DAYS_IN_ORDER.indexOf(time.day)

  // Handle hour overflow
  while (newHour >= 24) {
    newHour -= 24
    dayIndex = (dayIndex + 1) % 7
    newDayNumber++
  }

  // Handle hour underflow (shouldn't happen normally)
  while (newHour < 0) {
    newHour += 24
    dayIndex = (dayIndex - 1 + 7) % 7
    newDayNumber--
  }

  return {
    hour: newHour,
    minute: newMinute,
    day: DAYS_IN_ORDER[dayIndex],
    dayNumber: Math.max(1, newDayNumber),
  }
}

// Advance time by specified minutes
export function advanceMinutes(time: GameTime, minutes: number): GameTime {
  let newMinute = time.minute + minutes
  let newHour = time.hour
  let newDayNumber = time.dayNumber
  let dayIndex = DAYS_IN_ORDER.indexOf(time.day)

  // Handle minute overflow
  while (newMinute >= 60) {
    newMinute -= 60
    newHour++
  }

  // Handle hour overflow
  while (newHour >= 24) {
    newHour -= 24
    dayIndex = (dayIndex + 1) % 7
    newDayNumber++
  }

  return {
    hour: newHour,
    minute: newMinute,
    day: DAYS_IN_ORDER[dayIndex],
    dayNumber: Math.max(1, newDayNumber),
  }
}

// Get default starting time (Sunday night before classes start)
export function getDefaultGameTime(): GameTime {
  return {
    day: 'Sunday',
    hour: 22, // 10 PM
    minute: 0,
    dayNumber: 0, // Day 0 - day before term starts
  }
}

// ============================================
// COUNTDOWN TO NEXT CLASS
// ============================================

export interface TimeUntilClass {
  totalMinutes: number
  hours: number
  minutes: number
  isUrgent: boolean // Less than 15 minutes
  classInfo: ScheduledClass
  startTime: GameTime
}

// Calculate time until next class
export function getTimeUntilNextClass(time: GameTime): TimeUntilClass | null {
  const nextClassInfo = getNextClassTime(time)
  if (!nextClassInfo) return null

  const { time: classTime, classInfo } = nextClassInfo

  // Calculate total minutes until class
  let totalMinutes = 0

  if (classTime.day === time.day) {
    // Same day
    totalMinutes = (classTime.hour - time.hour) * 60 - time.minute
  } else {
    // Different day - calculate hours until midnight + hours from midnight to class
    const hoursUntilMidnight = 24 - time.hour
    const hoursFromMidnightToClass = classTime.hour
    totalMinutes = (hoursUntilMidnight + hoursFromMidnightToClass) * 60 - time.minute
  }

  return {
    totalMinutes: Math.max(0, totalMinutes),
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    isUrgent: totalMinutes > 0 && totalMinutes <= 15,
    classInfo,
    startTime: classTime,
  }
}

// Get next class time
export function getNextClassTime(time: GameTime): { time: GameTime; classInfo: ScheduledClass } | null {
  // Check remaining slots today
  const slots: TimeSlot[] = ['morning', 'afternoon', 'evening']
  const currentSlot = getTimeSlot(time.hour)
  const currentSlotIndex = slots.indexOf(currentSlot)

  // If we're in a slot but before the class start hour, the upcoming class IS
  // in the current slot (e.g. 6:30 AM is in 'morning' but Elemental Theory
  // doesn't start until 8 AM — show that class as the next one).
  if (currentSlotIndex >= 0) {
    const classStartHour = CLASS_START_HOURS[currentSlot]
    if (classStartHour !== undefined && time.hour < classStartHour) {
      const slotClass = getClassForSlot(time.day, currentSlot)
      if (slotClass) {
        return {
          time: { day: time.day, hour: classStartHour, minute: 0, dayNumber: time.dayNumber },
          classInfo: slotClass,
        }
      }
    }
  }

  // Check later slots today
  for (let i = currentSlotIndex + 1; i < slots.length; i++) {
    const nextClass = getClassForSlot(time.day, slots[i])
    if (nextClass) {
      const nextHour = CLASS_START_HOURS[slots[i]] ?? TIME_SLOT_HOURS[slots[i]].start
      return {
        time: { day: time.day, hour: nextHour, minute: 0, dayNumber: time.dayNumber },
        classInfo: nextClass,
      }
    }
  }

  // Check next days (up to a week)
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const nextDayIndex = (DAYS_IN_ORDER.indexOf(time.day) + dayOffset) % 7
    const nextDay = DAYS_IN_ORDER[nextDayIndex]

    for (const slot of slots) {
      const nextClass = getClassForSlot(nextDay, slot)
      if (nextClass) {
        return {
          time: {
            day: nextDay,
            hour: CLASS_START_HOURS[slot] ?? TIME_SLOT_HOURS[slot].start,
            minute: 0,
            dayNumber: time.dayNumber + dayOffset,
          },
          classInfo: nextClass,
        }
      }
    }
  }

  return null
}

// Format time until class
export function formatTimeUntilClass(timeUntil: TimeUntilClass | null): string {
  if (!timeUntil) return 'No upcoming classes'

  if (timeUntil.totalMinutes <= 0) {
    return 'Class starting now!'
  }

  if (timeUntil.hours > 0) {
    return `${timeUntil.hours}h ${timeUntil.minutes}m until ${timeUntil.classInfo.name}`
  }

  return `${timeUntil.minutes}m until ${timeUntil.classInfo.name}`
}

// ============================================
// TIME SLOT DISPLAY
// ============================================

export function getTimeSlotName(slot: TimeSlot): string {
  switch (slot) {
    case 'morning': return 'Morning (6AM - 12PM)'
    case 'afternoon': return 'Afternoon (12PM - 6PM)'
    case 'evening': return 'Evening (6PM - 10PM)'
    case 'night': return 'Night (10PM - 6AM)'
  }
}

export function getTimeSlotShort(slot: TimeSlot): string {
  switch (slot) {
    case 'morning': return 'Morning'
    case 'afternoon': return 'Afternoon'
    case 'evening': return 'Evening'
    case 'night': return 'Night'
  }
}
