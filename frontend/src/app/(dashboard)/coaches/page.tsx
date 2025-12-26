'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Star,
  MapPin,
  MessageSquare,
  Calendar,
  Users,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useViewMode } from '@/contexts/view-mode-context'
import { cn } from '@/lib/utils'

// Mock data for coaches
interface Coach {
  id: string
  name: string
  image: string // Required for coaches
  specialties: string[]
  rating: number
  reviewCount: number
  location: string
  hourlyRate: number
  bio: string
  isYourCoach?: boolean
}

// Placeholder images using UI Avatars service (would be real photos in production)
const mockYourCoaches: Coach[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop',
    specialties: ['Tennis', 'Pickleball'],
    rating: 4.9,
    reviewCount: 47,
    location: 'San Francisco, CA',
    hourlyRate: 85,
    bio: 'Former college tennis player with 10+ years of coaching experience.',
    isYourCoach: true,
  },
  {
    id: '2',
    name: 'Mike Chen',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop',
    specialties: ['Basketball', 'Strength Training'],
    rating: 4.8,
    reviewCount: 32,
    location: 'San Francisco, CA',
    hourlyRate: 75,
    bio: 'Certified personal trainer specializing in basketball performance.',
    isYourCoach: true,
  },
  {
    id: '7',
    name: 'Rachel Kim',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop',
    specialties: ['Running', 'Marathon'],
    rating: 4.9,
    reviewCount: 38,
    location: 'San Francisco, CA',
    hourlyRate: 70,
    bio: 'Boston Marathon qualifier and certified running coach.',
    isYourCoach: true,
  },
]

const mockRecommendedCoaches: Coach[] = [
  {
    id: '3',
    name: 'Emily Davis',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
    specialties: ['Swimming', 'Triathlon'],
    rating: 4.9,
    reviewCount: 58,
    location: 'Oakland, CA',
    hourlyRate: 90,
    bio: 'Olympic trials qualifier and certified swim instructor.',
  },
  {
    id: '4',
    name: 'James Wilson',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=500&fit=crop',
    specialties: ['Golf'],
    rating: 4.7,
    reviewCount: 29,
    location: 'Palo Alto, CA',
    hourlyRate: 120,
    bio: 'PGA certified instructor with 15 years of teaching experience.',
  },
  {
    id: '5',
    name: 'Lisa Park',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop',
    specialties: ['Yoga', 'Pilates'],
    rating: 5.0,
    reviewCount: 64,
    location: 'San Jose, CA',
    hourlyRate: 65,
    bio: 'RYT-500 certified yoga instructor focused on mindful movement.',
  },
  {
    id: '6',
    name: 'David Martinez',
    image: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=500&fit=crop',
    specialties: ['Boxing', 'Martial Arts'],
    rating: 4.8,
    reviewCount: 41,
    location: 'San Francisco, CA',
    hourlyRate: 80,
    bio: 'Professional boxing coach with competitive fighting background.',
  },
]

const sportFilters = [
  'All',
  'Tennis',
  'Basketball',
  'Swimming',
  'Golf',
  'Yoga',
  'Boxing',
  'Running',
]

interface CoachTradingCardProps {
  coach: Coach
}

// Trading card style component for "Your Coaches" carousel
function CoachTradingCard({ coach }: CoachTradingCardProps) {
  return (
    <Card className="w-48 shrink-0 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Coach Image - Front and Center */}
      <div className="relative w-full h-[320px] overflow-hidden bg-gradient-to-b from-primary/10 to-primary/5">
        <img
          src={coach.image}
          alt={coach.name}
          className="w-full h-full object-cover"
        />
        {/* Rating Badge Overlay */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-white">{coach.rating}</span>
        </div>
        {/* Price Badge Overlay */}
        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5">
          <span className="text-xs font-semibold">${coach.hourlyRate}/hr</span>
        </div>
      </div>

      {/* Coach Info */}
      <CardContent className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm truncate">{coach.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{coach.location}</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 max-h-[32px] overflow-hidden">
          {coach.specialties.slice(0, 2).map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-[10px] px-1.5 py-0 truncate max-w-[90px]">
              {specialty}
            </Badge>
          ))}
          {coach.specialties.length > 2 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{coach.specialties.length - 2}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 pt-1">
          <Button size="sm" className="flex-1 h-7 text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Book
          </Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
            <MessageSquare className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface CoachCardProps {
  coach: Coach
}

// Standard card for recommended coaches grid
function CoachCard({ coach }: CoachCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Coach Image */}
        <div className="w-28 sm:w-32 shrink-0">
          <img
            src={coach.image}
            alt={coach.name}
            className="w-full h-full object-cover aspect-[3/4]"
          />
        </div>

        {/* Coach Info */}
        <CardContent className="p-3 flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">{coach.name}</h3>
              <div className="flex items-center gap-0.5 shrink-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{coach.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{coach.location}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {coach.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {specialty}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{coach.bio}</p>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-sm font-semibold text-primary">${coach.hourlyRate}/hr</span>
            <div className="flex gap-1.5">
              <Button size="sm" className="h-7 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Book
              </Button>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                <MessageSquare className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export default function CoachesPage() {
  const { viewMode } = useViewMode()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const carouselRef = useRef<HTMLDivElement>(null)

  // Filter coaches based on search and sport filter
  const filterCoaches = (coaches: Coach[]) => {
    return coaches.filter((coach) => {
      const matchesSearch =
        searchQuery === '' ||
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        coach.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        selectedFilter === 'All' || coach.specialties.includes(selectedFilter)

      return matchesSearch && matchesFilter
    })
  }

  const filteredYourCoaches = filterCoaches(mockYourCoaches)
  const filteredRecommendedCoaches = filterCoaches(mockRecommendedCoaches)

  // Carousel scroll handlers
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200 // Width of one card + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // Show message if in coach mode
  if (viewMode === 'coach') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Coach View</h1>
        <p className="text-muted-foreground max-w-md">
          The Coaches page is available when you&apos;re in Student mode.
          Switch to Student mode using the toggle at the bottom of the sidebar to find and connect with coaches.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Find Coaches</h1>
        <p className="text-sm text-muted-foreground">
          Discover and connect with coaches in your area
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, sport, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {sportFilters.map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
            className="shrink-0"
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Your Coaches Section - Horizontal Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Your Coaches</h2>
            <Badge variant="secondary">{filteredYourCoaches.length}</Badge>
          </div>
          {filteredYourCoaches.length > 2 && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scrollCarousel('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scrollCarousel('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {filteredYourCoaches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              <p>No coaches found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredYourCoaches.map((coach) => (
              <div key={coach.id} className="snap-start">
                <CoachTradingCard coach={coach} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Coaches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recommended for You</h2>
          <span className="text-sm text-muted-foreground">
            {filteredRecommendedCoaches.length} coaches
          </span>
        </div>

        {filteredRecommendedCoaches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <p>No coaches found matching your search.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedFilter('All')
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredRecommendedCoaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
