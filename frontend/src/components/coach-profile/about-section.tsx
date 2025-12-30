'use client'

import { Instagram, Twitter, Linkedin, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AboutSectionProps {
  bio: string
  socials: {
    instagram?: string
    twitter?: string
    linkedin?: string
    website?: string
  }
}

export function AboutSection({ bio, socials }: AboutSectionProps) {
  const hasSocials = socials.instagram || socials.twitter || socials.linkedin || socials.website

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
