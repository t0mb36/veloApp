'use client'

import { useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Calendar, CalendarDays, Play, Star, Briefcase } from 'lucide-react'
import { getFullCoachData } from '@/lib/mock-data/coaches'
import { ProfileHero } from '@/components/coach-profile/profile-hero'
import { ServicesBookingSection } from '@/components/coach-profile/services-booking-section'
import { ContentSection } from '@/components/coach-profile/content-section'
import { ReviewsSection } from '@/components/coach-profile/reviews-section'
import { FullCalendar } from '@/components/coach-profile/full-calendar'
import { CartProvider } from '@/contexts/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'

const tabTriggerClass = "gap-2 rounded-md rounded-b-none bg-transparent shadow-none border-0 data-[state=active]:bg-muted/50 data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-foreground text-muted-foreground px-4 py-2 hover:text-foreground hover:bg-muted/30 transition-colors"

export default function CoachProfilePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const coachId = params.id as string

  const data = getFullCoachData(coachId)

  // Get current tab from URL or default to 'services'
  const tabParam = searchParams.get('tab')
  const activeTab = ['services', 'calendar', 'content', 'reviews'].includes(tabParam || '')
    ? tabParam!
    : 'services'

  // Update URL when tab changes
  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === 'services') {
      // Remove tab param for default tab
      router.push(`/coaches/${coachId}`, { scroll: false })
    } else {
      router.push(`/coaches/${coachId}?tab=${newTab}`, { scroll: false })
    }
  }, [coachId, router])

  if (!data.profile) {
    notFound()
  }

  const { profile, services, availability, reviews, content } = data
  const coachName = `${profile.firstName} ${profile.lastName}`
  const activeServices = services.filter((s) => s.isActive)

  // Build breadcrumb items based on active tab
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Discover', href: '/discover' },
      { label: coachName, href: `/coaches/${coachId}` },
    ]

    if (activeTab === 'calendar') {
      items.push({ label: 'Calendar' })
    } else if (activeTab === 'content') {
      items.push({ label: 'Content' })
    } else if (activeTab === 'reviews') {
      items.push({ label: 'Reviews' })
    }

    return items
  }

  return (
    <CartProvider>
      <div className="space-y-6 pb-12">
        {/* Breadcrumb */}
        <Breadcrumb items={getBreadcrumbItems()} />

        {/* Profile Hero - includes bio and socials */}
        <ProfileHero coach={profile} />

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent gap-2 border-b">
            <TabsTrigger value="services" className={tabTriggerClass}>
              <Briefcase className="h-4 w-4" />
              Services ({activeServices.length})
            </TabsTrigger>
            <TabsTrigger value="calendar" className={tabTriggerClass}>
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            {content.length > 0 && (
              <TabsTrigger value="content" className={tabTriggerClass}>
                <Play className="h-4 w-4" />
                Content ({content.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="reviews" className={tabTriggerClass}>
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
              coachName={coachName}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <FullCalendar
              availability={availability}
              services={services}
              coachId={coachId}
              coachName={coachName}
              isContactOnly={profile.isContactOnly}
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
              coachName={coachName}
              services={activeServices.map((s) => ({ id: s.id, name: s.name }))}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </CartProvider>
  )
}
