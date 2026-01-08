// Video annotation types

export type AnnotationTool = 'select' | 'circle' | 'arrow' | 'line' | 'rectangle' | 'freehand' | 'text'

export type AnnotationColor = 'red' | 'yellow' | 'green' | 'blue' | 'white'

export const ANNOTATION_COLORS: Record<AnnotationColor, string> = {
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  white: '#ffffff',
}

export interface Point {
  x: number // Percentage 0-100
  y: number // Percentage 0-100
}

export interface BaseShape {
  id: string
  color: AnnotationColor
  strokeWidth: number
}

export interface CircleShape extends BaseShape {
  type: 'circle'
  center: Point
  radius: number // Percentage of video width
}

export interface ArrowShape extends BaseShape {
  type: 'arrow'
  start: Point
  end: Point
}

export interface LineShape extends BaseShape {
  type: 'line'
  start: Point
  end: Point
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle'
  topLeft: Point
  width: number // Percentage
  height: number // Percentage
}

export interface FreehandShape extends BaseShape {
  type: 'freehand'
  points: Point[]
}

export interface TextShape extends BaseShape {
  type: 'text'
  position: Point
  content: string
  fontSize: number
}

export type Shape = CircleShape | ArrowShape | LineShape | RectangleShape | FreehandShape | TextShape

export interface VideoAnnotation {
  id: string
  label?: string
  startTime: number // When annotation appears (seconds)
  endTime: number | null // When annotation disappears (null = forever, same as startTime = single frame)
  shapes: Shape[]
  createdAt: string
}

export interface AnnotationLayerProps {
  annotations: VideoAnnotation[]
  currentTime: number
  isPlaying: boolean
  videoDimensions: { width: number; height: number }
  selectedTool: AnnotationTool
  selectedColor: AnnotationColor
  strokeWidth: number
  onAnnotationAdd: (annotation: VideoAnnotation) => void
  onAnnotationUpdate: (id: string, annotation: Partial<VideoAnnotation>) => void
  onAnnotationDelete: (id: string) => void
  isDrawingEnabled: boolean
}
