'use client'

import { Play, FileText, Dumbbell, Calendar, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CoachContent } from '@/types/coach'

interface ContentSectionProps {
  content: CoachContent[]
}

export function ContentSection({ content }: ContentSectionProps) {
  const handleViewContent = (contentItem: CoachContent) => {
    if (contentItem.isPremium && !contentItem.isUnlocked) {
      // TODO: Show purchase modal or redirect to checkout
      console.log('Unlock content:', contentItem.id)
      alert('Premium content - Purchase integration coming soon!')
    } else {
      // TODO: Navigate to content viewer
      console.log('View content:', contentItem.id)
    }
  }

  const getTypeIcon = (type: CoachContent['type']) => {
    switch (type) {
      case 'video':
        return <Play className="h-5 w-5" />
      case 'article':
        return <FileText className="h-5 w-5" />
      case 'workout':
        return <Dumbbell className="h-5 w-5" />
      case 'plan':
        return <Calendar className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: CoachContent['type']) => {
    switch (type) {
      case 'video':
        return 'Video'
      case 'article':
        return 'Article'
      case 'workout':
        return 'Workout'
      case 'plan':
        return 'Training Plan'
    }
  }

  const freeContent = content.filter((c) => !c.isPremium)
  const premiumContent = content.filter((c) => c.isPremium)

  return (
    <section>
      {/* Free Content */}
      {freeContent.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Free Resources</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {freeContent.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                onClick={() => handleViewContent(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Premium Content */}
      {premiumContent.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Premium Content</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {premiumContent.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                onClick={() => handleViewContent(item)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

interface ContentCardProps {
  content: CoachContent
  onClick: () => void
}

function ContentCard({ content, onClick }: ContentCardProps) {
  const getTypeIcon = (type: CoachContent['type']) => {
    switch (type) {
      case 'video':
        return <Play className="h-5 w-5" />
      case 'article':
        return <FileText className="h-5 w-5" />
      case 'workout':
        return <Dumbbell className="h-5 w-5" />
      case 'plan':
        return <Calendar className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: CoachContent['type']) => {
    switch (type) {
      case 'video':
        return 'Video'
      case 'article':
        return 'Article'
      case 'workout':
        return 'Workout'
      case 'plan':
        return 'Training Plan'
    }
  }

  const isLocked = content.isPremium && !content.isUnlocked

  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer transition-all hover:shadow-md',
        isLocked && 'relative'
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {content.thumbnailUrl ? (
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            {getTypeIcon(content.type)}
          </div>
        )}

        {/* Video duration badge */}
        {content.type === 'video' && content.duration && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 right-2 bg-black/70 text-white border-0"
          >
            {content.duration}
          </Badge>
        )}

        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
            <Lock className="h-8 w-8 mb-2" />
            <p className="font-bold text-lg">${content.price}</p>
          </div>
        )}

        {/* Type badge */}
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 gap-1"
        >
          {getTypeIcon(content.type)}
          {getTypeLabel(content.type)}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h4 className="font-semibold line-clamp-1">{content.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {content.description}
        </p>

        {isLocked ? (
          <Button className="w-full mt-3" size="sm">
            <Lock className="h-4 w-4 mr-2" />
            Unlock for ${content.price}
          </Button>
        ) : (
          <Button variant="outline" className="w-full mt-3" size="sm">
            {content.type === 'video' ? 'Watch Now' : 'View'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
