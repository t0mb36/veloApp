/**
 * Session Login API Route
 *
 * Proxies the Firebase ID token to the backend, which:
 * 1. Verifies the token with Firebase Admin SDK
 * 2. Creates a session cookie
 * 3. Returns the cookie in Set-Cookie header
 *
 * The proxy helper forwards this cookie to the browser, establishing
 * a secure HttpOnly session that the browser can't access via JavaScript.
 */

import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function POST(request: NextRequest) {
  // Parse the request body containing the Firebase ID token
  const body = await request.json()

  // Proxy to backend - the backend will set the session cookie
  return proxyToBackend(request, '/api/auth/session-login', {
    method: 'POST',
    body,
  })
}
