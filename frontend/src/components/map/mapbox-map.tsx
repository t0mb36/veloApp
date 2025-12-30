'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { cn } from '@/lib/utils'

// Set the Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

export interface MapMarker {
  id: string
  longitude: number
  latitude: number
  type: 'coach' | 'student' | 'location'
  title: string
  subtitle?: string
  rating?: number
  reviewCount?: number
  specialties?: string[]
  image?: string
  hourlyRate?: number
  bio?: string
}

interface MapboxMapProps {
  className?: string
  markers?: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  initialCenter?: [number, number]
  initialZoom?: number
  useIpLocation?: boolean
  controlsPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

// Default fallback location (San Francisco)
const DEFAULT_CENTER: [number, number] = [-122.4194, 37.7749]

export function MapboxMap({
  className,
  markers = [],
  onMarkerClick,
  initialCenter,
  initialZoom = 12,
  useIpLocation = true,
  controlsPosition = 'bottom-right',
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [hasGeolocationPermission, setHasGeolocationPermission] = useState(false)

  // Fetch user location - try browser geolocation first, fall back to IP
  useEffect(() => {
    if (!useIpLocation || initialCenter) return

    const fetchIpLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        if (response.ok) {
          const data = await response.json()
          if (data.latitude && data.longitude) {
            setUserLocation([data.longitude, data.latitude])
          }
        }
      } catch (err) {
        console.warn('Failed to get IP location, using default:', err)
      }
    }

    // Try browser geolocation first (more accurate)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude])
          setHasGeolocationPermission(true)
        },
        (err) => {
          console.warn('Browser geolocation denied or failed, trying IP:', err.message)
          fetchIpLocation()
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      )
    } else {
      // Browser doesn't support geolocation, use IP
      fetchIpLocation()
    }
  }, [useIpLocation, initialCenter])

  // Determine the center to use
  const mapCenter = initialCenter || userLocation || DEFAULT_CENTER

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Check if access token is configured
    if (!mapboxgl.accessToken || mapboxgl.accessToken === 'your-mapbox-access-token-here') {
      setError('Mapbox access token not configured. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file.')
      return
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: mapCenter,
        zoom: initialZoom,
      })

      // Add navigation controls (zoom +/-)
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }), controlsPosition)

      // Add geolocation control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })
      geolocateControlRef.current = geolocateControl
      map.current.addControl(geolocateControl, controlsPosition)

      map.current.on('load', () => {
        setIsLoaded(true)
        // Auto-trigger geolocation if user has already granted permission
        if (hasGeolocationPermission && geolocateControlRef.current) {
          geolocateControlRef.current.trigger()
        }
      })
    } catch (err) {
      setError('Failed to initialize map')
      console.error('Map initialization error:', err)
    }

    return () => {
      map.current?.remove()
      map.current = null
      geolocateControlRef.current = null
    }
  }, [mapCenter, initialZoom, hasGeolocationPermission, controlsPosition])

  // Trigger geolocate when permission is granted after map is loaded
  useEffect(() => {
    if (isLoaded && hasGeolocationPermission && geolocateControlRef.current) {
      geolocateControlRef.current.trigger()
    }
  }, [isLoaded, hasGeolocationPermission])

  // Update map center when user location is fetched
  useEffect(() => {
    if (map.current && userLocation && !initialCenter) {
      map.current.flyTo({
        center: userLocation,
        zoom: initialZoom,
        duration: 1500,
      })
    }
  }, [userLocation, initialCenter, initialZoom])

  // Update markers when they change
  useEffect(() => {
    if (!map.current || !isLoaded) return

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    markers.forEach((markerData) => {
      // Create custom marker element with enhanced coach display
      const el = document.createElement('div')
      el.className = 'mapbox-marker'
      el.style.cursor = 'pointer'

      // For coach type with image, create enhanced marker
      if (markerData.type === 'coach' && markerData.image) {
        el.innerHTML = `
          <div class="coach-marker-container" style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: all 0.2s ease;
          ">
            <!-- Condensed view (always visible) -->
            <div class="coach-marker-condensed" style="
              display: flex;
              align-items: center;
              gap: 6px;
              background: white;
              padding: 4px 8px 4px 4px;
              border-radius: 24px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              border: 2px solid white;
              transition: all 0.2s ease;
            ">
              <img
                src="${markerData.image}"
                alt="${markerData.title}"
                style="
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  object-fit: cover;
                  border: 2px solid #3b82f6;
                "
              />
              <div style="display: flex; flex-direction: column; line-height: 1.2;">
                <span style="font-size: 11px; font-weight: 600; color: #1f2937; white-space: nowrap; max-width: 80px; overflow: hidden; text-overflow: ellipsis;">
                  ${markerData.title.split(' ')[0]}
                </span>
                <div style="display: flex; align-items: center; gap: 4px;">
                  ${markerData.hourlyRate ? `<span style="font-size: 10px; font-weight: 600; color: #3b82f6;">$${markerData.hourlyRate}</span>` : ''}
                  ${markerData.rating ? `
                    <span style="display: flex; align-items: center; gap: 1px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span style="font-size: 10px; color: #6b7280;">${markerData.rating}</span>
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
            <!-- Expanded view (shown on hover) -->
            <div class="coach-marker-expanded" style="
              display: none;
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              margin-top: 8px;
              background: white;
              padding: 12px;
              border-radius: 12px;
              box-shadow: 0 4px 16px rgba(0,0,0,0.15);
              min-width: 200px;
              max-width: 250px;
              z-index: 100;
            ">
              <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                <img
                  src="${markerData.image}"
                  alt="${markerData.title}"
                  style="
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #3b82f6;
                  "
                />
                <div>
                  <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${markerData.title}</div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span style="font-size: 12px; font-weight: 500; color: #1f2937;">${markerData.rating || 'N/A'}</span>
                    <span style="font-size: 11px; color: #6b7280;">(${markerData.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              </div>
              ${markerData.specialties && markerData.specialties.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                  ${markerData.specialties.slice(0, 3).map(s => `
                    <span style="
                      font-size: 10px;
                      padding: 2px 6px;
                      background: #f3f4f6;
                      border-radius: 4px;
                      color: #4b5563;
                    ">${s}</span>
                  `).join('')}
                </div>
              ` : ''}
              ${markerData.bio ? `
                <p style="
                  font-size: 11px;
                  color: #6b7280;
                  margin-bottom: 10px;
                  line-height: 1.4;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                ">${markerData.bio}</p>
              ` : ''}
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 14px; font-weight: 600; color: #3b82f6;">
                  ${markerData.hourlyRate ? `From $${markerData.hourlyRate}/hr` : 'Contact for rates'}
                </span>
                <span style="
                  font-size: 11px;
                  color: #3b82f6;
                  font-weight: 500;
                ">View Profile →</span>
              </div>
            </div>
            <!-- Pointer triangle -->
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 8px solid white;
              margin-top: -2px;
              filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
            "></div>
          </div>
        `

        // Add hover effects
        el.addEventListener('mouseenter', () => {
          const condensed = el.querySelector('.coach-marker-condensed') as HTMLElement
          const expanded = el.querySelector('.coach-marker-expanded') as HTMLElement
          if (condensed) {
            condensed.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
            condensed.style.transform = 'scale(1.05)'
          }
          if (expanded) {
            expanded.style.display = 'block'
          }
        })

        el.addEventListener('mouseleave', () => {
          const condensed = el.querySelector('.coach-marker-condensed') as HTMLElement
          const expanded = el.querySelector('.coach-marker-expanded') as HTMLElement
          if (condensed) {
            condensed.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
            condensed.style.transform = 'scale(1)'
          }
          if (expanded) {
            expanded.style.display = 'none'
          }
        })
      } else {
        // Fallback to simple marker for non-coach types
        const colors = {
          coach: '#3b82f6',
          student: '#22c55e',
          location: '#f59e0b',
        }

        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${colors[markerData.type]};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${
                markerData.type === 'coach'
                  ? '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
                  : markerData.type === 'student'
                    ? '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'
                    : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>'
              }
            </svg>
          </div>
        `

        // Add popup on hover for non-coach markers
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 20,
        }).setHTML(`
          <div style="padding: 4px;">
            <strong>${markerData.title}</strong>
            ${markerData.subtitle ? `<br/><span style="color: #666; font-size: 12px;">${markerData.subtitle}</span>` : ''}
          </div>
        `)

        el.addEventListener('mouseenter', () => {
          popup.setLngLat([markerData.longitude, markerData.latitude]).addTo(map.current!)
        })

        el.addEventListener('mouseleave', () => {
          popup.remove()
        })
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.longitude, markerData.latitude])
        .addTo(map.current!)

      // Add click handler
      el.addEventListener('click', () => {
        onMarkerClick?.(markerData)
      })

      markersRef.current.push(marker)
    })
  }, [markers, isLoaded, onMarkerClick])

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted rounded-lg',
          className
        )}
      >
        <div className="text-center p-8">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative min-h-[400px]', className)} style={{ height: '100%' }}>
      {/* Custom styles for Mapbox controls to match our UI */}
      <style>{`
        .mapboxgl-ctrl-group {
          background: white !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
          overflow: hidden;
        }
        .dark .mapboxgl-ctrl-group {
          background: hsl(var(--background)) !important;
        }
        .mapboxgl-ctrl-group button {
          width: 40px !important;
          height: 40px !important;
          background: white !important;
          border: none !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        .dark .mapboxgl-ctrl-group button {
          background: hsl(var(--background)) !important;
        }
        .mapboxgl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: hsl(var(--accent)) !important;
        }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon {
          opacity: 0.6;
        }
        .mapboxgl-ctrl-group button:hover .mapboxgl-ctrl-icon {
          opacity: 0.9;
        }
        .dark .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon {
          filter: invert(1);
          opacity: 0.6;
        }
        .dark .mapboxgl-ctrl-group button:hover .mapboxgl-ctrl-icon {
          opacity: 0.9;
        }
        .mapboxgl-ctrl-geolocate {
          width: 40px !important;
          height: 40px !important;
        }
        .mapboxgl-ctrl-bottom-right {
          right: 1.5rem !important;
          bottom: 1.5rem !important;
        }
        .mapboxgl-ctrl-bottom-left {
          left: 1.5rem !important;
          bottom: 1.5rem !important;
        }
        .mapboxgl-ctrl-top-right {
          right: 1.5rem !important;
          top: 1.5rem !important;
        }
        .mapboxgl-ctrl-top-left {
          left: 1.5rem !important;
          top: 1.5rem !important;
        }
        .mapboxgl-ctrl-group + .mapboxgl-ctrl-group {
          margin-top: 0.5rem;
        }
        /* Attribution styling - position at absolute bottom */
        .mapboxgl-ctrl-attrib {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(4px);
          padding: 2px 8px !important;
          font-size: 10px !important;
          border-radius: 4px 0 0 0 !important;
        }
        .dark .mapboxgl-ctrl-attrib {
          background: rgba(0, 0, 0, 0.6) !important;
          color: rgba(255, 255, 255, 0.7) !important;
        }
        .dark .mapboxgl-ctrl-attrib a {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-attrib {
          margin-right: 0 !important;
          margin-bottom: 0 !important;
          position: fixed !important;
          bottom: 0 !important;
          right: 0 !important;
        }
        .mapboxgl-ctrl-logo {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          margin: 0 0 2px 4px !important;
        }
      `}</style>
      <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      )}
    </div>
  )
}
