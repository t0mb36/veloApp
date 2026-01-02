// Settings-related type definitions

export interface StripeStatus {
  isConnected: boolean
  accountId: string
  email: string
  payoutsEnabled: boolean
}

export interface PaymentMethod {
  id: string
  type: string
  last4: string
  brand: string
  isDefault: boolean
}

export interface Integration {
  id: string
  name: string
  icon: React.ElementType
  connected: boolean
  description: string
}

export interface Subscription {
  plan: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  price: number
  interval: 'month' | 'year'
  currentPeriodEnd: string
  features: string[]
}

export interface ReminderOption {
  value: number // in minutes
  label: string
}
