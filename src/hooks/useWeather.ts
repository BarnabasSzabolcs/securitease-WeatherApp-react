import type { ApiCallResult, WeatherData } from '../types/weather'
import { useQuery } from '@tanstack/react-query'
import { arePaidEndpointsEnabled, getDatesAround, getTodayISO, isMockEnabled } from '../utils/utils.ts'
import { getMockWeatherCurrent, getMockWeatherForecast, getMockWeatherHistorical } from '../services/mock.ts'
import { getLiveWeatherCurrent, getLiveWeatherForecast, getLiveWeatherHistorical } from '../services/live.ts'
import { cachedCall } from '../utils/cache.ts'

/**
 * Fetches current weather data (for "today"), using mock or live service depending on configuration.
 * Results are cached.
 * @param query - The location query string.
 * @returns A promise resolving to the API call result.
 */
async function getWeatherCurrent (query: string): Promise<ApiCallResult> {
  return cachedCall(
    'current',
    query,
    (async () =>
        isMockEnabled() ?
          await getMockWeatherCurrent(query) :
          await getLiveWeatherCurrent(query)
    ),
  )
}

/**
 * Fetches historical weather data for a given date (for the 3 past days), using mock or live service depending on configuration.
 * Results are cached.
 * @param date - The ISO date string.
 * @param query - The location query string.
 * @returns A promise resolving to the API call result.
 */
async function getWeatherHistorical (date: string, query: string): Promise<ApiCallResult> {
  return cachedCall(
    'historical',
    query,
    (async () =>
        isMockEnabled() ?
          await getMockWeatherHistorical(date, query) :
          await getLiveWeatherHistorical(date, query)
    ),
  )
}

/**
 * Fetches weather forecast data (for the 3 next days), using mock or live service depending on configuration.
 * Results are cached.
 * @param query - The location query string.
 * @returns A promise resolving to the API call result.
 */
async function getWeatherForecast (query: string): Promise<ApiCallResult> {
  return cachedCall(
    'forecast',
    query,
    (async () =>
        isMockEnabled() ?
          await getMockWeatherForecast(query) :
          await getLiveWeatherForecast(query)
    ),
  )
}

/**
 * Extracts a human-readable error message from an error object.
 * The error can stem from various sources, such as network errors
 * or when the WeatherStack API responds with HTTP 2xx but the response has an error.
 * @param e - The error object.
 * @param fallback - The fallback message if no specific message is found.
 * @returns The extracted error message.
 */
function extractErrorMessage (e: any, fallback: string): string {
  if (e.name === 'TypeError' || e.message === 'Failed to fetch') return 'Network connection error.'
  if (!e) return fallback
  if (typeof e === 'string') return e
  if (e.message) return e.message
  if (e.status && e.error) return `Error ${e.status}: ${e.error}`
  if (e.status && e.statusText) return `Error ${e.status}: ${e.statusText}`
  if (e.status) return `Error ${e.status}`
  // WeatherStack API error response
  if (e.success === false && e.error) {
    return `Error (${e.error.code}): ${e.error.info}`
  }
  return fallback
}

/**
 * Generates an empty weather data object
 * that Timeline component can use to display a placeholder for dates without data while loading.
 * @param date - The ISO date string.
 * @returns An object mapping dates to null weather data.
 */
function getNullWeatherData (date: string): Record<string, WeatherData | null> {
  const dates = getDatesAround(date)
  const nullWeatherData: Record<string, WeatherData | null> = {}
  for (const d of dates) {
    nullWeatherData[d] = null
  }
  return nullWeatherData
}

/**
 * React hook to fetch and manage weather data for a given location query.
 * Handles loading state, error state, and combines current, historical, and forecast data.
 * @param query - The location query string.
 * @returns An object containing location, weather data, loading state, and error message.
 *
 * Note: isMountedRef and abortController are used to prevent state updates after the component has unmounted,
 * which can happen if the component is unmounted before the fetch completes.
 * This is important to avoid memory leaks and errors in React applications.
 */
export function useWeather (query: string) {
  // Fetch current weather first
  const current = useQuery({
    queryKey: ['weather', 'current', query],
    queryFn: () => getWeatherCurrent(query),
    enabled: !!query,
  })

  // Extract the date only after current is loaded
  const today = current.data ? Object.keys(current.data.weather_data)[0] : undefined

  // Fetch historical and forecast only after current is successful
  const historical = useQuery({
    queryKey: ['weather', 'historical', today, query],
    queryFn: () => getWeatherHistorical(today!, query),
    enabled: !!today && arePaidEndpointsEnabled(),
  })

  const forecast = useQuery({
    queryKey: ['weather', 'forecast', query],
    queryFn: () => getWeatherForecast(query),
    enabled: !!today && arePaidEndpointsEnabled(),
  })

  // Fill up the ±3 days with nulls using getNullWeatherData(today)
  const weather_data = {
    ...getNullWeatherData(today || getTodayISO()),
    ...current.data?.weather_data,
    ...historical.data?.weather_data,
    ...forecast.data?.weather_data,
  }

  // Compose error using extractErrorMessage for the first error found
  const rawError = current.error || historical.error || forecast.error
  const error = rawError ? extractErrorMessage(rawError, 'Failed to fetch weather data') : null

  return {
    isLoading: current.isLoading || historical.isLoading || forecast.isLoading,
    error,
    location: current.data?.location || historical.data?.location || forecast.data?.location,
    weather_data,
  }
}