'use client'

/**
 * Authentication Hook
 *
 * Provides authentication state and actions for React components.
 * Checks auth status on mount and exposes login/logout functions.
 *
 * Usage:
 *   const { user, isLoading, isAuthenticated, login, logout } = useAuth()
 */

import { useState, useEffect, useCallback } from 'react'
import { login as authLogin, logout as authLogout, getMe, User } from '@/lib/auth'

interface UseAuthReturn {
  /** Current user object, null if not authenticated */
  user: User | null
  /** True while checking authentication status */
  isLoading: boolean
  /** True if user is authenticated */
  isAuthenticated: boolean
  /** Login with email and password */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  /** Logout current user */
  logout: () => Promise<void>
  /** Refresh user data from server */
  refresh: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    try {
      const currentUser = await getMe()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Login handler
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const result = await authLogin(email, password)

      if (result.success) {
        // Fetch user data after successful login
        const currentUser = await getMe()
        setUser(currentUser)
      }

      return result
    },
    []
  )

  // Logout handler
  const logout = useCallback(async (): Promise<void> => {
    await authLogout()
    setUser(null)
  }, [])

  // Refresh user data
  const refresh = useCallback(async (): Promise<void> => {
    const currentUser = await getMe()
    setUser(currentUser)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    refresh,
  }
}
