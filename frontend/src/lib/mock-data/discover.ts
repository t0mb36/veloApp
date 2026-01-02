// Discover page mock data

export interface DiscoverCoach {
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

// Mock coaches that the current user is working with
export const mockYourCoaches: DiscoverCoach[] = [
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

// Mock recommended coaches
export const mockRecommendedCoaches: DiscoverCoach[] = [
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

// Sport filter options
export const sportFilters = [
  'Tennis',
  'Basketball',
  'Swimming',
  'Golf',
  'Yoga',
  'Boxing',
  'Running',
  'Pickleball',
]
