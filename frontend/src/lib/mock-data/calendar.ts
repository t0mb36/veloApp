import type { CalendarEvent } from '@/types/calendar'

// Helper to create mock events relative to a given date
export function createMockEvents(today: Date): CalendarEvent[] {
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  return [
    {
      id: 'evt-a1b2c3d4-1111-2222-3333-444444444444',
      title: 'Tennis with Sarah',
      time: '10:00 AM',
      type: 'training',
      date: today,
      location: 'Venice Beach Courts',
      with: 'Sarah Johnson',
      description: 'Weekly tennis training session focusing on serve technique.',
    },
    {
      id: 'evt-b2c3d4e5-2222-3333-4444-555555555555',
      title: 'Program Review',
      time: '2:00 PM',
      type: 'meeting',
      date: tomorrow,
      with: 'Mike Chen',
      description: 'Review progress on the 8-week conditioning program.',
    },
    {
      id: 'evt-c3d4e5f6-3333-4444-5555-666666666666',
      title: 'Group Session',
      time: '9:00 AM',
      type: 'training',
      date: nextWeek,
      location: 'Main Gym',
      with: 'Group (4 students)',
      description: 'Small group basketball training - footwork drills.',
    },
  ]
}

// Pre-generated events for current date (will be stale but useful for testing)
export const mockCalendarEvents = createMockEvents(new Date())
