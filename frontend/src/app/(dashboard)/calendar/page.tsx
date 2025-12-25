'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  format,
  isToday,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
} from 'date-fns'
import {
  CalendarDays,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Placeholder events for UI development
const mockEvents = [
  {
    id: '1',
    title: 'Morning Training Session',
    time: '09:00 AM - 10:30 AM',
    type: 'training' as const,
    date: new Date(),
  },
  {
    id: '2',
    title: 'Team Meeting',
    time: '02:00 PM - 03:00 PM',
    type: 'meeting' as const,
    date: new Date(),
  },
  {
    id: '3',
    title: 'Evening Practice',
    time: '05:00 PM - 06:30 PM',
    type: 'training' as const,
    date: new Date(),
  },
]

interface CalendarEvent {
  id: string
  title: string
  time: string
  type: 'training' | 'meeting' | 'other'
  date: Date
}

function getEventsForDate(date: Date, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => isSameDay(event.date, date))
}

function EventTypeIndicator({ type }: { type: CalendarEvent['type'] }) {
  const colors = {
    training: 'bg-blue-500',
    meeting: 'bg-green-500',
    other: 'bg-gray-500',
  }

  return <div className={cn('h-2 w-2 rounded-full', colors[type])} />
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface FullCalendarProps {
  currentMonth: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  events: CalendarEvent[]
}

function FullCalendar({
  currentMonth,
  selectedDate,
  onSelectDate,
  events,
}: FullCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)

  // Always generate exactly 6 weeks (42 days) for consistent calendar height
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    days.push(addDays(calendarStart, i))
  }

  // Split into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="py-3 text-center text-sm font-medium text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="flex-1 grid"
        style={{ gridTemplateRows: 'repeat(6, minmax(100px, 1fr))' }}
      >
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0 min-h-[100px]">
            {week.map((date) => {
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isSelected = isSameDay(date, selectedDate)
              const isCurrentDay = isToday(date)
              const dayEvents = getEventsForDate(date, events)

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    'relative flex flex-col items-start p-2 border-r last:border-r-0 transition-colors cursor-pointer min-h-[80px]',
                    'hover:bg-accent/50',
                    !isCurrentMonth && 'bg-muted/60',
                    isSelected && 'bg-accent'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-sm',
                      !isCurrentMonth && 'text-muted-foreground/70',
                      isCurrentDay &&
                        !isSelected &&
                        'bg-primary text-primary-foreground font-semibold',
                      isSelected &&
                        isCurrentDay &&
                        'bg-primary text-primary-foreground font-semibold',
                      isSelected && !isCurrentDay && 'bg-foreground text-background'
                    )}
                  >
                    {format(date, 'd')}
                  </span>
                  {/* Event indicators */}
                  {dayEvents.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            event.type === 'training' && 'bg-blue-500',
                            event.type === 'meeting' && 'bg-green-500',
                            event.type === 'other' && 'bg-gray-500'
                          )}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const eventsForSelectedDate = getEventsForDate(selectedDate, mockEvents)

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  return (
    <div className="flex h-full gap-6">
      {/* Left: Full Calendar */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0">
          {/* Navigation Bar */}
          <CardHeader className="pb-0 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousMonth}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold min-w-[160px] text-center">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextMonth}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="ml-2"
                  >
                    Today
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Calendar Grid */}
          <CardContent className="flex-1 pt-4 pb-2 min-h-0">
            <div className="h-full border rounded-lg overflow-hidden">
              <FullCalendar
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                events={mockEvents}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Day Detail Panel */}
      <div className="w-80 shrink-0">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE')}
              </CardTitle>
              <p className="text-2xl font-bold">
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
              {isToday(selectedDate) && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Today
                </span>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {eventsForSelectedDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  No events scheduled
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click &quot;Add Event&quot; to create one
                </p>
                <Button variant="outline" size="sm" className="mt-4 gap-1">
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {eventsForSelectedDate.length} event
                  {eventsForSelectedDate.length !== 1 ? 's' : ''} scheduled
                </p>
                <div className="space-y-2">
                  {eventsForSelectedDate.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer"
                    >
                      <EventTypeIndicator type={event.type} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {event.title}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {event.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
