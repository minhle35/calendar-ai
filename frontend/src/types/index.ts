export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
export type AttendeeRole = 'ORGANIZER' | 'REQUIRED' | 'OPTIONAL'
export type AttendeeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE'
export type PermissionLevel = 'VIEW' | 'EDIT' | 'ADMIN'
export type CalendarView = 'week' | 'month'

export interface UserResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  timezone: string
  profilePictureUrl: string
  createdAt: string
}

export interface CalendarResponse {
  id: string
  name: string
  description: string
  color: string
  isDefault: boolean
  isPublic: boolean
  ownerId: string
  createdAt: string
}

export interface EventResponse {
  id: string
  calendarId: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  isRecurring: boolean
  recurrenceRule: string
  status: EventStatus
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface AttendeeResponse {
  id: string
  eventId: string
  userId: string | null
  displayName: string
  email: string
  role: AttendeeRole
  responseStatus: AttendeeStatus
  responseDate: string | null
}

// Local event draft — used before saving to the backend
export interface DraftEvent {
  id: string          // temporary client-side id
  calendarId: string
  calendarColor: string
  title: string
  description: string
  location: string
  startTime: Date
  endTime: Date
  status: EventStatus
}

export interface DaySettings {
  startHour: number   // 0–23, default 6
  endHour: number     // 0–23, default 22
}

export interface NewEventDefaults {
  date: Date
  startHour: number
  startMinute: number
}
