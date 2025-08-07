/**
 * Live weather service using WeatherStack API
 *
 * See documentation at https://weatherstack.com/documentation
 * @module
 */

import { getApiKey, getDatesAround, getTodayISO } from '../utils/utils.ts'
import type { ApiCallResult, Location, WeatherData } from '../types/weather.ts'

async function safeFetchJson (url: any) {
  const res = await fetch(url)
  if (!res.ok) {
    throw await res.json()
  }
  const resJson = await res.json()
  if (resJson.success === false) {
    throw resJson
  }
  return resJson
}

export async function getLiveWeatherCurrent (query: string): Promise<ApiCallResult> {
  const currUrl = new URL('https://api.weatherstack.com/current')
  currUrl.search = new URLSearchParams({
    access_key: getApiKey(),
    query,
    units: 'm',
  }).toString()
  const response = await safeFetchJson(currUrl)
  let location: Location = { name: '-', country: '-', region: '-' }
  if (!response.location) {
    // React protects against script injection attack, so this is safe:
    throw new Error(`Location "${query}" not available.`)
  }
  location = {
    name: response.location.name,
    country: response.location.country,
    region: response.location.region,
  }
  const c = response.current
  if (!c) {
    throw new Error('No current weather data available.')
  }
  // get the date part of localtime
  const currentDate = response.location.localtime.split(' ')[0]
  const weather_data: Record<string, WeatherData | null> = {
    [currentDate]: {
      temperature: c.temperature ?? '-',
      weather_icon: c.weather_icons?.[0] ?? '-',
      weather_description: c.weather_descriptions?.[0] ?? '-',
      wind_speed: c.wind_speed ?? '-',
      pressure: c.pressure ?? '-',
      precip: c.precip ?? '-',
    },
  }
  return { weather_data, location }
}

export async function getLiveWeatherHistorical (currentDate: string, query: string): Promise<ApiCallResult> {
  const histUrl = new URL('https://api.weatherstack.com/historical')
  const dates = getDatesAround(currentDate, 3).filter(d => d < currentDate)

  histUrl.search = new URLSearchParams({
    access_key: getApiKey(),
    query,
    units: 'm',
    historical_date: dates.join(';'),
  }).toString()
  const response = await safeFetchJson(histUrl)
  let location: Location = { name: '-', country: '-', region: '-' }
  const weather_data: any = {}
  if (response.location) {
    location = {
      name: response.location.name,
      country: response.location.country,
      region: response.location.region,
    }
  }
  if (response.historical) {
    for (const d of dates) {
      const h = response.historical[d]
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

export async function getLiveWeatherForecast (query: string): Promise<ApiCallResult> {
  const url = new URL('https://api.weatherstack.com/forecast')
  const today = getTodayISO()
  const dates = getDatesAround(today, 3).filter(d => d > today)

  url.search = new URLSearchParams({
    access_key: getApiKey(),
    query,
    forecast_days: '3',
    units: 'm',
    hourly: '1',
    interval: '24', // day average
  }).toString()
  const response = await safeFetchJson(url)
  let location: Location = { name: '-', country: '-', region: '-' }
  const weather_data: any = {}
  if (response.location) {
    location = {
      name: response.location.name,
      country: response.location.country,
      region: response.location.region,
    }
  }
  if (response.forecast) {
    for (const d of dates) {
      const h = response.forecast[d]?.hourly?.[0] // get the first hourly data for the day
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