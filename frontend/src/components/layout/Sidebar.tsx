import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Settings, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarResponse } from '@/types'

interface SidebarProps {
  calendars: CalendarResponse[]
  selectedCalendarId: string | null
  onSelectCalendar: (id: string) => void
  onCreateCalendar: () => void
}

export function Sidebar({ calendars, selectedCalendarId, onSelectCalendar, onCreateCalendar }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState<'calendars' | 'profile' | 'settings'>('calendars')

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 h-full',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-4 py-5 border-b border-gray-100', collapsed && 'justify-center px-2')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <Calendar size={16} className="text-white" />
        </div>
        {!collapsed && <span className="font-semibold text-gray-900">CalendarAI</span>}
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col gap-1 p-2 border-b border-gray-100">
        {[
          { key: 'calendars', icon: Calendar, label: 'Calendars' },
          { key: 'settings', icon: Settings, label: 'Calendar Settings' },
          { key: 'profile',  icon: User,     label: 'Profile Settings' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as typeof activeSection)}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors',
              activeSection === key && 'bg-blue-50 text-blue-700 font-medium',
              collapsed && 'justify-center'
            )}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Section content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3">
          {activeSection === 'calendars' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">My Calendars</span>
                <button onClick={onCreateCalendar} className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Plus size={15} />
                </button>
              </div>
              {calendars.map(cal => (
                <button
                  key={cal.id}
                  onClick={() => onSelectCalendar(cal.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors',
                    selectedCalendarId === cal.id && 'bg-gray-100 font-medium'
                  )}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: cal.color }}
                  />
                  <span className="truncate">{cal.name}</span>
                  {cal.isDefault && (
                    <span className="ml-auto text-[10px] text-gray-400">default</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-1">Calendar Settings</p>
              <div className="space-y-3">
                <SettingRow label="Week starts on" value="Monday" />
                <SettingRow label="Time format" value="24-hour" />
                <SettingRow label="Default view" value="Month" />
                <SettingRow label="Show weekends" value="Yes" />
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-1">Profile Settings</p>
              <div className="space-y-3">
                <SettingRow label="Display name" value="Alice Smith" />
                <SettingRow label="Email" value="alice@example.com" />
                <SettingRow label="Timezone" value="Australia/Sydney" />
                <SettingRow label="Notifications" value="Email" />
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-700">{value}</span>
    </div>
  )
}
