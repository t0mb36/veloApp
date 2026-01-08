'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { CoachService, ServiceBundle } from '@/types/coach'
import type { CompletedLesson, Program, ContentFolder, ContentItem } from '@/types/studio'
import {
  mockServices,
  mockPrograms,
  mockCompletedLessons,
  mockFolders,
  mockContentItems,
  folderColorOptions,
  DURATION_OPTIONS,
} from '@/lib/mock-data/studio'
import {
  Clapperboard,
  Video,
  FileText,
  BarChart3,
  BookOpen,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Clock,
  CreditCard,
  X,
  Check,
  Calendar,
  CalendarRange,
  Sparkles,
  Users,
  Image,
  Upload,
  Play,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Columns3,
  Layers,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Eye,
  Archive,
  FolderPlus,
  Folder,
  FolderOpen,
  File,
  Film,
  FileImage,
  FileVideo,
  Link2,
  Tag,
  Grid3X3,
  List,
} from 'lucide-react'

type TabKey = 'services' | 'programs' | 'sessions' | 'content' | 'analytics'
type ServiceType = 'session' | 'program' | 'custom' | 'group'

const tabs: { key: TabKey; label: string; icon: React.ElementType; available: boolean }[] = [
  { key: 'services', label: 'Services & Pricing', icon: DollarSign, available: true },
  { key: 'sessions', label: 'Sessions', icon: FileText, available: true },
  { key: 'programs', label: 'Programs', icon: BookOpen, available: true },
  { key: 'content', label: 'Content', icon: Layers, available: true },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, available: false },
]

interface ServiceFormData {
  name: string
  type: ServiceType
  price: string
  duration: number
  customDuration: string
  programWeeks: string
  customServiceDuration: string // optional duration for custom services
  maxSeats: string // for group sessions
  description: string
  isActive: boolean
  // Bundle option for sessions
  offerBundle: boolean
  bundleCredits: string
  bundlePrice: string
  bundleExpirationMonths: string
  bundleNeverExpires: boolean
}

const emptyFormData: ServiceFormData = {
  name: '',
  type: 'session',
  price: '',
  duration: 60,
  customDuration: '',
  programWeeks: '',
  customServiceDuration: '',
  maxSeats: '',
  description: '',
  isActive: true,
  offerBundle: false,
  bundleCredits: '',
  bundlePrice: '',
  bundleExpirationMonths: '',
  bundleNeverExpires: false,
}

export default function StudioPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab') as TabKey | null

  const [activeTab, setActiveTab] = useState<TabKey>(tabParam || 'services')

  // Update URL when tab changes
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    router.replace(`/studio?tab=${tab}`, { scroll: false })
  }
  const [services, setServices] = useState<CoachService[]>(mockServices)
  const [isAddingService, setIsAddingService] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>(emptyFormData)

  // Sessions state
  const [sessions] = useState<CompletedLesson[]>(mockCompletedLessons)
  const [sessionSearchQuery, setSessionSearchQuery] = useState('')

  // Programs state
  const [programs] = useState<Program[]>(mockPrograms)
  const [programSearchQuery, setProgramSearchQuery] = useState('')
  const [programStatusFilter, setProgramStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')

  // Content state
  const [folders, setFolders] = useState<ContentFolder[]>(mockFolders)
  const [contentItems, setContentItems] = useState<ContentItem[]>(mockContentItems)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null) // null = All Content
  const [contentSearchQuery, setContentSearchQuery] = useState('')
  const [contentViewMode, setContentViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false)
  const [creatingInFolderId, setCreatingInFolderId] = useState<string | null>(null) // parent folder for new folder
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'video' as ContentItem['type'],
    folderId: null as string | null,
    tags: '',
    fileUrl: '',
  })

  // Sync tab with URL param
  useEffect(() => {
    if (tabParam && tabs.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const resetForm = () => {
    setFormData(emptyFormData)
    setIsAddingService(false)
    setEditingServiceId(null)
  }

  const handleEditService = (service: CoachService) => {
    const isCustomDuration = Boolean(
      service.type === 'session' &&
      service.duration &&
      !DURATION_OPTIONS.includes(service.duration)
    )
    setFormData({
      name: service.name,
      type: service.type,
      price: service.price.toString(),
      duration: isCustomDuration ? 60 : (service.duration || 60),
      customDuration: isCustomDuration && service.duration ? service.duration.toString() : '',
      programWeeks: service.type === 'program' && service.duration ? service.duration.toString() : '',
      customServiceDuration: service.type === 'custom' && service.duration ? service.duration.toString() : '',
      maxSeats: service.maxSeats?.toString() || '',
      description: service.description || '',
      isActive: service.isActive,
      offerBundle: !!service.bundle,
      bundleCredits: service.bundle?.credits?.toString() || '',
      bundlePrice: service.bundle?.price?.toString() || '',
      bundleExpirationMonths: service.bundle?.expirationMonths?.toString() || '',
      bundleNeverExpires: !service.bundle?.expirationMonths,
    })
    setEditingServiceId(service.id)
    setIsAddingService(false)
  }

  const handleSaveService = () => {
    // Determine duration based on service type
    let finalDuration: number | undefined
    let durationUnit: 'minutes' | 'weeks' | undefined

    if (formData.type === 'session') {
      finalDuration = formData.customDuration
        ? parseInt(formData.customDuration)
        : formData.duration
      durationUnit = 'minutes'
    } else if (formData.type === 'program') {
      finalDuration = parseInt(formData.programWeeks) || undefined
      durationUnit = 'weeks'
    } else if (formData.type === 'custom' && formData.customServiceDuration) {
      finalDuration = parseInt(formData.customServiceDuration) || undefined
      durationUnit = 'minutes'
    } else if (formData.type === 'group') {
      finalDuration = formData.customDuration
        ? parseInt(formData.customDuration)
        : formData.duration
      durationUnit = 'minutes'
    }

    // Build bundle if offered for sessions
    let bundle: ServiceBundle | undefined
    if (formData.type === 'session' && formData.offerBundle) {
      const credits = parseInt(formData.bundleCredits) || 0
      const price = parseFloat(formData.bundlePrice) || 0
      if (credits > 0 && price > 0) {
        bundle = {
          credits,
          price,
          expirationMonths: formData.bundleNeverExpires
            ? undefined
            : parseInt(formData.bundleExpirationMonths) || undefined,
        }
      }
    }

    const newService: CoachService = {
      id: editingServiceId || crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      price: parseFloat(formData.price) || 0,
      duration: finalDuration,
      durationUnit,
      maxSeats: formData.type === 'group' && formData.maxSeats ? parseInt(formData.maxSeats) : undefined,
      bundle,
      description: formData.description || undefined,
      isActive: formData.isActive,
    }

    if (editingServiceId) {
      setServices((prev) => prev.map((s) => (s.id === editingServiceId ? newService : s)))
    } else {
      setServices((prev) => [...prev, newService])
    }

    resetForm()
  }

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
    if (editingServiceId === id) {
      resetForm()
    }
  }

  const handleToggleActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    )
  }

  const isFormValid =
    formData.name.trim() &&
    formData.price &&
    parseFloat(formData.price) > 0 &&
    // Session: duration is always valid (preset or custom)
    (formData.type !== 'session' || formData.duration > 0 || (formData.customDuration && parseInt(formData.customDuration) > 0)) &&
    // Session with bundle: needs credits and price if bundle is offered
    (formData.type !== 'session' || !formData.offerBundle || (formData.bundleCredits && parseInt(formData.bundleCredits) > 0 && formData.bundlePrice && parseFloat(formData.bundlePrice) > 0)) &&
    // Program: needs weeks
    (formData.type !== 'program' || (formData.programWeeks && parseInt(formData.programWeeks) > 0)) &&
    // Group: needs duration and maxSeats
    (formData.type !== 'group' || (
      (formData.duration > 0 || (formData.customDuration && parseInt(formData.customDuration) > 0)) &&
      formData.maxSeats && parseInt(formData.maxSeats) > 0
    )) &&
    // Custom: always valid (duration is optional)
    true

  // Sessions helpers
  const filteredSessions = sessions.filter((session) =>
    session.studentName.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
    session.serviceName.toLowerCase().includes(sessionSearchQuery.toLowerCase())
  )

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatSessionTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  // Programs helpers
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(programSearchQuery.toLowerCase()) ||
      program.sport?.toLowerCase().includes(programSearchQuery.toLowerCase())
    const matchesStatus = programStatusFilter === 'all' || program.status === programStatusFilter
    return matchesSearch && matchesStatus
  })

  const formatProgramDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusColor = (status: Program['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700'
      case 'archived':
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getSportColor = (sport?: string) => {
    switch (sport?.toLowerCase()) {
      case 'baseball':
        return 'bg-red-100 text-red-700'
      case 'basketball':
        return 'bg-orange-100 text-orange-700'
      case 'tennis':
        return 'bg-green-100 text-green-700'
      case 'fitness':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-purple-100 text-purple-700'
    }
  }

  // Content helpers
  const filteredContentItems = contentItems.filter((item) => {
    let matchesFolder = false
    if (selectedFolderId === null) {
      matchesFolder = true // Show all content
    } else if (selectedFolderId === 'uncategorized') {
      matchesFolder = item.folderId === null
    } else {
      matchesFolder = item.folderId === selectedFolderId
    }
    const matchesSearch = contentSearchQuery === '' ||
      item.title.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(contentSearchQuery.toLowerCase()))
    return matchesFolder && matchesSearch
  })

  const getContentCountForFolder = (folderId: string) => {
    return contentItems.filter(item => item.folderId === folderId).length
  }

  const getContentItemsForFolder = (folderId: string) => {
    return contentItems.filter(item => item.folderId === folderId)
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

  const getContentTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'video':
        return Film
      case 'image':
        return FileImage
      case 'document':
        return FileText
      case 'link':
        return Link2
    }
  }

  const handleStartNewFolder = (parentId: string | null = null) => {
    setIsCreatingNewFolder(true)
    setCreatingInFolderId(parentId)
    setNewFolderName('')
    // Auto-expand parent folder if creating inside one
    if (parentId) {
      setExpandedFolders(prev => new Set([...prev, parentId]))
    }
  }

  const handleSaveNewFolder = () => {
    if (!newFolderName.trim()) {
      setIsCreatingNewFolder(false)
      setCreatingInFolderId(null)
      return
    }
    const newFolder: ContentFolder = {
      id: crypto.randomUUID(),
      name: newFolderName.trim(),
      color: 'bg-blue-500', // Keep for compatibility but won't display
      parentId: creatingInFolderId,
      createdAt: new Date().toISOString(),
    }
    setFolders(prev => [...prev, newFolder])
    setNewFolderName('')
    setIsCreatingNewFolder(false)
    setCreatingInFolderId(null)
  }

  const handleNewFolderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveNewFolder()
    } else if (e.key === 'Escape') {
      setIsCreatingNewFolder(false)
      setCreatingInFolderId(null)
      setNewFolderName('')
    }
  }

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const getChildFolders = (parentId: string | null) => {
    return folders.filter(f => f.parentId === parentId)
  }

  const hasChildFolders = (folderId: string) => {
    return folders.some(f => f.parentId === folderId)
  }

  // Get all descendant folder IDs for a folder (for content counting)
  const getAllDescendantIds = (folderId: string): string[] => {
    const children = folders.filter(f => f.parentId === folderId)
    const descendantIds: string[] = [folderId]
    for (const child of children) {
      descendantIds.push(...getAllDescendantIds(child.id))
    }
    return descendantIds
  }

  const getContentCountForFolderRecursive = (folderId: string) => {
    const allIds = getAllDescendantIds(folderId)
    return contentItems.filter(item => item.folderId && allIds.includes(item.folderId)).length
  }

  const handleUpdateFolder = () => {
    if (!editingFolderId || !newFolderName.trim()) return
    setFolders(prev => prev.map(f =>
      f.id === editingFolderId
        ? { ...f, name: newFolderName.trim() }
        : f
    ))
    setEditingFolderId(null)
    setNewFolderName('')
  }

  const handleDeleteFolder = (folderId: string) => {
    // Get all descendant folders to delete
    const allIdsToDelete = getAllDescendantIds(folderId)
    // Move content from all deleted folders to uncategorized
    setContentItems(prev => prev.map(item =>
      item.folderId && allIdsToDelete.includes(item.folderId) ? { ...item, folderId: null } : item
    ))
    // Delete folder and all descendants
    setFolders(prev => prev.filter(f => !allIdsToDelete.includes(f.id)))
    if (selectedFolderId && allIdsToDelete.includes(selectedFolderId)) {
      setSelectedFolderId(null)
    }
  }

  const handleUploadContent = () => {
    if (!uploadForm.title.trim()) return
    const newContent: ContentItem = {
      id: crypto.randomUUID(),
      title: uploadForm.title.trim(),
      description: uploadForm.description.trim() || undefined,
      type: uploadForm.type,
      folderId: uploadForm.folderId,
      tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      fileUrl: uploadForm.fileUrl || undefined,
      thumbnailUrl: `https://placehold.co/320x180/1a1a2e/ffffff?text=${encodeURIComponent(uploadForm.title.slice(0, 10))}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setContentItems(prev => [...prev, newContent])
    setUploadForm({
      title: '',
      description: '',
      type: 'video',
      folderId: null,
      tags: '',
      fileUrl: '',
    })
    setIsUploadModalOpen(false)
  }

  const handleDeleteContent = (contentId: string) => {
    setContentItems(prev => prev.filter(c => c.id !== contentId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Clapperboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Coach Studio</h1>
          <p className="text-sm text-muted-foreground">
            Manage your services, programs, and coaching tools
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => tab.available && handleTabChange(tab.key)}
            disabled={!tab.available}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
              !tab.available && 'opacity-50 cursor-not-allowed'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {!tab.available && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Soon
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Services Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Services & Pricing</h2>
              <p className="text-sm text-muted-foreground">
                Configure the services you offer and their pricing
              </p>
            </div>
            {!isAddingService && !editingServiceId && (
              <Button onClick={() => setIsAddingService(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            )}
          </div>

          {/* Add/Edit Service Form */}
          {(isAddingService || editingServiceId) && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">
                  {editingServiceId ? 'Edit Service' : 'Add New Service'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service Type Toggle */}
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={formData.type === 'session' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, type: 'session' }))}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Session
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'program' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, type: 'program' }))}
                      className="gap-2"
                    >
                      <CalendarRange className="h-4 w-4" />
                      Program
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, type: 'custom' }))}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Custom
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'group' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, type: 'group' }))}
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Group
                    </Button>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="service-name">Service Name</Label>
                  <Input
                    id="service-name"
                    placeholder={
                      formData.type === 'session'
                        ? 'e.g., Private Lesson'
                        : formData.type === 'program'
                          ? 'e.g., 10-Week Strength Training'
                          : 'e.g., Video Analysis, Equipment Rental'
                    }
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Session-specific fields */}
                {formData.type === 'session' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <div className="flex flex-wrap items-center gap-1">
                        {DURATION_OPTIONS.map((mins) => (
                          <Button
                            key={mins}
                            type="button"
                            variant={!formData.customDuration && formData.duration === mins ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData((prev) => ({ ...prev, duration: mins, customDuration: '' }))}
                          >
                            {mins}
                          </Button>
                        ))}
                        <div className="flex items-center">
                          <Input
                            type="number"
                            placeholder="Custom"
                            value={formData.customDuration}
                            onChange={(e) => setFormData((prev) => ({ ...prev, customDuration: e.target.value }))}
                            className="w-20 h-9 text-sm"
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-price">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="session-price"
                          type="number"
                          placeholder="0"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                          className="pl-7"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bundle option for sessions */}
                {formData.type === 'session' && (
                  <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.offerBundle}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, offerBundle: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-muted-foreground"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Also offer as a bundle</span>
                      </div>
                    </label>

                    {formData.offerBundle && (
                      <div className="space-y-4 pl-7">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="bundle-credits">Number of Sessions</Label>
                            <Input
                              id="bundle-credits"
                              type="number"
                              placeholder="e.g., 10"
                              value={formData.bundleCredits}
                              onChange={(e) => setFormData((prev) => ({ ...prev, bundleCredits: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bundle-price">Bundle Price</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                id="bundle-price"
                                type="number"
                                placeholder="0"
                                value={formData.bundlePrice}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bundlePrice: e.target.value }))}
                                className="pl-7"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Expiration</Label>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="6"
                                value={formData.bundleExpirationMonths}
                                onChange={(e) =>
                                  setFormData((prev) => ({ ...prev, bundleExpirationMonths: e.target.value }))
                                }
                                disabled={formData.bundleNeverExpires}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">months</span>
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.bundleNeverExpires}
                                onChange={(e) =>
                                  setFormData((prev) => ({ ...prev, bundleNeverExpires: e.target.checked }))
                                }
                                className="rounded border-muted-foreground"
                              />
                              Never expires
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Program-specific fields */}
                {formData.type === 'program' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="program-weeks">Duration (weeks)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="program-weeks"
                          type="number"
                          placeholder="e.g., 10"
                          value={formData.programWeeks}
                          onChange={(e) => setFormData((prev) => ({ ...prev, programWeeks: e.target.value }))}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">weeks</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program-price">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="program-price"
                          type="number"
                          placeholder="0"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                          className="pl-7"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom service type fields */}
                {formData.type === 'custom' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="custom-duration">Duration (optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="custom-duration"
                          type="number"
                          placeholder="e.g., 30"
                          value={formData.customServiceDuration}
                          onChange={(e) => setFormData((prev) => ({ ...prev, customServiceDuration: e.target.value }))}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-price">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="custom-price"
                          type="number"
                          placeholder="0"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                          className="pl-7"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Group lesson fields */}
                {formData.type === 'group' && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <div className="flex flex-wrap items-center gap-1">
                          {DURATION_OPTIONS.map((mins) => (
                            <Button
                              key={mins}
                              type="button"
                              variant={!formData.customDuration && formData.duration === mins ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setFormData((prev) => ({ ...prev, duration: mins, customDuration: '' }))}
                            >
                              {mins}
                            </Button>
                          ))}
                          <div className="flex items-center">
                            <Input
                              type="number"
                              placeholder="Custom"
                              value={formData.customDuration}
                              onChange={(e) => setFormData((prev) => ({ ...prev, customDuration: e.target.value }))}
                              className="w-20 h-9 text-sm"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">min</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="group-max-seats">Max Students</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="group-max-seats"
                            type="number"
                            placeholder="e.g., 4"
                            value={formData.maxSeats}
                            onChange={(e) => setFormData((prev) => ({ ...prev, maxSeats: e.target.value }))}
                            className="w-24"
                            min={2}
                          />
                          <span className="text-sm text-muted-foreground">students</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="group-price">Price per Student</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="group-price"
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                            className="pl-7"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="service-description">
                    Description {formData.type === 'custom' ? '' : '(optional)'}
                  </Label>
                  <Textarea
                    id="service-description"
                    placeholder="Describe what's included in this service..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                {/* Active Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-muted-foreground"
                  />
                  <span className="text-sm">Active (visible to students)</span>
                </label>

                <Separator />

                {/* Form Actions */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveService} disabled={!isFormValid}>
                    {editingServiceId ? 'Save Changes' : 'Add Service'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services List */}
          <div className="space-y-3">
            {services.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    No services configured yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add your first service to start accepting bookings
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-1"
                    onClick={() => setIsAddingService(true)}
                  >
                    <Plus className="h-3 w-3" />
                    Add Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              services.map((service) => (
                <Card
                  key={service.id}
                  className={cn(!service.isActive && 'opacity-60')}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                            service.type === 'session' && 'bg-blue-100 text-blue-600',
                            service.type === 'program' && 'bg-orange-100 text-orange-600',
                            service.type === 'custom' && 'bg-purple-100 text-purple-600',
                            service.type === 'group' && 'bg-green-100 text-green-600'
                          )}
                        >
                          {service.type === 'session' && <Clock className="h-5 w-5" />}
                          {service.type === 'program' && <CalendarRange className="h-5 w-5" />}
                          {service.type === 'custom' && <Sparkles className="h-5 w-5" />}
                          {service.type === 'group' && <Users className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{service.name}</h3>
                            {!service.isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                            {service.bundle && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <CreditCard className="h-3 w-3" />
                                Bundle
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {service.type === 'session' && (
                              <>{service.duration} min session</>
                            )}
                            {service.type === 'program' && (
                              <>{service.duration} week program</>
                            )}
                            {service.type === 'custom' && (
                              <>
                                Custom
                                {service.duration && <> • {service.duration} min</>}
                              </>
                            )}
                            {service.type === 'group' && (
                              <>
                                {service.duration} min • Max {service.maxSeats} students
                              </>
                            )}
                          </p>
                          {service.bundle && (
                            <p className="text-xs text-green-600 mt-1">
                              Bundle: {service.bundle.credits} sessions for ${service.bundle.price}
                              {service.bundle.expirationMonths && (
                                <> • Valid {service.bundle.expirationMonths} mo</>
                              )}
                              {!service.bundle.expirationMonths && <> • Never expires</>}
                            </p>
                          )}
                          {service.description && (
                            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">${service.price}</p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditService(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Table Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={sessionSearchQuery}
                onChange={(e) => setSessionSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 h-9">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9">
              <Columns3 className="h-4 w-4" />
              Columns
            </Button>
          </div>

          {/* Sessions Table */}
          <Card>
            <CardContent className="p-0">
              {filteredSessions.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {sessionSearchQuery ? 'No sessions match your search' : 'No completed sessions yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Student</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Service</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Time</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Duration</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Attachments</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map((session) => (
                        <tr
                          key={session.id}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => router.push(`/studio/sessions/${session.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full bg-muted overflow-hidden shrink-0">
                                {session.studentAvatar ? (
                                  <img
                                    src={session.studentAvatar}
                                    alt={session.studentName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-xs font-medium">
                                    {session.studentName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium">{session.studentName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs font-normal',
                                session.serviceType === 'session' && 'bg-blue-100 text-blue-700',
                                session.serviceType === 'group' && 'bg-green-100 text-green-700',
                                session.serviceType === 'program' && 'bg-orange-100 text-orange-700',
                                session.serviceType === 'custom' && 'bg-purple-100 text-purple-700'
                              )}
                            >
                              {session.serviceName}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatSessionDate(session.date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatSessionTime(session.date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {session.duration} min
                          </td>
                          <td className="px-4 py-3">
                            {session.attachments.length > 0 ? (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                {session.attachments.some((a) => a.type === 'photo') && (
                                  <Image className="h-3.5 w-3.5" />
                                )}
                                {session.attachments.some((a) => a.type === 'video') && (
                                  <Video className="h-3.5 w-3.5" />
                                )}
                                {session.attachments.some((a) => a.type === 'note') && (
                                  <MessageSquare className="h-3.5 w-3.5" />
                                )}
                                <span className="text-xs">({session.attachments.length})</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/studio/sessions/${session.id}`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          {/* Table Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
                  value={programSearchQuery}
                  onChange={(e) => setProgramSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex gap-1">
                {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={programStatusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 capitalize"
                    onClick={() => setProgramStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            <Link href="/studio/programs/new">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Program
              </Button>
            </Link>
          </div>

          {/* Programs Grid */}
          {filteredPrograms.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  {programSearchQuery || programStatusFilter !== 'all'
                    ? 'No programs match your filters'
                    : 'No programs created yet'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first program to start assigning to students
                </p>
                <Link href="/studio/programs/new">
                  <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                    <Plus className="h-4 w-4" />
                    Create Program
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:border-primary/50 transition-colors group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', getStatusColor(program.status))}
                        >
                          {program.status}
                        </Badge>
                        {program.sport && (
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', getSportColor(program.sport))}
                          >
                            {program.sport}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Duplicate">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="More options">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <Link href={`/studio/programs/${program.id}`} className="block">
                      <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors">
                        {program.name}
                      </h3>
                    </Link>

                    {program.description && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {program.durationWeeks} weeks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {program.daysPerWeek} days/wk
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {program.assignedCount} assigned
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">
                        Updated {formatProgramDate(program.updatedAt)}
                      </span>
                      <div className="flex gap-1">
                        <Link href={`/studio/programs/${program.id}`}>
                          <Button variant="outline" size="sm" className="h-7 gap-1">
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/studio/programs/${program.id}?preview=true`}>
                          <Button variant="ghost" size="sm" className="h-7 gap-1">
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="flex gap-6">
          {/* Folder Sidebar */}
          <div className="w-64 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Folders</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleStartNewFolder()}
                disabled={isCreatingNewFolder}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-0.5">
              {/* All Content */}
              <button
                onClick={() => setSelectedFolderId(null)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                  selectedFolderId === null
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">All Content</span>
                <span className="text-xs opacity-70">{contentItems.length}</span>
              </button>

              {/* Recursive Folder Tree */}
              {(() => {
                const renderFolderTree = (parentId: string | null, depth: number = 0): React.ReactNode => {
                  const childFolders = getChildFolders(parentId)
                  const indentPx = depth * 12

                  return (
                    <>
                      {childFolders.map((folder) => {
                        const isExpanded = expandedFolders.has(folder.id)
                        const contentCount = getContentCountForFolderRecursive(folder.id)

                        return (
                          <div key={folder.id}>
                            {editingFolderId === folder.id ? (
                              /* Inline Edit Mode */
                              <div
                                className="flex items-center gap-1.5 py-1.5 px-2 rounded border-2 border-dashed border-primary bg-primary/5"
                                style={{ marginLeft: indentPx }}
                              >
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <input
                                  type="text"
                                  value={newFolderName}
                                  onChange={(e) => setNewFolderName(e.target.value)}
                                  onBlur={handleUpdateFolder}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateFolder()
                                    if (e.key === 'Escape') {
                                      setEditingFolderId(null)
                                      setNewFolderName('')
                                    }
                                  }}
                                  autoFocus
                                  className="flex-1 bg-transparent text-sm outline-none min-w-0"
                                  placeholder="Folder name..."
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  'group flex items-center gap-1 py-1.5 px-2 rounded text-sm transition-colors',
                                  selectedFolderId === folder.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                )}
                                style={{ paddingLeft: indentPx + 8 }}
                              >
                                {/* Expand/Collapse Chevron - always visible */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFolderExpanded(folder.id)
                                  }}
                                  className="p-0.5 rounded hover:bg-muted-foreground/20 shrink-0"
                                >
                                  <ChevronRight className={cn(
                                    'h-3 w-3 transition-transform',
                                    isExpanded && 'rotate-90'
                                  )} />
                                </button>

                                {/* Folder icon and name - clickable to select */}
                                <button
                                  onClick={() => setSelectedFolderId(folder.id)}
                                  className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                                >
                                  {isExpanded ? (
                                    <FolderOpen className="h-4 w-4 shrink-0" />
                                  ) : (
                                    <Folder className="h-4 w-4 shrink-0" />
                                  )}
                                  <span className="truncate">{folder.name}</span>
                                </button>

                                {/* Content count - hidden on hover to make room for actions */}
                                <span className="text-xs opacity-70 group-hover:hidden shrink-0">
                                  {contentCount}
                                </span>

                                {/* Action buttons - shown on hover */}
                                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStartNewFolder(folder.id)
                                    }}
                                    className={cn(
                                      'p-1 rounded',
                                      selectedFolderId === folder.id
                                        ? 'hover:bg-primary-foreground/20'
                                        : 'hover:bg-muted-foreground/20'
                                    )}
                                    title="New subfolder"
                                  >
                                    <FolderPlus className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingFolderId(folder.id)
                                      setNewFolderName(folder.name)
                                    }}
                                    className={cn(
                                      'p-1 rounded',
                                      selectedFolderId === folder.id
                                        ? 'hover:bg-primary-foreground/20'
                                        : 'hover:bg-muted-foreground/20'
                                    )}
                                    title="Rename"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteFolder(folder.id)
                                    }}
                                    className={cn(
                                      'p-1 rounded',
                                      selectedFolderId === folder.id
                                        ? 'hover:bg-primary-foreground/20 text-red-200'
                                        : 'hover:bg-destructive/20 text-destructive'
                                    )}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Inline new folder creation for this parent */}
                            {isCreatingNewFolder && creatingInFolderId === folder.id && (
                              <div
                                className="flex items-center gap-1.5 py-1.5 px-2 rounded border-2 border-dashed border-primary bg-primary/5"
                                style={{ marginLeft: indentPx + 12 }}
                              >
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <input
                                  type="text"
                                  value={newFolderName}
                                  onChange={(e) => setNewFolderName(e.target.value)}
                                  onBlur={handleSaveNewFolder}
                                  onKeyDown={handleNewFolderKeyDown}
                                  autoFocus
                                  className="flex-1 bg-transparent text-sm outline-none min-w-0"
                                  placeholder="New folder..."
                                />
                              </div>
                            )}

                            {/* Render children and content items if expanded */}
                            {isExpanded && (
                              <>
                                {renderFolderTree(folder.id, depth + 1)}
                                {/* Content items in this folder */}
                                {getContentItemsForFolder(folder.id).map((item) => {
                                  const TypeIcon = getContentTypeIcon(item.type)
                                  return (
                                    <Link
                                      key={item.id}
                                      href={`/studio/content/${item.id}`}
                                      className="flex items-center gap-1.5 py-1 px-2 rounded text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                      style={{ paddingLeft: indentPx + 32 }}
                                    >
                                      <TypeIcon className="h-3.5 w-3.5 shrink-0" />
                                      <span className="truncate">{item.title}</span>
                                    </Link>
                                  )
                                })}
                              </>
                            )}
                          </div>
                        )
                      })}

                      {/* Inline new folder creation at root level */}
                      {parentId === null && isCreatingNewFolder && creatingInFolderId === null && (
                        <div
                          className="flex items-center gap-1.5 py-1.5 px-2 rounded border-2 border-dashed border-primary bg-primary/5"
                          style={{ marginLeft: indentPx }}
                        >
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onBlur={handleSaveNewFolder}
                            onKeyDown={handleNewFolderKeyDown}
                            autoFocus
                            className="flex-1 bg-transparent text-sm outline-none min-w-0"
                            placeholder="New folder..."
                          />
                        </div>
                      )}
                    </>
                  )
                }

                return renderFolderTree(null)
              })()}

              {/* Uncategorized */}
              <button
                onClick={() => setSelectedFolderId('uncategorized')}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors mt-2 border-t pt-2',
                  selectedFolderId === 'uncategorized'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                )}
              >
                <Folder className="h-4 w-4" />
                <span className="flex-1 text-left">Uncategorized</span>
                <span className="text-xs opacity-70">
                  {contentItems.filter(c => c.folderId === null).length}
                </span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={contentSearchQuery}
                    onChange={(e) => setContentSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setContentViewMode('grid')}
                    className={cn(
                      'p-2 transition-colors',
                      contentViewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setContentViewMode('list')}
                    className={cn(
                      'p-2 transition-colors',
                      contentViewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button onClick={() => setIsUploadModalOpen(true)} className="gap-1.5">
                <Upload className="h-4 w-4" />
                Upload Content
              </Button>
            </div>

            {/* Content Grid/List */}
            {filteredContentItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Layers className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    {contentSearchQuery ? 'No content matches your search' : 'No content yet'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload videos, images, or documents to share with students
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-1.5"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Content
                  </Button>
                </CardContent>
              </Card>
            ) : contentViewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredContentItems.map((item) => {
                  const TypeIcon = getContentTypeIcon(item.type)
                  return (
                    <Card key={item.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted relative">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="gap-1 text-xs bg-background/80 backdrop-blur-sm">
                            <TypeIcon className="h-3 w-3" />
                            {item.type}
                          </Badge>
                        </div>
                        {/* Duration for videos */}
                        {item.type === 'video' && item.duration && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                            {formatDuration(item.duration)}
                          </div>
                        )}
                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Link href={`/studio/content/${item.id}`}>
                            <Button size="sm" variant="secondary" className="gap-1">
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeleteContent(item.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <Link href={`/studio/content/${item.id}`} className="hover:text-primary transition-colors">
                          <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        </Link>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t text-[10px] text-muted-foreground">
                          <span>{item.fileSize && formatFileSize(item.fileSize)}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              /* List View */
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Type</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Folder</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Size</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                        <th className="w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContentItems.map((item) => {
                        const TypeIcon = getContentTypeIcon(item.type)
                        const folder = folders.find(f => f.id === item.folderId)
                        return (
                          <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-14 rounded bg-muted overflow-hidden shrink-0">
                                  {item.thumbnailUrl ? (
                                    <img
                                      src={item.thumbnailUrl}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <TypeIcon className="h-5 w-5 text-muted-foreground/50" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Link href={`/studio/content/${item.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                                    {item.title}
                                  </Link>
                                  {item.tags.length > 0 && (
                                    <div className="flex gap-1 mt-0.5">
                                      {item.tags.slice(0, 2).map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-[10px] text-muted-foreground"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="gap-1 text-xs capitalize">
                                <TypeIcon className="h-3 w-3" />
                                {item.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {folder ? (
                                <div className="flex items-center gap-1.5">
                                  <div className={cn('h-2.5 w-2.5 rounded-sm', folder.color)} />
                                  <span className="text-sm">{folder.name}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {item.fileSize ? formatFileSize(item.fileSize) : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <Link href={`/studio/content/${item.id}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteContent(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Upload Content Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upload Content</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsUploadModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">Video, Image, or Document</p>
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="flex gap-2">
                  {(['video', 'image', 'document', 'link'] as const).map((type) => {
                    const icons = { video: Film, image: FileImage, document: FileText, link: Link2 }
                    const Icon = icons[type]
                    return (
                      <Button
                        key={type}
                        type="button"
                        variant={uploadForm.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUploadForm(prev => ({ ...prev, type }))}
                        className="gap-1.5 capitalize"
                      >
                        <Icon className="h-4 w-4" />
                        {type}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="content-title">Title</Label>
                <Input
                  id="content-title"
                  placeholder="e.g., 4-Seam Fastball Grip Tutorial"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="content-description">Description</Label>
                <Textarea
                  id="content-description"
                  placeholder="Describe what this content covers..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Folder */}
              <div className="space-y-2">
                <Label htmlFor="content-folder">Folder</Label>
                <select
                  id="content-folder"
                  value={uploadForm.folderId || ''}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, folderId: e.target.value || null }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">No folder (Uncategorized)</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="content-tags">Tags</Label>
                <Input
                  id="content-tags"
                  placeholder="e.g., pitching, fastball, beginner (comma-separated)"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
              </div>

              {/* URL for link type */}
              {uploadForm.type === 'link' && (
                <div className="space-y-2">
                  <Label htmlFor="content-url">URL</Label>
                  <Input
                    id="content-url"
                    type="url"
                    placeholder="https://example.com/resource"
                    value={uploadForm.fileUrl}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                  />
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadContent}
                  disabled={!uploadForm.title.trim()}
                >
                  Upload Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab - Coming Soon */}
      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              This feature is currently under development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Analytics will be available soon
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
