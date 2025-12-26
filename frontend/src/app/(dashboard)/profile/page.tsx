'use client'

import { useState, useEffect } from 'react'
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
  Globe,
  Plus,
  X,
  Save,
  Briefcase,
  Star,
  MessageSquare,
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

interface CoachProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string
  specialties: string[]
  services: string[]
  hourlyRate: string
  instagram: string
  twitter: string
  linkedin: string
  website: string
  profileImage: string | null
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
    services: [],
    hourlyRate: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    website: '',
    profileImage: null,
  })

  const [newService, setNewService] = useState('')
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false)

  // Pre-populate email from user data
  useEffect(() => {
    if (user?.email) {
      setProfile((prev) => ({ ...prev, email: user.email || '' }))
    }
  }, [user])

  const handleInputChange = (field: keyof CoachProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddSpecialty = (specialty: string) => {
    if (!profile.specialties.includes(specialty)) {
      setProfile((prev) => ({
        ...prev,
        specialties: [...prev.specialties, specialty],
      }))
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }))
  }

  const handleAddService = () => {
    if (newService.trim() && !profile.services.includes(newService.trim())) {
      setProfile((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }))
      setNewService('')
    }
  }

  const handleRemoveService = (service: string) => {
    setProfile((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }))
  }

  const handleSave = () => {
    // TODO: Save to backend
    console.log('Saving profile:', profile)
  }

  const getInitials = () => {
    const first = profile.firstName?.[0] || ''
    const last = profile.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'CO'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            {viewMode === 'coach' ? 'Coach Profile' : 'Student Profile'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'coach'
              ? 'Manage your public coaching profile'
              : 'Manage your personal information'}
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Main Content - 2/3 + 1/3 layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card (takes 2 columns on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture & Basic Info */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48">
                    <AvatarImage src={profile.profileImage || undefined} />
                    <AvatarFallback className="text-3xl sm:text-4xl lg:text-5xl bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-1" />
                    Upload Photo
                  </Button>
                </div>

                {/* Name, Location & Contact */}
                <div className="flex-1 space-y-4">
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

                {/* Services Offered */}
                <div className="space-y-3">
                  <Label>Services Offered</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service) => (
                      <Badge key={service} variant="secondary" className="gap-1 pr-1">
                        {service}
                        <button
                          onClick={() => handleRemoveService(service)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="e.g., Private lessons, Group classes"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddService}
                      disabled={!newService.trim()}
                      className="sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden">Add Service</span>
                    </Button>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate-mobile">Hourly Rate</Label>
                  <div className="relative w-full sm:w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="hourlyRate-mobile"
                      type="number"
                      placeholder="0"
                      value={profile.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className="pl-7"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/hr</span>
                  </div>
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
            {/* Services Card */}
            <Card>
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

                {/* Services Offered */}
                <div className="space-y-3">
                  <Label>Services Offered</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service) => (
                      <Badge key={service} variant="secondary" className="gap-1 pr-1">
                        {service}
                        <button
                          onClick={() => handleRemoveService(service)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g., Private lessons, Group classes"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddService}
                      disabled={!newService.trim()}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Service
                    </Button>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate-desktop">Hourly Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="hourlyRate-desktop"
                      type="number"
                      placeholder="0"
                      value={profile.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className="pl-7"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/hr</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Card */}
            <Card>
              <CardHeader>
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
              <CardContent className="space-y-3">
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
                  <Button variant="outline" size="sm" className="w-full">
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
