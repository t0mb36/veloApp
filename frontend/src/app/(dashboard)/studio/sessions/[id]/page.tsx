'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VideoPlayer, VideoAnnotation } from '@/components/video-player'
import { BlockEditor, Block, markdownToBlocks } from '@/components/block-editor'
import { cn } from '@/lib/utils'
import {
  ChevronRight,
  FileText,
  Video,
  Image,
  Upload,
  Play,
  Trash2,
  Plus,
  Clock,
  Calendar,
  Dumbbell,
  StickyNote,
  MapPin,
} from 'lucide-react'

// Session data types
interface SessionAttachment {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnail?: string
  createdAt: string
  title: string
  caption?: string
  annotations?: VideoAnnotation[]
}

interface CompletedSession {
  id: string
  studentId: string
  studentName: string
  studentAvatar?: string
  serviceId: string
  serviceName: string
  serviceType: 'session' | 'program' | 'custom' | 'group'
  date: string
  duration: number
  attachments: SessionAttachment[]
  notes: string
  focus?: string
  location?: string
}

// Mock data
const mockSessions: Record<string, CompletedSession> = {
  'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    studentId: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
    studentName: 'Alex Johnson',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    serviceId: 'a3bb189e-8bf9-4f8d-9c85-f7a3b8d4e2c1',
    serviceName: 'Private Session',
    serviceType: 'session',
    date: '2024-12-30T10:00:00',
    duration: 60,
    location: 'Court 3',
    focus: 'Forehand technique',
    attachments: [
      {
        id: 'vid-001',
        type: 'video',
        url: '/videos/forehand-drill.mp4',
        thumbnail: 'https://placehold.co/800x450/1a1a2e/ffffff?text=Forehand+Drill',
        createdAt: '2024-12-30T11:10:00',
        title: 'Forehand Drill',
        caption: 'Good follow-through on this swing. Notice the elbow position at the point of contact.',
      },
      {
        id: 'vid-002',
        type: 'video',
        url: '/videos/backhand.mp4',
        thumbnail: 'https://placehold.co/800x450/1a1a2e/ffffff?text=Backhand+Form',
        createdAt: '2024-12-30T11:15:00',
        title: 'Backhand Form Check',
      },
      {
        id: 'photo-001',
        type: 'photo',
        url: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Ready+Position',
        createdAt: '2024-12-30T10:30:00',
        title: 'Ready Position',
        caption: 'Feet shoulder-width apart, knees bent. Good athletic stance.',
      },
      {
        id: 'photo-002',
        type: 'photo',
        url: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Grip+Check',
        createdAt: '2024-12-30T10:35:00',
        title: 'Grip Check',
      },
    ],
    notes: '# Session Summary\n\nWorked on **forehand technique** today. Alex is making great progress!\n\n## What We Covered\n- Follow-through mechanics\n- Elbow positioning during backswing\n- Weight transfer\n\n## Homework\n1. Practice shadow swings 50x daily\n2. Record yourself and compare to today\'s videos\n3. Focus on keeping elbow HIGH',
  },
  '550e8400-e29b-41d4-a716-446655440000': {
    id: '550e8400-e29b-41d4-a716-446655440000',
    studentId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    studentName: 'Maria Garcia',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    serviceId: 'a3bb189e-8bf9-4f8d-9c85-f7a3b8d4e2c1',
    serviceName: 'Private Session',
    serviceType: 'session',
    date: '2024-12-29T14:00:00',
    duration: 60,
    location: 'Court 1',
    focus: 'Serve mechanics',
    attachments: [
      { id: 'photo-003', type: 'photo', url: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Serve+Stance', createdAt: '2024-12-29T14:30:00', title: 'Serve Stance' },
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
    serviceName: 'Private Session',
    serviceType: 'session',
    date: '2024-12-27T10:00:00',
    duration: 60,
    location: 'Court 2',
    focus: 'Serve introduction',
    attachments: [],
    notes: 'Introduced serve technique basics. Need more practice on toss consistency.',
  },
}

type SidebarView = 'media' | 'notes'

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const initialSession = mockSessions[sessionId]

  // Editable state
  const [studentName, setStudentName] = useState(initialSession?.studentName || '')
  const [serviceName] = useState(initialSession?.serviceName || '')
  const [date] = useState(initialSession?.date || '')
  const [duration, setDuration] = useState(initialSession?.duration || 60)
  const [location, setLocation] = useState(initialSession?.location || '')
  const [focus, setFocus] = useState(initialSession?.focus || '')
  const [attachments, setAttachments] = useState<SessionAttachment[]>(initialSession?.attachments || [])

  // Session notes as blocks
  const [sessionNotes, setSessionNotes] = useState<Block[]>(() =>
    markdownToBlocks(initialSession?.notes || '')
  )

  // Sidebar view state
  const [sidebarView, setSidebarView] = useState<SidebarView>('media')

  // Selected media for preview
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(
    initialSession?.attachments?.[0]?.id || null
  )

  if (!initialSession) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <FileText className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Session not found</h2>
        <p className="text-muted-foreground">The session you're looking for doesn't exist.</p>
        <Link href="/studio?tab=sessions" className="text-primary hover:underline text-sm">
          Back to Sessions
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
    router.push('/studio?tab=sessions')
  }

  const handleFreezeFrame = (dataUrl: string, timestamp: number) => {
    const newPhoto: SessionAttachment = {
      id: `freeze-${Date.now()}`,
      type: 'photo',
      url: dataUrl,
      createdAt: new Date().toISOString(),
      title: `Freeze Frame - ${formatVideoTime(timestamp)}`,
    }
    setAttachments(prev => [...prev, newPhoto])
    setSelectedMediaId(newPhoto.id)
  }

  const handleUpdateMediaCaption = (mediaId: string, caption: string) => {
    setAttachments(prev => prev.map(a =>
      a.id === mediaId ? { ...a, caption } : a
    ))
  }

  const handleUpdateMediaAnnotations = (mediaId: string, annotations: VideoAnnotation[]) => {
    setAttachments(prev => prev.map(a =>
      a.id === mediaId ? { ...a, annotations } : a
    ))
  }

  const selectedMedia = attachments.find(a => a.id === selectedMediaId)
  const videoAttachments = attachments.filter(a => a.type === 'video')
  const photoAttachments = attachments.filter(a => a.type === 'photo')

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/studio" className="hover:text-foreground transition-colors">
          Studio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/studio?tab=sessions" className="hover:text-foreground transition-colors">
          Sessions
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{studentName} - {formatDate(date)}</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Navigation Sidebar */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-2">
              {/* Sidebar Navigation */}
              <div className="space-y-1 mb-3">
                <button
                  onClick={() => setSidebarView('notes')}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    sidebarView === 'notes'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <StickyNote className="h-4 w-4" />
                  Session Notes
                </button>
              </div>

              <Separator className="my-2" />

              {/* Media Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-muted-foreground">Media</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Videos */}
                {videoAttachments.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                      <Video className="h-3 w-3" />
                      Videos
                    </div>
                    {videoAttachments.map((media) => (
                      <button
                        key={media.id}
                        onClick={() => {
                          setSelectedMediaId(media.id)
                          setSidebarView('media')
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left',
                          selectedMediaId === media.id && sidebarView === 'media'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <div className="h-7 w-10 rounded bg-muted overflow-hidden shrink-0 relative">
                          <img src={media.thumbnail || media.url} alt="" className="h-full w-full object-cover" />
                          <Play className="absolute inset-0 m-auto h-2.5 w-2.5 text-white drop-shadow" />
                        </div>
                        <span className="truncate flex-1">{media.title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Photos */}
                {photoAttachments.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                      <Image className="h-3 w-3" />
                      Photos
                    </div>
                    {photoAttachments.map((media) => (
                      <button
                        key={media.id}
                        onClick={() => {
                          setSelectedMediaId(media.id)
                          setSidebarView('media')
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left',
                          selectedMediaId === media.id && sidebarView === 'media'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <div className="h-7 w-7 rounded bg-muted overflow-hidden shrink-0">
                          <img src={media.url} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="truncate flex-1">{media.title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {attachments.length === 0 && (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground/40 mb-2">
                      <Video className="h-4 w-4" />
                      <Image className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">No media</p>
                    <Button variant="outline" size="sm" className="mt-2 h-6 text-[10px] gap-1">
                      <Upload className="h-2.5 w-2.5" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Main Content Area */}
        <div className="lg:col-span-7">
          {sidebarView === 'notes' ? (
            /* Session Notes Editor */
            <Card className="h-full">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Session Notes</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Type &apos;/&apos; for commands, drag blocks to reorder
                  </p>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                  <BlockEditor
                    blocks={sessionNotes}
                    onChange={setSessionNotes}
                    placeholder="Start typing your session notes... Use '/' for formatting options"
                    minHeight="400px"
                  />
                </div>
              </CardContent>
            </Card>
          ) : selectedMedia ? (
            /* Media Viewer */
            <Card className="h-full">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Media Display with built-in annotation tools */}
                <div className="relative bg-black flex-shrink-0">
                  {selectedMedia.type === 'video' ? (
                    <VideoPlayer
                      src={selectedMedia.url}
                      poster={selectedMedia.thumbnail}
                      title={selectedMedia.title}
                      onFreezeFrame={handleFreezeFrame}
                      annotations={selectedMedia.annotations || []}
                      onAnnotationsChange={(annotations) => handleUpdateMediaAnnotations(selectedMedia.id, annotations)}
                      showAnnotations={true}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-black" style={{ maxHeight: '50vh' }}>
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.title}
                        className="max-w-full max-h-[50vh] object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Media Info Bar with Caption */}
                <div className="p-3 border-b">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{selectedMedia.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedMedia.createdAt).toLocaleString()}
                      </p>
                      <textarea
                        value={selectedMedia.caption || ''}
                        onChange={(e) => handleUpdateMediaCaption(selectedMedia.id, e.target.value)}
                        placeholder="Add a caption..."
                        rows={2}
                        className="w-full mt-2 text-sm bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground/50 hover:bg-muted/30 focus:bg-muted/30 rounded px-1 -mx-1 py-1 transition-colors"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleDeleteAttachment(selectedMedia.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Empty State */
            <Card className="h-full">
              <CardContent className="h-full flex flex-col items-center justify-center py-12">
                <div className="flex items-center gap-3 text-muted-foreground/30 mb-3">
                  <Video className="h-10 w-10" />
                  <Image className="h-10 w-10" />
                </div>
                <p className="text-sm text-muted-foreground">Select media from the sidebar</p>
                <p className="text-xs text-muted-foreground mt-1">or click "Session Notes" to write notes</p>
                <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                  <Upload className="h-4 w-4" />
                  Upload Media
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Session Details */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-4 space-y-4">
              {/* Student */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
                  {initialSession.studentAvatar ? (
                    <img
                      src={initialSession.studentAvatar}
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
                      initialSession.serviceType === 'session' && 'bg-blue-100 text-blue-700',
                      initialSession.serviceType === 'group' && 'bg-green-100 text-green-700',
                      initialSession.serviceType === 'program' && 'bg-orange-100 text-orange-700',
                      initialSession.serviceType === 'custom' && 'bg-purple-100 text-purple-700'
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
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location
                </span>
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

              {/* Quick Stats */}
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
                Delete Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
