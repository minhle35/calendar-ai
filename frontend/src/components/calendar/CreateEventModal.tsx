import * as Dialog from '@radix-ui/react-dialog'
import { X, MapPin, AlignLeft, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { CalendarResponse, DraftEvent, NewEventDefaults } from '@/types'

interface CreateEventModalProps {
  open: boolean
  defaults: NewEventDefaults | null
  calendars: CalendarResponse[]
  selectedCalendarId: string | null
  onSave: (event: Omit<DraftEvent, 'id'>) => void
  onClose: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }
function toTimeStr(h: number, m: number) { return `${pad(h)}:${pad(m)}` }
function fromTimeStr(s: string): [number, number] {
  const [h, m] = s.split(':').map(Number)
  return [h, m]
}

export function CreateEventModal({ open, defaults, calendars, selectedCalendarId, onSave, onClose }: CreateEventModalProps) {
  const [title, setTitle]       = useState('')
  const [date, setDate]         = useState('')
  const [startTime, setStart]   = useState('09:00')
  const [endTime, setEnd]       = useState('10:00')
  const [description, setDesc]  = useState('')
  const [location, setLoc]      = useState('')
  const [calendarId, setCalId]  = useState(selectedCalendarId ?? calendars[0]?.id ?? '')

  // Pre-fill from click defaults
  useEffect(() => {
    if (!defaults) return
    const d = defaults.date
    setDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
    setStart(toTimeStr(defaults.startHour, defaults.startMinute))
    setEnd(toTimeStr(defaults.startHour + 1, defaults.startMinute))
  }, [defaults])

  useEffect(() => {
    if (selectedCalendarId) setCalId(selectedCalendarId)
  }, [selectedCalendarId])

  function handleSave() {
    if (!title.trim() || !date) return
    const [sy, sm, sd] = date.split('-').map(Number)
    const [sh, smin]   = fromTimeStr(startTime)
    const [eh, emin]   = fromTimeStr(endTime)

    const cal = calendars.find(c => c.id === calendarId) ?? calendars[0]

    onSave({
      calendarId: cal.id,
      calendarColor: cal.color,
      title: title.trim(),
      description,
      location,
      startTime: new Date(sy, sm - 1, sd, sh, smin),
      endTime:   new Date(sy, sm - 1, sd, eh, emin),
      status: 'PUBLISHED',
    })

    // Reset
    setTitle(''); setDesc(''); setLoc('')
    onClose()
  }

  const selectedCal = calendars.find(c => c.id === calendarId)

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl focus:outline-none">

          {/* Color bar from selected calendar */}
          <div
            className="h-1.5 w-full rounded-t-2xl"
            style={{ backgroundColor: selectedCal?.color ?? '#4A90E2' }}
          />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                New event
              </Dialog.Title>
              <Dialog.Close className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={15} />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Event title"
                className="w-full border-0 border-b-2 border-gray-200 pb-2 text-xl font-semibold text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 transition-colors bg-transparent"
              />

              {/* Date + Times */}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock size={14} className="shrink-0 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStart(e.target.value)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEnd(e.target.value)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-gray-400" />
                <input
                  value={location}
                  onChange={e => setLoc(e.target.value)}
                  placeholder="Add location"
                  className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder-gray-300"
                />
              </div>

              {/* Description */}
              <div className="flex items-start gap-2">
                <AlignLeft size={14} className="shrink-0 mt-2 text-gray-400" />
                <textarea
                  value={description}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Add description"
                  rows={2}
                  className="flex-1 resize-none rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder-gray-300"
                />
              </div>

              {/* Calendar selector */}
              <div className="flex flex-wrap gap-2">
                {calendars.map(cal => (
                  <button
                    key={cal.id}
                    type="button"
                    onClick={() => setCalId(cal.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                      calendarId === cal.id
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                    style={calendarId === cal.id ? { backgroundColor: cal.color } : {}}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: calendarId === cal.id ? 'rgba(255,255,255,0.6)' : cal.color }}
                    />
                    {cal.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !date}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save event
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
