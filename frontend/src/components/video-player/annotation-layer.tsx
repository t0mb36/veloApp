'use client'

import { useState, useRef, useCallback, useEffect, MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import {
  VideoAnnotation,
  Shape,
  Point,
  AnnotationTool,
  AnnotationColor,
  ANNOTATION_COLORS,
} from './types'

interface AnnotationLayerProps {
  annotations: VideoAnnotation[]
  currentTime: number
  isPlaying: boolean
  selectedTool: AnnotationTool
  selectedColor: AnnotationColor
  strokeWidth: number
  onAnnotationAdd: (annotation: VideoAnnotation) => void
  onAnnotationUpdate: (id: string, shapes: Shape[]) => void
  onAnnotationDelete: (id: string) => void
  isDrawingEnabled: boolean
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function AnnotationLayer({
  annotations,
  currentTime,
  isPlaying,
  selectedTool,
  selectedColor,
  strokeWidth,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  isDrawingEnabled,
}: AnnotationLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [freehandPoints, setFreehandPoints] = useState<Point[]>([])
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)

  // Get visible annotations based on current time
  const visibleAnnotations = annotations.filter((ann) => {
    if (ann.endTime === null) {
      // Annotation is always visible from startTime onward
      return currentTime >= ann.startTime
    }
    return currentTime >= ann.startTime && currentTime <= ann.endTime
  })

  // Convert screen coordinates to percentage-based coordinates
  const screenToPercent = useCallback((clientX: number, clientY: number): Point => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }, [])

  const handleMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!isDrawingEnabled || selectedTool === 'select' || isPlaying) return

      const point = screenToPercent(e.clientX, e.clientY)
      setStartPoint(point)
      setCurrentPoint(point)
      setIsDrawing(true)

      if (selectedTool === 'freehand') {
        setFreehandPoints([point])
      }
    },
    [isDrawingEnabled, selectedTool, isPlaying, screenToPercent]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!isDrawing || !startPoint) return

      const point = screenToPercent(e.clientX, e.clientY)
      setCurrentPoint(point)

      if (selectedTool === 'freehand') {
        setFreehandPoints((prev) => [...prev, point])
      }
    },
    [isDrawing, startPoint, selectedTool, screenToPercent]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !startPoint || !currentPoint) {
      setIsDrawing(false)
      return
    }

    let newShape: Shape | null = null
    const baseShape = {
      id: generateId(),
      color: selectedColor,
      strokeWidth,
    }

    switch (selectedTool) {
      case 'circle': {
        const dx = currentPoint.x - startPoint.x
        const dy = currentPoint.y - startPoint.y
        const radius = Math.sqrt(dx * dx + dy * dy)
        if (radius > 1) {
          newShape = {
            ...baseShape,
            type: 'circle',
            center: startPoint,
            radius,
          }
        }
        break
      }
      case 'arrow': {
        const dx = currentPoint.x - startPoint.x
        const dy = currentPoint.y - startPoint.y
        if (Math.sqrt(dx * dx + dy * dy) > 1) {
          newShape = {
            ...baseShape,
            type: 'arrow',
            start: startPoint,
            end: currentPoint,
          }
        }
        break
      }
      case 'line': {
        const dx = currentPoint.x - startPoint.x
        const dy = currentPoint.y - startPoint.y
        if (Math.sqrt(dx * dx + dy * dy) > 1) {
          newShape = {
            ...baseShape,
            type: 'line',
            start: startPoint,
            end: currentPoint,
          }
        }
        break
      }
      case 'rectangle': {
        const width = Math.abs(currentPoint.x - startPoint.x)
        const height = Math.abs(currentPoint.y - startPoint.y)
        if (width > 1 && height > 1) {
          newShape = {
            ...baseShape,
            type: 'rectangle',
            topLeft: {
              x: Math.min(startPoint.x, currentPoint.x),
              y: Math.min(startPoint.y, currentPoint.y),
            },
            width,
            height,
          }
        }
        break
      }
      case 'freehand': {
        if (freehandPoints.length > 2) {
          newShape = {
            ...baseShape,
            type: 'freehand',
            points: freehandPoints,
          }
        }
        break
      }
    }

    if (newShape) {
      const annotation: VideoAnnotation = {
        id: generateId(),
        startTime: currentTime,
        endTime: null, // Persists for rest of video
        shapes: [newShape],
        createdAt: new Date().toISOString(),
      }
      onAnnotationAdd(annotation)
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setFreehandPoints([])
  }, [
    isDrawing,
    startPoint,
    currentPoint,
    selectedTool,
    selectedColor,
    strokeWidth,
    freehandPoints,
    currentTime,
    onAnnotationAdd,
  ])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotationId) {
          onAnnotationDelete(selectedAnnotationId)
          setSelectedAnnotationId(null)
        }
      }
      if (e.key === 'Escape') {
        setSelectedAnnotationId(null)
        setIsDrawing(false)
        setStartPoint(null)
        setCurrentPoint(null)
        setFreehandPoints([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedAnnotationId, onAnnotationDelete])

  // Render a single shape
  const renderShape = (shape: Shape, isPreview = false) => {
    const color = ANNOTATION_COLORS[shape.color]
    const opacity = isPreview ? 0.6 : 1
    const strokeDasharray = isPreview ? '5,5' : undefined

    switch (shape.type) {
      case 'circle':
        return (
          <circle
            key={shape.id}
            cx={`${shape.center.x}%`}
            cy={`${shape.center.y}%`}
            r={`${shape.radius}%`}
            fill="none"
            stroke={color}
            strokeWidth={shape.strokeWidth}
            opacity={opacity}
            strokeDasharray={strokeDasharray}
          />
        )
      case 'arrow': {
        const angle = Math.atan2(shape.end.y - shape.start.y, shape.end.x - shape.start.x)
        const arrowLength = 2 // Percentage
        const arrowAngle = Math.PI / 6 // 30 degrees

        // Calculate arrowhead points
        const arrowPoint1 = {
          x: shape.end.x - arrowLength * Math.cos(angle - arrowAngle),
          y: shape.end.y - arrowLength * Math.sin(angle - arrowAngle),
        }
        const arrowPoint2 = {
          x: shape.end.x - arrowLength * Math.cos(angle + arrowAngle),
          y: shape.end.y - arrowLength * Math.sin(angle + arrowAngle),
        }

        return (
          <g key={shape.id} opacity={opacity}>
            <line
              x1={`${shape.start.x}%`}
              y1={`${shape.start.y}%`}
              x2={`${shape.end.x}%`}
              y2={`${shape.end.y}%`}
              stroke={color}
              strokeWidth={shape.strokeWidth}
              strokeDasharray={strokeDasharray}
            />
            <polygon
              points={`${shape.end.x}%,${shape.end.y}% ${arrowPoint1.x}%,${arrowPoint1.y}% ${arrowPoint2.x}%,${arrowPoint2.y}%`}
              fill={color}
            />
          </g>
        )
      }
      case 'line':
        return (
          <line
            key={shape.id}
            x1={`${shape.start.x}%`}
            y1={`${shape.start.y}%`}
            x2={`${shape.end.x}%`}
            y2={`${shape.end.y}%`}
            stroke={color}
            strokeWidth={shape.strokeWidth}
            opacity={opacity}
            strokeDasharray={strokeDasharray}
          />
        )
      case 'rectangle':
        return (
          <rect
            key={shape.id}
            x={`${shape.topLeft.x}%`}
            y={`${shape.topLeft.y}%`}
            width={`${shape.width}%`}
            height={`${shape.height}%`}
            fill="none"
            stroke={color}
            strokeWidth={shape.strokeWidth}
            opacity={opacity}
            strokeDasharray={strokeDasharray}
          />
        )
      case 'freehand': {
        const pathData = shape.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`)
          .join(' ')
        return (
          <path
            key={shape.id}
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={shape.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacity}
            strokeDasharray={strokeDasharray}
          />
        )
      }
      case 'text':
        return (
          <text
            key={shape.id}
            x={`${shape.position.x}%`}
            y={`${shape.position.y}%`}
            fill={color}
            fontSize={shape.fontSize}
            opacity={opacity}
          >
            {shape.content}
          </text>
        )
      default:
        return null
    }
  }

  // Render preview shape while drawing
  const renderPreviewShape = () => {
    if (!isDrawing || !startPoint || !currentPoint) return null

    const previewShape: Partial<Shape> = {
      id: 'preview',
      color: selectedColor,
      strokeWidth,
    }

    switch (selectedTool) {
      case 'circle': {
        const dx = currentPoint.x - startPoint.x
        const dy = currentPoint.y - startPoint.y
        const radius = Math.sqrt(dx * dx + dy * dy)
        return renderShape({
          ...previewShape,
          type: 'circle',
          center: startPoint,
          radius,
        } as Shape, true)
      }
      case 'arrow':
        return renderShape({
          ...previewShape,
          type: 'arrow',
          start: startPoint,
          end: currentPoint,
        } as Shape, true)
      case 'line':
        return renderShape({
          ...previewShape,
          type: 'line',
          start: startPoint,
          end: currentPoint,
        } as Shape, true)
      case 'rectangle': {
        const width = Math.abs(currentPoint.x - startPoint.x)
        const height = Math.abs(currentPoint.y - startPoint.y)
        return renderShape({
          ...previewShape,
          type: 'rectangle',
          topLeft: {
            x: Math.min(startPoint.x, currentPoint.x),
            y: Math.min(startPoint.y, currentPoint.y),
          },
          width,
          height,
        } as Shape, true)
      }
      case 'freehand':
        if (freehandPoints.length > 1) {
          return renderShape({
            ...previewShape,
            type: 'freehand',
            points: freehandPoints,
          } as Shape, true)
        }
        return null
      default:
        return null
    }
  }

  const handleAnnotationClick = (e: MouseEvent, annotationId: string) => {
    if (selectedTool === 'select') {
      e.stopPropagation()
      setSelectedAnnotationId(annotationId)
    }
  }

  return (
    <svg
      ref={svgRef}
      className={cn(
        'absolute inset-0 w-full h-full z-10',
        isDrawingEnabled && selectedTool !== 'select' && !isPlaying
          ? 'cursor-crosshair'
          : 'pointer-events-none'
      )}
      style={{ pointerEvents: isDrawingEnabled ? 'auto' : 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Render visible annotations */}
      {visibleAnnotations.map((annotation) => (
        <g
          key={annotation.id}
          onClick={(e) => handleAnnotationClick(e, annotation.id)}
          className={cn(
            selectedAnnotationId === annotation.id && 'outline outline-2 outline-white'
          )}
          style={{ cursor: selectedTool === 'select' ? 'pointer' : undefined }}
        >
          {annotation.shapes.map((shape) => renderShape(shape))}
        </g>
      ))}

      {/* Render preview while drawing */}
      {renderPreviewShape()}

      {/* Selection highlight */}
      {selectedAnnotationId && selectedTool === 'select' && (
        <rect
          className="pointer-events-none"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="none"
        />
      )}
    </svg>
  )
}
