import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { CalendarView } from '@/components/calendar/CalendarView'
import { api } from '@/api/client'
import type { CalendarResponse, DaySettings } from '@/types'

export function Dashboard() {
  const [calendars, setCalendars]   = useState<CalendarResponse[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [settings, setSettings]     = useState<DaySettings>({ startHour: 6, endHour: 22 })

  useEffect(() => {
    api.calendars.list().then(data => {
      setCalendars(data)
      const def = data.find(c => c.isDefault) ?? data[0]
      if (def) setSelectedId(def.id)
    }).catch(console.error)
  }, [])

  const selectedCalendar = calendars.find(c => c.id === selectedId) ?? null

  const handleCreateCalendar = async () => {
    const name = prompt('Calendar name:')
    if (!name?.trim()) return
    const created = await api.calendars.create({
      name: name.trim(),
      isDefault: false,
      isPublic: false,
    })
    setCalendars(prev => [...prev, created])
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        calendars={calendars}
        selectedCalendarId={selectedId}
        settings={settings}
        onSelectCalendar={setSelectedId}
        onCreateCalendar={handleCreateCalendar}
        onSettingsChange={setSettings}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <CalendarView
          calendar={selectedCalendar}
          calendars={calendars}
          settings={settings}
        />
      </main>
    </div>
  )
}
