'use client'

import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Calendar, Play, Star } from 'lucide-react'
import { getFullCoachData } from '@/lib/mock-data/coaches'
import { ProfileHero } from '@/components/coach-profile/profile-hero'
import { ServicesBookingSection } from '@/components/coach-profile/services-booking-section'
import { ContentSection } from '@/components/coach-profile/content-section'
import { ReviewsSection } from '@/components/coach-profile/reviews-section'
import { CartProvider } from '@/contexts/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CoachProfilePage() {
  const params = useParams()
  const coachId = params.id as string

  const data = getFullCoachData(coachId)

  if (!data.profile) {
    notFound()
  }

  const { profile, services, availability, reviews, content } = data

  return (
    <CartProvider>
      <div className="space-y-6 pb-12">
        {/* Profile Hero - includes bio and socials */}
        <ProfileHero coach={profile} />

        {/* Tabbed Content */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent gap-2 border-b">
            <TabsTrigger
              value="services"
              className="gap-2 rounded-md rounded-b-none bg-transparent shadow-none border-0 data-[state=active]:bg-muted/50 data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-foreground text-muted-foreground px-4 py-2 hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Services & Booking
            </TabsTrigger>
            {content.length > 0 && (
              <TabsTrigger
                value="content"
                className="gap-2 rounded-md rounded-b-none bg-transparent shadow-none border-0 data-[state=active]:bg-muted/50 data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-foreground text-muted-foreground px-4 py-2 hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <Play className="h-4 w-4" />
                Content ({content.length})
              </TabsTrigger>
            )}
            <TabsTrigger
              value="reviews"
              className="gap-2 rounded-md rounded-b-none bg-transparent shadow-none border-0 data-[state=active]:bg-muted/50 data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-foreground text-muted-foreground px-4 py-2 hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <Star className="h-4 w-4" />
              Reviews ({profile.reviewCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            <ServicesBookingSection
              services={services}
              availability={availability}
              isContactOnly={profile.isContactOnly}
              coachId={coachId}
              coachName={`${profile.firstName} ${profile.lastName}`}
            />
          </TabsContent>

          {content.length > 0 && (
            <TabsContent value="content" className="mt-6">
              <ContentSection content={content} />
            </TabsContent>
          )}

          <TabsContent value="reviews" className="mt-6">
            <ReviewsSection
              reviews={reviews}
              averageRating={profile.rating}
              totalCount={profile.reviewCount}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </CartProvider>
  )
}
