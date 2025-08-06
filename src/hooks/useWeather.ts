import type { ApiCallResult, Location, WeatherData } from '../types/weather'

import { useEffect, useState } from 'react'
import { arePaidEndpointsEnabled, getDatesAround, getTodayISO, isMockEnabled } from '../utils/utils.ts'
import { getMockWeatherCurrent, getMockWeatherForecast, getMockWeatherHistorical } from '../services/mock.ts'
import { getLiveWeatherCurrent, getLiveWeatherForecast, getLiveWeatherHistorical } from '../services/live.ts'
import { cachedCall } from '../utils/cache.ts'

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

async function getWeatherHistorical (query: string): Promise<ApiCallResult> {
  return cachedCall(
    'historical',
    query,
    (async () =>
        isMockEnabled() ?
          await getMockWeatherHistorical(query) :
          await getLiveWeatherHistorical(query)
    ),
  )
}

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

function extractErrorMessage(e: any, fallback: string): string {
  if (e.name === 'TypeError' || e.message === 'Failed to fetch') return 'Network connection error.'
  if (!e) return fallback
  if (typeof e === 'string') return e
  if (e.message) return e.message
  if (e.status && e.error) return `Error ${e.status}: ${e.error}`
  if (e.status && e.statusText) return `Error ${e.status}: ${e.statusText}`
  if (e.status) return `Error ${e.status}`
  if (e.success === false && e.error) {
    return `Error (${e.error.code}): ${e.error.info}`
  }
  return fallback
}

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
      const nullWeatherData: Record<string, WeatherData | null> = {}
      const dates = getDatesAround(getTodayISO())
      for (const date of dates) {
        nullWeatherData[date] = null
      }

      let weatherData: Record<string, WeatherData | null> = { ...nullWeatherData }
      try {
        const res = await getWeatherCurrent(query)
        if (res) {
          weatherData = { ...weatherData, ...res.weather_data }
          setWeatherData(weatherData)
          setLocation(res.location)
        }
      } catch (e: any) {
        setError(extractErrorMessage(e, 'Failed to fetch current weather'))
      }
      if (arePaidEndpointsEnabled()) {
        try {
          const [historicalRes, forecastRes] = await Promise.all([
            getWeatherHistorical(query),
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