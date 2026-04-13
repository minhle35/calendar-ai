import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarView } from '@/types'

interface CalendarHeaderProps {
  view: CalendarView
  currentDate: Date
  onViewChange: (v: CalendarView) => void
  onNavigate: (dir: -1 | 0 | 1) => void
  onNewEvent: () => void
}

export function CalendarHeader({ view, currentDate, onViewChange, onNavigate, onNewEvent }: CalendarHeaderProps) {
  const label = getLabel(view, currentDate)

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 shrink-0">
      {/* Left — navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate(0)}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
        <div className="flex items-center">
          <button
            onClick={() => onNavigate(-1)}
            className="rounded-l-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => onNavigate(1)}
            className="rounded-r-md border border-l-0 border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <span className="text-sm font-semibold text-gray-900 min-w-[160px]">{label}</span>
      </div>

      {/* Right — view toggle + new event */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs font-medium">
          {(['week', 'month'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                'px-3 py-1.5 transition-colors capitalize',
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <button
          onClick={onNewEvent}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={13} />
          New event
        </button>
      </div>
    </div>
  )
}

function getLabel(view: CalendarView, date: Date): string {
  if (view === 'month') {
    return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
  }
  // Week view — show "Mar 31 – Apr 6, 2026"
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}
