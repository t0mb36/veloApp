'use client'

import { useState } from 'react'
import { X, Star, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Service {
  id: string
  name: string
}

interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  coachName: string
  services: Service[]
  onSubmit: (review: { rating: number; comment: string; serviceId: string | null; serviceName: string | null }) => void
}

export function WriteReviewModal({
  isOpen,
  onClose,
  coachName,
  services,
  onSubmit,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')

  const selectedService = services.find((s) => s.id === selectedServiceId)

  const handleSubmit = () => {
    if (rating === 0) return
    onSubmit({
      rating,
      comment,
      serviceId: selectedServiceId || null,
      serviceName: selectedService?.name || null,
    })
    // Reset form
    setRating(0)
    setComment('')
    setSelectedServiceId('')
    onClose()
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setComment('')
    setSelectedServiceId('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-background rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Write a Review</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Share your experience with {coachName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Service Selection */}
          {services.length > 0 && (
            <div className="space-y-3">
              <Label htmlFor="service-select" className="text-sm font-medium">
                Service (Optional)
              </Label>
              <div className="relative">
                <select
                  id="service-select"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select a service you used</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Your Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hoveredRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30 hover:text-yellow-400/50'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm text-muted-foreground">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          {/* Review Comment */}
          <div className="space-y-3">
            <Label htmlFor="review-comment" className="text-sm font-medium">
              Your Review
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Tell others about your experience. What did you like? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Post Review
          </Button>
        </div>
      </div>
    </div>
  )
}
