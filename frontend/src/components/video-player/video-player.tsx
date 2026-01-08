'use client'

import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Camera,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { AnnotationLayer } from './annotation-layer'
import { AnnotationToolbar } from './annotation-toolbar'
import {
  VideoAnnotation,
  AnnotationTool,
  AnnotationColor,
  Shape,
} from './types'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  onFreezeFrame?: (dataUrl: string, timestamp: number) => void
  onTimeUpdate?: (currentTime: number) => void
  className?: string
  // Annotation props
  annotations?: VideoAnnotation[]
  onAnnotationsChange?: (annotations: VideoAnnotation[]) => void
  showAnnotations?: boolean
}

interface FrameThumbnail {
  time: number
  url: string
}

export function VideoPlayer({
  src,
  poster,
  title,
  onFreezeFrame,
  onTimeUpdate,
  className,
  annotations: externalAnnotations,
  onAnnotationsChange,
  showAnnotations = true,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const filmstripRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState(0)

  // Filmstrip thumbnails (generated from video)
  const [frameThumbnails, setFrameThumbnails] = useState<FrameThumbnail[]>([])
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false)
  const [isFilmstripExpanded, setIsFilmstripExpanded] = useState(false)
  const [detectedFps, setDetectedFps] = useState(30)

  // Playback speed
  const [playbackRate, setPlaybackRate] = useState(1)
  const playbackRates = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

  // Annotation state
  const [internalAnnotations, setInternalAnnotations] = useState<VideoAnnotation[]>([])
  const [isAnnotationMode, setIsAnnotationMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('arrow')
  const [selectedColor, setSelectedColor] = useState<AnnotationColor>('yellow')
  const [strokeWidth, setStrokeWidth] = useState(3)

  // Use external annotations if provided, otherwise use internal state
  const annotations = externalAnnotations ?? internalAnnotations
  const setAnnotations = useCallback((newAnnotations: VideoAnnotation[] | ((prev: VideoAnnotation[]) => VideoAnnotation[])) => {
    const updated = typeof newAnnotations === 'function'
      ? newAnnotations(annotations)
      : newAnnotations
    if (onAnnotationsChange) {
      onAnnotationsChange(updated)
    } else {
      setInternalAnnotations(updated)
    }
  }, [annotations, onAnnotationsChange])

  // Auto-hide controls timer
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Detect video frame rate using requestVideoFrameCallback if available
  const detectFrameRate = useCallback((): Promise<number> => {
    return new Promise((resolve) => {
      const video = videoRef.current
      if (!video) {
        resolve(30)
        return
      }

      // Try to use requestVideoFrameCallback for accurate FPS detection
      if ('requestVideoFrameCallback' in video) {
        let frameCount = 0
        let startTime = 0
        const maxFrames = 10

        const countFrame = (now: number, metadata: { presentedFrames: number }) => {
          if (frameCount === 0) {
            startTime = now
          }
          frameCount++

          if (frameCount < maxFrames) {
            (video as any).requestVideoFrameCallback(countFrame)
          } else {
            const elapsed = now - startTime
            const fps = Math.round((frameCount / elapsed) * 1000)
            // Clamp to reasonable values (24-240fps)
            resolve(Math.max(24, Math.min(240, fps)))
          }
        }

        // Need to play briefly to detect FPS
        const wasPlaying = !video.paused
        const originalTime = video.currentTime
        video.muted = true
        video.play().then(() => {
          (video as any).requestVideoFrameCallback(countFrame)
          setTimeout(() => {
            video.pause()
            video.currentTime = originalTime
            video.muted = false
            if (wasPlaying) video.play()
          }, 500)
        }).catch(() => resolve(30))
      } else {
        // Fallback: assume 30fps for normal video, check for common slo-mo indicators
        resolve(30)
      }
    })
  }, [])

  // Generate filmstrip thumbnails from video
  const generateThumbnails = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isGeneratingThumbnails) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsGeneratingThumbnails(true)

    // Wait for video to be ready
    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        video.addEventListener('loadeddata', () => resolve(), { once: true })
      })
    }

    // Detect frame rate
    const fps = await detectFrameRate()
    setDetectedFps(fps)

    const videoDuration = video.duration

    // For slo-mo (high fps), generate more thumbnails
    // Normal video: ~1 thumbnail per second, max 60
    // Slo-mo (60+ fps): up to 2-4 thumbnails per second, max 120
    const isSlowMo = fps >= 60
    const thumbnailsPerSecond = isSlowMo ? Math.min(4, fps / 30) : 1
    const thumbnailCount = Math.min(
      Math.ceil(videoDuration * thumbnailsPerSecond),
      isSlowMo ? 120 : 60
    )
    const interval = videoDuration / thumbnailCount
    const thumbnails: FrameThumbnail[] = []

    // Set canvas size (small thumbnails)
    canvas.width = 120
    canvas.height = 68

    // Store original time to restore later
    const originalTime = video.currentTime
    const wasPlaying = !video.paused

    if (wasPlaying) video.pause()

    for (let i = 0; i < thumbnailCount; i++) {
      const time = i * interval
      video.currentTime = time

      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          thumbnails.push({
            time,
            url: canvas.toDataURL('image/jpeg', 0.6),
          })
          resolve()
        }
        video.addEventListener('seeked', onSeeked, { once: true })
      })
    }

    // Restore original position
    video.currentTime = originalTime
    if (wasPlaying) video.play()

    setFrameThumbnails(thumbnails)
    setIsGeneratingThumbnails(false)
  }, [isGeneratingThumbnails, detectFrameRate])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      // Generate thumbnails after metadata is loaded
      generateThumbnails()
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onTimeUpdate, generateThumbnails])

  // Auto-hide controls
  useEffect(() => {
    if (isHovering || isScrubbing || !isPlaying) {
      setShowControls(true)
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current)
      }
    } else {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    }

    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current)
      }
    }
  }, [isHovering, isScrubbing, isPlaying])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const newVolume = parseFloat(e.target.value)
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const stepFrame = (direction: 'forward' | 'backward') => {
    if (!videoRef.current) return
    // Use detected FPS for accurate frame stepping
    const frameTime = 1 / detectedFps
    const newTime = videoRef.current.currentTime + (direction === 'forward' ? frameTime : -frameTime)
    videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration))
  }

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = percent * duration
  }

  const handleProgressHover = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    setHoverTime(percent * duration)
    setHoverPosition(e.clientX - rect.left)
  }

  const handleProgressLeave = () => {
    setHoverTime(null)
  }

  const handleFreezeFrame = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas to video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/png')
    onFreezeFrame?.(dataUrl, video.currentTime)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const handlePlaybackRateChange = () => {
    if (!videoRef.current) return
    const currentIndex = playbackRates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % playbackRates.length
    const newRate = playbackRates[nextIndex]
    videoRef.current.playbackRate = newRate
    setPlaybackRate(newRate)
  }

  // Get thumbnail for hover time
  const getHoverThumbnail = () => {
    if (hoverTime === null || frameThumbnails.length === 0) return null
    const closest = frameThumbnails.reduce((prev, curr) =>
      Math.abs(curr.time - hoverTime) < Math.abs(prev.time - hoverTime) ? curr : prev
    )
    return closest
  }

  // Annotation handlers
  const handleAnnotationAdd = useCallback((annotation: VideoAnnotation) => {
    setAnnotations((prev) => [...prev, annotation])
  }, [setAnnotations])

  const handleAnnotationUpdate = useCallback((id: string, shapes: Shape[]) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, shapes } : ann))
    )
  }, [setAnnotations])

  const handleAnnotationDelete = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id))
  }, [setAnnotations])

  const handleSetAnnotationEndTime = useCallback((id: string, endTime: number | null) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, endTime } : ann))
    )
  }, [setAnnotations])

  const handleClearAnnotations = useCallback(() => {
    setAnnotations([])
  }, [setAnnotations])

  const handleUndoLastAnnotation = useCallback(() => {
    setAnnotations((prev) => prev.slice(0, -1))
  }, [setAnnotations])

  const hoverThumbnail = getHoverThumbnail()
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black overflow-hidden group',
        isFullscreen ? 'w-screen h-screen' : 'aspect-video',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={isAnnotationMode ? undefined : togglePlay}
        playsInline
      />

      {/* Hidden canvas for thumbnail generation and freeze frame */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Annotation Layer */}
      {showAnnotations && (
        <AnnotationLayer
          annotations={annotations}
          currentTime={currentTime}
          isPlaying={isPlaying}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          strokeWidth={strokeWidth}
          onAnnotationAdd={handleAnnotationAdd}
          onAnnotationUpdate={handleAnnotationUpdate}
          onAnnotationDelete={handleAnnotationDelete}
          isDrawingEnabled={isAnnotationMode}
        />
      )}

      {/* Annotation Toolbar */}
      {showAnnotations && (
        <AnnotationToolbar
          isEnabled={isAnnotationMode}
          onToggle={() => setIsAnnotationMode(!isAnnotationMode)}
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          annotations={annotations}
          currentTime={currentTime}
          onDeleteAnnotation={handleAnnotationDelete}
          onClearAnnotations={handleClearAnnotations}
          onUndoLastAnnotation={handleUndoLastAnnotation}
          onSetAnnotationEndTime={handleSetAnnotationEndTime}
        />
      )}

      {/* Center Play Button (when paused) */}
      {!isPlaying && showControls && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <Play className="h-7 w-7 text-white ml-1" />
          </div>
        </button>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        <div className="relative p-3 space-y-2">
          {/* Filmstrip Scrubber - Minimized by default, expands on hover */}
          <div
            ref={progressRef}
            className="relative cursor-pointer rounded overflow-hidden group/scrubber"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseEnter={() => setIsFilmstripExpanded(true)}
            onMouseLeave={() => {
              handleProgressLeave()
              setIsFilmstripExpanded(false)
            }}
          >
            {/* Minimized progress bar (default state) */}
            <div
              className={cn(
                'relative w-full transition-all duration-300 ease-out',
                isFilmstripExpanded ? 'h-16 opacity-0 pointer-events-none' : 'h-1.5'
              )}
            >
              {/* Background track */}
              <div className="absolute inset-0 bg-white/20 rounded-full" />
              {/* Progress fill */}
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
              {/* Playhead dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover/scrubber:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
              />
            </div>

            {/* Expanded filmstrip (on hover) */}
            <div
              className={cn(
                'absolute inset-x-0 bottom-0 transition-all duration-300 ease-out overflow-hidden rounded',
                isFilmstripExpanded ? 'h-16 opacity-100' : 'h-0 opacity-0'
              )}
            >
              {/* Filmstrip background */}
              <div ref={filmstripRef} className="absolute inset-0 flex">
                {frameThumbnails.length > 0 ? (
                  frameThumbnails.map((thumb, i) => (
                    <div
                      key={i}
                      className="h-full shrink-0"
                      style={{ width: `${100 / frameThumbnails.length}%` }}
                    >
                      <img
                        src={thumb.url}
                        alt=""
                        className="w-full h-full object-cover opacity-70"
                        draggable={false}
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    {isGeneratingThumbnails ? (
                      <span className="text-[10px] text-white/50">Loading frames...</span>
                    ) : (
                      <span className="text-[10px] text-white/50">Hover to expand</span>
                    )}
                  </div>
                )}
              </div>

              {/* Progress overlay (unplayed portion is darker) */}
              <div
                className="absolute inset-y-0 bg-black/50 pointer-events-none"
                style={{ width: `${100 - progress}%`, right: 0 }}
              />

              {/* Playhead line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                style={{ left: `${progress}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow" />
              </div>
            </div>

            {/* Hover preview thumbnail */}
            {hoverTime !== null && hoverThumbnail && isFilmstripExpanded && (
              <div
                className="absolute bottom-full mb-2 z-30 pointer-events-none"
                style={{ left: `${hoverPosition}px`, transform: 'translateX(-50%)' }}
              >
                <div className="bg-black rounded overflow-hidden shadow-xl border border-white/20">
                  <img
                    src={hoverThumbnail.url}
                    alt=""
                    className="w-36 h-20 object-cover"
                    draggable={false}
                  />
                  <div className="text-center text-xs text-white py-1 bg-black/90 font-mono">
                    {formatTime(hoverTime)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Frame stepping */}
            <button
              onClick={() => stepFrame('backward')}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title={`Previous frame (1/${detectedFps}s)`}
            >
              <SkipBack className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={() => stepFrame('forward')}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title={`Next frame (1/${detectedFps}s)`}
            >
              <SkipForward className="h-4 w-4 text-white" />
            </button>

            {/* Time display */}
            <span className="text-xs text-white font-mono min-w-[80px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Playback speed */}
            <button
              onClick={handlePlaybackRateChange}
              className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded transition-colors font-mono min-w-[45px]"
              title="Playback speed"
            >
              {playbackRate}x
            </button>

            <div className="flex-1" />

            {/* Freeze frame */}
            {onFreezeFrame && (
              <button
                onClick={handleFreezeFrame}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-white hover:bg-white/20 rounded transition-colors"
                title="Capture freeze frame"
              >
                <Camera className="h-4 w-4" />
                <span>Freeze</span>
              </button>
            )}

            {/* Volume */}
            <div className="flex items-center gap-1 group/volume">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-white" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-white opacity-0 group-hover/volume:opacity-100 transition-opacity"
              />
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4 text-white" />
              ) : (
                <Maximize className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
