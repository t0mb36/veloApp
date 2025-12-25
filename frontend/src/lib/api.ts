/**
 * API Client for client-side requests
 *
 * This client is used for making requests from the browser to our
 * Next.js API routes (/api/*). It always uses same-origin requests
 * with credentials: "include" to ensure cookies are sent.
 *
 * Security: All requests go through our Next.js API routes, which
 * proxy to the FastAPI backend. The browser never directly calls
 * the FastAPI backend. This ensures:
 * 1. CORS is not needed (same-origin)
 * 2. Session cookies are properly forwarded
 * 3. Backend URL is not exposed to the client
 */

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    // Remove leading slash from endpoint to ensure it's appended to baseUrl
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const fullPath = `${this.baseUrl}/${cleanEndpoint}`
    const url = new URL(fullPath, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    return url.toString()
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)

    const response = await fetch(url, {
      ...fetchOptions,
      // Always include credentials (cookies) for session-based auth
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`) as Error & {
        status: number
      }
      error.status = response.status
      throw error
    }

    // Check content type to avoid parsing HTML as JSON
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      throw new Error(`Unexpected response type: ${contentType}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    } as RequestOptions & { body?: string })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    } as RequestOptions & { body?: string })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Client for calling our Next.js API routes (same-origin)
// All auth-related requests should use this client
export const apiClient = new ApiClient('/api')
