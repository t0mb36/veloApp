'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Home, Map, BookOpen, Calendar, Users, User, Settings, LogOut } from 'lucide-react'
import { useAuthContext } from '@/contexts/auth-context'

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
    title: 'Maps',
    icon: <Map className="h-5 w-5" />,
    href: '/maps',
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
  {
    title: 'Coaches',
    icon: <Users className="h-5 w-5" />,
    href: '/coaches',
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: 'Profile',
    icon: <User className="h-5 w-5" />,
    href: '/profile',
  },
  {
    title: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    href: '/settings',
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const { logout } = useAuthContext()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
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
      </nav>

      <Separator />

      {/* Bottom Navigation */}
      <nav className="space-y-1 p-3">
        {bottomNavItems.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
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
