import type { ApiCallResult, Location, WeatherData } from '../types/weather'

import { useEffect, useState } from 'react'
import { getDatesAround, getTodayISO, isHistoryEndpointEnabled, isMockEnabled } from '../utils/utils.ts'
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

export function useWeather (query: string) {
  const [location, setLocation] = useState<Location>({ name: '', country: '', region: '' })
  const [weather_data, setWeatherData] = useState<Record<string, WeatherData | null>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query) return

    const fetchWeather = async () => {
      setIsLoading(true)
      const nullWeatherData: Record<string, WeatherData | null> = {}
      const dates = getDatesAround(getTodayISO())
      for (const date of dates) {
        nullWeatherData[date] = null
      }

      let weatherData: Record<string, WeatherData | null> = { ...nullWeatherData }
      // We wait for the current to be fetched first, because otherwise the free API will ratelimit us.
      // If the user has pro API key, then it is not a big wait.
      try {
        const res = await getWeatherCurrent(query)
        if (res) {
          weatherData = { ...weatherData, ...res.weather_data }
          setWeatherData(weatherData)
          setLocation(res.location)
        }
      } catch (e) {
      }
      if (isHistoryEndpointEnabled()) {
        try {
          const [historicalRes, forecastRes] = await Promise.all([
            getWeatherHistorical(query),
            getWeatherForecast(query),
          ])
          if (historicalRes) {
            weatherData = { ...weatherData, ...historicalRes.weather_data }
            setWeatherData(weatherData)
            setLocation(historicalRes.location)
          }
          if (forecastRes) {
            weatherData = { ...weatherData, ...forecastRes.weather_data }
            setWeatherData(weatherData)
            setLocation(forecastRes.location)
          }
        } catch (e) {
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
  }
}