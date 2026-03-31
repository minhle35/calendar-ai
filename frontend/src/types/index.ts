export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
export type AttendeeRole = 'ORGANIZER' | 'REQUIRED' | 'OPTIONAL'
export type AttendeeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE'
export type PermissionLevel = 'VIEW' | 'EDIT' | 'ADMIN'

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
