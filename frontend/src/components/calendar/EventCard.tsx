import { MapPin, Clock, Users, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { cn, formatTime, formatDate } from '@/lib/utils'
import type { EventResponse, AttendeeResponse, AttendeeStatus } from '@/types'

interface EventCardProps {
  event: EventResponse
  attendees: AttendeeResponse[]
  currentUserId: string
  onRsvp: (eventId: string, status: AttendeeStatus) => void
}

export function EventCard({ event, attendees, currentUserId, onRsvp }: EventCardProps) {
  const myAttendee = attendees.find(a => a.userId === currentUserId)
  const myStatus = myAttendee?.responseStatus ?? 'PENDING'

  const statusCounts = {
    ACCEPTED: attendees.filter(a => a.responseStatus === 'ACCEPTED').length,
    DECLINED: attendees.filter(a => a.responseStatus === 'DECLINED').length,
    TENTATIVE: attendees.filter(a => a.responseStatus === 'TENTATIVE').length,
    PENDING:  attendees.filter(a => a.responseStatus === 'PENDING').length,
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight">{event.title}</h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <Clock size={11} />
            <span>{formatDate(event.startTime)} · {formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
          </div>
        </div>
        <StatusBadge status={event.status} />
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
      )}

      {/* Location */}
      {event.location && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin size={11} />
          <span>{event.location}</span>
        </div>
      )}

      {/* Attendee count */}
      {attendees.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Users size={11} />
          <span>
            {statusCounts.ACCEPTED} yes · {statusCounts.DECLINED} no · {statusCounts.TENTATIVE} maybe · {statusCounts.PENDING} pending
          </span>
        </div>
      )}

      {/* RSVP buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <RsvpButton
          label="Yes"
          icon={<CheckCircle size={13} />}
          active={myStatus === 'ACCEPTED'}
          activeClass="bg-green-50 text-green-700 border-green-200"
          onClick={() => onRsvp(event.id, 'ACCEPTED')}
        />
        <RsvpButton
          label="No"
          icon={<XCircle size={13} />}
          active={myStatus === 'DECLINED'}
          activeClass="bg-red-50 text-red-700 border-red-200"
          onClick={() => onRsvp(event.id, 'DECLINED')}
        />
        <RsvpButton
          label="Maybe"
          icon={<HelpCircle size={13} />}
          active={myStatus === 'TENTATIVE'}
          activeClass="bg-yellow-50 text-yellow-700 border-yellow-200"
          onClick={() => onRsvp(event.id, 'TENTATIVE')}
        />
      </div>
    </div>
  )
}

function RsvpButton({
  label, icon, active, activeClass, onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  activeClass: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
        active
          ? activeClass
          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function StatusBadge({ status }: { status: EventResponse['status'] }) {
  const map = {
    PUBLISHED: 'bg-blue-50 text-blue-700',
    DRAFT:     'bg-gray-100 text-gray-500',
    CANCELLED: 'bg-red-50 text-red-500 line-through',
  }
  return (
    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', map[status])}>
      {status.toLowerCase()}
    </span>
  )
}
