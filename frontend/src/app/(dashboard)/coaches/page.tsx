'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Search,
  Star,
  MapPin,
  MessageSquare,
  Calendar,
  Users,
  Filter,
  X,
} from 'lucide-react'
import { useViewMode } from '@/contexts/view-mode-context'
import { cn } from '@/lib/utils'

// Mock data for coaches
interface Coach {
  id: string
  name: string
  avatar?: string
  specialties: string[]
  rating: number
  reviewCount: number
  location: string
  hourlyRate: number
  bio: string
  isYourCoach?: boolean
}

const mockYourCoaches: Coach[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
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
    specialties: ['Basketball', 'Strength Training'],
    rating: 4.8,
    reviewCount: 32,
    location: 'San Francisco, CA',
    hourlyRate: 75,
    bio: 'Certified personal trainer specializing in basketball performance.',
    isYourCoach: true,
  },
]

const mockRecommendedCoaches: Coach[] = [
  {
    id: '3',
    name: 'Emily Davis',
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

interface CoachCardProps {
  coach: Coach
  compact?: boolean
}

function CoachCard({ coach, compact = false }: CoachCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', compact && 'border-0 shadow-none')}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex gap-4">
          <Avatar className={cn('h-16 w-16', compact && 'h-12 w-12')}>
            <AvatarImage src={coach.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(coach.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={cn('font-semibold', compact ? 'text-sm' : 'text-base')}>
                  {coach.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{coach.location}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{coach.rating}</span>
                  <span className="text-muted-foreground text-sm">({coach.reviewCount})</span>
                </div>
                <p className="text-sm font-medium text-primary">${coach.hourlyRate}/hr</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {coach.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
            {!compact && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{coach.bio}</p>
            )}
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1">
                <Calendar className="h-4 w-4 mr-1" />
                Book
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CoachesPage() {
  const { viewMode } = useViewMode()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')

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

      {/* Your Coaches Section */}
      <Accordion type="single" collapsible defaultValue="your-coaches">
        <AccordionItem value="your-coaches" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Your Coaches</span>
              <Badge variant="secondary" className="ml-2">
                {filteredYourCoaches.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {filteredYourCoaches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No coaches found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-3 pb-2">
                {filteredYourCoaches.map((coach) => (
                  <CoachCard key={coach.id} coach={coach} compact />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
