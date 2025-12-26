'use client'

/**
 * Dashboard Layout
 *
 * Layout for authenticated pages with sidebar navigation.
 * Only rendered for logged-in users (protected by middleware).
 */

import { AppLayout } from '@/components/layout'
import { ViewModeProvider } from '@/contexts/view-mode-context'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ViewModeProvider>
      <AppLayout>{children}</AppLayout>
    </ViewModeProvider>
  )
}
