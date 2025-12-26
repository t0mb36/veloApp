'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { MapboxMap, MapMarker } from '@/components/map/mapbox-map'
import {
  Map,
  Search,
  Filter,
  Star,
  MapPin,
  User,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useViewMode } from '@/contexts/view-mode-context'

// Mock data for coaches (for students to find)
const mockCoaches: MapMarker[] = [
  {
    id: 'coach-1',
    longitude: -122.4194,
    latitude: 37.7749,
    type: 'coach',
    title: 'Coach Sarah Johnson',
    subtitle: 'Tennis, Pickleball',
    rating: 4.9,
    specialties: ['Tennis', 'Pickleball'],
  },
  {
    id: 'coach-2',
    longitude: -122.4094,
    latitude: 37.7849,
    type: 'coach',
    title: 'Coach Mike Chen',
    subtitle: 'Basketball, Fitness',
    rating: 4.7,
    specialties: ['Basketball', 'Fitness'],
  },
  {
    id: 'coach-3',
    longitude: -122.4294,
    latitude: 37.7649,
    type: 'coach',
    title: 'Coach Emily Davis',
    subtitle: 'Swimming, Triathlon',
    rating: 4.8,
    specialties: ['Swimming', 'Triathlon'],
  },
]

// Mock data for lesson locations (for coaches)
const mockLocations: MapMarker[] = [
  {
    id: 'loc-1',
    longitude: -122.4150,
    latitude: 37.7700,
    type: 'location',
    title: 'Golden Gate Park Courts',
    subtitle: 'Tennis, Pickleball',
  },
  {
    id: 'loc-2',
    longitude: -122.4250,
    latitude: 37.7800,
    type: 'location',
    title: 'SF Recreation Center',
    subtitle: 'Basketball, Fitness',
  },
]

// Mock data for students who opted in (for coaches)
const mockStudents: MapMarker[] = [
  {
    id: 'student-1',
    longitude: -122.4180,
    latitude: 37.7720,
    type: 'student',
    title: 'Alex Thompson',
    subtitle: 'Looking for tennis lessons',
  },
  {
    id: 'student-2',
    longitude: -122.4220,
    latitude: 37.7780,
    type: 'student',
    title: 'Jordan Lee',
    subtitle: 'Interested in basketball',
  },
]

type FilterType = 'all' | 'coaches' | 'locations' | 'students'

const sportFilters = [
  'All Sports',
  'Tennis',
  'Basketball',
  'Swimming',
  'Fitness',
  'Pickleball',
  'Triathlon',
]

interface SelectedMarkerPanelProps {
  marker: MapMarker
  onClose: () => void
}

function SelectedMarkerPanel({ marker, onClose }: SelectedMarkerPanelProps) {
  return (
    <Card className="absolute bottom-4 left-4 w-80 z-10 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center',
                marker.type === 'coach' && 'bg-blue-500',
                marker.type === 'student' && 'bg-green-500',
                marker.type === 'location' && 'bg-amber-500'
              )}
            >
              {marker.type === 'coach' && <Users className="h-4 w-4 text-white" />}
              {marker.type === 'student' && <User className="h-4 w-4 text-white" />}
              {marker.type === 'location' && <MapPin className="h-4 w-4 text-white" />}
            </div>
            <div>
              <CardTitle className="text-base">{marker.title}</CardTitle>
              {marker.subtitle && (
                <p className="text-sm text-muted-foreground">{marker.subtitle}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {marker.rating && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{marker.rating}</span>
            <span className="text-sm text-muted-foreground">(24 reviews)</span>
          </div>
        )}
        {marker.specialties && marker.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {marker.specialties.map((specialty) => (
              <span
                key={specialty}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            {marker.type === 'coach' ? 'Book Lesson' : 'View Profile'}
          </Button>
          <Button size="sm" variant="outline">
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MapsPage() {
  const { viewMode } = useViewMode()
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedSport, setSelectedSport] = useState('All Sports')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [showFilters, setShowFilters] = useState(true)

  // Get markers based on view mode and filters
  const getFilteredMarkers = (): MapMarker[] => {
    let markers: MapMarker[] = []

    if (viewMode === 'student') {
      // Students see coaches
      if (filterType === 'all' || filterType === 'coaches') {
        markers = [...mockCoaches]
      }
    } else {
      // Coaches see their locations and opted-in students
      if (filterType === 'all' || filterType === 'locations') {
        markers = [...markers, ...mockLocations]
      }
      if (filterType === 'all' || filterType === 'students') {
        markers = [...markers, ...mockStudents]
      }
    }

    // Filter by sport
    if (selectedSport !== 'All Sports') {
      markers = markers.filter(
        (m) =>
          m.specialties?.includes(selectedSport) ||
          m.subtitle?.includes(selectedSport)
      )
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      markers = markers.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.subtitle?.toLowerCase().includes(query)
      )
    }

    return markers
  }

  const markers = getFilteredMarkers()

  return (
    <div className="flex h-full gap-4">
      {/* Filter Panel */}
      <div className={cn('shrink-0 transition-all', showFilters ? 'w-72' : 'w-0')}>
        {showFilters && (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Filter Type */}
              <div className="space-y-2">
                <Label>Show</Label>
                <div className="space-y-1">
                  <Button
                    variant={filterType === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className="w-full justify-start"
                  >
                    All
                  </Button>
                  {viewMode === 'student' ? (
                    <Button
                      variant={filterType === 'coaches' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterType('coaches')}
                      className="w-full justify-start"
                    >
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      Coaches
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={filterType === 'locations' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterType('locations')}
                        className="w-full justify-start"
                      >
                        <MapPin className="h-4 w-4 mr-2 text-amber-500" />
                        My Locations
                      </Button>
                      <Button
                        variant={filterType === 'students' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterType('students')}
                        className="w-full justify-start"
                      >
                        <User className="h-4 w-4 mr-2 text-green-500" />
                        Students Nearby
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Sport Filter */}
              <div className="space-y-2">
                <Label>Sport</Label>
                <div className="space-y-1">
                  {sportFilters.map((sport) => (
                    <Button
                      key={sport}
                      variant={selectedSport === sport ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedSport(sport)}
                      className="w-full justify-start"
                    >
                      {sport}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {markers.length} result{markers.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Map Header */}
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!showFilters && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(true)}
                    className="h-8 w-8"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                )}
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  {viewMode === 'student' ? 'Find Coaches' : 'My Map'}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">Coaches</span>
                  </div>
                  {viewMode === 'coach' && (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-muted-foreground">Locations</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Students</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Map */}
          <CardContent className="flex-1 p-2 min-h-0 relative">
            <MapboxMap
              className="h-full w-full"
              markers={markers}
              onMarkerClick={setSelectedMarker}
            />
            {selectedMarker && (
              <SelectedMarkerPanel
                marker={selectedMarker}
                onClose={() => setSelectedMarker(null)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
