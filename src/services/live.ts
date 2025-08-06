import { getApiKey, getDatesAround, getTodayISO } from '../utils/utils.ts'
import type { ApiCallResult } from '../types/weather.ts'
import type { Location, WeatherData } from '../../_temp/src/types/weather.ts'

export async function getLiveCurrentWeather (query: string): Promise<ApiCallResult> {
  const currUrl = new URL('https://api.weatherstack.com/current')
  currUrl.search = new URLSearchParams({
    access_key: getApiKey(),
    query,
    units: 'm',
  }).toString()
  const res = await fetch(currUrl)
  let currentResponse: any = await res.json()
  if (currentResponse.success === false) throw new Error(currentResponse)
  let location: Location = { name: '-', country: '-', region: '-' }
  if (currentResponse.location) {
    location = {
      name: currentResponse.location.name,
      country: currentResponse.location.country,
      region: currentResponse.location.region,
    }
  }
  const c = currentResponse.current
  const today = getTodayISO()
  const weather_data: Record<string, WeatherData | null> = {
    [today]: {
      temperature: c.temperature ?? '-',
      weather_icon: c.weather_icons?.[0] ?? '-',
      weather_description: c.weather_descriptions?.[0] ?? '-',
      wind_speed: c.wind_speed ?? '-',
      pressure: c.pressure ?? '-',
      precip: c.precip ?? '-',
    }
  }
  return { weather_data, location }
}

export async function getLiveHistoricalWeather (query: string): Promise<ApiCallResult> {
  const histUrl = new URL('https://api.weatherstack.com/historical')
  const today = getTodayISO()
  const dates = getDatesAround(today, 3).filter(d => d < today)

  histUrl.search = new URLSearchParams({
    access_key: getApiKey(),
    query,
    units: 'm',
    historical_date: dates.join(';'),
  }).toString()
  const res = await fetch(histUrl)
  const historyResponse: any = res.json()
  if (historyResponse.success === false) throw new Error(historyResponse)
  let location: Location = { name: '-', country: '-', region: '-' }
  const weather_data: any = {}
  if (historyResponse.location) {
    location = {
      name: historyResponse.location.name,
      country: historyResponse.location.country,
      region: historyResponse.location.region,
    }
  }
  if (historyResponse.historical) {
    for (const d of dates) {
      const h = historyResponse.historical[d]
      weather_data[d] = h
        ? {
          temperature: h.temperature ?? '-',
          weather_icon: h.weather_icons?.[0] ?? '-',
          weather_description: h.weather_descriptions?.[0] ?? '-',
          wind_speed: h.wind_speed ?? '-',
          pressure: h.pressure ?? '-',
          precip: h.precip ?? '-',
        }
        : null
    }
  }
  return { weather_data, location }
}