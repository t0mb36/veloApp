'use client'

import { useState } from 'react'
import { Clock, CalendarRange, Sparkles, CreditCard, Mail, Calendar, ChevronRight, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CoachService, AvailabilitySlot } from '@/types/coach'
import { format, parseISO, addDays, isToday, isTomorrow, startOfDay } from 'date-fns'
import { useCart } from '@/contexts/cart-context'

interface ServicesBookingSectionProps {
  services: CoachService[]
  availability: AvailabilitySlot[]
  isContactOnly: boolean
  coachId: string
  coachName: string
}

export function ServicesBookingSection({
  services,
  availability,
  isContactOnly,
  coachId,
  coachName,
}: ServicesBookingSectionProps) {
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string | null>>({})
  const { addItem } = useCart()

  const activeServices = services.filter((s) => s.isActive)

  // Standard time slots to display (full 24-hour cycle)
  const standardTimes = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ]

  // Format time to 12-hour with AM/PM
  const formatTime = (time: string) => {
    const hour = parseInt(time.split(':')[0], 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:00 ${ampm}`
  }

  // Group ALL slots by date (both available and booked)
  const slotLookup = availability.reduce((acc, slot) => {
    const key = `${slot.date}-${slot.startTime}`
    acc[key] = slot
    return acc
  }, {} as Record<string, AvailabilitySlot>)

  // Get available slots
  const availableSlots = availability.filter((s) => !s.isBooked)

  // Generate next 7 days starting from today
  const today = new Date()
  const upcomingDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfDay(today), i)
    return format(date, 'yyyy-MM-dd')
  })

  // Get current hour for filtering today's times
  const currentHour = today.getHours()

  // Get time slots for a specific date
  const getTimeSlotsForDate = (dateStr: string) => {
    const isDateToday = isToday(parseISO(dateStr))

    return standardTimes
      .filter((time) => {
        if (isDateToday) {
          const hour = parseInt(time.split(':')[0], 10)
          return hour > currentHour
        }
        return true
      })
      .map((time) => {
        const key = `${dateStr}-${time}`
        const existingSlot = slotLookup[key]

        return {
          id: existingSlot?.id || `generated-${key}`,
          date: dateStr,
          time,
          isAvailable: existingSlot ? !existingSlot.isBooked : false,
          isBooked: existingSlot?.isBooked || false,
        }
      })
  }

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM d')
  }

  const handleSlotSelect = (serviceId: string, slotId: string) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId] === slotId ? null : slotId,
    }))
  }

  const handleAddToCart = (service: CoachService, isBundle: boolean = false) => {
    const selectedSlotId = selectedSlots[service.id]
    const selectedSlot = selectedSlotId
      ? availableSlots.find((s) => s.id === selectedSlotId)
      : null

    addItem({
      serviceId: service.id,
      serviceName: isBundle ? `${service.name} (Bundle)` : service.name,
      coachId,
      coachName,
      price: isBundle && service.bundle ? service.bundle.price : service.price,
      quantity: 1,
      isBundle,
      bundleCredits: isBundle && service.bundle ? service.bundle.credits : undefined,
      slotId: selectedSlot?.id,
      slotDate: selectedSlot ? formatDateLabel(selectedSlot.date) : undefined,
      slotTime: selectedSlot?.startTime,
    })

    // Clear slot selection after adding to cart
    if (selectedSlot) {
      setSelectedSlots((prev) => ({ ...prev, [service.id]: null }))
    }
  }

  const getServiceIcon = (type: CoachService['type']) => {
    switch (type) {
      case 'session':
        return <Clock className="h-5 w-5" />
      case 'program':
        return <CalendarRange className="h-5 w-5" />
      case 'custom':
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getServiceTypeColor = (type: CoachService['type']) => {
    switch (type) {
      case 'session':
        return 'bg-blue-100 text-blue-600'
      case 'program':
        return 'bg-orange-100 text-orange-600'
      case 'custom':
        return 'bg-purple-100 text-purple-600'
    }
  }

  if (activeServices.length === 0) {
    return (
      <section>
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No services available at this time.</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      {activeServices.map((service) => {
        const selectedSlotId = selectedSlots[service.id]

        return (
          <Card key={service.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Service Header */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Service Icon */}
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
                      getServiceTypeColor(service.type)
                    )}
                  >
                    {getServiceIcon(service.type)}
                  </div>

                  {/* Service Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.type === 'session' && `${service.duration} min`}
                          {service.type === 'program' && `${service.duration} week program`}
                          {service.type === 'custom' && service.duration && `${service.duration} min`}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-primary">${service.price}</p>
                    </div>

                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
                    )}

                    {/* Bundle offer */}
                    {service.bundle && (
                      <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-green-50 border border-green-200">
                        <CreditCard className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="text-sm text-green-700">
                          Bundle: {service.bundle.credits} sessions for ${service.bundle.price}
                          {service.bundle.expirationMonths && (
                            <span className="text-green-600"> ({service.bundle.expirationMonths} mo validity)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability & Actions */}
                <div className="mt-4 pt-4 border-t">
                  {isContactOnly ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>Contact {coachName.split(' ')[0]} directly to schedule</span>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Full Availability Calendar */}
                      <div className="space-y-4 mb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Select a time
                          </h4>
                          <Button variant="ghost" size="sm" className="text-primary gap-1 h-auto py-1">
                            View Full Calendar
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/30 space-y-4">
                          {upcomingDates.slice(0, 5).map((dateStr) => {
                            const slots = getTimeSlotsForDate(dateStr)
                            if (slots.length === 0) return null

                            const hasAvailable = slots.some((s) => s.isAvailable)

                            return (
                              <div key={dateStr}>
                                <p className="text-sm font-medium mb-2">{formatDateLabel(dateStr)}</p>
                                <div className="relative">
                                  {!hasAvailable && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-md">
                                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                        No available times
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-1.5">
                                    {slots.map((slot) => (
                                      <button
                                        key={slot.id}
                                        onClick={() => slot.isAvailable && handleSlotSelect(service.id, slot.id)}
                                        disabled={!slot.isAvailable}
                                        className={cn(
                                          'px-2.5 py-1 text-xs rounded-md border transition-colors',
                                          !slot.isAvailable
                                            ? 'bg-muted text-muted-foreground/60 border-border cursor-not-allowed'
                                            : selectedSlotId === slot.id
                                              ? 'bg-primary text-primary-foreground border-primary'
                                              : 'bg-background hover:bg-accent border-border'
                                        )}
                                      >
                                        {formatTime(slot.time)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          disabled={!selectedSlotId}
                          onClick={() => handleAddToCart(service, false)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1.5" />
                          {selectedSlotId ? 'Add to Cart' : 'Select a time to book'}
                        </Button>
                        {service.bundle && (
                          <Button
                            variant="secondary"
                            onClick={() => handleAddToCart(service, true)}
                          >
                            <CreditCard className="h-4 w-4 mr-1.5" />
                            Buy Bundle (${service.bundle.price})
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
