import type { CalendarResponse, EventResponse, AttendeeResponse, AttendeeStatus } from '@/types'

// Temporary: hardcoded to Alice's seeded ID until JWT auth is added
const TEMP_USER_ID = '018f1a2b-0000-7000-8000-000000000001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Request failed')
  }
  return res.json()
}

export const api = {
  calendars: {
    list: () =>
      request<CalendarResponse[]>(`/calendars?userId=${TEMP_USER_ID}`),
    get: (id: string) =>
      request<CalendarResponse>(`/calendars/${id}?userId=${TEMP_USER_ID}`),
    create: (body: { name: string; description?: string; color?: string; isDefault: boolean; isPublic: boolean }) =>
      request<CalendarResponse>(`/calendars?userId=${TEMP_USER_ID}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    setDefault: (id: string) =>
      request<CalendarResponse>(`/calendars/${id}/default?userId=${TEMP_USER_ID}`, { method: 'PATCH' }),
    delete: (id: string) =>
      request<void>(`/calendars/${id}?userId=${TEMP_USER_ID}`, { method: 'DELETE' }),
  },
  events: {
    list: (calendarId: string) =>
      request<EventResponse[]>(`/calendars/${calendarId}/events`),
  },
  attendees: {
    list: (eventId: string) =>
      request<AttendeeResponse[]>(`/events/${eventId}/attendees`),
    rsvp: (eventId: string, responseStatus: AttendeeStatus) =>
      request<AttendeeResponse>(`/events/${eventId}/attendees/rsvp?userId=${TEMP_USER_ID}`, {
        method: 'POST',
        body: JSON.stringify({ responseStatus }),
      }),
  },
}
