import type { ApiCallResult, Location, WeatherData } from '../types/weather'

import { useEffect, useState } from 'react'
import { getDatesAround, getTodayISO, isHistoryEndpointEnabled, isMockEnabled } from '../utils/utils.ts'
import { getMockCurrentWeather, getMockHistoricalWeather } from '../services/mock.ts'
import { getLiveCurrentWeather, getLiveHistoricalWeather } from '../services/live.ts'

async function getCurrentWeather (query: string): Promise<ApiCallResult> {
  if (isMockEnabled()) {
    return await getMockCurrentWeather(query)
  }
  return await getLiveCurrentWeather(query)
}

async function getHistoricalWeather (query: string): Promise<ApiCallResult> {
  if (isMockEnabled()) {
    return await getMockHistoricalWeather(query)
  }
  return await getLiveHistoricalWeather(query)
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
        const res = await getCurrentWeather(query)
        if (res) {
          weatherData = { ...weatherData, ...res.weather_data }
          setWeatherData(weatherData)
          setLocation(res.location)
        }
      } catch (e) {
      }
      if (isHistoryEndpointEnabled()) {
        try {
          // Forecast could be retrieved here, in parallel to historical data.
          const res = await getHistoricalWeather(query)
          if (res) {
            weatherData = { ...weatherData, ...res.weather_data }
            setWeatherData(weatherData)
            setLocation(res.location)
          }
        } catch (e) {
        }
      }
      setIsLoading(false)
    }

    fetchWeather()
  }, [query])

  return {
    location,
    weather_data,
    isLoading,
  }
}