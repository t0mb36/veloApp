import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { config } from '@/config'

interface HealthStatus {
  frontend: 'healthy' | 'unhealthy'
  api: 'healthy' | 'unhealthy' | 'checking'
  timestamp: string
}

export function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    frontend: 'healthy',
    api: 'checking',
    timestamp: new Date().toISOString(),
  })
  const [inputValue, setInputValue] = useState('')

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
    // Fetch API health on component mount
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
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
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
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Last checked</span>
              <span>{new Date(status.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-muted-foreground mb-2 text-sm">Component Test</p>
            <div className="flex gap-2">
              <Input
                placeholder="Type something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button onClick={checkApiHealth}>Refresh</Button>
            </div>
          </div>

          <div className="text-muted-foreground border-t pt-4 text-xs">
            <p>API Base URL: {config.apiBaseUrl}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
