'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { mockContentItems, mockFolders } from '@/lib/mock-data/studio'
import {
  Film,
  FileImage,
  FileText,
  Link2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Trash2,
  ChevronRight,
  ExternalLink,
  X,
  FolderOpen,
  Share2,
  Plus,
} from 'lucide-react'

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return Film
    case 'image':
      return FileImage
    case 'document':
      return FileText
    case 'link':
      return Link2
    default:
      return FileText
  }
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(1)} GB`
}

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contentId = params.id as string

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Find content item
  const content = mockContentItems.find(item => item.id === contentId)
  const folder = content?.folderId ? mockFolders.find(f => f.id === content.folderId) : null

  // Edit form state - always editable inline
  const [title, setTitle] = useState(content?.title || '')
  const [description, setDescription] = useState(content?.description || '')
  const [tags, setTags] = useState<string[]>(content?.tags || [])
  const [folderId, setFolderId] = useState(content?.folderId || '')
  const [newTag, setNewTag] = useState('')

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <FileText className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Content not found</h2>
        <p className="text-muted-foreground">The content you're looking for doesn't exist.</p>
        <Link href="/studio?tab=content" className="text-primary hover:underline text-sm">
          Back to Content
        </Link>
      </div>
    )
  }

  const TypeIcon = getContentTypeIcon(content.type)

  const handleDelete = () => {
    router.push('/studio?tab=content')
  }

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setNewTag('')
    }
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove))
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/studio" className="hover:text-foreground transition-colors">
          Studio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/studio?tab=content" className="hover:text-foreground transition-colors">
          Content
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {folder && (
          <>
            <Link
              href={`/studio?tab=content&folder=${folder.id}`}
              className="hover:text-foreground transition-colors"
            >
              {folder.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-foreground font-medium truncate max-w-[200px]">{content.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Content Preview - Left Side */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="overflow-hidden flex-1 flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              {content.type === 'video' && (
                <div className="relative flex-1 bg-black min-h-[300px]">
                  {content.thumbnailUrl ? (
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center absolute inset-0">
                      <Film className="h-24 w-24 text-white/20" />
                    </div>
                  )}
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                      )}
                    </button>
                  </div>
                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </button>
                        <button onClick={() => setIsMuted(!isMuted)}>
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                        <span className="text-sm">
                          0:00 / {content.duration ? formatDuration(content.duration) : '0:00'}
                        </span>
                      </div>
                      <button>
                        <Maximize className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {content.type === 'image' && (
                <div className="flex-1 bg-muted flex items-center justify-center min-h-[300px]">
                  {content.thumbnailUrl ? (
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <FileImage className="h-24 w-24 text-muted-foreground/30" />
                  )}
                </div>
              )}

              {content.type === 'document' && (
                <div className="flex-1 bg-muted flex flex-col items-center justify-center gap-4 min-h-[300px]">
                  <FileText className="h-24 w-24 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Document preview not available</p>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Document
                  </Button>
                </div>
              )}

              {content.type === 'link' && (
                <div className="flex-1 bg-muted flex flex-col items-center justify-center gap-4 min-h-[300px]">
                  <Link2 className="h-24 w-24 text-muted-foreground/30" />
                  <p className="text-muted-foreground">External link</p>
                  {content.fileUrl && (
                    <a href={content.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open Link
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Sidebar - Right Side */}
        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              {/* Title - Inline editable */}
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent font-medium text-sm outline-none hover:bg-muted/50 focus:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors"
                />
              </div>

              {/* Description - Inline editable */}
              <div className="space-y-0.5 mt-3">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={2}
                  className="w-full bg-transparent text-sm text-muted-foreground outline-none hover:bg-muted/50 focus:bg-muted/50 rounded px-1 -mx-1 py-0.5 resize-none transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Folder - Inline editable */}
              <div className="space-y-0.5 mt-3">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Folder</span>
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <select
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none hover:bg-muted/50 focus:bg-muted/50 rounded px-1 -mx-1 py-0.5 cursor-pointer transition-colors"
                  >
                    <option value="">Uncategorized</option>
                    {mockFolders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags - Always interactive */}
              <div className="space-y-1.5 mt-3">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Tags</span>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs pr-1 group">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-0.5 opacity-50 group-hover:opacity-100 hover:text-destructive transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder={tags.length === 0 ? "Add tag..." : "+"}
                      className="w-14 bg-transparent text-xs outline-none hover:bg-muted/50 focus:bg-muted/50 rounded px-1 py-0.5 transition-colors placeholder:text-muted-foreground/50"
                    />
                    {newTag && (
                      <button
                        onClick={handleAddTag}
                        className="p-0.5 hover:bg-muted rounded transition-colors"
                      >
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize text-right">{content.type}</span>

                {content.fileSize && (
                  <>
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-right">{formatFileSize(content.fileSize)}</span>
                  </>
                )}

                {content.duration && (
                  <>
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-right">{formatDuration(content.duration)}</span>
                  </>
                )}

                <span className="text-muted-foreground">Created</span>
                <span className="text-right">{new Date(content.createdAt).toLocaleDateString()}</span>

                <span className="text-muted-foreground">Updated</span>
                <span className="text-right">{new Date(content.updatedAt).toLocaleDateString()}</span>
              </div>

              {/* Spacer to push actions to bottom */}
              <div className="flex-1" />

              <Separator className="my-4" />

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {content.type !== 'link' && (
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
