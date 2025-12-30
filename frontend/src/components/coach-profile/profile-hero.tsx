'use client'

import { useState } from 'react'
import { MapPin, Star, Heart, MessageCircle, Instagram, Twitter, Linkedin, Youtube, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { PublicCoachProfile } from '@/types/coach'

// TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
}

interface ProfileHeroProps {
  coach: PublicCoachProfile
}

export function ProfileHero({ coach }: ProfileHeroProps) {
  const [isFavorited, setIsFavorited] = useState(coach.isFavorited || false)

  const getInitials = () => {
    const first = coach.firstName?.[0] || ''
    const last = coach.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'CO'
  }

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
    // TODO: Call API to update favorites
  }

  const handleMessage = () => {
    // TODO: Navigate to messaging or open message modal
    console.log('Message coach:', coach.id)
  }

  const hasSocials = coach.instagram || coach.twitter || coach.linkedin || coach.tiktok || coach.youtube || coach.website

  const formatSocialUrl = (platform: string, handle?: string) => {
    if (!handle) return ''
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle

    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${cleanHandle}`
      case 'twitter':
        return `https://twitter.com/${cleanHandle}`
      case 'linkedin':
        return handle.startsWith('http') ? handle : `https://linkedin.com/in/${cleanHandle}`
      case 'tiktok':
        return `https://tiktok.com/@${cleanHandle}`
      case 'youtube':
        return handle.startsWith('http') ? handle : `https://youtube.com/@${cleanHandle}`
      case 'website':
        return handle.startsWith('http') ? handle : `https://${handle}`
      default:
        return handle
    }
  }

  const formatDisplayHandle = (handle?: string) => {
    if (!handle) return ''
    if (handle.startsWith('http')) {
      try {
        const url = new URL(handle)
        return url.hostname.replace('www.', '')
      } catch {
        return handle
      }
    }
    return handle
  }

  return (
    <div>
      {/* Banner Image */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden rounded-xl">
        {coach.bannerImage ? (
          <img
            src={coach.bannerImage}
            alt={`${coach.firstName} ${coach.lastName} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative -mt-12 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Profile Picture */}
          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-lg">
            <AvatarImage src={coach.profileImage || undefined} />
            <AvatarFallback className="text-xl md:text-2xl bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {/* Coach Info */}
          <div className="flex-1 pt-2 sm:pt-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Name and details */}
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {coach.firstName} {coach.lastName}
                </h1>

                {/* Location and Rating */}
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{coach.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">{coach.rating}</span>
                    <span className="text-sm">({coach.reviewCount} reviews)</span>
                  </div>
                  <span className="text-sm">
                    From <span className="font-semibold text-foreground">${coach.hourlyRate}</span>/session
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2">
                  {coach.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button onClick={handleMessage} className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={cn(
                    'transition-colors',
                    isFavorited && 'text-red-500 hover:text-red-600'
                  )}
                >
                  <Heart
                    className={cn('h-5 w-5', isFavorited && 'fill-current')}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <p className="text-muted-foreground whitespace-pre-line">{coach.bio}</p>
        </div>

        {/* Social Links */}
        {hasSocials && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {coach.instagram && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={formatSocialUrl('instagram', coach.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-4 w-4" />
                  {formatDisplayHandle(coach.instagram)}
                </a>
              </Button>
            )}

            {coach.twitter && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={formatSocialUrl('twitter', coach.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4" />
                  {formatDisplayHandle(coach.twitter)}
                </a>
              </Button>
            )}

            {coach.linkedin && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={formatSocialUrl('linkedin', coach.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}

            {coach.tiktok && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={formatSocialUrl('tiktok', coach.tiktok)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TikTokIcon className="h-4 w-4" />
                  {formatDisplayHandle(coach.tiktok)}
                </a>
              </Button>
            )}

            {coach.youtube && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={formatSocialUrl('youtube', coach.youtube)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube className="h-4 w-4" />
                  {formatDisplayHandle(coach.youtube)}
                </a>
              </Button>
            )}

            {coach.website && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={formatSocialUrl('website', coach.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4" />
                  {formatDisplayHandle(coach.website)}
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
