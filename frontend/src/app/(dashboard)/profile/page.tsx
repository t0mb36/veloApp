'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/contexts/auth-context'
import { useViewMode } from '@/contexts/view-mode-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Camera,
  MapPin,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  Plus,
  X,
  Briefcase,
  Star,
  MessageSquare,
  ArrowRight,
  Clock,
  CreditCard,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'

// Available specialties for coaches to choose from
const availableSpecialties = [
  'Tennis',
  'Basketball',
  'Soccer',
  'Swimming',
  'Golf',
  'Yoga',
  'Pilates',
  'CrossFit',
  'Running',
  'Cycling',
  'Boxing',
  'Martial Arts',
  'Strength Training',
  'Personal Training',
  'Nutrition',
  'Pickleball',
  'Volleyball',
  'Baseball',
  'Football',
  'Hockey',
]

// Mock reviews data
interface Review {
  id: string
  studentName: string
  studentAvatar?: string
  rating: number
  date: string
  comment: string
  sport: string
}

const mockReviews: Review[] = [
  {
    id: '1',
    studentName: 'Alex Thompson',
    rating: 5,
    date: '2024-12-20',
    comment: 'Amazing coach! Really helped me improve my backhand technique. Very patient and knowledgeable.',
    sport: 'Tennis',
  },
  {
    id: '2',
    studentName: 'Jordan Lee',
    rating: 5,
    date: '2024-12-15',
    comment: 'Great experience! The lessons are well structured and I can see real improvement in my game.',
    sport: 'Tennis',
  },
  {
    id: '3',
    studentName: 'Sam Rodriguez',
    rating: 4,
    date: '2024-12-10',
    comment: 'Very professional and encouraging. Would definitely recommend to others looking to learn.',
    sport: 'Pickleball',
  },
  {
    id: '4',
    studentName: 'Casey Kim',
    rating: 5,
    date: '2024-12-05',
    comment: 'Best coach I have ever had. Makes learning fun and breaks down complex techniques into simple steps.',
    sport: 'Tennis',
  },
]

// Coach Services data model
interface ServiceBundle {
  credits: number
  price: number
  expirationMonths?: number // undefined = never expires
}

interface CoachService {
  id: string
  name: string
  type: 'session' | 'program' | 'custom'
  price: number
  duration?: number // in minutes for sessions, weeks for programs
  durationUnit?: 'minutes' | 'weeks'
  bundle?: ServiceBundle // optional bundle offer for sessions
  description?: string
  isActive: boolean
}

const mockServices: CoachService[] = [
  {
    id: '1',
    name: 'Private Lesson',
    type: 'session',
    duration: 60,
    price: 85,
    bundle: {
      credits: 10,
      price: 750,
      expirationMonths: 6,
    },
    description: 'One-on-one personalized coaching session',
    isActive: true,
  },
  {
    id: '2',
    name: 'Group Session',
    type: 'session',
    duration: 60,
    price: 45,
    description: 'Small group training (2-4 people)',
    isActive: true,
  },
]

// TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
}

interface CoachProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string
  specialties: string[]
  instagram: string
  twitter: string
  linkedin: string
  tiktok: string
  youtube: string
  website: string
  profileImage: string | null
  bannerImage: string | null
}

export default function ProfilePage() {
  const { user } = useAuthContext()
  const { viewMode } = useViewMode()

  const [profile, setProfile] = useState<CoachProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    specialties: [],
    instagram: '',
    twitter: '',
    linkedin: '',
    tiktok: '',
    youtube: '',
    website: '',
    profileImage: null,
    bannerImage: null,
  })

  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false)
  const [showAllServices, setShowAllServices] = useState(false)

  // Services are managed in Studio, here we just display them
  const services = mockServices.filter((s) => s.isActive)
  const MAX_VISIBLE_SERVICES = 3
  const visibleServices = showAllServices ? services : services.slice(0, MAX_VISIBLE_SERVICES)
  const hasMoreServices = services.length > MAX_VISIBLE_SERVICES
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save function with debounce
  const autoSave = useCallback((profileData: CoachProfile) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(() => {
      // TODO: Save to backend
      console.log('Auto-saving profile:', profileData)
    }, 1000)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Pre-populate email from user data
  useEffect(() => {
    if (user?.email) {
      setProfile((prev) => ({ ...prev, email: user.email || '' }))
    }
  }, [user])

  const handleInputChange = (field: keyof CoachProfile, value: string) => {
    const newProfile = { ...profile, [field]: value }
    setProfile(newProfile)
    autoSave(newProfile)
  }

  const handleAddSpecialty = (specialty: string) => {
    if (!profile.specialties.includes(specialty)) {
      const newProfile = {
        ...profile,
        specialties: [...profile.specialties, specialty],
      }
      setProfile(newProfile)
      autoSave(newProfile)
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    const newProfile = {
      ...profile,
      specialties: profile.specialties.filter((s) => s !== specialty),
    }
    setProfile(newProfile)
    autoSave(newProfile)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL for the uploaded image
      const imageUrl = URL.createObjectURL(file)
      const newProfile = { ...profile, profileImage: imageUrl }
      setProfile(newProfile)
      autoSave(newProfile)
      // TODO: Upload to backend storage and get permanent URL
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      const newProfile = { ...profile, bannerImage: imageUrl }
      setProfile(newProfile)
      autoSave(newProfile)
      // TODO: Upload to backend storage and get permanent URL
    }
  }

  const getInitials = () => {
    const first = profile.firstName?.[0] || ''
    const last = profile.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'CO'
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Main Content - 2/3 + 1/3 layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
        {/* Left Column - Profile Card (takes 2 columns on lg) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="lg:flex-1 flex flex-col overflow-hidden py-0">
            <CardContent className="p-0 flex-1">
              {/* Banner Image Upload with Overlapping Profile Picture */}
              <div className="relative">
                {/* Banner */}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  className="relative w-full group cursor-pointer"
                >
                  <div className="w-full h-32 sm:h-40 overflow-hidden">
                    {profile.bannerImage ? (
                      <img
                        src={profile.bannerImage}
                        alt="Profile banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10">
                        <ImageIcon className="h-8 w-8 text-primary/50" />
                        <span className="text-sm text-primary/70 mt-2">
                          Click to upload a banner
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Upload overlay on hover */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                    <span className="text-white text-sm mt-1">
                      {profile.bannerImage ? 'Change Banner' : 'Upload Banner'}
                    </span>
                  </div>
                </button>

                {/* View Public Profile button - floating on banner */}
                {viewMode === 'coach' && (
                  <Link href={`/coaches/c9a1f8e2-3b4d-5c6e-7f8a-9b0c1d2e3f4a`} className="absolute top-3 right-3 z-10">
                    <Button variant="secondary" size="sm" className="gap-1.5 shadow-md">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Public Profile
                    </Button>
                  </Link>
                )}

                {/* Gradient overlay at bottom of banner */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
              </div>

              {/* Profile Picture & Basic Info - Overlapping */}
              <div className="relative -mt-12 px-6 pb-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Avatar with Upload Overlay */}
                  <div className="flex flex-col items-center sm:items-start">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="relative group cursor-pointer"
                    >
                      <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-lg">
                        <AvatarImage src={profile.profileImage || undefined} />
                        <AvatarFallback className="text-2xl sm:text-3xl bg-primary text-primary-foreground">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Upload overlay - always visible when no photo, hover when photo exists */}
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 transition-opacity ${
                          profile.profileImage
                            ? 'opacity-0 group-hover:opacity-100'
                            : 'opacity-100'
                        }`}
                      >
                        <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        <span className="text-white text-xs mt-1">
                          {profile.profileImage ? 'Change' : 'Upload'}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Name, Location & Contact */}
                  <div className="flex-1 space-y-4 pt-2 sm:pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={profile.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={profile.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          readOnly
                          className="pl-9 bg-muted cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={profile.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City, State"
                        value={profile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {/* Rest of form content */}
              <div className="px-6 pb-6 space-y-6">
              <Separator />

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder={
                    viewMode === 'coach'
                      ? 'Tell potential students about yourself, your experience, and coaching philosophy...'
                      : 'Tell us a bit about yourself and your athletic interests...'
                  }
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="min-h-[120px] lg:min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  {profile.bio.length}/500 characters
                </p>
              </div>

              <Separator />

              {/* Social Media */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Social Media & Website</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-xs text-muted-foreground">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="instagram"
                        placeholder="@username"
                        value={profile.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-xs text-muted-foreground">Twitter / X</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="twitter"
                        placeholder="@username"
                        value={profile.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-xs text-muted-foreground">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        placeholder="linkedin.com/in/username"
                        value={profile.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="text-xs text-muted-foreground">TikTok</Label>
                    <div className="relative">
                      <TikTokIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="tiktok"
                        placeholder="@username"
                        value={profile.tiktok}
                        onChange={(e) => handleInputChange('tiktok', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="text-xs text-muted-foreground">YouTube</Label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="youtube"
                        placeholder="@channelname"
                        value={profile.youtube}
                        onChange={(e) => handleInputChange('youtube', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-xs text-muted-foreground">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="www.yourwebsite.com"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Card - Only on mobile/tablet, moves to right column on lg */}
          {viewMode === 'coach' && (
            <Card className="lg:hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" />
                  Specialties & Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specialties */}
                <div className="space-y-3">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="gap-1 pr-1">
                        {specialty}
                        <button
                          onClick={() => handleRemoveSpecialty(specialty)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSpecialtyPicker(!showSpecialtyPicker)}
                      className="h-6 gap-1 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                  {showSpecialtyPicker && (
                    <div className="rounded-lg border p-3 mt-2">
                      <p className="text-sm font-medium mb-2">Select specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableSpecialties
                          .filter((s) => !profile.specialties.includes(s))
                          .map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent"
                              onClick={() => handleAddSpecialty(specialty)}
                            >
                              {specialty}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Services Overview (Read-only) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Services & Pricing</Label>
                    <Link href="/studio?tab=services">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary">
                        Manage in Studio
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                  {services.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center">
                      <p className="text-sm text-muted-foreground">No services configured yet</p>
                      <Link href="/studio?tab=services">
                        <Button variant="outline" size="sm" className="mt-2 gap-1">
                          <Plus className="h-3 w-3" />
                          Add Services
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid gap-2">
                        {visibleServices.map((service) => (
                          <div
                            key={service.id}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {service.type === 'session' && <Clock className="h-4 w-4 text-muted-foreground" />}
                                {service.type === 'program' && <CalendarRange className="h-4 w-4 text-muted-foreground" />}
                                {service.type === 'custom' && <Sparkles className="h-4 w-4 text-muted-foreground" />}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{service.name}</p>
                                    {service.bundle && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
                                        <CreditCard className="h-2.5 w-2.5" />
                                        Bundle
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {service.type === 'session' && `${service.duration} min`}
                                    {service.type === 'program' && `${service.duration} weeks`}
                                    {service.type === 'custom' && (service.duration ? `${service.duration} min` : 'Custom')}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-semibold">${service.price}</p>
                            </div>
                            {service.bundle && (
                              <p className="text-xs text-green-600 mt-2 ml-7">
                                Bundle: {service.bundle.credits} for ${service.bundle.price}
                                {service.bundle.expirationMonths && ` • ${service.bundle.expirationMonths} mo`}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {hasMoreServices && (
                        <button
                          onClick={() => setShowAllServices(!showAllServices)}
                          className="flex w-full items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showAllServices ? (
                            <>
                              Show less
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              +{services.length - MAX_VISIBLE_SERVICES} more services
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Card - Only on mobile/tablet, moves to right column on lg */}
          {viewMode === 'coach' && (
            <Card className="lg:hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" />
                    Student Reviews
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({mockReviews.length})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.studentAvatar} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {review.studentName.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{review.studentName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs px-1.5 py-0">{review.sport}</Badge>
                            <span>
                              {new Date(review.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{review.comment}</p>
                  </div>
                ))}
                {mockReviews.length > 4 && (
                  <Button variant="outline" className="w-full">View All Reviews</Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Services & Reviews (only on lg screens for coach) */}
        {viewMode === 'coach' && (
          <div className="hidden lg:flex lg:flex-col lg:gap-6">
            {/* Services Card - fixed height based on content */}
            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" />
                  Specialties & Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specialties */}
                <div className="space-y-3">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="gap-1 pr-1">
                        {specialty}
                        <button
                          onClick={() => handleRemoveSpecialty(specialty)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSpecialtyPicker(!showSpecialtyPicker)}
                      className="h-6 gap-1 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                  {showSpecialtyPicker && (
                    <div className="rounded-lg border p-3 mt-2">
                      <p className="text-sm font-medium mb-2">Select specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableSpecialties
                          .filter((s) => !profile.specialties.includes(s))
                          .map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent"
                              onClick={() => handleAddSpecialty(specialty)}
                            >
                              {specialty}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Services Overview (Read-only) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Services & Pricing</Label>
                    <Link href="/studio?tab=services">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary">
                        Manage
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                  {services.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center">
                      <p className="text-sm text-muted-foreground">No services yet</p>
                      <Link href="/studio?tab=services">
                        <Button variant="outline" size="sm" className="mt-2 gap-1">
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visibleServices.map((service) => (
                        <div
                          key={service.id}
                          className="rounded-lg border p-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {service.type === 'session' && <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                              {service.type === 'program' && <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />}
                              {service.type === 'custom' && <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-medium">{service.name}</p>
                                  {service.bundle && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5">
                                      <CreditCard className="h-2.5 w-2.5" />
                                      Bundle
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {service.type === 'session' && `${service.duration} min`}
                                  {service.type === 'program' && `${service.duration} wks`}
                                  {service.type === 'custom' && (service.duration ? `${service.duration} min` : 'Custom')}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold">${service.price}</p>
                          </div>
                          {service.bundle && (
                            <p className="text-[10px] text-green-600 mt-1.5 ml-5">
                              {service.bundle.credits} for ${service.bundle.price}
                              {service.bundle.expirationMonths && ` • ${service.bundle.expirationMonths} mo`}
                            </p>
                          )}
                        </div>
                      ))}
                      {hasMoreServices && (
                        <button
                          onClick={() => setShowAllServices(!showAllServices)}
                          className="flex w-full items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showAllServices ? (
                            <>
                              Less
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              +{services.length - MAX_VISIBLE_SERVICES} more
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Card - grows to fill remaining space */}
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" />
                    Reviews
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">4.8</span>
                    <span className="text-xs text-muted-foreground">({mockReviews.length})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3 overflow-auto">
                {mockReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.studentAvatar} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {review.studentName.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{review.studentName}</p>
                          <p className="text-xs text-muted-foreground">{review.sport}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
                  </div>
                ))}
                {mockReviews.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full mt-auto flex-shrink-0">
                    View All {mockReviews.length} Reviews
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
