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
  specialties?: string[]
}

interface MapboxMapProps {
  className?: string
  markers?: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  initialCenter?: [number, number]
  initialZoom?: number
  useIpLocation?: boolean
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

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add geolocation control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })
      geolocateControlRef.current = geolocateControl
      map.current.addControl(geolocateControl, 'top-right')

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
  }, [mapCenter, initialZoom, hasGeolocationPermission])

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
      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'mapbox-marker'
      el.style.cursor = 'pointer'

      // Style based on type
      const colors = {
        coach: '#3b82f6', // blue
        student: '#22c55e', // green
        location: '#f59e0b', // amber
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

      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.longitude, markerData.latitude])
        .addTo(map.current!)

      // Add click handler
      el.addEventListener('click', () => {
        onMarkerClick?.(markerData)
      })

      // Add popup on hover
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
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" style={{ width: '100%', height: '100%' }} />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      )}
    </div>
  )
}
