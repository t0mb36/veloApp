'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
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
} from 'lucide-react'

// Coach Services data model
interface ServiceBundle {
  credits: number
  price: number
  expirationMonths?: number // undefined = never expires
}

interface CoachService {
  id: string
  name: string
  type: 'session' | 'program' | 'custom'
  price: number
  duration?: number // in minutes for sessions, or weeks for programs
  durationUnit?: 'minutes' | 'weeks'
  bundle?: ServiceBundle // optional bundle offer for sessions
  description?: string
  isActive: boolean
}

const initialMockServices: CoachService[] = [
  {
    id: '1',
    name: 'Private Lesson',
    type: 'session',
    duration: 60,
    price: 85,
    bundle: {
      credits: 10,
      price: 750,
      expirationMonths: 6,
    },
    description: 'One-on-one personalized coaching session',
    isActive: true,
  },
  {
    id: '2',
    name: 'Group Session',
    type: 'session',
    duration: 60,
    price: 45,
    description: 'Small group training (2-4 people)',
    isActive: true,
  },
]

const DURATION_OPTIONS = [30, 45, 60, 90]

type TabKey = 'services' | 'programs' | 'video' | 'notes' | 'analytics'
type ServiceType = 'session' | 'program' | 'custom'

const tabs: { key: TabKey; label: string; icon: React.ElementType; available: boolean }[] = [
  { key: 'services', label: 'Services & Pricing', icon: DollarSign, available: true },
  { key: 'programs', label: 'Programs', icon: BookOpen, available: false },
  { key: 'video', label: 'Video Analysis', icon: Video, available: false },
  { key: 'notes', label: 'Lesson Notes', icon: FileText, available: false },
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
  const tabParam = searchParams.get('tab') as TabKey | null

  const [activeTab, setActiveTab] = useState<TabKey>(tabParam || 'services')
  const [services, setServices] = useState<CoachService[]>(initialMockServices)
  const [isAddingService, setIsAddingService] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>(emptyFormData)

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
      id: editingServiceId || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      price: parseFloat(formData.price) || 0,
      duration: finalDuration,
      durationUnit,
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
    // Custom: always valid (duration is optional)
    true

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
            onClick={() => tab.available && setActiveTab(tab.key)}
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
                            service.type === 'custom' && 'bg-purple-100 text-purple-600'
                          )}
                        >
                          {service.type === 'session' && <Clock className="h-5 w-5" />}
                          {service.type === 'program' && <CalendarRange className="h-5 w-5" />}
                          {service.type === 'custom' && <Sparkles className="h-5 w-5" />}
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

      {/* Other tabs - Coming Soon */}
      {activeTab !== 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              This feature is currently under development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-8 text-center">
              {activeTab === 'programs' && <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />}
              {activeTab === 'video' && <Video className="h-12 w-12 mx-auto text-muted-foreground/50" />}
              {activeTab === 'notes' && <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />}
              {activeTab === 'analytics' && <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />}
              <p className="mt-4 text-sm text-muted-foreground">
                {tabs.find((t) => t.key === activeTab)?.label} will be available soon
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
