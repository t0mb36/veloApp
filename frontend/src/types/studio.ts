// Studio-related type definitions

// Re-export shared types
export type { CoachService, ServiceBundle } from './coach'

// Completed Lesson types
export interface LessonAttachment {
  id: string
  type: 'photo' | 'video' | 'note'
  url?: string
  content?: string // for notes
  thumbnail?: string // for videos
  createdAt: string
}

export interface CompletedLesson {
  id: string
  studentId: string
  studentName: string
  studentAvatar?: string
  serviceId: string
  serviceName: string
  serviceType: 'session' | 'program' | 'custom' | 'group'
  date: string
  duration: number // in minutes
  attachments: LessonAttachment[]
  notes?: string
}

// Program types
export interface ProgramActivity {
  id: string
  name: string
  description?: string
  metrics: {
    type: 'sets_reps' | 'duration' | 'distance' | 'count' | 'custom'
    sets?: number
    reps?: number | string // can be "10-12" for ranges
    duration?: number // in seconds
    durationUnit?: 'seconds' | 'minutes'
    distance?: number
    distanceUnit?: 'meters' | 'yards' | 'miles' | 'feet'
    count?: number
    customLabel?: string
    customValue?: string
  }
  notes?: string
  contentId?: string // linked video/content
  order: number
}

export interface ProgramDay {
  id: string
  dayNumber: number
  name?: string // e.g., "Upper Body", "Recovery", "Game Day Prep"
  activities: ProgramActivity[]
  notes?: string
}

export interface ProgramWeek {
  id: string
  weekNumber: number
  name?: string // e.g., "Foundation", "Build Phase", "Peak"
  days: ProgramDay[]
}

export interface Program {
  id: string
  name: string
  description?: string
  sport?: string // e.g., "Baseball", "Basketball", "Tennis", "Fitness"
  durationWeeks: number
  daysPerWeek: number
  weeks: ProgramWeek[]
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  assignedCount: number // number of students assigned
}

// Content management types
export interface ContentFolder {
  id: string
  name: string
  color: string // tailwind color class
  parentId: string | null // for nested folders
  createdAt: string
}

export interface ContentItem {
  id: string
  title: string
  description?: string
  type: 'video' | 'image' | 'document' | 'link'
  folderId: string | null // null = root/uncategorized
  tags: string[]
  thumbnailUrl?: string
  fileUrl?: string
  duration?: number // for videos, in seconds
  fileSize?: number // in bytes
  createdAt: string
  updatedAt: string
}
