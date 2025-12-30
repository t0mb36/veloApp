'use client'

import { Instagram, Twitter, Linkedin, Youtube, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
}

interface AboutSectionProps {
  bio: string
  socials: {
    instagram?: string
    twitter?: string
    linkedin?: string
    tiktok?: string
    youtube?: string
    website?: string
  }
}

export function AboutSection({ bio, socials }: AboutSectionProps) {
  const hasSocials = socials.instagram || socials.twitter || socials.linkedin || socials.tiktok || socials.youtube || socials.website

  const formatSocialUrl = (platform: string, handle?: string) => {
    if (!handle) return ''
    // Remove @ if present
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
    <section>
      <h2 className="text-2xl font-bold mb-6">About</h2>

      <Card>
        <CardContent className="p-6">
          {/* Bio */}
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-line">{bio}</p>
          </div>

          {/* Social Links */}
          {hasSocials && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium mb-3">Connect</p>
              <div className="flex flex-wrap gap-2">
                {socials.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a
                      href={formatSocialUrl('instagram', socials.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-4 w-4" />
                      {formatDisplayHandle(socials.instagram)}
                    </a>
                  </Button>
                )}

                {socials.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a
                      href={formatSocialUrl('twitter', socials.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-4 w-4" />
                      {formatDisplayHandle(socials.twitter)}
                    </a>
                  </Button>
                )}

                {socials.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a
                      href={formatSocialUrl('linkedin', socials.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}

                {socials.tiktok && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a
                      href={formatSocialUrl('tiktok', socials.tiktok)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TikTokIcon className="h-4 w-4" />
                      {formatDisplayHandle(socials.tiktok)}
                    </a>
                  </Button>
                )}

                {socials.youtube && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a
                      href={formatSocialUrl('youtube', socials.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="h-4 w-4" />
                      {formatDisplayHandle(socials.youtube)}
                    </a>
                  </Button>
                )}

                {socials.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a
                      href={formatSocialUrl('website', socials.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4" />
                      {formatDisplayHandle(socials.website)}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
