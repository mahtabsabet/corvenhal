import { describe, it, expect } from 'vitest'
import {
  DAYS_IN_ORDER,
  DAY_ICONS,
  TIME_SLOT_HOURS,
  CLASS_SCHEDULE,
  getTimeSlot,
  formatHour,
  formatGameTime,
  getGreeting,
  advanceTime,
  advanceMinutes,
  getDefaultGameTime,
  getClassForSlot,
  getCurrentClass,
  getClassesForDay,
  isClassAvailableNow,
  isRestDay,
  isDuringClassHours,
  getTimeUntilNextClass,
  formatTimeUntilClass,
  getTimeSlotName,
  getTimeSlotShort,
  type GameTime,
  type DayOfWeek,
  type TimeSlot,
} from '../game-time'

// ============================================
// getTimeSlot
// ============================================

describe('getTimeSlot', () => {
  it('returns morning for hours 6–11', () => {
    for (let h = 6; h < 12; h++) {
      expect(getTimeSlot(h)).toBe('morning')
    }
  })

  it('returns afternoon for hours 12–17', () => {
    for (let h = 12; h < 18; h++) {
      expect(getTimeSlot(h)).toBe('afternoon')
    }
  })

  it('returns evening for hours 18–21', () => {
    for (let h = 18; h < 22; h++) {
      expect(getTimeSlot(h)).toBe('evening')
    }
  })

  it('returns night for hours 22–23', () => {
    expect(getTimeSlot(22)).toBe('night')
    expect(getTimeSlot(23)).toBe('night')
  })

  it('returns night for hour 0', () => {
    expect(getTimeSlot(0)).toBe('night')
  })

  it('returns night for hours 1–5', () => {
    for (let h = 1; h <= 5; h++) {
      expect(getTimeSlot(h)).toBe('night')
    }
  })
})

// ============================================
// formatHour
// ============================================

describe('formatHour', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatHour(0)).toBe('12:00 AM')
  })

  it('formats noon as 12:00 PM', () => {
    expect(formatHour(12)).toBe('12:00 PM')
  })

  it('formats 1 AM correctly', () => {
    expect(formatHour(1)).toBe('1:00 AM')
  })

  it('formats 1 PM correctly', () => {
    expect(formatHour(13)).toBe('1:00 PM')
  })

  it('formats 11 PM correctly', () => {
    expect(formatHour(23)).toBe('11:00 PM')
  })

  it('pads single-digit minutes with a leading zero', () => {
    expect(formatHour(9, 5)).toBe('9:05 AM')
  })

  it('formats minutes correctly', () => {
    expect(formatHour(14, 30)).toBe('2:30 PM')
  })

  it('defaults minute to 0 when omitted', () => {
    expect(formatHour(8)).toBe('8:00 AM')
  })
})

// ============================================
// formatGameTime
// ============================================

describe('formatGameTime', () => {
  it('includes the day name', () => {
    const time: GameTime = { day: 'Moonday', hour: 10, minute: 0, dayNumber: 1 }
    expect(formatGameTime(time)).toContain('Moonday')
  })

  it('includes the formatted hour', () => {
    const time: GameTime = { day: 'Moonday', hour: 14, minute: 30, dayNumber: 1 }
    expect(formatGameTime(time)).toContain('2:30 PM')
  })

  it('includes the day icon', () => {
    const time: GameTime = { day: 'Sunday', hour: 8, minute: 0, dayNumber: 7 }
    expect(formatGameTime(time)).toContain(DAY_ICONS['Sunday'])
  })
})

// ============================================
// getGreeting
// ============================================

describe('getGreeting', () => {
  it('returns Good morning for hours 5–11', () => {
    for (let h = 5; h < 12; h++) {
      expect(getGreeting(h)).toBe('Good morning')
    }
  })

  it('returns Good afternoon for hours 12–16', () => {
    for (let h = 12; h < 17; h++) {
      expect(getGreeting(h)).toBe('Good afternoon')
    }
  })

  it('returns Good evening for hours 17–20', () => {
    for (let h = 17; h < 21; h++) {
      expect(getGreeting(h)).toBe('Good evening')
    }
  })

  it('returns Good night for hours 21–23', () => {
    for (let h = 21; h <= 23; h++) {
      expect(getGreeting(h)).toBe('Good night')
    }
  })

  it('returns Good night for hour 0–4', () => {
    for (let h = 0; h < 5; h++) {
      expect(getGreeting(h)).toBe('Good night')
    }
  })
})

// ============================================
// advanceTime
// ============================================

describe('advanceTime', () => {
  const base: GameTime = { day: 'Moonday', hour: 10, minute: 0, dayNumber: 1 }

  it('adds hours within the same day', () => {
    const result = advanceTime(base, 4)
    expect(result.hour).toBe(14)
    expect(result.day).toBe('Moonday')
    expect(result.dayNumber).toBe(1)
  })

  it('rolls over to the next day after 24 hours', () => {
    const result = advanceTime(base, 14)
    expect(result.hour).toBe(0)
    expect(result.day).toBe('Tiwsday')
    expect(result.dayNumber).toBe(2)
  })

  it('wraps day of week from Sunday back to Moonday', () => {
    const sunday: GameTime = { day: 'Sunday', hour: 23, minute: 0, dayNumber: 7 }
    const result = advanceTime(sunday, 2)
    expect(result.day).toBe('Moonday')
  })

  it('advances multiple days at once', () => {
    const result = advanceTime(base, 48)
    expect(result.day).toBe('Wodansday')
    expect(result.dayNumber).toBe(3)
  })

  it('advancing 0 hours leaves time unchanged', () => {
    const result = advanceTime(base, 0)
    expect(result.hour).toBe(base.hour)
    expect(result.day).toBe(base.day)
    expect(result.dayNumber).toBe(base.dayNumber)
  })

  it('preserves minutes', () => {
    const withMinutes: GameTime = { day: 'Moonday', hour: 10, minute: 45, dayNumber: 1 }
    const result = advanceTime(withMinutes, 2)
    expect(result.minute).toBe(45)
  })
})

// ============================================
// advanceMinutes
// ============================================

describe('advanceMinutes', () => {
  const base: GameTime = { day: 'Moonday', hour: 10, minute: 0, dayNumber: 1 }

  it('adds minutes within the same hour', () => {
    const result = advanceMinutes(base, 30)
    expect(result.minute).toBe(30)
    expect(result.hour).toBe(10)
    expect(result.day).toBe('Moonday')
  })

  it('rolls over to the next hour when minutes exceed 60', () => {
    const result = advanceMinutes(base, 75)
    expect(result.minute).toBe(15)
    expect(result.hour).toBe(11)
  })

  it('rolls over to the next day when crossing midnight', () => {
    const late: GameTime = { day: 'Moonday', hour: 23, minute: 50, dayNumber: 1 }
    const result = advanceMinutes(late, 20)
    expect(result.hour).toBe(0)
    expect(result.minute).toBe(10)
    expect(result.day).toBe('Tiwsday')
    expect(result.dayNumber).toBe(2)
  })

  it('advancing 0 minutes leaves time unchanged', () => {
    const result = advanceMinutes(base, 0)
    expect(result.minute).toBe(base.minute)
    expect(result.hour).toBe(base.hour)
  })
})

// ============================================
// getDefaultGameTime
// ============================================

describe('getDefaultGameTime', () => {
  it('starts on Sunday', () => {
    expect(getDefaultGameTime().day).toBe('Sunday')
  })

  it('starts at 22:00', () => {
    const t = getDefaultGameTime()
    expect(t.hour).toBe(22)
    expect(t.minute).toBe(0)
  })

  it('starts at dayNumber 0', () => {
    expect(getDefaultGameTime().dayNumber).toBe(0)
  })
})

// ============================================
// getClassForSlot
// ============================================

describe('getClassForSlot', () => {
  it('returns the elemental class on Moonday morning', () => {
    const result = getClassForSlot('Moonday', 'morning')
    expect(result).not.toBeNull()
    expect(result?.id).toBe('elemental')
  })

  it('returns null for Sunday (rest day)', () => {
    const result = getClassForSlot('Sunday', 'morning')
    expect(result).toBeNull()
  })

  it('returns null for a free slot', () => {
    // Tiwsday evening is a free period
    const result = getClassForSlot('Tiwsday', 'evening')
    expect(result).toBeNull()
  })
})

// ============================================
// getCurrentClass
// ============================================

describe('getCurrentClass', () => {
  it('returns the class for the current day and time slot', () => {
    // Moonday morning (hour 9 → morning slot)
    const time: GameTime = { day: 'Moonday', hour: 9, minute: 0, dayNumber: 1 }
    const result = getCurrentClass(time)
    expect(result).not.toBeNull()
    expect(result?.id).toBe('elemental')
  })

  it('returns null when there is no class for the slot', () => {
    // Sunday has no classes
    const time: GameTime = { day: 'Sunday', hour: 9, minute: 0, dayNumber: 7 }
    expect(getCurrentClass(time)).toBeNull()
  })
})

// ============================================
// getClassesForDay
// ============================================

describe('getClassesForDay', () => {
  it('returns all classes for Moonday (3 expected)', () => {
    const classes = getClassesForDay('Moonday')
    expect(classes.length).toBe(3)
    expect(classes.every(c => c.day === 'Moonday')).toBe(true)
  })

  it('returns an empty array for Sunday (rest day)', () => {
    expect(getClassesForDay('Sunday')).toHaveLength(0)
  })

  it('returns only classes for the given day', () => {
    const days: DayOfWeek[] = DAYS_IN_ORDER
    for (const day of days) {
      const classes = getClassesForDay(day)
      expect(classes.every(c => c.day === day)).toBe(true)
    }
  })
})

// ============================================
// isClassAvailableNow
// ============================================

describe('isClassAvailableNow', () => {
  it('returns true when time matches scheduled class slot', () => {
    // elemental is Moonday morning
    const time: GameTime = { day: 'Moonday', hour: 9, minute: 0, dayNumber: 1 }
    expect(isClassAvailableNow('elemental', time)).toBe(true)
  })

  it('returns false when day does not match', () => {
    const time: GameTime = { day: 'Tiwsday', hour: 9, minute: 0, dayNumber: 2 }
    expect(isClassAvailableNow('elemental', time)).toBe(false)
  })

  it('returns false when time slot does not match', () => {
    // elemental is morning; check afternoon on same day
    const time: GameTime = { day: 'Moonday', hour: 14, minute: 0, dayNumber: 1 }
    expect(isClassAvailableNow('elemental', time)).toBe(false)
  })

  it('returns false for an unknown class ID', () => {
    const time: GameTime = { day: 'Moonday', hour: 9, minute: 0, dayNumber: 1 }
    expect(isClassAvailableNow('nonexistent-class', time)).toBe(false)
  })
})

// ============================================
// isRestDay
// ============================================

describe('isRestDay', () => {
  it('returns true for Sunday', () => {
    expect(isRestDay('Sunday')).toBe(true)
  })

  it('returns false for all other days', () => {
    const nonRestDays: DayOfWeek[] = ['Moonday', 'Tiwsday', 'Wodansday', 'Thorsday', 'Friggasday', 'Saturnsday']
    for (const day of nonRestDays) {
      expect(isRestDay(day)).toBe(false)
    }
  })
})

// ============================================
// isDuringClassHours
// ============================================

describe('isDuringClassHours', () => {
  it('returns true for morning hours', () => {
    expect(isDuringClassHours(8)).toBe(true)
  })

  it('returns true for afternoon hours', () => {
    expect(isDuringClassHours(14)).toBe(true)
  })

  it('returns true for evening hours', () => {
    expect(isDuringClassHours(19)).toBe(true)
  })

  it('returns false for night hours', () => {
    expect(isDuringClassHours(23)).toBe(false)
    expect(isDuringClassHours(0)).toBe(false)
    expect(isDuringClassHours(3)).toBe(false)
  })
})

// ============================================
// formatTimeUntilClass
// ============================================

describe('formatTimeUntilClass', () => {
  it('returns a fallback message when null is passed', () => {
    expect(formatTimeUntilClass(null)).toBe('No upcoming classes')
  })

  it('returns "Class starting now!" when totalMinutes is 0', () => {
    const mockTimeUntil = {
      totalMinutes: 0,
      hours: 0,
      minutes: 0,
      isUrgent: false,
      classInfo: CLASS_SCHEDULE[0],
      startTime: getDefaultGameTime(),
    }
    expect(formatTimeUntilClass(mockTimeUntil)).toBe('Class starting now!')
  })

  it('includes class name in the countdown string', () => {
    const mockTimeUntil = {
      totalMinutes: 90,
      hours: 1,
      minutes: 30,
      isUrgent: false,
      classInfo: CLASS_SCHEDULE[0],
      startTime: getDefaultGameTime(),
    }
    const result = formatTimeUntilClass(mockTimeUntil)
    expect(result).toContain(CLASS_SCHEDULE[0].name)
    expect(result).toContain('1h')
    expect(result).toContain('30m')
  })

  it('omits hours when only minutes remain', () => {
    const mockTimeUntil = {
      totalMinutes: 10,
      hours: 0,
      minutes: 10,
      isUrgent: true,
      classInfo: CLASS_SCHEDULE[0],
      startTime: getDefaultGameTime(),
    }
    const result = formatTimeUntilClass(mockTimeUntil)
    expect(result).not.toContain('0h')
    expect(result).toContain('10m')
  })
})

// ============================================
// getTimeUntilNextClass
// ============================================

describe('getTimeUntilNextClass', () => {
  it('returns a non-null result when there is a next class', () => {
    // Night on Sunday - next class is Moonday morning
    const time: GameTime = { day: 'Sunday', hour: 22, minute: 0, dayNumber: 0 }
    const result = getTimeUntilNextClass(time)
    expect(result).not.toBeNull()
  })

  it('result totalMinutes is non-negative', () => {
    const time: GameTime = { day: 'Moonday', hour: 7, minute: 0, dayNumber: 1 }
    const result = getTimeUntilNextClass(time)
    expect(result).not.toBeNull()
    expect(result!.totalMinutes).toBeGreaterThanOrEqual(0)
  })

  it('marks the class as urgent when under 15 minutes away', () => {
    // Elemental starts at 8 AM on Moonday; test at 7:50 AM = 10 min away
    const time: GameTime = { day: 'Moonday', hour: 7, minute: 50, dayNumber: 1 }
    const result = getTimeUntilNextClass(time)
    expect(result).not.toBeNull()
    expect(result!.isUrgent).toBe(true)
  })

  it('does not mark the class as urgent when more than 15 minutes away', () => {
    const time: GameTime = { day: 'Moonday', hour: 6, minute: 0, dayNumber: 1 }
    const result = getTimeUntilNextClass(time)
    expect(result).not.toBeNull()
    expect(result!.isUrgent).toBe(false)
  })
})

// ============================================
// getTimeSlotName / getTimeSlotShort
// ============================================

describe('getTimeSlotName', () => {
  it('returns a descriptive string for each slot', () => {
    const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night']
    for (const slot of slots) {
      const name = getTimeSlotName(slot)
      expect(name).toBeTruthy()
      expect(typeof name).toBe('string')
    }
  })
})

describe('getTimeSlotShort', () => {
  it('returns a short label for each slot', () => {
    expect(getTimeSlotShort('morning')).toBe('Morning')
    expect(getTimeSlotShort('afternoon')).toBe('Afternoon')
    expect(getTimeSlotShort('evening')).toBe('Evening')
    expect(getTimeSlotShort('night')).toBe('Night')
  })
})

// ============================================
// DAYS_IN_ORDER / DAY_ICONS / TIME_SLOT_HOURS
// ============================================

describe('DAYS_IN_ORDER', () => {
  it('contains exactly 7 days', () => {
    expect(DAYS_IN_ORDER).toHaveLength(7)
  })

  it('starts with Moonday and ends with Sunday', () => {
    expect(DAYS_IN_ORDER[0]).toBe('Moonday')
    expect(DAYS_IN_ORDER[6]).toBe('Sunday')
  })
})

describe('DAY_ICONS', () => {
  it('has an icon for every day', () => {
    for (const day of DAYS_IN_ORDER) {
      expect(DAY_ICONS[day]).toBeTruthy()
    }
  })
})

describe('TIME_SLOT_HOURS', () => {
  it('has start and end hours for every slot', () => {
    const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night']
    for (const slot of slots) {
      expect(typeof TIME_SLOT_HOURS[slot].start).toBe('number')
      expect(typeof TIME_SLOT_HOURS[slot].end).toBe('number')
    }
  })
})
