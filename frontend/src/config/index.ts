interface Config {
  apiBaseUrl: string
  appName: string
  environment: 'development' | 'staging' | 'production'
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] ?? defaultValue
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const config: Config = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000'),
  appName: getEnvVar('VITE_APP_NAME', 'Velo App'),
  environment: getEnvVar('VITE_ENVIRONMENT', 'development') as Config['environment'],
}
