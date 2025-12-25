'use client'

/**
 * Authentication Functions
 *
 * These functions handle the authentication flow:
 * 1. login() - Sign in with Firebase, exchange token for session cookie
 * 2. logout() - Clear session cookie and sign out of Firebase
 * 3. getMe() - Get current user from session
 *
 * Security: The Firebase ID token is only used temporarily to establish
 * a session. After login(), the token is discarded and all subsequent
 * requests use the HttpOnly session cookie (which JS can't access).
 */

import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirebaseAuth } from './firebase'
import { apiClient } from './api'

/**
 * User object returned from /auth/me
 */
export interface User {
  id: string
  email: string
  display_name: string | null
  roles: string[]
  active_mode: 'student' | 'coach'
}

/**
 * Login with email and password
 *
 * Flow:
 * 1. Authenticate with Firebase client SDK
 * 2. Get ID token from Firebase
 * 3. Exchange ID token for session cookie via backend
 *
 * After this, the browser will have an HttpOnly session cookie
 * that will be sent with all subsequent requests.
 */
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Sign in with Firebase
    const auth = getFirebaseAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Step 2: Get the ID token
    const idToken = await userCredential.user.getIdToken()

    // Step 3: Exchange token for session cookie
    await apiClient.post('/auth/session-login', { id_token: idToken })

    return { success: true }
  } catch (error) {
    // Handle Firebase errors
    const firebaseError = error as { code?: string; message?: string }
    let errorMessage = 'Login failed'

    if (firebaseError.code === 'auth/invalid-api-key') {
      errorMessage = 'Firebase configuration error. Please check environment variables.'
      console.error('Firebase API key is invalid or not configured. Check NEXT_PUBLIC_FIREBASE_* env vars.')
    } else if (firebaseError.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email'
    } else if (firebaseError.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password'
    } else if (firebaseError.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address'
    } else if (firebaseError.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.'
    } else if (firebaseError.message) {
      errorMessage = firebaseError.message
    }

    return { success: false, error: errorMessage }
  }
}

/**
 * Logout
 *
 * Flow:
 * 1. Call backend to clear session cookie
 * 2. Sign out from Firebase client
 *
 * The order matters: we clear the server session first, then
 * clean up the client-side Firebase state.
 */
export async function logout(): Promise<void> {
  try {
    // Step 1: Clear session cookie on backend
    await apiClient.post('/auth/session-logout')
  } catch {
    // Continue with client-side logout even if backend fails
    console.warn('Failed to clear server session')
  }

  // Step 2: Sign out from Firebase client
  const auth = getFirebaseAuth()
  await signOut(auth)
}

/**
 * Get current user
 *
 * Makes a request to /auth/me with the session cookie.
 * Returns the user object if authenticated, null otherwise.
 */
export async function getMe(): Promise<User | null> {
  try {
    return await apiClient.get<User>('/auth/me')
  } catch (error) {
    // 401 means not authenticated - this is expected
    const httpError = error as { status?: number }
    if (httpError.status === 401) {
      return null
    }
    // For other errors, log and return null
    console.error('Failed to get current user:', error)
    return null
  }
}
