'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import {
  mockStripeStatus,
  mockPaymentMethods,
  mockSubscription,
  mockIntegrations,
  REMINDER_OPTIONS,
} from '@/lib/mock-data/settings'
import {
  Settings,
  CreditCard,
  Bell,
  Plug,
  Building2,
  Shield,
  ChevronRight,
  Check,
  ExternalLink,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
  Lock,
  Key,
  History,
  AlertTriangle,
  Scale,
  Eye,
  FileText,
  Download,
  Cookie,
  Trash2,
  Crown,
  Sparkles,
} from 'lucide-react'

// Icon mapping for integrations
const integrationIcons: Record<string, React.ElementType> = {
  'calendar': Calendar,
  'users': Users,
  'dollar-sign': DollarSign,
}

type SettingsSection = 'billing' | 'notifications' | 'integrations' | 'workspace' | 'security' | 'legal' | 'privacy'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection | null>(null)

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMarketing: false,
    pushBookings: true,
    pushMessages: true,
  })

  // Reminder enabled state
  const [reminderEnabled, setReminderEnabled] = useState({
    email: true,
    push: true,
    sms: false,
  })

  // Reminder intervals state (in minutes)
  const [reminderIntervals, setReminderIntervals] = useState({
    email: [60, 1440] as number[], // 1 hour, 1 day before
    push: [15, 60] as number[], // 15 min, 1 hour before
    sms: [60] as number[], // 1 hour before (default when enabled)
  })

  // Workspace settings state
  const [workspace, setWorkspace] = useState({
    businessName: 'My Coaching Business',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    language: 'en',
  })

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const settingsSections = [
    {
      id: 'billing' as const,
      title: 'Billing & Payments',
      description: 'Manage how you get paid and payment methods',
      icon: CreditCard,
      status: mockStripeStatus.isConnected ? 'Connected' : undefined,
    },
    {
      id: 'notifications' as const,
      title: 'Notifications',
      description: 'Configure your notification preferences',
      icon: Bell,
    },
    {
      id: 'integrations' as const,
      title: 'Integrations',
      description: 'Connect third-party services and apps',
      icon: Plug,
      status: `${mockIntegrations.filter(i => i.connected).length} connected`,
    },
    {
      id: 'workspace' as const,
      title: 'Workspace Settings',
      description: 'Business details, timezone, and preferences',
      icon: Building2,
    },
    {
      id: 'security' as const,
      title: 'Security',
      description: 'Password, two-factor auth, and login history',
      icon: Shield,
    },
    {
      id: 'legal' as const,
      title: 'Legal',
      description: 'Terms of service, licenses, and agreements',
      icon: Scale,
    },
    {
      id: 'privacy' as const,
      title: 'Privacy',
      description: 'Data preferences, cookies, and account data',
      icon: Eye,
    },
  ]

  const activeConfig = settingsSections.find(s => s.id === activeSection)

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: 'Settings', onClick: activeSection ? () => setActiveSection(null) : undefined },
    ...(activeConfig ? [{ label: activeConfig.title }] : []),
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          {activeConfig ? <activeConfig.icon className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{activeConfig?.title || 'Settings'}</h1>
          <p className="text-sm text-muted-foreground">
            {activeConfig?.description || 'Manage your account and preferences'}
          </p>
        </div>
      </div>

      {activeSection ? (
        // Section Detail View
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection(null)}
            className="gap-2 -ml-2 text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Settings
          </Button>

          {activeSection === 'billing' && <BillingContent />}
          {activeSection === 'notifications' && (
            <NotificationsContent
              notifications={notifications}
              toggleNotification={toggleNotification}
              reminderEnabled={reminderEnabled}
              setReminderEnabled={setReminderEnabled}
              reminderIntervals={reminderIntervals}
              setReminderIntervals={setReminderIntervals}
            />
          )}
          {activeSection === 'integrations' && <IntegrationsContent />}
          {activeSection === 'workspace' && (
            <WorkspaceContent
              workspace={workspace}
              setWorkspace={setWorkspace}
            />
          )}
          {activeSection === 'security' && <SecurityContent />}
          {activeSection === 'legal' && <LegalContent />}
          {activeSection === 'privacy' && <PrivacyContent />}
        </div>
      ) : (
        // Settings Overview Grid
        <div className="grid gap-4 md:grid-cols-2">
          {settingsSections.map((section) => (
            <Card
              key={section.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setActiveSection(section.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <section.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{section.title}</h3>
                        {section.status && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            {section.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Billing Content
function BillingContent() {
  return (
    <div className="space-y-8">
      {/* Subscription Management */}
      <SettingsGroup title="Coach Subscription" description="Manage your coaching platform subscription" icon={Crown}>
        <div className="rounded-lg border overflow-hidden">
          {/* Current Plan Header */}
          <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{mockSubscription.plan} Plan</h4>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${mockSubscription.price}/{mockSubscription.interval} • Renews {new Date(mockSubscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Manage Plan
              </Button>
            </div>
          </div>

          {/* Plan Features */}
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">Your plan includes:</p>
            <div className="grid grid-cols-2 gap-2">
              {mockSubscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="p-4 border-t flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Need more features?</p>
              <p className="text-xs text-muted-foreground">Upgrade to Enterprise for advanced analytics and API access</p>
            </div>
            <Button size="sm" className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade
            </Button>
          </div>
        </div>
      </SettingsGroup>

      {/* Stripe Connect for Coaches */}
      <SettingsGroup title="Receive Payments" description="Connect your Stripe account to accept payments from students">
        {mockStripeStatus.isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Stripe Connected</p>
                  <p className="text-sm text-muted-foreground">{mockStripeStatus.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Payouts enabled
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Stripe Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">Connect Stripe to receive payments</p>
            <Button size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Connect Stripe
            </Button>
          </div>
        )}
      </SettingsGroup>

      {/* Payment Methods */}
      <SettingsGroup title="Payment Methods" description="Manage your saved payment methods for booking sessions">
        <div className="space-y-3">
          {mockPaymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 rounded border bg-background flex items-center justify-center text-xs font-medium">
                  {method.brand}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">•••• {method.last4}</span>
                  {method.isDefault && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Remove
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      </SettingsGroup>

      {/* Billing History */}
      <SettingsGroup title="Billing History" description="View your past transactions and invoices">
        <div className="p-8 rounded-lg border border-dashed text-center">
          <History className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No billing history yet</p>
        </div>
      </SettingsGroup>
    </div>
  )
}

// Notifications Content
function NotificationsContent({
  notifications,
  toggleNotification,
  reminderEnabled,
  setReminderEnabled,
  reminderIntervals,
  setReminderIntervals,
}: {
  notifications: {
    emailBookings: boolean
    emailMarketing: boolean
    pushBookings: boolean
    pushMessages: boolean
  }
  toggleNotification: (key: keyof typeof notifications) => void
  reminderEnabled: {
    email: boolean
    push: boolean
    sms: boolean
  }
  setReminderEnabled: React.Dispatch<React.SetStateAction<typeof reminderEnabled>>
  reminderIntervals: {
    email: number[]
    push: number[]
    sms: number[]
  }
  setReminderIntervals: React.Dispatch<React.SetStateAction<typeof reminderIntervals>>
}) {
  const toggleReminderEnabled = (channel: 'email' | 'push' | 'sms') => {
    setReminderEnabled(prev => ({ ...prev, [channel]: !prev[channel] }))
  }

  const toggleReminderInterval = (channel: 'email' | 'push' | 'sms', value: number) => {
    setReminderIntervals(prev => {
      const current = prev[channel]
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value].sort((a, b) => a - b)
      return { ...prev, [channel]: updated }
    })
  }

  const formatIntervals = (channel: 'email' | 'push' | 'sms') => {
    if (!reminderEnabled[channel]) return 'Disabled'
    const intervals = reminderIntervals[channel]
    if (intervals.length === 0) return 'No times selected'
    return intervals.map(v => {
      const option = REMINDER_OPTIONS.find(o => o.value === v)
      return option?.label.replace(' before', '') || `${v}m`
    }).join(', ')
  }

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <SettingsGroup title="Email Notifications" description="Choose what emails you want to receive" icon={Mail}>
        <div className="space-y-1">
          <ToggleRow
            label="Booking confirmations"
            description="Get notified when a booking is made or cancelled"
            checked={notifications.emailBookings}
            onChange={() => toggleNotification('emailBookings')}
          />
          <ToggleRow
            label="Marketing & updates"
            description="News, tips, and product updates"
            checked={notifications.emailMarketing}
            onChange={() => toggleNotification('emailMarketing')}
          />
        </div>
      </SettingsGroup>

      {/* Push Notifications */}
      <SettingsGroup title="Push Notifications" description="Manage mobile and desktop notifications" icon={Smartphone}>
        <div className="space-y-1">
          <ToggleRow
            label="Booking alerts"
            description="Instant notifications for new bookings"
            checked={notifications.pushBookings}
            onChange={() => toggleNotification('pushBookings')}
          />
          <ToggleRow
            label="Messages"
            description="Get notified when you receive a message"
            checked={notifications.pushMessages}
            onChange={() => toggleNotification('pushMessages')}
          />
        </div>
      </SettingsGroup>

      {/* Session Reminders Section */}
      <SettingsGroup title="Session Reminders" description="Get notified before your booked sessions">
        <div className="space-y-3">
          {/* Email Reminders */}
          <ReminderToggleWithOptions
            label="Email reminders"
            description="Receive reminder emails before sessions"
            icon={Mail}
            enabled={reminderEnabled.email}
            onToggle={() => toggleReminderEnabled('email')}
            intervals={reminderIntervals.email}
            onIntervalToggle={(value) => toggleReminderInterval('email', value)}
          />

          {/* Push Reminders */}
          <ReminderToggleWithOptions
            label="Push reminders"
            description="Receive push notifications before sessions"
            icon={Smartphone}
            enabled={reminderEnabled.push}
            onToggle={() => toggleReminderEnabled('push')}
            intervals={reminderIntervals.push}
            onIntervalToggle={(value) => toggleReminderInterval('push', value)}
          />

          {/* SMS Reminders */}
          <ReminderToggleWithOptions
            label="SMS reminders"
            description="Receive text messages before sessions (rates may apply)"
            icon={MessageSquare}
            enabled={reminderEnabled.sms}
            onToggle={() => toggleReminderEnabled('sms')}
            intervals={reminderIntervals.sms}
            onIntervalToggle={(value) => toggleReminderInterval('sms', value)}
          />
        </div>
      </SettingsGroup>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
        <h4 className="font-medium text-sm">Reminder Summary</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email reminders:</span>
            <span className="font-medium">{formatIntervals('email')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Push reminders:</span>
            <span className="font-medium">{formatIntervals('push')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SMS reminders:</span>
            <span className="font-medium">{formatIntervals('sms')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reminder Toggle with Expandable Options Component
function ReminderToggleWithOptions({
  label,
  description,
  icon: Icon,
  enabled,
  onToggle,
  intervals,
  onIntervalToggle,
}: {
  label: string
  description: string
  icon: React.ElementType
  enabled: boolean
  onToggle: () => void
  intervals: number[]
  onIntervalToggle: (value: number) => void
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Toggle Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-9 w-9 rounded-lg flex items-center justify-center',
            enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={onToggle}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            enabled ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
              enabled ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {/* Expandable Options */}
      {enabled && (
        <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mt-3 mb-2">
            Send reminders at these times:
          </p>
          <div className="flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map((option) => {
              const isSelected = intervals.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => onIntervalToggle(option.value)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-full border transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent border-input'
                  )}
                >
                  {option.label.replace(' before', '')}
                </button>
              )
            })}
          </div>
          {intervals.length === 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Select at least one time to receive reminders
            </p>
          )}
          {intervals.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {intervals.length} reminder{intervals.length > 1 ? 's' : ''} will be sent before each session
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Integrations Content
function IntegrationsContent() {
  return (
    <div className="space-y-8">
      <SettingsGroup title="Connected Apps" description="Connect your favorite tools to streamline your coaching workflow">
        <div className="space-y-2">
          {mockIntegrations.map((integration) => {
            const Icon = integrationIcons[integration.iconName] || Plug
            return (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    integration.connected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{integration.name}</p>
                      {integration.connected && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                  {integration.connected ? 'Manage' : 'Connect'}
                </Button>
              </div>
            )
          })}
        </div>
      </SettingsGroup>

      <div className="p-6 rounded-lg border border-dashed text-center">
        <Plug className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm font-medium">More integrations coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">We're working on adding more tools to help you coach better</p>
      </div>
    </div>
  )
}

// Workspace Content
function WorkspaceContent({
  workspace,
  setWorkspace,
}: {
  workspace: { businessName: string; timezone: string; currency: string; language: string }
  setWorkspace: React.Dispatch<React.SetStateAction<typeof workspace>>
}) {
  return (
    <div className="space-y-8">
      <SettingsGroup title="Business Information" description="Your business name as it appears to students">
        <div className="max-w-md space-y-2">
          <Label htmlFor="business-name">Business Name</Label>
          <Input
            id="business-name"
            value={workspace.businessName}
            onChange={(e) => setWorkspace(prev => ({ ...prev, businessName: e.target.value }))}
            placeholder="Your business name"
          />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Regional Settings" description="Configure your timezone, currency, and language preferences">
        <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={workspace.timezone}
              onChange={(e) => setWorkspace(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={workspace.currency}
              onChange={(e) => setWorkspace(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={workspace.language}
              onChange={(e) => setWorkspace(prev => ({ ...prev, language: e.target.value }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </SettingsGroup>

      <Button>Save Changes</Button>
    </div>
  )
}

// Security Content
function SecurityContent() {
  return (
    <div className="space-y-8">
      <SettingsGroup title="Password" description="Change your password to keep your account secure" icon={Lock}>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Change password</p>
            <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
          </div>
          <Button variant="outline" size="sm">Update Password</Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Two-Factor Authentication" description="Add an extra layer of security to your account" icon={Key}>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Two-factor authentication</p>
            <p className="text-sm text-muted-foreground">Protect your account with 2FA</p>
          </div>
          <Button variant="outline" size="sm">Enable 2FA</Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Active Sessions" description="Manage your logged-in devices" icon={History}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">Chrome on macOS • Los Angeles, CA</p>
              </div>
            </div>
            <Badge variant="secondary">Active now</Badge>
          </div>
          <Button variant="outline" size="sm" className="text-muted-foreground">
            Sign out all other sessions
          </Button>
        </div>
      </SettingsGroup>

      <SettingsGroup
        title="Danger Zone"
        description="Irreversible actions for your account"
        icon={AlertTriangle}
        danger
      >
        <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <div>
            <p className="font-medium">Delete account</p>
            <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
          </div>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </div>
      </SettingsGroup>
    </div>
  )
}

// Legal Content
function LegalContent() {
  return (
    <div className="space-y-8">
      <SettingsGroup title="Terms & Agreements" description="Review the terms that govern your use of our platform" icon={FileText}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Terms of Service</p>
              <p className="text-sm text-muted-foreground">Last updated January 15, 2025</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Privacy Policy</p>
              <p className="text-sm text-muted-foreground">Last updated January 15, 2025</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Acceptable Use Policy</p>
              <p className="text-sm text-muted-foreground">Guidelines for using our platform</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Coach Agreement" description="Additional terms for coaches using our platform" icon={Scale}>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">Coach Terms & Conditions</p>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Accepted</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Accepted on December 10, 2024</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Review
          </Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Licenses & Attribution" description="Third-party licenses and open source attributions">
        <div className="p-4 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            This application uses various open source libraries. View the full list of licenses and attributions.
          </p>
          <Button variant="link" size="sm" className="gap-2 px-0 mt-2">
            View Open Source Licenses
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </SettingsGroup>
    </div>
  )
}

// Privacy Content
function PrivacyContent() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  })

  return (
    <div className="space-y-8">
      <SettingsGroup title="Cookie Preferences" description="Manage how we use cookies on your browser" icon={Cookie}>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30 -mx-4">
            <div>
              <p className="font-medium">Essential Cookies</p>
              <p className="text-sm text-muted-foreground">Required for the platform to function properly</p>
            </div>
            <Badge variant="secondary">Always On</Badge>
          </div>
          <ToggleRow
            label="Analytics Cookies"
            description="Help us understand how you use the platform"
            checked={cookiePreferences.analytics}
            onChange={() => setCookiePreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
          />
          <ToggleRow
            label="Marketing Cookies"
            description="Used to show you relevant ads and content"
            checked={cookiePreferences.marketing}
            onChange={() => setCookiePreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
          />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Data & Privacy" description="Control how your data is used and stored" icon={Eye}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Profile Visibility</p>
              <p className="text-sm text-muted-foreground">Control who can see your public profile</p>
            </div>
            <select className="h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="public">Public</option>
              <option value="students">Students Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Activity Status</p>
              <p className="text-sm text-muted-foreground">Show when you're online to students</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={true}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors bg-primary"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform translate-x-5" />
            </button>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Your Data" description="Download or delete your account data">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Request Export
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div>
              <p className="font-medium">Delete All Data</p>
              <p className="text-sm text-muted-foreground">Permanently delete all your stored data</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Data
            </Button>
          </div>
        </div>
      </SettingsGroup>
    </div>
  )
}

// Settings Group Component - flat layout, no card
function SettingsGroup({
  title,
  description,
  icon: Icon,
  danger,
  children,
}: {
  title: string
  description?: string
  icon?: React.ElementType
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={cn(
          "font-semibold flex items-center gap-2",
          danger && "text-destructive"
        )}>
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

// Toggle Row Component
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors -mx-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
