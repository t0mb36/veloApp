'use client'

/**
 * Authentication Context
 *
 * Provides authentication state and actions to the entire app.
 * Wrap your app with AuthProvider to access auth state via useAuthContext.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { login as authLogin, logout as authLogout, getMe, User } from '@/lib/auth'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { apiClient } from '@/lib/api'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
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
        const currentUser = await getMe()
        setUser(currentUser)
      }

      return result
    },
    []
  )

  // Signup handler
  const signup = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // Create user with Firebase
        const auth = getFirebaseAuth()
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        // Get ID token and create session
        const idToken = await userCredential.user.getIdToken()
        await apiClient.post('/auth/session-login', { id_token: idToken })

        // Fetch user data
        const currentUser = await getMe()
        setUser(currentUser)

        return { success: true }
      } catch (error) {
        const firebaseError = error as { code?: string; message?: string }
        let errorMessage = 'Signup failed'

        if (firebaseError.code === 'auth/invalid-api-key') {
          errorMessage = 'Firebase configuration error. Please check environment variables.'
          console.error('Firebase API key is invalid or not configured. Check NEXT_PUBLIC_FIREBASE_* env vars.')
        } else if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists'
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters'
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address'
        } else if (firebaseError.message) {
          errorMessage = firebaseError.message
        }

        return { success: false, error: errorMessage }
      }
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        signup,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
