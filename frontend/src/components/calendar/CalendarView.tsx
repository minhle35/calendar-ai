import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { CalendarHeader } from './CalendarHeader'
import { WeekView } from './WeekView'
import { MonthView } from './MonthView'
import { CreateEventModal } from './CreateEventModal'
import type { CalendarResponse, CalendarView as ViewType, DraftEvent, DaySettings, NewEventDefaults } from '@/types'

interface CalendarViewProps {
  calendar: CalendarResponse | null
  calendars: CalendarResponse[]
  settings: DaySettings
}

let localId = 0
function nextId() { return `local-${++localId}` }

export function CalendarView({ calendar, calendars, settings }: CalendarViewProps) {
  const [view, setView]           = useState<ViewType>('week')
  const [currentDate, setCurrent] = useState(new Date())
  const [events, setEvents]       = useState<DraftEvent[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newEventDefaults, setNewEventDefaults] = useState<NewEventDefaults | null>(null)

  function navigate(dir: -1 | 0 | 1) {
    if (dir === 0) { setCurrent(new Date()); return }
    const d = new Date(currentDate)
    if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setCurrent(d)
  }

  function handleSlotClick(defaults: NewEventDefaults) {
    setNewEventDefaults(defaults)
    setShowModal(true)
  }

  function handleNewEvent() {
    const now = new Date()
    setNewEventDefaults({ date: now, startHour: now.getHours(), startMinute: 0 })
    setShowModal(true)
  }

  function handleSave(draft: Omit<DraftEvent, 'id'>) {
    setEvents(prev => [...prev, { ...draft, id: nextId() }])
    // TODO: persist to backend once EventController is implemented
  }

  function handleEventClick(_event: DraftEvent) {
    // TODO: open event detail / edit modal
  }

  const visibleEvents = calendar
    ? events.filter(e => e.calendarId === calendar.id)
    : events

  if (!calendar) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
        <CalendarDays size={48} strokeWidth={1} />
        <p className="text-sm">Select a calendar from the left panel</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <CalendarHeader
        view={view}
        currentDate={currentDate}
        onViewChange={setView}
        onNavigate={navigate}
        onNewEvent={handleNewEvent}
      />

      {view === 'week' ? (
        <WeekView
          currentDate={currentDate}
          events={visibleEvents}
          settings={settings}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          events={visibleEvents}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
      )}

      <CreateEventModal
        open={showModal}
        defaults={newEventDefaults}
        calendars={calendars}
        selectedCalendarId={calendar?.id ?? null}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
