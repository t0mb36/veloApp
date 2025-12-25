/**
 * Session Logout API Route
 *
 * Proxies the logout request to the backend, which clears
 * the session cookie by setting it with max_age=0.
 *
 * After this, the browser will no longer send the session
 * cookie, effectively logging the user out.
 */

import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function POST(request: NextRequest) {
  // Proxy to backend - the backend will clear the session cookie
  return proxyToBackend(request, '/api/auth/session-logout', {
    method: 'POST',
  })
}
