// Calendar-related type definitions

export type CalendarEventType = 'training' | 'meeting' | 'other'

export interface CalendarEvent {
  id: string
  title: string
  time: string
  type: CalendarEventType
  date: Date
  location?: string
  with?: string
  description?: string
}
