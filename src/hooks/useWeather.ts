import type { ApiCallResult, Location, WeatherData } from '../types/weather'

import { useEffect, useState } from 'react'
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
 */
export function useWeather (query: string) {
  const [location, setLocation] = useState<Location>({ name: '', country: '', region: '' })
  const [weather_data, setWeatherData] = useState<Record<string, WeatherData | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) return

    const fetchWeather = async () => {
      setIsLoading(true)
      setError(null)
      // setLocation({ name: '-', country: '-', region: '-' })
      let today: string = getTodayISO()
      let weatherData = getNullWeatherData(today)
      try {
        const res = await getWeatherCurrent(query)
        const currentToday = Object.keys(res.weather_data)[0]
        if (currentToday !== today) {
          today = currentToday
          weatherData = getNullWeatherData(today)
        }
        weatherData = { ...weatherData, ...res.weather_data }
        setWeatherData(weatherData)
        setLocation(res.location)
      } catch (e: any) {
        setError(extractErrorMessage(e, 'Failed to fetch current weather'))
      }

      if (arePaidEndpointsEnabled()) {
        try {
          const [historicalRes, forecastRes] = await Promise.all([
            getWeatherHistorical(today, query),
            getWeatherForecast(query),
          ])
          if (historicalRes) {
            weatherData = { ...weatherData, ...historicalRes.weather_data }
            setWeatherData(weatherData)
            if (location.name === '-') setLocation(historicalRes.location)
          }
          if (forecastRes) {
            weatherData = { ...weatherData, ...forecastRes.weather_data }
            setWeatherData(weatherData)
            if (location.name === '-') setLocation(forecastRes.location)
          }
        } catch (e: any) {
          setError(extractErrorMessage(e, 'Failed to fetch paid weather data'))
        }
      }
      setIsLoading(false)
    }

    // noinspection JSIgnoredPromiseFromCall
    fetchWeather()
  }, [query])

  return {
    location,
    weather_data,
    isLoading,
    error,
  }
}