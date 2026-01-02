import type { StripeStatus, PaymentMethod, Subscription, ReminderOption } from '@/types/settings'

// Mock Stripe connection status
export const mockStripeStatus: StripeStatus = {
  isConnected: true,
  accountId: 'acct_1234567890',
  email: 'coach@example.com',
  payoutsEnabled: true,
}

// Mock payment methods
export const mockPaymentMethods: PaymentMethod[] = [
  { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
]

// Mock subscription
export const mockSubscription: Subscription = {
  plan: 'Pro',
  status: 'active',
  price: 29,
  interval: 'month',
  currentPeriodEnd: '2025-02-15',
  features: [
    'Unlimited students',
    'Video analysis tools',
    'Custom branding',
    'Priority support',
  ],
}

// Integration definitions (without icons - icons added at component level)
export interface IntegrationConfig {
  id: string
  name: string
  iconName: 'calendar' | 'users' | 'dollar-sign'
  connected: boolean
  description: string
}

export const mockIntegrations: IntegrationConfig[] = [
  { id: 'google-calendar', name: 'Google Calendar', iconName: 'calendar', connected: true, description: 'Sync your availability and bookings' },
  { id: 'zoom', name: 'Zoom', iconName: 'users', connected: false, description: 'Automatically create meeting links' },
  { id: 'stripe', name: 'Stripe', iconName: 'dollar-sign', connected: true, description: 'Process payments securely' },
]

// Reminder options
export const REMINDER_OPTIONS: ReminderOption[] = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' },
  { value: 10080, label: '1 week before' },
]
