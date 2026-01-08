'use client'

import { cn } from '@/lib/utils'
import {
  MousePointer2,
  Circle,
  ArrowRight,
  Minus,
  Square,
  Pencil,
  Type,
  Trash2,
  Undo,
  Clock,
  X,
} from 'lucide-react'
import { AnnotationTool, AnnotationColor, ANNOTATION_COLORS, VideoAnnotation } from './types'

interface AnnotationToolbarProps {
  isEnabled: boolean
  onToggle: () => void
  selectedTool: AnnotationTool
  onToolChange: (tool: AnnotationTool) => void
  selectedColor: AnnotationColor
  onColorChange: (color: AnnotationColor) => void
  strokeWidth: number
  onStrokeWidthChange: (width: number) => void
  annotations: VideoAnnotation[]
  currentTime: number
  onDeleteAnnotation: (id: string) => void
  onClearAnnotations: () => void
  onUndoLastAnnotation: () => void
  onSetAnnotationEndTime: (id: string, endTime: number | null) => void
}

const tools: { id: AnnotationTool; icon: typeof Circle; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'freehand', icon: Pencil, label: 'Freehand' },
]

const colors: AnnotationColor[] = ['red', 'yellow', 'green', 'blue', 'white']

const strokeWidths = [2, 3, 4, 6]

export function AnnotationToolbar({
  isEnabled,
  onToggle,
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  annotations,
  currentTime,
  onDeleteAnnotation,
  onClearAnnotations,
  onUndoLastAnnotation,
  onSetAnnotationEndTime,
}: AnnotationToolbarProps) {
  // Get annotations visible at current time
  const visibleAnnotations = annotations.filter((ann) => {
    if (ann.endTime === null) {
      return currentTime >= ann.startTime
    }
    return currentTime >= ann.startTime && currentTime <= ann.endTime
  })

  if (!isEnabled) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-3 right-3 z-30 flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg text-white text-sm transition-colors"
      >
        <Pencil className="h-4 w-4" />
        <span>Annotate</span>
      </button>
    )
  }

  return (
    <div className="absolute top-3 left-3 right-3 z-30 flex items-start gap-3">
      {/* Main toolbar */}
      <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-lg p-1.5">
        {/* Tools */}
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              'p-2 rounded-md transition-colors',
              selectedTool === tool.id
                ? 'bg-white text-black'
                : 'text-white hover:bg-white/20'
            )}
            title={tool.label}
          >
            <tool.icon className="h-4 w-4" />
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Colors */}
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={cn(
              'w-6 h-6 rounded-full border-2 transition-transform',
              selectedColor === color
                ? 'border-white scale-110'
                : 'border-transparent hover:scale-105'
            )}
            style={{ backgroundColor: ANNOTATION_COLORS[color] }}
            title={color.charAt(0).toUpperCase() + color.slice(1)}
          />
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Stroke width */}
        <div className="flex items-center gap-1">
          {strokeWidths.map((width) => (
            <button
              key={width}
              onClick={() => onStrokeWidthChange(width)}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center transition-colors',
                strokeWidth === width
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/20'
              )}
              title={`Stroke width: ${width}px`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: width + 2, height: width + 2 }}
              />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Actions */}
        <button
          onClick={onUndoLastAnnotation}
          disabled={annotations.length === 0}
          className="p-2 rounded-md text-white hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo last annotation"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          onClick={onClearAnnotations}
          disabled={annotations.length === 0}
          className="p-2 rounded-md text-white hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Clear all annotations"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Close */}
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-white hover:bg-red-500/50 transition-colors ml-1"
          title="Close annotation mode"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Annotation timeline list (visible annotations) */}
      {visibleAnnotations.length > 0 && (
        <div className="flex flex-col gap-1 bg-black/80 backdrop-blur-sm rounded-lg p-2 max-w-[200px] max-h-[150px] overflow-y-auto">
          <span className="text-[10px] text-white/60 uppercase tracking-wider mb-1">
            Visible Annotations
          </span>
          {visibleAnnotations.map((ann, idx) => (
            <div
              key={ann.id}
              className="flex items-center gap-2 text-xs text-white group"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    ann.shapes[0] && ANNOTATION_COLORS[ann.shapes[0].color],
                }}
              />
              <span className="truncate flex-1">
                {ann.label || `Annotation ${idx + 1}`}
              </span>
              <button
                onClick={() => {
                  // Toggle end time: if null, set to current time; if set, make it null
                  onSetAnnotationEndTime(
                    ann.id,
                    ann.endTime === null ? currentTime : null
                  )
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded transition-opacity"
                title={ann.endTime === null ? 'End here' : 'Remove end time'}
              >
                <Clock className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDeleteAnnotation(ann.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/50 rounded transition-opacity"
                title="Delete"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <div className="flex-1" />
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs">
        {selectedTool === 'select'
          ? 'Click annotation to select, then Delete to remove'
          : 'Pause video to draw. Annotations persist from this point forward.'
        }
      </div>
    </div>
  )
}
