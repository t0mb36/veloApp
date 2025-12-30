'use client'

import { useState } from 'react'
import { Clock, CalendarRange, Sparkles, CreditCard, Mail, Calendar, ChevronRight, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const { addItem } = useCart()

  const activeServices = services.filter((s) => s.isActive)

  // Standard time slots to display
  const standardTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

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

  // Get available slots for cart functionality
  const availableSlots = availability.filter((s) => !s.isBooked)

  // Generate next 4 days starting from today
  const today = new Date()
  const upcomingDates = Array.from({ length: 4 }, (_, i) => {
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
        // For today, only show times after current hour
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
          time,
          isAvailable: existingSlot ? !existingSlot.isBooked : false, // If no slot exists, it's not available
          isBooked: existingSlot?.isBooked || false,
          hasSlot: !!existingSlot, // Whether a slot exists for this time
        }
      })
  }

  // Check if a day has any available slots
  const hasAvailableSlots = (dateStr: string) => {
    const slots = getTimeSlotsForDate(dateStr)
    return slots.some((s) => s.isAvailable)
  }

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM d')
  }

  const handleQuickBook = (serviceId: string) => {
    // TODO: Integrate with Stripe checkout
    console.log('Quick book:', { serviceId, coachId, slotId: selectedSlotId })
    alert('Quick Book - Stripe integration coming soon!')
  }

  const handleAddToCart = (service: CoachService, isBundle: boolean = false) => {
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
      setSelectedSlotId(null)
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

  return (
    <section>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Services List - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {activeServices.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No services available at this time.</p>
              </CardContent>
            </Card>
          ) : (
            activeServices.map((service) => (
              <Card
                key={service.id}
                className={cn(
                  'transition-all cursor-pointer hover:shadow-md',
                  selectedServiceId === service.id && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedServiceId(service.id)}
              >
                <CardContent className="p-4">
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
                        <p className="text-xl font-bold">${service.price}</p>
                      </div>

                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
                      )}

                      {/* Bundle offer */}
                      {service.bundle && (
                        <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-green-50 border border-green-200">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            Bundle: {service.bundle.credits} sessions for ${service.bundle.price}
                            {service.bundle.expirationMonths && (
                              <span className="text-green-600"> ({service.bundle.expirationMonths} mo validity)</span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleQuickBook(service.id)
                          }}
                        >
                          Quick Book
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(service, false)
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                        {service.bundle && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToCart(service, true)
                            }}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Buy Bundle
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Availability Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isContactOnly ? (
                <div className="text-center py-6">
                  <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact {coachName.split(' ')[0]} directly to schedule a session.
                  </p>
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              ) : upcomingDates.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No available slots in the next 7 days.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDates.map((dateStr) => {
                    const slots = getTimeSlotsForDate(dateStr)
                    const noAvailable = !hasAvailableSlots(dateStr)

                    // Skip if no slots to show (e.g., today after business hours)
                    if (slots.length === 0) return null

                    return (
                      <div key={dateStr}>
                        <p className="text-sm font-medium mb-2">{formatDateLabel(dateStr)}</p>
                        <div className="relative">
                          {/* No available times overlay */}
                          {noAvailable && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-md">
                              <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                                No available times
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {slots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => slot.isAvailable && setSelectedSlotId(slot.id === selectedSlotId ? null : slot.id)}
                                disabled={!slot.isAvailable}
                                className={cn(
                                  'px-2.5 py-1 text-xs rounded-md border transition-colors',
                                  !slot.isAvailable
                                    ? 'bg-muted text-muted-foreground/60 border-border cursor-not-allowed'
                                    : selectedSlotId === slot.id
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'hover:bg-accent border-border'
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

                  <Separator />

                  <Button variant="ghost" className="w-full justify-between text-primary">
                    View Full Calendar
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
