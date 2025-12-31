'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/cart-context'
import type { AvailabilitySlot, CoachService } from '@/types/coach'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
} from 'date-fns'

interface FullCalendarProps {
  availability: AvailabilitySlot[]
  services: CoachService[]
  coachId: string
  coachName: string
  isContactOnly: boolean
}

export function FullCalendar({
  availability,
  services,
  coachId,
  coachName,
  isContactOnly,
}: FullCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedService, setSelectedService] = useState<string | null>(
    services.find((s) => s.isActive)?.id || null
  )
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const { addItem } = useCart()

  const activeServices = services.filter((s) => s.isActive)

  // Build a lookup of available slots by date
  const slotsByDate = useMemo(() => {
    const lookup: Record<string, AvailabilitySlot[]> = {}
    availability.forEach((slot) => {
      if (!lookup[slot.date]) {
        lookup[slot.date] = []
      }
      lookup[slot.date].push(slot)
    })
    return lookup
  }, [availability])

  // Get calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days: Date[] = []
    let day = calendarStart
    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  // Get available slots for selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return (slotsByDate[dateStr] || [])
      .filter((slot) => !slot.isBooked)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [selectedDate, slotsByDate])

  const formatTime = (time: string) => {
    const hour = parseInt(time.split(':')[0], 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:00 ${ampm}`
  }

  const hasAvailability = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const slots = slotsByDate[dateStr] || []
    return slots.some((slot) => !slot.isBooked)
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleDateClick = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleAddToCart = () => {
    if (!selectedSlot || !selectedService) return

    const service = activeServices.find((s) => s.id === selectedService)
    const slot = slotsForSelectedDate.find((s) => s.id === selectedSlot)

    if (!service || !slot) return

    addItem({
      serviceId: service.id,
      serviceName: service.name,
      coachId,
      coachName,
      price: service.price,
      quantity: 1,
      isBundle: false,
      slotId: slot.id,
      slotDate: selectedDate ? format(selectedDate, 'EEE, MMM d') : undefined,
      slotTime: slot.startTime,
    })

    setSelectedSlot(null)
  }

  if (isContactOnly) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Contact for Availability</h3>
          <p className="text-muted-foreground">
            {coachName.split(' ')[0]} manages their schedule directly. Please message them to arrange a session.
          </p>
          <Button className="mt-4">Send Message</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isPast = isBefore(day, startOfDay(new Date()))
              const hasSlots = hasAvailability(day)

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  disabled={isPast || !isCurrentMonth}
                  className={cn(
                    'aspect-square p-2 rounded-lg text-sm transition-colors relative',
                    !isCurrentMonth && 'text-muted-foreground/30',
                    isCurrentMonth && !isPast && 'hover:bg-accent',
                    isPast && 'text-muted-foreground/50 cursor-not-allowed',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                    isToday(day) && !isSelected && 'border border-primary'
                  )}
                >
                  {format(day, 'd')}
                  {hasSlots && isCurrentMonth && !isPast && (
                    <span
                      className={cn(
                        'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground' : 'bg-green-500'
                      )}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border border-primary" />
              <span>Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <div className="space-y-4">
        {/* Service Selection */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Select Service</h3>
            <div className="space-y-2">
              {activeServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service.id)
                    setSelectedSlot(null)
                  }}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-colors',
                    selectedService === service.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{service.name}</span>
                    <span className="text-sm text-primary font-semibold">
                      ${service.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {service.duration} {service.durationUnit === 'minutes' ? 'min' : service.durationUnit}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </h3>

            {selectedDate && slotsForSelectedDate.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {slotsForSelectedDate.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={cn(
                      'px-3 py-2 text-sm rounded-md border transition-colors',
                      selectedSlot === slot.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent'
                    )}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            ) : selectedDate ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No available times on this date
              </p>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Select a date to see available times
              </p>
            )}

            {/* Add to Cart Button */}
            {selectedSlot && selectedService && (
              <Button className="w-full mt-4" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
