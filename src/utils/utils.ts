export function unique (arr: any[]): any[] {
  return [...new Set(arr)]
}

/**
 * Returns the ISO date string in WeatherStack API's format (YYYY-MM-DD) for the given date or for today if no date is provided.
 * @param date - The Date object to format. Defaults to current date.
 * @returns The date string in ISO format (YYYY-MM-DD).
 */
export function getDateISO (date?: Date): string {
  // date.toLocaleDateString gives YYYY-MM-DD in the local timezone.
  return (date || new Date()).toLocaleDateString('en-CA') // en-CA: YYYY-MM-DD format
}

export function getTodayISO () {
  return getDateISO()
}

/**
 * Returns an array of ISO date strings (that is WeatherStack API's format),
 * centered around the given date.
 * @param date - The center date in ISO format (YYYY-MM-DD).
 * @param range - Number of days before and after the date to include (default: 3).
 * @returns Array of ISO date strings.
 */
export function getDatesAround (date: string, range = 3) {
  const base = new Date(date)
  return Array.from({ length: range * 2 + 1 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() - range + i)
    return getDateISO(d)
  })
}

/**
 * Retrieves an environment variable value by key.
 * Works with Vite's import.meta.env or returns undefined if not available.
 * @param key - The environment variable key.
 * @returns The value of the environment variable or undefined.
 */
function getEnv (key: string) {
  // Vite exposes env as import.meta.env
  // @ts-ignore
  return typeof import.meta !== 'undefined' ? import.meta.env[key] : undefined
}

/**
 * Retrieves the WeatherStack API key from environment variable VITE_WEATHERSTACK_API_KEY.
 * @returns The WeatherStack API key as a string, or undefined if not set.
 */
export function getApiKey () {
  return localStorage.getItem('WEATHERSTACK_API_KEY') || getEnv('VITE_WEATHERSTACK_API_KEY')
}

/**
 * Determines if the mock API is enabled based on environment variable VITE_USE_MOCK_API.
 * @returns True if mock API is enabled, false otherwise.
 */
export function isMockEnabled () {
  return getEnv('VITE_USE_MOCK_API') === 'true'
}

/**
 * Determines if paid WeatherStack endpoints are enabled based on environment variable VITE_USE_PAID_ENDPOINTS.
 * @returns True if paid endpoints are enabled, false otherwise.
 */
export function arePaidEndpointsEnabled () {
  return getEnv('VITE_USE_PAID_ENDPOINTS') === 'true'
}