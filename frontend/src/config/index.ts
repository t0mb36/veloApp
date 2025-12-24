interface Config {
  apiBaseUrl: string
  appName: string
  environment: 'development' | 'staging' | 'production'
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const config: Config = {
  apiBaseUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:8000'),
  appName: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Velo App'),
  environment: getEnvVar('NEXT_PUBLIC_ENVIRONMENT', 'development') as Config['environment'],
}
