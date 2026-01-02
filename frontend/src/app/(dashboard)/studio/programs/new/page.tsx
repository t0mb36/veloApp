'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Clock,
  Calendar,
  Save,
  Settings,
  Video,
  Link2,
  Copy,
  X,
  Check,
} from 'lucide-react'

// Types
interface ActivityMetrics {
  type: 'sets_reps' | 'duration' | 'distance' | 'count' | 'custom'
  sets?: number
  reps?: string
  duration?: number
  durationUnit?: 'seconds' | 'minutes'
  distance?: number
  distanceUnit?: 'meters' | 'yards' | 'miles' | 'feet'
  count?: number
  customLabel?: string
  customValue?: string
}

interface Activity {
  id: string
  name: string
  description?: string
  metrics: ActivityMetrics
  notes?: string
  contentId?: string
}

interface ProgramDay {
  id: string
  dayNumber: number
  name: string
  activities: Activity[]
  isExpanded: boolean
}

interface ProgramWeek {
  id: string
  weekNumber: number
  name: string
  days: ProgramDay[]
  isExpanded: boolean
}

// Sport options
const SPORT_OPTIONS = [
  'Baseball', 'Basketball', 'Football', 'Soccer', 'Tennis', 'Golf',
  'Swimming', 'Track & Field', 'Volleyball', 'Hockey', 'Lacrosse',
  'Fitness', 'Strength & Conditioning', 'Other',
]

// Metric type options
const METRIC_TYPES = [
  { value: 'sets_reps', label: 'Sets & Reps', example: '3 x 10' },
  { value: 'duration', label: 'Duration', example: '30 sec' },
  { value: 'distance', label: 'Distance', example: '100m' },
  { value: 'count', label: 'Count', example: '50x' },
  { value: 'custom', label: 'Custom', example: 'Any' },
]

export default function NewProgramPage() {
  const router = useRouter()

  // Program metadata
  const [programName, setProgramName] = useState('')
  const [programDescription, setProgramDescription] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(4)
  const [daysPerWeek, setDaysPerWeek] = useState(5)

  // Program structure
  const [weeks, setWeeks] = useState<ProgramWeek[]>([])
  const [isStructureGenerated, setIsStructureGenerated] = useState(false)

  // Drag state
  const [draggedWeekId, setDraggedWeekId] = useState<string | null>(null)
  const [dragOverWeekId, setDragOverWeekId] = useState<string | null>(null)

  // Activity being edited
  const [editingActivity, setEditingActivity] = useState<{
    weekId: string
    dayId: string
    activity: Activity | null
  } | null>(null)

  // Generate program structure
  const generateStructure = () => {
    const newWeeks: ProgramWeek[] = []
    for (let w = 1; w <= durationWeeks; w++) {
      const days: ProgramDay[] = []
      for (let d = 1; d <= daysPerWeek; d++) {
        days.push({
          id: crypto.randomUUID(),
          dayNumber: d,
          name: `Day ${d}`,
          activities: [],
          isExpanded: false,
        })
      }
      newWeeks.push({
        id: crypto.randomUUID(),
        weekNumber: w,
        name: `Week ${w}`,
        days,
        isExpanded: w === 1,
      })
    }
    setWeeks(newWeeks)
    setIsStructureGenerated(true)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, weekId: string) => {
    setDraggedWeekId(weekId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, weekId: string) => {
    e.preventDefault()
    if (draggedWeekId && draggedWeekId !== weekId) {
      setDragOverWeekId(weekId)
    }
  }

  const handleDragLeave = () => {
    setDragOverWeekId(null)
  }

  const handleDrop = (e: React.DragEvent, targetWeekId: string) => {
    e.preventDefault()
    if (!draggedWeekId || draggedWeekId === targetWeekId) return

    setWeeks(prev => {
      const draggedIndex = prev.findIndex(w => w.id === draggedWeekId)
      const targetIndex = prev.findIndex(w => w.id === targetWeekId)
      const newWeeks = [...prev]
      const [draggedWeek] = newWeeks.splice(draggedIndex, 1)
      newWeeks.splice(targetIndex, 0, draggedWeek)
      // Update week numbers
      return newWeeks.map((w, i) => ({ ...w, weekNumber: i + 1 }))
    })

    setDraggedWeekId(null)
    setDragOverWeekId(null)
  }

  const handleDragEnd = () => {
    setDraggedWeekId(null)
    setDragOverWeekId(null)
  }

  // Toggle week expansion
  const toggleWeek = (weekId: string) => {
    setWeeks(prev => prev.map(w =>
      w.id === weekId ? { ...w, isExpanded: !w.isExpanded } : w
    ))
  }

  // Toggle day expansion
  const toggleDay = (weekId: string, dayId: string) => {
    setWeeks(prev => prev.map(w =>
      w.id === weekId
        ? { ...w, days: w.days.map(d => d.id === dayId ? { ...d, isExpanded: !d.isExpanded } : d) }
        : w
    ))
  }

  // Update week name
  const updateWeekName = (weekId: string, name: string) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, name } : w))
  }

  // Update day name
  const updateDayName = (weekId: string, dayId: string, name: string) => {
    setWeeks(prev => prev.map(w =>
      w.id === weekId
        ? { ...w, days: w.days.map(d => d.id === dayId ? { ...d, name } : d) }
        : w
    ))
  }

  // Delete week
  const deleteWeek = (weekId: string) => {
    setWeeks(prev => {
      const filtered = prev.filter(w => w.id !== weekId)
      return filtered.map((w, i) => ({ ...w, weekNumber: i + 1 }))
    })
    setDurationWeeks(prev => Math.max(1, prev - 1))
  }

  // Add activity to day
  const addActivity = (weekId: string, dayId: string) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: '',
      metrics: { type: 'sets_reps', sets: 3, reps: '10' },
    }
    setEditingActivity({ weekId, dayId, activity: newActivity })
  }

  // Save activity
  const saveActivity = () => {
    if (!editingActivity || !editingActivity.activity?.name.trim()) return

    setWeeks(prev => prev.map(w =>
      w.id === editingActivity.weekId
        ? {
            ...w,
            days: w.days.map(d =>
              d.id === editingActivity.dayId
                ? {
                    ...d,
                    activities: d.activities.find(a => a.id === editingActivity.activity!.id)
                      ? d.activities.map(a => a.id === editingActivity.activity!.id ? editingActivity.activity! : a)
                      : [...d.activities, editingActivity.activity!],
                  }
                : d
            ),
          }
        : w
    ))
    setEditingActivity(null)
  }

  // Delete activity
  const deleteActivity = (weekId: string, dayId: string, activityId: string) => {
    setWeeks(prev => prev.map(w =>
      w.id === weekId
        ? { ...w, days: w.days.map(d => d.id === dayId ? { ...d, activities: d.activities.filter(a => a.id !== activityId) } : d) }
        : w
    ))
  }

  // Edit existing activity
  const editActivity = (weekId: string, dayId: string, activity: Activity) => {
    setEditingActivity({ weekId, dayId, activity: { ...activity } })
  }

  // Copy entire week
  const copyWeek = (weekId: string) => {
    const sourceWeek = weeks.find(w => w.id === weekId)
    if (!sourceWeek) return

    const newWeek: ProgramWeek = {
      ...sourceWeek,
      id: crypto.randomUUID(),
      weekNumber: weeks.length + 1,
      name: `${sourceWeek.name} (Copy)`,
      days: sourceWeek.days.map(d => ({
        ...d,
        id: crypto.randomUUID(),
        activities: d.activities.map(a => ({ ...a, id: crypto.randomUUID() })),
      })),
      isExpanded: true,
    }

    setWeeks(prev => [...prev, newWeek])
    setDurationWeeks(prev => prev + 1)
  }

  // Save program
  const handleSave = (publish: boolean = false) => {
    console.log('Saving program:', { name: programName, description: programDescription, sport: selectedSport, durationWeeks, daysPerWeek, weeks, status: publish ? 'published' : 'draft' })
    router.push('/studio?tab=programs')
  }

  // Get activity count for a week
  const getWeekActivityCount = (week: ProgramWeek) => {
    return week.days.reduce((sum, day) => sum + day.activities.length, 0)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Studio', href: '/studio' },
        { label: 'Programs', href: '/studio?tab=programs' },
        { label: 'New Program' },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create Program</h1>
            <p className="text-sm text-muted-foreground">Build a custom training program for your athletes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)}>
            <Save className="h-4 w-4 mr-1.5" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)}>
            <Check className="h-4 w-4 mr-1.5" />
            Publish
          </Button>
        </div>
      </div>

      {/* Program Setup */}
      {!isStructureGenerated ? (
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="program-name">Program Name *</Label>
              <Input
                id="program-name"
                placeholder="e.g., 8-Week Pitching Development"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sport">Sport / Category</Label>
              <select
                id="sport"
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select a sport...</option>
                {SPORT_OPTIONS.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this program covers and who it's for..."
              value={programDescription}
              onChange={(e) => setProgramDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">weeks</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Training Days per Week</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={daysPerWeek === num ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDaysPerWeek(num)}
                    className="w-9"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={generateStructure} disabled={!programName.trim()} className="w-full">
            Generate Program Structure
          </Button>
        </div>
      ) : (
        <>
          {/* Program Info Summary */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="font-semibold text-lg">{programName}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {selectedSport && <Badge variant="secondary" className="text-xs">{selectedSport}</Badge>}
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{weeks.length} weeks</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{daysPerWeek} days/week</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsStructureGenerated(false)}>
              <Settings className="h-4 w-4 mr-1.5" />
              Edit Settings
            </Button>
          </div>

          {/* Program Builder */}
          <div className="space-y-2">
            {weeks.map((week) => (
              <div
                key={week.id}
                draggable
                onDragStart={(e) => handleDragStart(e, week.id)}
                onDragOver={(e) => handleDragOver(e, week.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, week.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'rounded-lg border transition-all',
                  draggedWeekId === week.id && 'opacity-50',
                  dragOverWeekId === week.id && 'border-primary border-2'
                )}
              >
                {/* Week Header */}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-t-lg border-b">
                  <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded" onMouseDown={(e) => e.stopPropagation()}>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <button onClick={() => toggleWeek(week.id)} className="p-1 hover:bg-muted rounded">
                    {week.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <Input
                    value={week.name}
                    onChange={(e) => updateWeekName(week.id, e.target.value)}
                    className="w-32 h-7 text-sm font-medium"
                  />
                  <span className="text-xs text-muted-foreground">{getWeekActivityCount(week)} activities</span>
                  <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyWeek(week.id)} title="Duplicate">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteWeek(week.id)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Week Content */}
                {week.isExpanded && (
                  <div className="p-3 space-y-2">
                    {week.days.map((day) => (
                      <div key={day.id} className="rounded-md border bg-background">
                        {/* Day Header */}
                        <div className="flex items-center gap-2 p-2.5 border-b bg-muted/20">
                          <button onClick={() => toggleDay(week.id, day.id)} className="p-0.5 hover:bg-muted rounded">
                            {day.isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                          <Input
                            value={day.name}
                            onChange={(e) => updateDayName(week.id, day.id, e.target.value)}
                            className="w-28 h-6 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">{day.activities.length} activities</span>
                          <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs gap-1" onClick={() => addActivity(week.id, day.id)}>
                            <Plus className="h-3 w-3" />
                            Add
                          </Button>
                        </div>

                        {/* Activities */}
                        {day.isExpanded && (
                          <div className="p-2 space-y-1.5">
                            {day.activities.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-3">No activities yet</p>
                            ) : (
                              day.activities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-2 p-2 rounded bg-muted/40 group">
                                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-medium">{activity.name}</span>
                                      {activity.contentId && <Video className="h-3 w-3 text-muted-foreground" />}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                      {activity.metrics.type === 'sets_reps' && `${activity.metrics.sets} x ${activity.metrics.reps}`}
                                      {activity.metrics.type === 'duration' && `${activity.metrics.duration} ${activity.metrics.durationUnit}`}
                                      {activity.metrics.type === 'distance' && `${activity.metrics.distance} ${activity.metrics.distanceUnit}`}
                                      {activity.metrics.type === 'count' && `${activity.metrics.count}x`}
                                      {activity.metrics.type === 'custom' && `${activity.metrics.customLabel}: ${activity.metrics.customValue}`}
                                    </p>
                                  </div>
                                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => editActivity(week.id, day.id, activity)}>
                                      <Settings className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteActivity(week.id, day.id, activity.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Add Week Button */}
            <button
              onClick={() => {
                const newWeek: ProgramWeek = {
                  id: crypto.randomUUID(),
                  weekNumber: weeks.length + 1,
                  name: `Week ${weeks.length + 1}`,
                  days: Array.from({ length: daysPerWeek }, (_, i) => ({
                    id: crypto.randomUUID(),
                    dayNumber: i + 1,
                    name: `Day ${i + 1}`,
                    activities: [],
                    isExpanded: false,
                  })),
                  isExpanded: true,
                }
                setWeeks(prev => [...prev, newWeek])
                setDurationWeeks(prev => prev + 1)
              }}
              className="w-full p-3 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Week
            </button>
          </div>
        </>
      )}

      {/* Activity Editor Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingActivity(null)}>
          <div className="w-full max-w-lg rounded-lg border bg-card p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{editingActivity.activity?.name ? 'Edit Activity' : 'Add Activity'}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingActivity(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-name">Activity Name *</Label>
              <Input
                id="activity-name"
                placeholder="e.g., Bench Press, Long Toss, Free Throws"
                value={editingActivity.activity?.name || ''}
                onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, name: e.target.value } } : null)}
              />
            </div>

            <div className="space-y-2">
              <Label>Metric Type</Label>
              <div className="flex flex-wrap gap-2">
                {METRIC_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, type: type.value as ActivityMetrics['type'] } } } : null)}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-md border transition-colors',
                      editingActivity.activity?.metrics.type === type.value ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {editingActivity.activity?.metrics.type === 'sets_reps' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Sets</Label>
                    <Input type="number" min={1} value={editingActivity.activity.metrics.sets || ''} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, sets: parseInt(e.target.value) || undefined } } } : null)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Reps</Label>
                    <Input placeholder="e.g., 10 or 8-12" value={editingActivity.activity.metrics.reps || ''} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, reps: e.target.value } } } : null)} />
                  </div>
                </div>
              )}

              {editingActivity.activity?.metrics.type === 'duration' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Duration</Label>
                    <Input type="number" min={1} value={editingActivity.activity.metrics.duration || ''} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, duration: parseInt(e.target.value) || undefined } } } : null)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <select value={editingActivity.activity.metrics.durationUnit || 'seconds'} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, durationUnit: e.target.value as 'seconds' | 'minutes' } } } : null)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                    </select>
                  </div>
                </div>
              )}

              {editingActivity.activity?.metrics.type === 'distance' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Distance</Label>
                    <Input type="number" min={1} value={editingActivity.activity.metrics.distance || ''} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, distance: parseInt(e.target.value) || undefined } } } : null)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <select value={editingActivity.activity.metrics.distanceUnit || 'meters'} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, distanceUnit: e.target.value as 'meters' | 'yards' | 'miles' | 'feet' } } } : null)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="meters">Meters</option>
                      <option value="yards">Yards</option>
                      <option value="feet">Feet</option>
                      <option value="miles">Miles</option>
                    </select>
                  </div>
                </div>
              )}

              {editingActivity.activity?.metrics.type === 'count' && (
                <div className="space-y-1">
                  <Label className="text-xs">Count</Label>
                  <Input type="number" min={1} placeholder="e.g., 50" value={editingActivity.activity.metrics.count || ''} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, count: parseInt(e.target.value) || undefined } } } : null)} />
                </div>
              )}

              {editingActivity.activity?.metrics.type === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input placeholder="e.g., Intensity" value={editingActivity.activity.metrics.customLabel || ''} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, customLabel: e.target.value } } } : null)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Value</Label>
                    <Input placeholder="e.g., 75%" value={editingActivity.activity.metrics.customValue || ''} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, metrics: { ...prev.activity!.metrics, customValue: e.target.value } } } : null)} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="activity-notes" className="text-xs">Notes (optional)</Label>
              <Textarea id="activity-notes" placeholder="Any additional instructions..." value={editingActivity.activity?.notes || ''} onChange={(e) => setEditingActivity(prev => prev ? { ...prev, activity: { ...prev.activity!, notes: e.target.value } } : null)} rows={2} />
            </div>

            <Button variant="outline" className="w-full gap-2 text-sm">
              <Link2 className="h-4 w-4" />
              Link Video / Content
            </Button>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditingActivity(null)}>Cancel</Button>
              <Button onClick={saveActivity} disabled={!editingActivity.activity?.name.trim()}>Save Activity</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
