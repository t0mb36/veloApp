'use client'

import { useState } from 'react'
import { Star, CheckCircle, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, parseISO } from 'date-fns'
import type { CoachReview } from '@/types/coach'

interface ReviewsSectionProps {
  reviews: CoachReview[]
  averageRating: number
  totalCount: number
}

export function ReviewsSection({ reviews, averageRating, totalCount }: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedReviews = showAll ? reviews : reviews.slice(0, 4)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    )
  }

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => Math.round(r.rating) === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => Math.round(r.rating) === rating).length / reviews.length) * 100
        : 0,
  }))

  return (
    <section>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Rating Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-4xl font-bold">{averageRating}</p>
              <div className="flex justify-center my-2">{renderStars(Math.round(averageRating))}</div>
              <p className="text-sm text-muted-foreground">{totalCount} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-muted-foreground text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="lg:col-span-3 space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No reviews yet.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {displayedReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.studentAvatar} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          {getInitials(review.studentName)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{review.studentName}</p>
                              {review.isVerified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {renderStars(review.rating)}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {review.sport}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mt-3">{review.comment}</p>

                        {review.serviceType && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Service: {review.serviceType}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Show More Button */}
              {reviews.length > 4 && !showAll && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowAll(true)}
                >
                  Show All {reviews.length} Reviews
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
