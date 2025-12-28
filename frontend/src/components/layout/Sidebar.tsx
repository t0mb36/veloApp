'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Home, Compass, BookOpen, Calendar, Settings, LogOut, GraduationCap, ChevronUp, Check, Users, Clapperboard } from 'lucide-react'
import { useAuthContext } from '@/contexts/auth-context'
import { useViewMode, ViewMode } from '@/contexts/view-mode-context'

interface NavItem {
  title: string
  icon: React.ReactNode
  href: string
}

const mainNavItems: NavItem[] = [
  {
    title: 'Home',
    icon: <Home className="h-5 w-5" />,
    href: '/',
  },
  {
    title: 'Discover',
    icon: <Compass className="h-5 w-5" />,
    href: '/discover',
  },
  {
    title: 'Programs',
    icon: <BookOpen className="h-5 w-5" />,
    href: '/programs',
  },
  {
    title: 'Calendar',
    icon: <Calendar className="h-5 w-5" />,
    href: '/calendar',
  },
]


interface SidebarProps {
  className?: string
}

const viewModeOptions: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'student', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'coach', label: 'Coach', icon: <Users className="h-4 w-4" /> },
]

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout, user } = useAuthContext()
  const { viewMode, setViewMode } = useViewMode()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const currentOption = viewModeOptions.find((opt) => opt.value === viewMode)!

  const getUserInitials = () => {
    if (user?.display_name) {
      const parts = user.display_name.split(' ')
      return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const handleSelectMode = (mode: ViewMode) => {
    setViewMode(mode)
    setIsDropdownOpen(false)
  }

  return (
    <aside
      className={cn(
        'flex h-screen w-40 flex-col border-r border-border bg-background',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-lg font-bold">V</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {mainNavItems.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
        {/* Coach-only: Studio */}
        {viewMode === 'coach' && (
          <NavItemComponent
            item={{
              title: 'Studio',
              icon: <Clapperboard className="h-5 w-5" />,
              href: '/studio',
            }}
          />
        )}
      </nav>

      <Separator />

      {/* Bottom Navigation */}
      <nav className="space-y-1 p-3">
        {/* Profile with Avatar */}
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            pathname === '/profile' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          )}
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={undefined} />
            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span>Profile</span>
        </Link>
        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            pathname === '/settings' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
            'hover:bg-accent hover:text-accent-foreground',
            'text-muted-foreground'
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </nav>

      <Separator />

      {/* View Mode Dropdown */}
      <div className="relative p-3">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
            'border border-border bg-background hover:bg-accent'
          )}
        >
          <div className="flex items-center gap-2">
            {currentOption.icon}
            <span>{currentOption.label}</span>
          </div>
          <ChevronUp
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isDropdownOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border border-border bg-background shadow-lg">
            {viewModeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectMode(option.value)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg',
                  'hover:bg-accent',
                  viewMode === option.value && 'bg-accent/50'
                )}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                {viewMode === option.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

interface NavItemComponentProps {
  item: NavItem
}

function NavItemComponent({ item }: NavItemComponentProps) {
  const pathname = usePathname()
  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      )}
    >
      {item.icon}
      <span>{item.title}</span>
    </Link>
  )
}
