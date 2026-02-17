'use client'

import { GameTime, formatHour, getTimeSlot, DAY_ICONS, getTimeSlotShort, getNextClassTime, ScheduledClass } from '@/lib/game-time'

// ============================================
// TIME DISPLAY COMPONENT
// ============================================

interface TimeDisplayProps {
  time: GameTime
  showNextClass?: boolean
  compact?: boolean
}

export function TimeDisplay({ time, showNextClass = true, compact = false }: TimeDisplayProps) {
  const timeSlot = getTimeSlot(time.hour)
  const dayIcon = DAY_ICONS[time.day]
  const nextClass = showNextClass ? getNextClassTime(time) : null

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-amber-200/80">
        <span>{dayIcon}</span>
        <span className="font-crimson text-sm">{time.day}</span>
        <span className="text-amber-400/60">•</span>
        <span className="font-cinzel text-sm">{formatHour(time.hour)}</span>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 rounded-lg p-3 border border-indigo-800/30">
      {/* Main time display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{dayIcon}</span>
          <div>
            <p className="font-cinzel text-amber-100 text-sm">{time.day}</p>
            <p className="font-crimson text-amber-400/60 text-xs">Day {time.dayNumber} of Term</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-cinzel text-amber-200 text-lg">{formatHour(time.hour)}</p>
          <p className="font-crimson text-indigo-300/60 text-xs">{getTimeSlotShort(timeSlot)}</p>
        </div>
      </div>

      {/* Time progress bar */}
      <div className="h-1 bg-indigo-950/50 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${(time.hour / 24) * 100}%` }}
        />
      </div>

      {/* Next class info */}
      {nextClass && showNextClass && (
        <div className="mt-2 pt-2 border-t border-indigo-800/20">
          <p className="font-crimson text-indigo-300/60 text-xs mb-1">Next Class</p>
          <div className="flex items-center gap-2">
            <span>{nextClass.classInfo.icon}</span>
            <span className="font-crimson text-amber-200/80 text-sm">{nextClass.classInfo.name}</span>
            <span className="font-crimson text-indigo-400/60 text-xs ml-auto">
              {nextClass.time.day} {formatHour(nextClass.time.hour)}
            </span>
          </div>
        </div>
      )}

      {!nextClass && showNextClass && (
        <div className="mt-2 pt-2 border-t border-indigo-800/20">
          <p className="font-crimson text-amber-400/60 text-xs italic">No more classes this week</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// MINI TIME DISPLAY (for header/sidebar)
// ============================================

interface MiniTimeDisplayProps {
  time: GameTime
}

export function MiniTimeDisplay({ time }: MiniTimeDisplayProps) {
  const dayIcon = DAY_ICONS[time.day]
  const timeSlot = getTimeSlot(time.hour)

  // Get time-of-day background color
  const getBgColor = () => {
    switch (timeSlot) {
      case 'morning': return 'from-amber-900/30 to-orange-900/20'
      case 'afternoon': return 'from-blue-900/30 to-sky-900/20'
      case 'evening': return 'from-purple-900/30 to-indigo-900/20'
      case 'night': return 'from-slate-900/50 to-indigo-950/30'
    }
  }

  return (
    <div className={`bg-gradient-to-r ${getBgColor()} rounded-lg p-2 border border-amber-900/20`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{dayIcon}</span>
          <span className="font-crimson text-amber-200/80 text-sm">{time.day}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-400/60 text-sm">🕐</span>
          <span className="font-cinzel text-amber-200 text-sm">{formatHour(time.hour)}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CLASS SCHEDULE DISPLAY
// ============================================

interface ClassScheduleProps {
  currentDay: GameTime['day']
  currentHour: number
}

export function ClassSchedule({ currentDay, currentHour }: ClassScheduleProps) {
  const currentTimeSlot = getTimeSlot(currentHour)
  
  return (
    <div className="space-y-1">
      {['morning', 'afternoon', 'evening'].map(slot => {
        const slotInfo = {
          morning: { icon: '🌅', label: 'Morning', hours: '6AM-12PM' },
          afternoon: { icon: '☀️', label: 'Afternoon', hours: '12PM-6PM' },
          evening: { icon: '🌙', label: 'Evening', hours: '6PM-10PM' },
        }[slot]!

        const isCurrentSlot = slot === currentTimeSlot
        
        return (
          <div 
            key={slot}
            className={`flex items-center gap-2 p-2 rounded ${
              isCurrentSlot ? 'bg-amber-900/30 border border-amber-700/30' : 'bg-black/20'
            }`}
          >
            <span className="text-sm">{slotInfo.icon}</span>
            <span className={`font-crimson text-xs ${isCurrentSlot ? 'text-amber-200' : 'text-amber-200/50'}`}>
              {slotInfo.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
