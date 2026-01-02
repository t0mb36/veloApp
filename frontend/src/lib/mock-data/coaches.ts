import type { PublicCoachProfile, CoachService, AvailabilitySlot, CoachReview, CoachContent } from '@/types/coach'

// UUIDs for coaches (in real app, these would be generated when user signs up)
const COACH_IDS = {
  sarah: 'c9a1f8e2-3b4d-5c6e-7f8a-9b0c1d2e3f4a',
  mike: 'd8b2e9f3-4c5e-6d7f-8a9b-0c1d2e3f4a5b',
  emily: 'e7c3f0a4-5d6f-7e8a-9b0c-1d2e3f4a5b6c',
  james: 'f6d4a1b5-6e7a-8f9b-0c1d-2e3f4a5b6c7d',
  lisa: 'a5e5b2c6-7f8b-9a0c-1d2e-3f4a5b6c7d8e',
}

// Mock coach profiles with full data
export const mockCoachProfiles: Record<string, PublicCoachProfile> = {
  [COACH_IDS.sarah]: {
    id: COACH_IDS.sarah,
    firstName: 'Sarah',
    lastName: 'Johnson',
    bio: 'Professional tennis coach with 15+ years of experience. Former Division I player and certified USPTA Elite Professional. I specialize in helping players of all levels improve their technique, strategy, and mental game. My coaching philosophy focuses on building a strong foundation while making learning fun and engaging.',
    location: 'Santa Monica, CA',
    specialties: ['Tennis', 'Pickleball', 'Fitness'],
    instagram: '@sarahtennis',
    twitter: '@coachsarahj',
    linkedin: 'sarahjohnsontennis',
    tiktok: '@sarahtennis',
    youtube: '@SarahJohnsonTennis',
    website: 'www.sarahjohnsontennis.com',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 85,
    isContactOnly: false,
    isFavorited: false,
    latitude: 34.0195,
    longitude: -118.4912,
  },
  [COACH_IDS.mike]: {
    id: COACH_IDS.mike,
    firstName: 'Mike',
    lastName: 'Chen',
    bio: 'Passionate basketball coach dedicated to player development. 10 years of coaching experience from youth leagues to college prep. I focus on fundamentals, game IQ, and building confidence on the court. Every player has potential - let me help you unlock yours.',
    location: 'Venice Beach, CA',
    specialties: ['Basketball', 'Strength Training', 'Speed & Agility'],
    instagram: '@coachmikehoops',
    tiktok: '@coachmikehoops',
    youtube: '@CoachMikeChen',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 75,
    isContactOnly: false,
    isFavorited: true,
    latitude: 33.9850,
    longitude: -118.4695,
  },
  [COACH_IDS.emily]: {
    id: COACH_IDS.emily,
    firstName: 'Emily',
    lastName: 'Davis',
    bio: 'Elite swimming and triathlon coach. Former Olympic trials qualifier with a passion for endurance sports. I work with athletes from beginners to competitive triathletes. My data-driven approach combines technique refinement with smart training periodization.',
    location: 'Marina del Rey, CA',
    specialties: ['Swimming', 'Triathlon', 'Open Water'],
    instagram: '@emilydavisswim',
    twitter: '@coachemilyd',
    youtube: '@EmilyDavisTriathlon',
    website: 'www.emilydavistriathlon.com',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200',
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 90,
    isContactOnly: false,
    isFavorited: false,
    latitude: 33.9802,
    longitude: -118.4517,
  },
  [COACH_IDS.james]: {
    id: COACH_IDS.james,
    firstName: 'James',
    lastName: 'Wilson',
    bio: 'PGA-certified golf instructor with 20+ years teaching experience. I have worked with beginners to tour professionals and love helping golfers of all skill levels improve their game. My teaching combines traditional techniques with modern technology like TrackMan analysis.',
    location: 'Pacific Palisades, CA',
    specialties: ['Golf'],
    instagram: '@jameswilsongolf',
    linkedin: 'jameswilsonpga',
    website: 'www.jameswilsongolf.com',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
    rating: 4.7,
    reviewCount: 203,
    hourlyRate: 120,
    isContactOnly: true,
    isFavorited: false,
    latitude: 34.0459,
    longitude: -118.5301,
  },
  [COACH_IDS.lisa]: {
    id: COACH_IDS.lisa,
    firstName: 'Lisa',
    lastName: 'Park',
    bio: 'Certified yoga and Pilates instructor focused on mind-body wellness. 12 years of teaching experience with specializations in Vinyasa, Hatha, and therapeutic yoga. I believe in creating a safe, inclusive space where every body can thrive.',
    location: 'Playa del Rey, CA',
    specialties: ['Yoga', 'Pilates', 'Meditation'],
    instagram: '@lisaparkyoga',
    website: 'www.lisaparkyoga.com',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200',
    rating: 5.0,
    reviewCount: 178,
    hourlyRate: 65,
    isContactOnly: false,
    isFavorited: false,
    latitude: 33.9575,
    longitude: -118.4426,
  },
}

// Mock services per coach
export const mockCoachServices: Record<string, CoachService[]> = {
  [COACH_IDS.sarah]: [
    {
      id: 's1-1',
      name: 'Private Tennis Lesson',
      type: 'session',
      price: 85,
      duration: 60,
      durationUnit: 'minutes',
      bundle: {
        credits: 10,
        price: 750,
        expirationMonths: 6,
      },
      description: 'One-on-one personalized tennis coaching tailored to your skill level and goals.',
      isActive: true,
    },
    {
      id: 's1-2',
      name: 'Group Tennis Clinic',
      type: 'group',
      price: 45,
      duration: 90,
      durationUnit: 'minutes',
      maxSeats: 4,
      description: 'Small group session focusing on drills and match play.',
      isActive: true,
    },
    {
      id: 's1-3',
      name: '8-Week Tennis Intensive',
      type: 'program',
      price: 599,
      duration: 8,
      durationUnit: 'weeks',
      description: 'Comprehensive training program with 2 sessions per week, video analysis, and match strategy.',
      isActive: true,
    },
  ],
  [COACH_IDS.mike]: [
    {
      id: 's2-1',
      name: 'Basketball Skills Training',
      type: 'session',
      price: 75,
      duration: 60,
      durationUnit: 'minutes',
      bundle: {
        credits: 5,
        price: 350,
      },
      description: 'Individual training focusing on ball handling, shooting, and footwork.',
      isActive: true,
    },
    {
      id: 's2-2',
      name: 'Strength & Conditioning',
      type: 'session',
      price: 65,
      duration: 45,
      durationUnit: 'minutes',
      description: 'Athletic performance training to improve speed, power, and endurance.',
      isActive: true,
    },
    {
      id: 's2-3',
      name: 'Group Basketball Camp',
      type: 'group',
      price: 40,
      duration: 90,
      durationUnit: 'minutes',
      maxSeats: 8,
      description: 'Team-style training session with game scenarios and competitive drills.',
      isActive: true,
    },
  ],
  [COACH_IDS.emily]: [
    {
      id: 's3-1',
      name: 'Private Swim Lesson',
      type: 'session',
      price: 90,
      duration: 60,
      durationUnit: 'minutes',
      bundle: {
        credits: 10,
        price: 800,
        expirationMonths: 4,
      },
      description: 'Personalized swimming instruction for technique improvement and endurance.',
      isActive: true,
    },
    {
      id: 's3-2',
      name: 'Triathlon Training Plan',
      type: 'program',
      price: 899,
      duration: 12,
      durationUnit: 'weeks',
      description: 'Complete triathlon preparation including swim, bike, and run coaching.',
      isActive: true,
    },
  ],
  [COACH_IDS.james]: [
    {
      id: 's4-1',
      name: 'Golf Lesson with TrackMan',
      type: 'session',
      price: 120,
      duration: 60,
      durationUnit: 'minutes',
      description: 'Data-driven golf instruction using TrackMan launch monitor analysis.',
      isActive: true,
    },
    {
      id: 's4-2',
      name: 'Playing Lesson (9 holes)',
      type: 'custom',
      price: 200,
      duration: 120,
      durationUnit: 'minutes',
      description: 'On-course instruction focusing on course management and shot selection.',
      isActive: true,
    },
  ],
  [COACH_IDS.lisa]: [
    {
      id: 's5-1',
      name: 'Private Yoga Session',
      type: 'session',
      price: 65,
      duration: 60,
      durationUnit: 'minutes',
      bundle: {
        credits: 10,
        price: 550,
        expirationMonths: 3,
      },
      description: 'Personalized yoga practice tailored to your needs and experience level.',
      isActive: true,
    },
    {
      id: 's5-2',
      name: 'Pilates Mat Class',
      type: 'session',
      price: 55,
      duration: 45,
      durationUnit: 'minutes',
      description: 'Core-focused Pilates session to build strength and flexibility.',
      isActive: true,
    },
    {
      id: 's5-3',
      name: '6-Week Mindfulness Program',
      type: 'program',
      price: 299,
      duration: 6,
      durationUnit: 'weeks',
      description: 'Weekly meditation and yoga sessions with daily practice guidance.',
      isActive: true,
    },
  ],
}

// Generate availability slots for next 7 days
function generateAvailabilitySlots(coachId: string, serviceId: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = []
  const today = new Date()

  // More comprehensive time options
  const morningTimes = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00']
  const afternoonTimes = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  const eveningTimes = ['18:00', '19:00', '20:00', '21:00']

  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)
    const dateStr = date.toISOString().split('T')[0]

    // Skip weekends for some coaches
    const dayOfWeek = date.getDay()
    if (coachId === COACH_IDS.james && (dayOfWeek === 0 || dayOfWeek === 6)) continue

    // Generate slots across different parts of the day
    // Morning slots (pick 3-4 random)
    const numMorning = Math.floor(Math.random() * 2) + 3
    const shuffledMorning = [...morningTimes].sort(() => Math.random() - 0.5).slice(0, numMorning)

    // Afternoon slots (pick 4-5 random)
    const numAfternoon = Math.floor(Math.random() * 2) + 4
    const shuffledAfternoon = [...afternoonTimes].sort(() => Math.random() - 0.5).slice(0, numAfternoon)

    // Evening slots (pick 2-3 random)
    const numEvening = Math.floor(Math.random() * 2) + 2
    const shuffledEvening = [...eveningTimes].sort(() => Math.random() - 0.5).slice(0, numEvening)

    const allTimes = [...shuffledMorning, ...shuffledAfternoon, ...shuffledEvening].sort()

    for (const time of allTimes) {
      const hour = parseInt(time.split(':')[0], 10)
      slots.push({
        id: `slot-${coachId.slice(0, 8)}-${dateStr}-${time}`,
        date: dateStr,
        startTime: time,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        serviceId,
        isBooked: Math.random() > 0.85, // 15% chance of being booked
      })
    }
  }

  return slots
}

export const mockAvailabilitySlots: Record<string, AvailabilitySlot[]> = {
  [COACH_IDS.sarah]: generateAvailabilitySlots(COACH_IDS.sarah, 's1-1'),
  [COACH_IDS.mike]: generateAvailabilitySlots(COACH_IDS.mike, 's2-1'),
  [COACH_IDS.emily]: generateAvailabilitySlots(COACH_IDS.emily, 's3-1'),
  [COACH_IDS.james]: [], // Contact only
  [COACH_IDS.lisa]: generateAvailabilitySlots(COACH_IDS.lisa, 's5-1'),
}

// Mock reviews
export const mockCoachReviews: Record<string, CoachReview[]> = {
  [COACH_IDS.sarah]: [
    {
      id: 'r1-1',
      coachId: COACH_IDS.sarah,
      studentId: 'u1',
      studentName: 'Alex Thompson',
      rating: 5,
      date: '2024-12-20',
      comment: 'Sarah is an amazing coach! She completely transformed my backhand technique in just a few sessions. Very patient and knowledgeable.',
      sport: 'Tennis',
      serviceType: 'Private Tennis Lesson',
      isVerified: true,
    },
    {
      id: 'r1-2',
      coachId: COACH_IDS.sarah,
      studentId: 'u2',
      studentName: 'Jordan Lee',
      rating: 5,
      date: '2024-12-15',
      comment: 'Great experience! The lessons are well structured and I can see real improvement in my game after just a month.',
      sport: 'Tennis',
      serviceType: 'Private Tennis Lesson',
      isVerified: true,
    },
    {
      id: 'r1-3',
      coachId: COACH_IDS.sarah,
      studentId: 'u3',
      studentName: 'Sam Rodriguez',
      rating: 4,
      date: '2024-12-10',
      comment: 'Very professional and encouraging. Would definitely recommend to others looking to improve their tennis.',
      sport: 'Tennis',
      isVerified: true,
    },
    {
      id: 'r1-4',
      coachId: COACH_IDS.sarah,
      studentId: 'u4',
      studentName: 'Casey Kim',
      rating: 5,
      date: '2024-12-05',
      comment: 'Best tennis coach I have ever had. Makes learning fun and breaks down complex techniques into simple steps.',
      sport: 'Pickleball',
      serviceType: 'Private Tennis Lesson',
      isVerified: true,
    },
  ],
  [COACH_IDS.mike]: [
    {
      id: 'r2-1',
      coachId: COACH_IDS.mike,
      studentId: 'u5',
      studentName: 'Chris Martinez',
      rating: 5,
      date: '2024-12-18',
      comment: 'Mike really knows his stuff. My shooting percentage has improved significantly since training with him.',
      sport: 'Basketball',
      serviceType: 'Basketball Skills Training',
      isVerified: true,
    },
    {
      id: 'r2-2',
      coachId: COACH_IDS.mike,
      studentId: 'u6',
      studentName: 'Taylor Brown',
      rating: 5,
      date: '2024-12-12',
      comment: 'Great energy and very motivating. The strength training sessions are tough but effective!',
      sport: 'Basketball',
      serviceType: 'Strength & Conditioning',
      isVerified: true,
    },
  ],
  [COACH_IDS.emily]: [
    {
      id: 'r3-1',
      coachId: COACH_IDS.emily,
      studentId: 'u7',
      studentName: 'Morgan Davis',
      rating: 5,
      date: '2024-12-19',
      comment: 'Emily helped me go from barely finishing a sprint triathlon to completing my first Olympic distance race!',
      sport: 'Triathlon',
      serviceType: 'Triathlon Training Plan',
      isVerified: true,
    },
  ],
  [COACH_IDS.james]: [
    {
      id: 'r4-1',
      coachId: COACH_IDS.james,
      studentId: 'u8',
      studentName: 'Pat Wilson',
      rating: 5,
      date: '2024-12-17',
      comment: 'The TrackMan analysis was eye-opening. James identified issues I never knew I had.',
      sport: 'Golf',
      serviceType: 'Golf Lesson with TrackMan',
      isVerified: true,
    },
  ],
  [COACH_IDS.lisa]: [
    {
      id: 'r5-1',
      coachId: COACH_IDS.lisa,
      studentId: 'u9',
      studentName: 'Jamie Anderson',
      rating: 5,
      date: '2024-12-21',
      comment: 'Lisa creates such a welcoming and peaceful environment. My stress levels have dropped significantly since starting yoga with her.',
      sport: 'Yoga',
      serviceType: 'Private Yoga Session',
      isVerified: true,
    },
    {
      id: 'r5-2',
      coachId: COACH_IDS.lisa,
      studentId: 'u10',
      studentName: 'Riley Cooper',
      rating: 5,
      date: '2024-12-16',
      comment: 'The mindfulness program changed my life. I am more present and calm in everything I do now.',
      sport: 'Meditation',
      serviceType: '6-Week Mindfulness Program',
      isVerified: true,
    },
  ],
}

// Mock content
export const mockCoachContent: Record<string, CoachContent[]> = {
  [COACH_IDS.sarah]: [
    {
      id: 'c1-1',
      coachId: COACH_IDS.sarah,
      title: 'Perfect Your Tennis Serve',
      description: 'Learn the fundamentals of a powerful and consistent serve.',
      type: 'video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
      isPremium: false,
      duration: '8:45',
      createdAt: '2024-12-01',
    },
    {
      id: 'c1-2',
      coachId: COACH_IDS.sarah,
      title: 'Backhand Masterclass',
      description: 'Complete guide to developing a reliable two-handed backhand.',
      type: 'video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
      isPremium: true,
      price: 29.99,
      duration: '45:00',
      createdAt: '2024-11-15',
    },
    {
      id: 'c1-3',
      coachId: COACH_IDS.sarah,
      title: '4-Week Beginner Tennis Plan',
      description: 'A structured program to get you match-ready in one month.',
      type: 'plan',
      isPremium: true,
      price: 49.99,
      createdAt: '2024-10-20',
    },
  ],
  [COACH_IDS.mike]: [
    {
      id: 'c2-1',
      coachId: COACH_IDS.mike,
      title: 'Ball Handling Drills',
      description: '10 essential drills to improve your handles.',
      type: 'video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      isPremium: false,
      duration: '12:30',
      createdAt: '2024-12-10',
    },
  ],
  [COACH_IDS.emily]: [
    {
      id: 'c3-1',
      coachId: COACH_IDS.emily,
      title: 'Freestyle Breathing Technique',
      description: 'Master bilateral breathing for better endurance.',
      type: 'video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
      isPremium: false,
      duration: '6:20',
      createdAt: '2024-12-05',
    },
    {
      id: 'c3-2',
      coachId: COACH_IDS.emily,
      title: 'Sprint Triathlon Training Guide',
      description: 'Complete 8-week program for your first sprint triathlon.',
      type: 'plan',
      isPremium: true,
      price: 39.99,
      createdAt: '2024-11-01',
    },
  ],
  [COACH_IDS.james]: [],
  [COACH_IDS.lisa]: [
    {
      id: 'c5-1',
      coachId: COACH_IDS.lisa,
      title: '10-Minute Morning Flow',
      description: 'Start your day right with this energizing yoga sequence.',
      type: 'video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
      isPremium: false,
      duration: '10:15',
      createdAt: '2024-12-18',
    },
    {
      id: 'c5-2',
      coachId: COACH_IDS.lisa,
      title: 'Stress Relief Meditation',
      description: 'Guided meditation for relaxation and calm.',
      type: 'video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      isPremium: false,
      duration: '15:00',
      createdAt: '2024-12-12',
    },
    {
      id: 'c5-3',
      coachId: COACH_IDS.lisa,
      title: 'Complete Flexibility Program',
      description: '30-day program to dramatically improve your flexibility.',
      type: 'plan',
      isPremium: true,
      price: 59.99,
      createdAt: '2024-10-01',
    },
  ],
}

// Export coach IDs for reference
export { COACH_IDS }

// Helper function to get a coach by ID
export function getCoachById(id: string): PublicCoachProfile | undefined {
  return mockCoachProfiles[id]
}

// Helper function to get all data for a coach
export function getFullCoachData(id: string) {
  return {
    profile: mockCoachProfiles[id],
    services: mockCoachServices[id] || [],
    availability: mockAvailabilitySlots[id] || [],
    reviews: mockCoachReviews[id] || [],
    content: mockCoachContent[id] || [],
  }
}

// Get all coach profiles as array
export function getAllCoaches(): PublicCoachProfile[] {
  return Object.values(mockCoachProfiles)
}
