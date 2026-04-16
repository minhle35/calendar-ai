import { cn } from '@/lib/utils'
import type { DraftEvent, NewEventDefaults } from '@/types'

interface MonthViewProps {
  currentDate: Date
  events: DraftEvent[]
  onSlotClick: (defaults: NewEventDefaults) => void
  onEventClick: (event: DraftEvent) => void
}

export function MonthView({ currentDate, events, onSlotClick, onEventClick }: MonthViewProps) {
  const today = new Date()
  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Build calendar grid — 6 rows × 7 cols
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const cells: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d
  })

  function eventsForDay(day: Date) {
    return events.filter(e => e.startTime.toDateString() === day.toDateString())
  }

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day name header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white shrink-0">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 overflow-hidden">
        {cells.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month
          const isToday = day.toDateString() === today.toDateString()
          const dayEvents = eventsForDay(day)

          return (
            <div
              key={i}
              onClick={() => onSlotClick({ date: day, startHour: 9, startMinute: 0 })}
              className={cn(
                'relative flex flex-col border-b border-r border-gray-100 p-1 cursor-pointer hover:bg-gray-50/60 transition-colors min-h-[90px]',
                !isCurrentMonth && 'bg-gray-50/40'
              )}
            >
              {/* Date number */}
              <div className="flex justify-end mb-1">
                <span className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  isToday         && 'bg-blue-600 text-white',
                  !isToday && isCurrentMonth  && 'text-gray-800',
                  !isToday && !isCurrentMonth && 'text-gray-300'
                )}>
                  {day.getDate()}
                </span>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map(event => (
                  <button
                    key={event.id}
                    onClick={e => { e.stopPropagation(); onEventClick(event) }}
                    className="truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight"
                    style={{
                      backgroundColor: event.calendarColor + '25',
                      color: event.calendarColor,
                      borderLeft: `2px solid ${event.calendarColor}`,
                    }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="pl-1 text-[10px] text-gray-400">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
