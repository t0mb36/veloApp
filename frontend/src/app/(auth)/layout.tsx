/**
 * Auth Layout
 *
 * Layout for authentication pages (login, signup, etc.)
 * Does NOT include the sidebar - just a centered container.
 */

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {children}
    </div>
  )
}
