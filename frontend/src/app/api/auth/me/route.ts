/**
 * Get Current User API Route
 *
 * Proxies the request to the backend with the session cookie.
 * The backend will:
 * 1. Verify the session cookie with Firebase Admin SDK
 * 2. Upsert the user record in the database
 * 3. Return the user object
 *
 * If the session is invalid or missing, returns 401.
 */

import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  // Proxy to backend - cookies are forwarded automatically
  return proxyToBackend(request, '/api/auth/me', {
    method: 'GET',
  })
}
