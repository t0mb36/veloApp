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
                <Link href={`/coaches/${coach.id}`}>
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    Full Profile
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Top Row: Specialties + Rate + Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {coach.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                {/* Bio - truncated */}
                <p className="text-sm text-muted-foreground line-clamp-2">{coach.bio}</p>
              </div>

              {/* Rate */}
              <div className="shrink-0 text-right">
                <span className="text-sm text-muted-foreground">From</span>
                <div>
                  <span className="text-2xl font-bold text-primary">${coach.hourlyRate}</span>
                  <span className="text-muted-foreground text-sm">/hr</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Services & Booking */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Services & Booking</h3>

              {activeServices.length > 0 ? (
                <div className="space-y-2">
                  {activeServices.slice(0, 4).map((service) => (
                    <div
                      key={service.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      {/* Service Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'p-1.5 rounded-md',
                            service.type === 'session' ? 'bg-blue-100 text-blue-600' :
                            service.type === 'program' ? 'bg-orange-100 text-orange-600' :
                            'bg-purple-100 text-purple-600'
                          )}>
                            {service.type === 'session' ? <Clock className="h-3.5 w-3.5" /> :
                             service.type === 'program' ? <Calendar className="h-3.5 w-3.5" /> :
                             <Star className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{service.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {service.duration} {service.durationUnit === 'minutes' ? 'min' : service.durationUnit}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-primary">${service.price}</span>
                      </div>

                      {/* Available Times for this service */}
                      {availableSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t">
                          {availableSlots.slice(0, 3).map((slot) => (
                            <button
                              key={slot.id}
                              className="px-2 py-1 text-xs rounded-md border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                            >
                              {formatSlotDate(slot.date)} • {formatTime(slot.startTime)}
                            </button>
                          ))}
                          <Link href={`/coaches/${coach.id}?tab=calendar`}>
                            <button className="px-2 py-1 text-xs rounded-md border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              See full availability
                            </button>
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Contact coach for availability
                          </p>
                          <Link href={`/coaches/${coach.id}?tab=calendar`}>
                            <button className="px-2 py-1 text-xs rounded-md border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              View calendar
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">No services listed yet.</p>
              )}
              {activeServices.length > 4 && (
                <Link href={`/coaches/${coach.id}`} className="block">
                  <p className="text-xs text-primary text-center mt-3 hover:underline cursor-pointer">
                    View all {activeServices.length} services →
                  </p>
                </Link>
              )}
            </div>

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
                    {[...freeContent, ...premiumContent].slice(0, 3).map((content) => (
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

                    {/* View Content Library Card - styled like a video thumbnail */}
                    <Link href={`/coaches/${coach.id}?tab=content`} className="block">
                      <div className="group relative rounded-lg overflow-hidden bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer aspect-video flex flex-col items-center justify-center gap-2">
                        <div className="p-3 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                          <ChevronRight className="h-6 w-6 text-primary group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="font-medium text-sm text-primary">View Content Library</p>
                      </div>
                    </Link>
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
