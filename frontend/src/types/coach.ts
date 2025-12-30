// Coach-related type definitions for public profiles

export interface PublicCoachProfile {
  id: string
  firstName: string
  lastName: string
  bio: string
  location: string
  specialties: string[]
  instagram?: string
  twitter?: string
  linkedin?: string
  tiktok?: string
  youtube?: string
  website?: string
  profileImage: string | null
  bannerImage: string | null
  rating: number
  reviewCount: number
  hourlyRate: number
  isContactOnly: boolean
  isFavorited?: boolean
  latitude?: number
  longitude?: number
}

export interface AvailabilitySlot {
  id: string
  date: string // ISO date string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  serviceId: string
  isBooked: boolean
}

export interface CoachContent {
  id: string
  coachId: string
  title: string
  description: string
  type: 'video' | 'article' | 'workout' | 'plan'
  thumbnailUrl?: string
  isPremium: boolean
  price?: number
  duration?: string // For videos, e.g., "12:34"
  createdAt: string
  isUnlocked?: boolean
}

export interface CoachReview {
  id: string
  coachId: string
  studentId: string
  studentName: string
  studentAvatar?: string
  rating: number
  date: string
  comment: string
  sport: string
  serviceType?: string
  isVerified: boolean
}

export interface CartItem {
  id: string
  serviceId: string
  serviceName: string
  coachId: string
  coachName: string
  price: number
  quantity: number
  isBundle: boolean
  bundleCredits?: number
  slotId?: string
  slotDate?: string
  slotTime?: string
}

// Service types (shared with studio)
export interface ServiceBundle {
  credits: number
  price: number
  expirationMonths?: number
}

export interface CoachService {
  id: string
  name: string
  type: 'session' | 'program' | 'custom'
  price: number
  duration?: number
  durationUnit?: 'minutes' | 'weeks'
  bundle?: ServiceBundle
  description?: string
  isActive: boolean
}
