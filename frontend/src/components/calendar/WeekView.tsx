import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { getWeekStart } from './CalendarHeader'
import type { DraftEvent, DaySettings, NewEventDefaults } from '@/types'

const HOUR_HEIGHT = 56  // px per hour
const TIME_COL_W  = 52  // px for the time labels column

interface WeekViewProps {
  currentDate: Date
  events: DraftEvent[]
  settings: DaySettings
  onSlotClick: (defaults: NewEventDefaults) => void
  onEventClick: (event: DraftEvent) => void
}

export function WeekView({ currentDate, events, settings, onSlotClick, onEventClick }: WeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const weekStart = getWeekStart(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
  const hours = Array.from(
    { length: settings.endHour - settings.startHour },
    (_, i) => settings.startHour + i
  )
  const totalHeight = hours.length * HOUR_HEIGHT
  const today = new Date()

  function isToday(d: Date) {
    return d.toDateString() === today.toDateString()
  }

  function handleSlotClick(day: Date, hour: number, minute = 0) {
    onSlotClick({ date: day, startHour: hour, startMinute: minute })
  }

  function getEventStyle(event: DraftEvent) {
    const start = event.startTime
    const end   = event.endTime
    const startMins = start.getHours() * 60 + start.getMinutes()
    const endMins   = end.getHours()   * 60 + end.getMinutes()
    const dayStartMins = settings.startHour * 60
    const top    = ((startMins - dayStartMins) / 60) * HOUR_HEIGHT
    const height = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT, 20)
    return { top, height }
  }

  function eventsForDay(day: Date) {
    return events.filter(e => e.startTime.toDateString() === day.toDateString())
  }

  const nowMins  = today.getHours() * 60 + today.getMinutes()
  const nowTop   = ((nowMins - settings.startHour * 60) / 60) * HOUR_HEIGHT
  const showNow  = today >= days[0] && today <= days[6]

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day header row */}
      <div className="flex border-b border-gray-200 bg-white shrink-0" style={{ paddingLeft: TIME_COL_W }}>
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-1 flex-col items-center py-2 text-xs border-l border-gray-100',
              isToday(day) && 'text-blue-600'
            )}
          >
            <span className="font-medium uppercase tracking-wide text-[10px] text-gray-400">
              {day.toLocaleDateString('en-AU', { weekday: 'short' })}
            </span>
            <span className={cn(
              'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
              isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-800'
            )}>
              {day.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: totalHeight }}>

          {/* Time labels */}
          <div className="relative shrink-0" style={{ width: TIME_COL_W }}>
            {hours.map(h => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-gray-400 leading-none"
                style={{ top: (h - settings.startHour) * HOUR_HEIGHT - 6 }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => (
            <div
              key={di}
              className="relative flex-1 border-l border-gray-100"
              style={{ height: totalHeight }}
            >
              {/* Hour lines */}
              {hours.map(h => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-gray-100 cursor-pointer hover:bg-blue-50/40 transition-colors"
                  style={{
                    top: (h - settings.startHour) * HOUR_HEIGHT,
                    height: HOUR_HEIGHT,
                  }}
                  onClick={() => handleSlotClick(day, h, 0)}
                />
              ))}

              {/* Half-hour lines */}
              {hours.map(h => (
                <div
                  key={`half-${h}`}
                  className="absolute inset-x-0 border-t border-gray-50 pointer-events-none"
                  style={{ top: (h - settings.startHour) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                />
              ))}

              {/* Current time indicator */}
              {showNow && isToday(day) && nowTop > 0 && nowTop < totalHeight && (
                <div
                  className="absolute inset-x-0 z-20 flex items-center pointer-events-none"
                  style={{ top: nowTop }}
                >
                  <div className="h-2 w-2 rounded-full bg-red-500 -ml-1" />
                  <div className="h-px flex-1 bg-red-500" />
                </div>
              )}

              {/* Events */}
              {eventsForDay(day).map(event => {
                const { top, height } = getEventStyle(event)
                if (top > totalHeight || top + height < 0) return null
                return (
                  <button
                    key={event.id}
                    onClick={e => { e.stopPropagation(); onEventClick(event) }}
                    className="absolute inset-x-1 z-10 rounded-md px-2 py-1 text-left text-xs shadow-sm overflow-hidden transition-opacity hover:opacity-90"
                    style={{
                      top,
                      height,
                      backgroundColor: event.calendarColor + '33',
                      borderLeft: `3px solid ${event.calendarColor}`,
                      color: event.calendarColor,
                    }}
                  >
                    <p className="font-semibold truncate leading-tight">{event.title}</p>
                    {height > 28 && (
                      <p className="opacity-80 truncate mt-0.5">
                        {formatEventTime(event.startTime)} – {formatEventTime(event.endTime)}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatHour(h: number) {
  if (h === 0)  return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function formatEventTime(d: Date) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
