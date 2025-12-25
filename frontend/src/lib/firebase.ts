'use client'

/**
 * Firebase Client SDK initialization
 *
 * This module initializes Firebase for client-side authentication.
 * It uses NEXT_PUBLIC_* environment variables which are safe to expose
 * to the browser (they're public Firebase config, not secrets).
 *
 * Security: The actual authentication happens server-side with session cookies.
 * This client SDK is only used to get ID tokens which are then exchanged
 * for secure HttpOnly session cookies via the backend.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

// Lazy initialization to avoid SSR issues
let app: FirebaseApp | null = null
let authInstance: Auth | null = null

/**
 * Get the Firebase app instance (lazy initialized)
 */
function getFirebaseApp(): FirebaseApp {
  if (app) return app

  // Check if we're on the client side
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side')
  }

  // Check if Firebase is already initialized
  if (getApps().length > 0) {
    app = getApp()
  } else {
    app = initializeApp(firebaseConfig)
  }

  return app
}

/**
 * Get the Firebase Auth instance (lazy initialized)
 */
export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance

  const firebaseApp = getFirebaseApp()
  authInstance = getAuth(firebaseApp)

  return authInstance
}
