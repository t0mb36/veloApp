/**
 * Proxy Helper for BFF (Backend for Frontend) Pattern
 *
 * This module provides utilities to proxy requests from Next.js API routes
 * to the FastAPI backend. This pattern ensures:
 *
 * 1. Session cookies (HttpOnly) are forwarded securely between browser and backend
 * 2. The browser never directly communicates with FastAPI
 * 3. CORS is simplified since all requests go through same-origin /api/* routes
 * 4. Server-side secrets (like BACKEND_URL) are not exposed to the client
 */

import { NextRequest, NextResponse } from 'next/server'

// Backend URL is server-side only (no NEXT_PUBLIC_ prefix)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

interface ProxyOptions {
  /** HTTP method to use */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Request body to forward (will be JSON stringified if object) */
  body?: unknown
  /** Additional headers to include */
  headers?: Record<string, string>
}

/**
 * Proxy a request to the FastAPI backend
 *
 * @param request - The incoming Next.js request (used to forward cookies)
 * @param endpoint - The backend endpoint path (e.g., "/auth/session-login")
 * @param options - Request options (method, body, headers)
 * @returns NextResponse with backend response and forwarded cookies
 */
export async function proxyToBackend(
  request: NextRequest,
  endpoint: string,
  options: ProxyOptions = {}
): Promise<NextResponse> {
  const { method = 'GET', body, headers = {} } = options

  // Forward cookies from the browser to the backend
  // This is critical for session-based auth
  const cookieHeader = request.headers.get('cookie')

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Include cookies if present
  if (cookieHeader) {
    fetchHeaders['Cookie'] = cookieHeader
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      method,
      headers: fetchHeaders,
      body: body ? JSON.stringify(body) : undefined,
      // Don't follow redirects - let the client handle them
      redirect: 'manual',
    })

    // Parse the response body
    let responseBody: unknown
    const contentType = backendResponse.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      responseBody = await backendResponse.json()
    } else {
      responseBody = await backendResponse.text()
    }

    // Create the Next.js response
    const nextResponse = NextResponse.json(responseBody, {
      status: backendResponse.status,
    })

    // Forward Set-Cookie headers from backend to browser
    // This is how session cookies get set on the browser
    const setCookieHeaders = backendResponse.headers.getSetCookie()
    for (const cookie of setCookieHeaders) {
      nextResponse.headers.append('Set-Cookie', cookie)
    }

    return nextResponse
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
  }
}
