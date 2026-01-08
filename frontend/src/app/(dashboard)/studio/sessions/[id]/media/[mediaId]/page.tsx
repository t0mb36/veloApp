'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  Video,
  Image,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Pencil,
  Circle,
  Square,
  ArrowRight,
  Type,
  Undo,
  Redo,
  Trash2,
  Download,
  Share2,
  Maximize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data - would come from session context/API
const mockMedia: Record<string, {
  id: string
  sessionId: string
  type: 'video' | 'photo'
  url: string
  thumbnail?: string
  title: string
  studentName: string
  sessionDate: string
}> = {
  'vid-001': {
    id: 'vid-001',
    sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: 'video',
    url: '/videos/forehand-drill.mp4',
    thumbnail: 'https://placehold.co/800x450/1a1a2e/ffffff?text=Forehand+Drill',
    title: 'Forehand Drill',
    studentName: 'Alex Johnson',
    sessionDate: '2024-12-30',
  },
  'vid-002': {
    id: 'vid-002',
    sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: 'video',
    url: '/videos/backhand.mp4',
    thumbnail: 'https://placehold.co/800x450/1a1a2e/ffffff?text=Backhand+Form',
    title: 'Backhand Form Check',
    studentName: 'Alex Johnson',
    sessionDate: '2024-12-30',
  },
  'photo-001': {
    id: 'photo-001',
    sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: 'photo',
    url: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Ready+Position',
    title: 'Ready Position',
    studentName: 'Alex Johnson',
    sessionDate: '2024-12-30',
  },
  'photo-002': {
    id: 'photo-002',
    sessionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: 'photo',
    url: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Grip+Check',
    title: 'Grip Check',
    studentName: 'Alex Johnson',
    sessionDate: '2024-12-30',
  },
  'photo-003': {
    id: 'photo-003',
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    type: 'photo',
    url: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Serve+Stance',
    title: 'Serve Stance',
    studentName: 'Maria Garcia',
    sessionDate: '2024-12-29',
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

export default function MediaAnnotationPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const mediaId = params.mediaId as string

  const media = mockMedia[mediaId]

  // Playback state (for video)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(45) // Mock duration in seconds

  // Annotation state
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('select')
  const [selectedColor, setSelectedColor] = useState('#ef4444')
  const [strokeWidth, setStrokeWidth] = useState(3)

  if (!media) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <FileText className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Media not found</h2>
        <p className="text-muted-foreground">The media you're looking for doesn't exist.</p>
        <Link href={`/studio/sessions/${sessionId}`} className="text-primary hover:underline text-sm">
          Back to Session
        </Link>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const tools: { id: AnnotationTool; icon: typeof Pencil; label: string }[] = [
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
        <Link href="/studio?tab=sessions" className="hover:text-foreground transition-colors">
          Sessions
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/studio/sessions/${sessionId}`} className="hover:text-foreground transition-colors">
          {media.studentName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{media.title}</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Main Canvas Area */}
        <div className="lg:col-span-9 space-y-3">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-2 flex items-center gap-2">
              {/* Drawing Tools */}
              <div className="flex items-center gap-1 border-r pr-2">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedTool(tool.id)}
                    title={tool.label}
                  >
                    <tool.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              {/* Colors */}
              <div className="flex items-center gap-1 border-r pr-2">
                {annotationColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      'h-6 w-6 rounded-full border-2 transition-transform',
                      selectedColor === color.value ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-2 border-r pr-2 min-w-[100px]">
                <span className="text-xs text-muted-foreground">Size</span>
                <input
                  type="range"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-16 h-1 accent-primary"
                />
              </div>

              {/* Undo/Redo */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Undo">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Redo">
                  <Redo className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Clear All">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Zoom Out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-10 text-center">100%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Zoom In">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Reset">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Actions */}
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-black aspect-video">
                {/* Media Display */}
                <img
                  src={media.type === 'video' ? media.thumbnail : media.url}
                  alt={media.title}
                  className="w-full h-full object-contain"
                />

                {/* Annotation Canvas Overlay (placeholder) */}
                <div className="absolute inset-0 cursor-crosshair">
                  {/* Canvas would go here - using SVG or HTML Canvas */}
                </div>

                {/* Video Play Button Overlay */}
                {media.type === 'video' && !isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-7 w-7 text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              {media.type === 'video' && (
                <div className="p-3 border-t bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <SkipForward className="h-4 w-4" />
                    </Button>

                    <span className="text-xs text-muted-foreground w-12">{formatTime(currentTime)}</span>

                    <input
                      type="range"
                      value={currentTime}
                      onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                      max={duration}
                      step={0.1}
                      className="flex-1 h-1 accent-primary"
                    />

                    <span className="text-xs text-muted-foreground w-12">{formatTime(duration)}</span>

                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Media Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                {media.type === 'video' ? (
                  <Video className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Image className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">{media.title}</span>
              </div>

              <Separator />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student</span>
                  <span>{media.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(media.sessionDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{media.type}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Annotations List */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Annotations</h3>
              <div className="text-center py-6 text-muted-foreground">
                <Pencil className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No annotations yet</p>
                <p className="text-[10px] mt-1">Use the tools above to mark up this {media.type}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                <Share2 className="h-3.5 w-3.5" />
                Share with Student
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                <Download className="h-3.5 w-3.5" />
                Download Original
              </Button>
              <Link href={`/studio/sessions/${sessionId}`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back to Session
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
