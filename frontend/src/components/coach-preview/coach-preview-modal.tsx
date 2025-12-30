'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X, Star, MapPin, Calendar, Clock, Play, FileText, CreditCard, ChevronRight, MessageSquare, Heart, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getFullCoachData } from '@/lib/mock-data/coaches'
import type { CoachService, CoachContent, AvailabilitySlot } from '@/types/coach'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'

interface Coach {
  id: string
  name: string
  image: string
  specialties: string[]
  rating: number
  reviewCount: number
  location: string
  hourlyRate: number
  bio: string
  isYourCoach?: boolean
}

interface CoachPreviewModalProps {
  coach: Coach | null
  isOpen: boolean
  onClose: () => void
  triggerRect?: DOMRect | null
}

export function CoachPreviewModal({ coach, isOpen, onClose, triggerRect }: CoachPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [coachData, setCoachData] = useState<{
    services: CoachService[]
    content: CoachContent[]
    availability: AvailabilitySlot[]
  } | null>(null)

  // Load full coach data when opened
  useEffect(() => {
    if (coach && isOpen) {
      const data = getFullCoachData(coach.id)
      setCoachData({
        services: data.services,
        content: data.content,
        availability: data.availability,
      })
    }
  }, [coach, isOpen])

  // Handle open/close with proper timing
  useLayoutEffect(() => {
    if (isOpen) {
      // Make visible but not yet animating (starts at card position)
      setIsVisible(true)
      setIsAnimating(false)

      // Force a reflow to ensure initial position is applied, then animate
      const frame1 = requestAnimationFrame(() => {
        const frame2 = requestAnimationFrame(() => {
          setIsAnimating(true)
        })
        return () => cancelAnimationFrame(frame2)
      })

      return () => cancelAnimationFrame(frame1)
    } else {
      // When closing, animate out first
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const availableSlots = coachData?.availability.filter(s => !s.isBooked).slice(0, 4) || []
  const activeServices = coachData?.services.filter(s => s.isActive) || []
  const freeContent = coachData?.content.filter(c => !c.isPremium).slice(0, 2) || []
  const premiumContent = coachData?.content.filter(c => c.isPremium).slice(0, 2) || []

  const formatSlotDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM d')
  }

  const formatTime = (time: string) => {
    const hour = parseInt(time.split(':')[0], 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:00 ${ampm}`
  }

  // Calculate the starting transform (at card position)
  const getStartTransform = () => {
    if (!triggerRect) return { x: 0, y: 0, scale: 0.8 }

    const modalWidth = 768
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const triggerCenterX = triggerRect.left + triggerRect.width / 2
    const triggerCenterY = triggerRect.top + triggerRect.height / 2

    return {
      x: triggerCenterX - centerX,
      y: triggerCenterY - centerY,
      scale: Math.max(triggerRect.width / modalWidth, 0.25),
    }
  }

  const startTransform = getStartTransform()

  // Don't render if not visible
  if (!isVisible || !coach) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 500ms ease-out',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] m-4 overflow-hidden rounded-2xl bg-background shadow-2xl"
        style={{
          transform: isAnimating
            ? 'translate(0, 0) scale(1)'
            : `translate(${startTransform.x}px, ${startTransform.y}px) scale(${startTransform.scale})`,
          opacity: isAnimating ? 1 : 0,
          transition: isAnimating
            ? 'transform 500ms cubic-bezier(0.32, 0.72, 0, 1), opacity 300ms ease-out'
            : 'none',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero Section */}
          <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
            <img
              src={coach.image}
              alt={coach.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

            {/* Profile Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
              <img
                src={coach.image}
                alt={coach.name}
                className="w-24 h-24 rounded-xl object-cover border-4 border-background shadow-lg"
              />
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-2xl font-bold truncate">{coach.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{coach.rating}</span>
                    <span className="text-muted-foreground text-sm">({coach.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{coach.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Action Buttons - At Top */}
            <div className="flex gap-3">
              <Link href={`/coaches/${coach.id}`} className="flex-1">
                <Button className="w-full gap-2" size="lg">
                  View Full Profile
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2">
                <Calendar className="h-4 w-4" />
                Book Now
              </Button>
            </div>

            <Separator />

            {/* Specialties & Rate */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {coach.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">${coach.hourlyRate}</span>
                <span className="text-muted-foreground">/hr</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-muted-foreground leading-relaxed">{coach.bio}</p>

            <Separator />

            {/* Services Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Services
                </h3>
                <span className="text-sm text-muted-foreground">{activeServices.length} available</span>
              </div>

              {activeServices.length > 0 ? (
                <div className="grid gap-2">
                  {activeServices.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          service.type === 'session' ? 'bg-blue-100 text-blue-600' :
                          service.type === 'program' ? 'bg-orange-100 text-orange-600' :
                          'bg-purple-100 text-purple-600'
                        )}>
                          {service.type === 'session' ? <Clock className="h-4 w-4" /> :
                           service.type === 'program' ? <Calendar className="h-4 w-4" /> :
                           <Star className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.duration} {service.durationUnit === 'minutes' ? 'min' : service.durationUnit}
                            {service.bundle && (
                              <span className="ml-2 text-green-600">• Bundle available</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">${service.price}</span>
                    </div>
                  ))}
                  {activeServices.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center py-1">
                      +{activeServices.length - 3} more services
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">No services listed yet.</p>
              )}
            </div>

            {/* Availability Section */}
            {availableSlots.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    Next Available
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <Badge
                        key={slot.id}
                        variant="outline"
                        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {formatSlotDate(slot.date)} • {formatTime(slot.startTime)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Content Section */}
            {(freeContent.length > 0 || premiumContent.length > 0) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Play className="h-5 w-5 text-primary" />
                    Content
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[...freeContent, ...premiumContent].slice(0, 4).map((content) => (
                      <div
                        key={content.id}
                        className="group relative rounded-lg overflow-hidden bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      >
                        {content.thumbnailUrl ? (
                          <div className="aspect-video relative">
                            <img
                              src={content.thumbnailUrl}
                              alt={content.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                            {content.isPremium && (
                              <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-950">
                                ${content.price}
                              </Badge>
                            )}
                            {!content.isPremium && (
                              <Badge variant="secondary" className="absolute top-2 right-2">
                                Free
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-primary/50" />
                            {content.isPremium && (
                              <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-950">
                                ${content.price}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="p-2">
                          <p className="font-medium text-sm truncate">{content.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{content.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
