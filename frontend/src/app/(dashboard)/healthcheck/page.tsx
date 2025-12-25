'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { config } from '@/config'

interface HealthStatus {
  frontend: 'healthy' | 'unhealthy'
  api: 'healthy' | 'unhealthy' | 'checking'
  timestamp: string
}

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    frontend: 'healthy',
    api: 'checking',
    timestamp: new Date().toISOString(),
  })

  const checkApiHealth = useCallback(async () => {
    setStatus((prev) => ({ ...prev, api: 'checking' }))
    try {
      const response = await fetch(`${config.apiBaseUrl}/health`)
      setStatus({
        frontend: 'healthy',
        api: response.ok ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      })
    } catch {
      setStatus({
        frontend: 'healthy',
        api: 'unhealthy',
        timestamp: new Date().toISOString(),
      })
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkApiHealth()
  }, [checkApiHealth])

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'healthy':
        return 'text-green-600'
      case 'unhealthy':
        return 'text-red-600'
      case 'checking':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Health Check</CardTitle>
          <CardDescription>
            {config.appName} - {config.environment}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Frontend</span>
              <span className={getStatusColor(status.frontend)}>{status.frontend}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">API</span>
              <span className={getStatusColor(status.api)}>{status.api}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Last checked</span>
              <span>{new Date(status.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button onClick={checkApiHealth} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>API Base URL: {config.apiBaseUrl}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
