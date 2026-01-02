'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  ChevronRight,
  FileText,
  Video,
  Image,
  MessageSquare,
  Upload,
  Play,
  Pause,
  Trash2,
  Plus,
  Clock,
  Calendar,
  Dumbbell,
  FolderOpen,
  Pencil,
  Circle,
  Square,
  ArrowRight,
  Type,
  Undo,
  Redo,
  Camera,
  SkipBack,
  SkipForward,
  Maximize,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  AlignLeft,
} from 'lucide-react'

// Lesson data types
interface LessonAttachment {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnail?: string
  createdAt: string
  title: string
  caption?: string
}

interface CompletedLesson {
  id: string
  studentId: string
  studentName: string
  studentAvatar?: string
  serviceId: string
  serviceName: string
  serviceType: 'session' | 'program' | 'custom' | 'group'
  date: string
  duration: number
  attachments: LessonAttachment[]
  notes: string
  focus?: string
  location?: string
}

// Mock data
const mockLessons: Record<string, CompletedLesson> = {
  'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    studentId: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
    studentName: 'Alex Johnson',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    serviceId: 'a3bb189e-8bf9-4f8d-9c85-f7a3b8d4e2c1',
    serviceName: 'Private Lesson',
    serviceType: 'session',
    date: '2024-12-30T10:00:00',
    duration: 60,
    location: 'Court 3',
    focus: 'Forehand technique',
    attachments: [
      { id: 'vid-001', type: 'video', url: '/videos/forehand-drill.mp4', thumbnail: 'https://placehold.co/400x225/1a1a2e/ffffff?text=Forehand+Drill', createdAt: '2024-12-30T11:10:00', title: 'Forehand Drill', caption: 'Good follow-through on this swing. Notice the elbow position.' },
      { id: 'vid-002', type: 'video', url: '/videos/backhand.mp4', thumbnail: 'https://placehold.co/400x225/1a1a2e/ffffff?text=Backhand+Form', createdAt: '2024-12-30T11:15:00', title: 'Backhand Form Check', caption: '' },
      { id: 'photo-001', type: 'photo', url: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Stance+Photo', createdAt: '2024-12-30T10:30:00', title: 'Ready Position', caption: 'Feet shoulder-width apart, knees bent.' },
      { id: 'photo-002', type: 'photo', url: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Grip+Photo', createdAt: '2024-12-30T10:35:00', title: 'Grip Check', caption: '' },
    ],
    notes: '# Session Summary\n\nWorked on **forehand technique** today. Alex is making great progress!\n\n## What We Covered\n- Follow-through mechanics\n- Elbow positioning during backswing\n- Weight transfer\n\n## Homework\n1. Practice shadow swings 50x daily\n2. Record yourself and compare to today\'s videos\n3. Focus on keeping elbow HIGH',
  },
  '550e8400-e29b-41d4-a716-446655440000': {
    id: '550e8400-e29b-41d4-a716-446655440000',
    studentId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    studentName: 'Maria Garcia',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    serviceId: 'a3bb189e-8bf9-4f8d-9c85-f7a3b8d4e2c1',
    serviceName: 'Private Lesson',
    serviceType: 'session',
    date: '2024-12-29T14:00:00',
    duration: 60,
    location: 'Court 1',
    focus: 'Serve mechanics',
    attachments: [
      { id: 'photo-003', type: 'photo', url: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Serve+Stance', createdAt: '2024-12-29T14:30:00', title: 'Serve Stance', caption: '' },
    ],
    notes: '',
  },
  '6fa459ea-ee8a-3ca4-894e-db77e160355e': {
    id: '6fa459ea-ee8a-3ca4-894e-db77e160355e',
    studentId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    studentName: 'James Wilson',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    serviceId: 'b4cc289f-9cf0-5f9e-0d96-g8b4c9e5f3d2',
    serviceName: 'Group Session',
    serviceType: 'group',
    date: '2024-12-28T09:00:00',
    duration: 90,
    location: 'Main Court',
    focus: 'Doubles strategy',
    attachments: [],
    notes: '',
  },
  '886313e1-3b8a-5372-9b90-0c9aee199e5d': {
    id: '886313e1-3b8a-5372-9b90-0c9aee199e5d',
    studentId: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
    studentName: 'Alex Johnson',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    serviceId: 'a3bb189e-8bf9-4f8d-9c85-f7a3b8d4e2c1',
    serviceName: 'Private Lesson',
    serviceType: 'session',
    date: '2024-12-27T10:00:00',
    duration: 60,
    location: 'Court 2',
    focus: 'Serve introduction',
    attachments: [],
    notes: 'Introduced serve technique basics. Need more practice on toss consistency.',
  },
}

type AnnotationTool = 'select' | 'draw' | 'arrow' | 'circle' | 'rectangle' | 'text'

const annotationColors = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'White', value: '#ffffff' },
]

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string
  const videoRef = useRef<HTMLVideoElement>(null)

  const initialLesson = mockLessons[lessonId]

  // Editable state
  const [studentName, setStudentName] = useState(initialLesson?.studentName || '')
  const [serviceName] = useState(initialLesson?.serviceName || '')
  const [date] = useState(initialLesson?.date || '')
  const [duration, setDuration] = useState(initialLesson?.duration || 60)
  const [location, setLocation] = useState(initialLesson?.location || '')
  const [focus, setFocus] = useState(initialLesson?.focus || '')
  const [notes, setNotes] = useState(initialLesson?.notes || '')
  const [attachments, setAttachments] = useState<LessonAttachment[]>(initialLesson?.attachments || [])

  // Selected media for preview
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(
    initialLesson?.attachments?.[0]?.id || null
  )

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)

  // Annotation state
  const [showAnnotationTools, setShowAnnotationTools] = useState(false)
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('draw')
  const [selectedColor, setSelectedColor] = useState('#ef4444')

  if (!initialLesson) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <FileText className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Lesson not found</h2>
        <p className="text-muted-foreground">The lesson you're looking for doesn't exist.</p>
        <Link href="/studio?tab=lessons" className="text-primary hover:underline text-sm">
          Back to Lessons
        </Link>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDeleteAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
    if (selectedMediaId === attachmentId) {
      const remaining = attachments.filter(a => a.id !== attachmentId)
      setSelectedMediaId(remaining[0]?.id || null)
    }
  }

  const handleDelete = () => {
    router.push('/studio?tab=lessons')
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleFrameStep = (direction: 'back' | 'forward') => {
    if (videoRef.current) {
      // Assuming 30fps, step by ~1 frame
      const frameTime = 1 / 30
      videoRef.current.currentTime += direction === 'forward' ? frameTime : -frameTime
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleFreezeFrame = () => {
    // In production, this would capture the current frame and save as a new photo
    const newPhoto: LessonAttachment = {
      id: `freeze-${Date.now()}`,
      type: 'photo',
      url: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Freeze+Frame',
      createdAt: new Date().toISOString(),
      title: `Freeze Frame - ${formatVideoTime(currentTime)}`,
      caption: '',
    }
    setAttachments(prev => [...prev, newPhoto])
  }

  const handleUpdateCaption = (mediaId: string, caption: string) => {
    setAttachments(prev => prev.map(a =>
      a.id === mediaId ? { ...a, caption } : a
    ))
  }

  const selectedMedia = attachments.find(a => a.id === selectedMediaId)
  const videoAttachments = attachments.filter(a => a.type === 'video')
  const photoAttachments = attachments.filter(a => a.type === 'photo')

  const annotationTools: { id: AnnotationTool; icon: typeof Pencil; label: string }[] = [
    { id: 'draw', icon: Pencil, label: 'Draw' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'text', icon: Type, label: 'Text' },
  ]

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/studio" className="hover:text-foreground transition-colors">
          Studio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/studio?tab=lessons" className="hover:text-foreground transition-colors">
          Lessons
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{studentName} - {formatDate(date)}</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Media Directory */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FolderOpen className="h-3.5 w-3.5" />
                  Media
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Videos Section */}
                {videoAttachments.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
                      <Video className="h-3 w-3" />
                      Videos ({videoAttachments.length})
                    </div>
                    <div className="space-y-0.5">
                      {videoAttachments.map((media) => (
                        <button
                          key={media.id}
                          onClick={() => setSelectedMediaId(media.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left',
                            selectedMediaId === media.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className="h-8 w-12 rounded bg-muted overflow-hidden shrink-0 relative">
                            <img src={media.thumbnail || media.url} alt="" className="h-full w-full object-cover" />
                            <Play className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow" />
                          </div>
                          <span className="truncate flex-1">{media.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos Section */}
                {photoAttachments.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
                      <Image className="h-3 w-3" />
                      Photos ({photoAttachments.length})
                    </div>
                    <div className="space-y-0.5">
                      {photoAttachments.map((media) => (
                        <button
                          key={media.id}
                          onClick={() => setSelectedMediaId(media.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left',
                            selectedMediaId === media.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className="h-8 w-8 rounded bg-muted overflow-hidden shrink-0">
                            <img src={media.url} alt="" className="h-full w-full object-cover" />
                          </div>
                          <span className="truncate flex-1">{media.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {attachments.length === 0 && (
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground/40 mb-2">
                      <Video className="h-5 w-5" />
                      <Image className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">No media yet</p>
                    <Button variant="outline" size="sm" className="mt-2 h-7 text-xs gap-1">
                      <Upload className="h-3 w-3" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Media Viewer with Integrated Tools */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="flex-1">
            <CardContent className="p-0">
              {selectedMedia ? (
                <div className="relative">
                  {/* Annotation Toolbar - Shows when enabled */}
                  {showAnnotationTools && (
                    <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-1 p-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                      {annotationTools.map((tool) => (
                        <Button
                          key={tool.id}
                          variant={selectedTool === tool.id ? 'secondary' : 'ghost'}
                          size="icon"
                          className="h-7 w-7 text-white hover:text-white"
                          onClick={() => setSelectedTool(tool.id)}
                          title={tool.label}
                        >
                          <tool.icon className="h-3.5 w-3.5" />
                        </Button>
                      ))}
                      <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />
                      {annotationColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={cn(
                            'h-5 w-5 rounded-full border transition-transform',
                            selectedColor === color.value ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                      <Separator orientation="vertical" className="h-5 mx-1 bg-white/20" />
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:text-white" title="Undo">
                        <Undo className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:text-white" title="Redo">
                        <Redo className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* Media Display */}
                  <div className="aspect-video bg-black rounded-t-lg overflow-hidden relative">
                    {selectedMedia.type === 'video' ? (
                      <>
                        <img
                          src={selectedMedia.thumbnail || selectedMedia.url}
                          alt={selectedMedia.title}
                          className="w-full h-full object-contain"
                        />
                        {/* In production, replace with actual video element */}
                        {/* <video
                          ref={videoRef}
                          src={selectedMedia.url}
                          className="w-full h-full object-contain"
                          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                          onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                        /> */}
                        {!isPlaying && !showAnnotationTools && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              onClick={handlePlayPause}
                              className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                              <Play className="h-6 w-6 text-white ml-1" />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.title}
                        className="w-full h-full object-contain"
                      />
                    )}

                    {/* Annotation Canvas Overlay */}
                    {showAnnotationTools && (
                      <div className="absolute inset-0 cursor-crosshair" />
                    )}
                  </div>

                  {/* Video Controls */}
                  {selectedMedia.type === 'video' && (
                    <div className="p-2 border-t bg-muted/30 flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleFrameStep('back')} title="Previous frame">
                        <SkipBack className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleFrameStep('forward')} title="Next frame">
                        <SkipForward className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs text-muted-foreground w-20">
                        {formatVideoTime(currentTime)} / {formatVideoTime(videoDuration || 45)}
                      </span>
                      <input
                        type="range"
                        value={currentTime}
                        onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                        max={videoDuration || 45}
                        step={0.033}
                        className="flex-1 h-1 accent-primary"
                      />
                      <Separator orientation="vertical" className="h-5" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={handleFreezeFrame}
                        title="Capture freeze frame"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Freeze
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Maximize className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* Media Info & Caption */}
                  <div className="p-3 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{selectedMedia.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedMedia.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant={showAnnotationTools ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => setShowAnnotationTools(!showAnnotationTools)}
                        >
                          <Pencil className="h-3 w-3" />
                          Annotate
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteAttachment(selectedMedia.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Caption/Notes for this media */}
                    <textarea
                      value={selectedMedia.caption || ''}
                      onChange={(e) => handleUpdateCaption(selectedMedia.id, e.target.value)}
                      placeholder="Add notes about this media..."
                      rows={2}
                      className="w-full bg-muted/50 text-sm rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 text-muted-foreground/30 mb-3">
                    <Video className="h-10 w-10" />
                    <Image className="h-10 w-10" />
                  </div>
                  <p className="text-sm text-muted-foreground">No media selected</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                    <Upload className="h-4 w-4" />
                    Upload Media
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rich Notes Editor */}
          <Card>
            <CardContent className="p-0">
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Heading 1">
                  <Heading1 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Heading 2">
                  <Heading2 className="h-3.5 w-3.5" />
                </Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Bold">
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Italic">
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Bullet List">
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Numbered List">
                  <ListOrdered className="h-3.5 w-3.5" />
                </Button>
                <div className="flex-1" />
                <span className="text-[10px] text-muted-foreground">Markdown supported</span>
              </div>
              {/* Editor Area */}
              <div className="p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="# Session Notes

Write detailed notes about the lesson...

## What We Covered
- Topic 1
- Topic 2

## Homework
1. Assignment 1
2. Assignment 2"
                  className="w-full min-h-[200px] bg-transparent text-sm outline-none resize-none font-mono placeholder:text-muted-foreground/40"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Details Sidebar */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-4 space-y-4">
              {/* Student */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
                  {initialLesson.studentAvatar ? (
                    <img
                      src={initialLesson.studentAvatar}
                      alt={studentName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm font-medium">
                      {studentName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-transparent font-medium text-sm outline-none hover:bg-muted/50 focus:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors"
                  />
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px] mt-0.5',
                      initialLesson.serviceType === 'session' && 'bg-blue-100 text-blue-700',
                      initialLesson.serviceType === 'group' && 'bg-green-100 text-green-700',
                      initialLesson.serviceType === 'program' && 'bg-orange-100 text-orange-700',
                      initialLesson.serviceType === 'custom' && 'bg-purple-100 text-purple-700'
                    )}
                  >
                    {serviceName}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Date & Time */}
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date & Time
                </span>
                <p className="text-sm">{formatDate(date)} at {formatTime(date)}</p>
              </div>

              {/* Duration */}
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Duration
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-12 bg-transparent text-sm outline-none hover:bg-muted/50 focus:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Location</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location..."
                  className="w-full bg-transparent text-sm outline-none hover:bg-muted/50 focus:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Focus */}
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" /> Focus
                </span>
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="What did you work on?"
                  className="w-full bg-transparent text-sm outline-none hover:bg-muted/50 focus:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              <Separator />

              {/* Media Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-muted/50 text-center">
                  <Video className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <span className="font-medium">{videoAttachments.length}</span>
                  <span className="text-muted-foreground ml-1">videos</span>
                </div>
                <div className="p-2 rounded bg-muted/50 text-center">
                  <Image className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <span className="font-medium">{photoAttachments.length}</span>
                  <span className="text-muted-foreground ml-1">photos</span>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Lesson
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
