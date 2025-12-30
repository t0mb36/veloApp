'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CoachPreviewModal } from '@/components/coach-preview/coach-preview-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapboxMap, MapMarker } from '@/components/map/mapbox-map'
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
  Sparkles,
  ChevronDown,
  Check,
  DollarSign,
  LayoutGrid,
  Map,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Unified Coach interface with map coordinates
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
  latitude: number
  longitude: number
}

// Mock data for coaches with coordinates (using UUIDs) - Santa Monica / Venice Beach area
const mockYourCoaches: Coach[] = [
  {
    id: 'c9a1f8e2-3b4d-5c6e-7f8a-9b0c1d2e3f4a',
    name: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop',
    specialties: ['Tennis', 'Pickleball'],
    rating: 4.9,
    reviewCount: 127,
    location: 'Santa Monica, CA',
    hourlyRate: 85,
    bio: 'Former college tennis player with 10+ years of coaching experience.',
    isYourCoach: true,
    latitude: 34.0195,
    longitude: -118.4912,
  },
  {
    id: 'd8b2e9f3-4c5e-6d7f-8a9b-0c1d2e3f4a5b',
    name: 'Mike Chen',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop',
    specialties: ['Basketball', 'Strength Training'],
    rating: 4.8,
    reviewCount: 89,
    location: 'Venice Beach, CA',
    hourlyRate: 75,
    bio: 'Certified personal trainer specializing in basketball performance.',
    isYourCoach: true,
    latitude: 33.9850,
    longitude: -118.4695,
  },
]

const mockRecommendedCoaches: Coach[] = [
  {
    id: 'e7c3f0a4-5d6f-7e8a-9b0c-1d2e3f4a5b6c',
    name: 'Emily Davis',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
    specialties: ['Swimming', 'Triathlon'],
    rating: 4.9,
    reviewCount: 156,
    location: 'Marina del Rey, CA',
    hourlyRate: 90,
    bio: 'Olympic trials qualifier and certified swim instructor.',
    latitude: 33.9802,
    longitude: -118.4517,
  },
  {
    id: 'f6d4a1b5-6e7a-8f9b-0c1d-2e3f4a5b6c7d',
    name: 'James Wilson',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=500&fit=crop',
    specialties: ['Golf'],
    rating: 4.7,
    reviewCount: 203,
    location: 'Pacific Palisades, CA',
    hourlyRate: 120,
    bio: 'PGA certified instructor with 15 years of teaching experience.',
    latitude: 34.0459,
    longitude: -118.5301,
  },
  {
    id: 'a5e5b2c6-7f8b-9a0c-1d2e-3f4a5b6c7d8e',
    name: 'Lisa Park',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop',
    specialties: ['Yoga', 'Pilates'],
    rating: 5.0,
    reviewCount: 178,
    location: 'Playa del Rey, CA',
    hourlyRate: 65,
    bio: 'RYT-500 certified yoga instructor focused on mindful movement.',
    latitude: 33.9575,
    longitude: -118.4426,
  },
]

const sportFilters = [
  'Tennis',
  'Basketball',
  'Swimming',
  'Golf',
  'Yoga',
  'Boxing',
  'Running',
  'Pickleball',
]

// Trading card style component for "Your Coaches" carousel
function CoachTradingCard({ coach, onClick }: { coach: Coach; onClick: (e: React.MouseEvent<HTMLDivElement>) => void }) {
  return (
    <Card
      className="w-48 shrink-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative w-full h-[320px] overflow-hidden bg-gradient-to-b from-primary/10 to-primary/5">
        <img
          src={coach.image}
          alt={coach.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-white">{coach.rating}</span>
        </div>
        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5">
          <span className="text-xs font-semibold">${coach.hourlyRate}/hr</span>
        </div>
      </div>
      <CardContent className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm truncate">{coach.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{coach.location}</span>
          </div>
        </div>
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
        <div className="flex gap-1.5 pt-1">
          <Button
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              // Direct booking - would go to booking flow
            }}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Book
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageSquare className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Grid card for recommended coaches
function CoachCard({ coach, onClick }: { coach: Coach; onClick: (e: React.MouseEvent<HTMLDivElement>) => void }) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-primary/10 to-primary/5">
        <img
          src={coach.image}
          alt={coach.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-white">{coach.rating}</span>
          <span className="text-xs text-white/70">({coach.reviewCount})</span>
        </div>
        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground rounded-full px-2.5 py-1">
          <span className="text-sm font-semibold">${coach.hourlyRate}/hr</span>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base truncate">{coach.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{coach.location}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {coach.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{coach.bio}</p>
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              // Direct booking - would go to booking flow
            }}
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            Book Session
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="px-3"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Selected coach panel for map view
function SelectedCoachPanel({ coach, onClose }: { coach: Coach; onClose: () => void }) {
  return (
    <Card className="absolute bottom-4 left-4 w-80 z-10 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link href={`/coaches/${coach.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={coach.image}
              alt={coach.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <CardTitle className="text-base">{coach.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{coach.location}</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{coach.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({coach.reviewCount} reviews)</span>
          <span className="text-sm font-semibold text-primary ml-auto">${coach.hourlyRate}/hr</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {coach.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{coach.bio}</p>
        <div className="flex gap-2">
          <Link href={`/coaches/${coach.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              View Profile
            </Button>
          </Link>
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DiscoverPage() {
  // View toggle state
  const [viewType, setViewType] = useState<'grid' | 'map'>('grid')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [locationFilter, setLocationFilter] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [minRating, setMinRating] = useState(0)

  // Map state
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)

  // Preview modal state
  const [previewCoach, setPreviewCoach] = useState<Coach | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)

  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null)

  // Handle opening the preview modal
  const handleCoachClick = useCallback((coach: Coach, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTriggerRect(rect)
    setPreviewCoach(coach)
    setIsPreviewOpen(true)
  }, [])

  // Handle closing the preview modal
  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false)
    // Delay clearing coach data for exit animation
    setTimeout(() => {
      setPreviewCoach(null)
      setTriggerRect(null)
    }, 800)
  }, [])

  // Filter coaches
  const filterCoaches = (coaches: Coach[]) => {
    return coaches.filter((coach) => {
      const matchesSearch =
        searchQuery === '' ||
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        coach.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.bio.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSport =
        selectedSports.length === 0 ||
        coach.specialties.some((s) => selectedSports.includes(s))

      const matchesLocation =
        locationFilter === '' ||
        coach.location.toLowerCase().includes(locationFilter.toLowerCase())

      const matchesPrice =
        coach.hourlyRate >= priceRange[0] &&
        (priceRange[1] === 200 || coach.hourlyRate <= priceRange[1])

      const matchesRating = coach.rating >= minRating

      return matchesSearch && matchesSport && matchesLocation && matchesPrice && matchesRating
    })
  }

  const filteredYourCoaches = filterCoaches(mockYourCoaches)
  const filteredRecommendedCoaches = filterCoaches(mockRecommendedCoaches)
  const allFilteredCoaches = [...filteredYourCoaches, ...filteredRecommendedCoaches]

  // Convert coaches to map markers with full data for enhanced display
  const mapMarkers: MapMarker[] = allFilteredCoaches.map((coach) => ({
    id: coach.id,
    longitude: coach.longitude,
    latitude: coach.latitude,
    type: 'coach' as const,
    title: coach.name,
    subtitle: coach.specialties.join(', '),
    rating: coach.rating,
    reviewCount: coach.reviewCount,
    specialties: coach.specialties,
    image: coach.image,
    hourlyRate: coach.hourlyRate,
    bio: coach.bio,
  }))

  // Carousel scroll handlers
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // Toggle filter selection
  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedSports([])
    setSearchQuery('')
    setLocationFilter('')
    setPriceRange([0, 200])
    setMinRating(0)
  }

  // Handle map marker click
  const handleMarkerClick = (marker: MapMarker) => {
    const coach = allFilteredCoaches.find((c) => c.id === marker.id)
    if (coach) {
      setSelectedCoach(coach)
    }
  }

  // Count active filters
  const activeFilterCount =
    selectedSports.length +
    (locationFilter ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0) +
    (minRating > 0 ? 1 : 0)

  // Search bar component for grid view
  const SearchHeader = () => (
    <div className="shrink-0 pb-4">
      {/* Search Bar with View Toggle and Filter */}
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Try: 'Tennis coach in San Francisco' or 'Yoga for beginners'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full h-12 pl-12 pr-32 rounded-xl border border-input bg-background',
              'text-base placeholder:text-muted-foreground/70',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-all'
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Smart Search</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-xl border p-1 bg-background">
          <Button
            variant={viewType === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-10 px-3 rounded-lg"
            onClick={() => setViewType('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === 'map' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-10 px-3 rounded-lg"
            onClick={() => setViewType('map')}
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant={isFilterOpen ? 'default' : 'outline'}
          className={cn(
            'h-12 px-5 gap-2 rounded-xl shrink-0',
            activeFilterCount > 0 && !isFilterOpen && 'border-primary'
          )}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge
              variant={isFilterOpen ? 'outline' : 'secondary'}
              className="ml-1 h-5 px-1.5 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isFilterOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Expanded Filter Panel */}
      {isFilterOpen && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filter Coaches</h3>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground h-8"
                >
                  Clear all filters
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sports Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Sports
                </label>
                <div className="flex flex-wrap gap-2">
                  {sportFilters.map((sport) => (
                    <Badge
                      key={sport}
                      variant={selectedSports.includes(sport) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => toggleSport(sport)}
                    >
                      {sport}
                      {selectedSports.includes(sport) && (
                        <Check className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="City or area..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={cn(
                      'w-full h-9 px-3 rounded-md border border-input bg-background',
                      'text-sm placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring'
                    )}
                  />
                  {locationFilter && (
                    <button
                      onClick={() => setLocationFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0] || ''}
                      onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                      className={cn(
                        'w-full h-9 pl-6 pr-2 rounded-md border border-input bg-background',
                        'text-sm placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring'
                      )}
                    />
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1] === 200 ? '' : priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 200])}
                      className={cn(
                        'w-full h-9 pl-6 pr-2 rounded-md border border-input bg-background',
                        'text-sm placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring'
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  Minimum Rating
                </label>
                <div className="flex gap-1">
                  {[0, 3, 3.5, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={cn(
                        'flex-1 h-9 rounded-md border text-sm font-medium transition-colors',
                        minRating === rating
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-input bg-background hover:bg-accent'
                      )}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Active:</span>
                {selectedSports.map((sport) => (
                  <Badge
                    key={sport}
                    variant="secondary"
                    className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => toggleSport(sport)}
                  >
                    {sport}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {locationFilter && (
                  <Badge
                    variant="secondary"
                    className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setLocationFilter('')}
                  >
                    {locationFilter}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 200) && (
                  <Badge
                    variant="secondary"
                    className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setPriceRange([0, 200])}
                  >
                    ${priceRange[0]} - ${priceRange[1] === 200 ? '200+' : priceRange[1]}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge
                    variant="secondary"
                    className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setMinRating(0)}
                  >
                    {minRating}+ rating
                    <X className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Grid View
  if (viewType === 'grid') {
    return (
      <div className="flex flex-col h-full">
        <SearchHeader />

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
          {/* Your Coaches Section - Horizontal Carousel */}
          {filteredYourCoaches.length > 0 && (
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

              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredYourCoaches.map((coach) => (
                  <div key={coach.id} className="snap-start">
                    <CoachTradingCard
                      coach={coach}
                      onClick={(e) => handleCoachClick(coach, e)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Coaches Section - Grid */}
          <div className="space-y-4 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {filteredYourCoaches.length > 0 ? 'Recommended for You' : 'All Coaches'}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredRecommendedCoaches.length} coaches
              </span>
            </div>

            {filteredRecommendedCoaches.length === 0 && filteredYourCoaches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-1">No coaches found</p>
                  <p className="text-sm mb-4">Try adjusting your search or filters</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRecommendedCoaches.map((coach) => (
                  <CoachCard
                    key={coach.id}
                    coach={coach}
                    onClick={(e) => handleCoachClick(coach, e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coach Preview Modal */}
        <CoachPreviewModal
          coach={previewCoach}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          triggerRect={triggerRect}
        />
      </div>
    )
  }

  // Map View - Full screen map filling the content area
  // Use negative margins to cancel parent padding (p-6 = 1.5rem on md+)
  return (
    <div className="relative w-[calc(100%+3rem)] h-[calc(100%+3rem)] -m-6">
      {/* Full-screen Map */}
      <MapboxMap
        className="absolute inset-0 h-full w-full"
        markers={mapMarkers}
        onMarkerClick={handleMarkerClick}
      />

      {/* Search Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-10">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Try: 'Tennis coach in San Francisco' or 'Yoga for beginners'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full h-12 pl-12 pr-32 rounded-xl border border-input bg-background',
                'text-base placeholder:text-muted-foreground/70',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-all shadow-lg'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <Sparkles className="h-3 w-3" />
                <span className="hidden sm:inline">Smart Search</span>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border p-1 bg-background shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3 rounded-lg"
              onClick={() => setViewType('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-10 px-3 rounded-lg"
              onClick={() => setViewType('map')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant={isFilterOpen ? 'default' : 'outline'}
            className={cn(
              'h-12 px-5 gap-2 rounded-xl shrink-0 shadow-lg bg-background',
              activeFilterCount > 0 && !isFilterOpen && 'border-primary'
            )}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge
                variant={isFilterOpen ? 'outline' : 'secondary'}
                className="ml-1 h-5 px-1.5 text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isFilterOpen && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Expanded Filter Panel */}
        {isFilterOpen && (
          <Card className="mt-4 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filter Coaches</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground h-8"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sports Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Sports
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sportFilters.map((sport) => (
                      <Badge
                        key={sport}
                        variant={selectedSports.includes(sport) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => toggleSport(sport)}
                      >
                        {sport}
                        {selectedSports.includes(sport) && (
                          <Check className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="City or area..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className={cn(
                        'w-full h-9 px-3 rounded-md border border-input bg-background',
                        'text-sm placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring'
                      )}
                    />
                    {locationFilter && (
                      <button
                        onClick={() => setLocationFilter('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0] || ''}
                        onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                        className={cn(
                          'w-full h-9 pl-6 pr-2 rounded-md border border-input bg-background',
                          'text-sm placeholder:text-muted-foreground',
                          'focus:outline-none focus:ring-2 focus:ring-ring'
                        )}
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1] === 200 ? '' : priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 200])}
                        className={cn(
                          'w-full h-9 pl-6 pr-2 rounded-md border border-input bg-background',
                          'text-sm placeholder:text-muted-foreground',
                          'focus:outline-none focus:ring-2 focus:ring-ring'
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    Minimum Rating
                  </label>
                  <div className="flex gap-1">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={cn(
                          'flex-1 h-9 rounded-md border text-sm font-medium transition-colors',
                          minRating === rating
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-input bg-background hover:bg-accent'
                        )}
                      >
                        {rating === 0 ? 'Any' : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Active:</span>
                  {selectedSports.map((sport) => (
                    <Badge
                      key={sport}
                      variant="secondary"
                      className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                      onClick={() => toggleSport(sport)}
                    >
                      {sport}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                  {locationFilter && (
                    <Badge
                      variant="secondary"
                      className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                      onClick={() => setLocationFilter('')}
                    >
                      {locationFilter}
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 200) && (
                    <Badge
                      variant="secondary"
                      className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                      onClick={() => setPriceRange([0, 200])}
                    >
                      ${priceRange[0]} - ${priceRange[1] === 200 ? '200+' : priceRange[1]}
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {minRating > 0 && (
                    <Badge
                      variant="secondary"
                      className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                      onClick={() => setMinRating(0)}
                    >
                      {minRating}+ rating
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Coach Panel */}
      {selectedCoach && (
        <SelectedCoachPanel
          coach={selectedCoach}
          onClose={() => setSelectedCoach(null)}
        />
      )}
    </div>
  )
}
