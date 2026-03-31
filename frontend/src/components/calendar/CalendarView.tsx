import { useEffect, useState } from 'react'
import { Loader2, CalendarDays } from 'lucide-react'
import { api } from '@/api/client'
import { EventCard } from './EventCard'
import type { EventResponse, AttendeeResponse, CalendarResponse, AttendeeStatus } from '@/types'

const TEMP_USER_ID = '018f1a2b-0000-7000-8000-000000000001'

interface CalendarViewProps {
  calendar: CalendarResponse | null
}

export function CalendarView({ calendar }: CalendarViewProps) {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [attendeesMap, setAttendeesMap] = useState<Record<string, AttendeeResponse[]>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!calendar) return
    setLoading(true)
    api.events.list(calendar.id)
      .then(async evts => {
        setEvents(evts)
        const entries = await Promise.all(
          evts.map(async e => {
            const attendees = await api.attendees.list(e.id).catch(() => [])
            return [e.id, attendees] as const
          })
        )
        setAttendeesMap(Object.fromEntries(entries))
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [calendar?.id])

  const handleRsvp = async (eventId: string, status: AttendeeStatus) => {
    try {
      const updated = await api.attendees.rsvp(eventId, status)
      setAttendeesMap(prev => ({
        ...prev,
        [eventId]: prev[eventId]?.map(a =>
          a.userId === TEMP_USER_ID ? { ...a, responseStatus: status } : a
        ) ?? [updated],
      }))
    } catch (_) {
      // silently ignore for now — auth not yet implemented
    }
  }

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
      {/* Calendar header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: calendar.color }}
        />
        <div>
          <h2 className="font-semibold text-gray-900">{calendar.name}</h2>
          {calendar.description && (
            <p className="text-xs text-gray-400">{calendar.description}</p>
          )}
        </div>
        {calendar.isPublic && (
          <span className="ml-auto rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
            public
          </span>
        )}
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
            <CalendarDays size={36} strokeWidth={1} />
            <p className="text-sm">No events in this calendar</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                attendees={attendeesMap[event.id] ?? []}
                currentUserId={TEMP_USER_ID}
                onRsvp={handleRsvp}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
