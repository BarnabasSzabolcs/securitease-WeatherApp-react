import type { Location, WeatherData } from '../types/weather.ts'
import { getDateISO, getTodayISO } from '../utils/utils.ts'

const mockIconSrc = 'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png'

const getMockWeather = (i: number) => {
  return {
    weather_icon: mockIconSrc,
    weather_description: 'Sunny',
    temperature: 25 + i,
    wind_speed: 10 + i,
    pressure: 1012 + i,
    precip: i,
  }
}
const mockResult: {
  location: Location;
} = {
  location: {
    name: 'Pretoria',
    country: 'South Africa',
    region: 'Gauteng',
  },
}

type ApiCallResult = {
  location: Location,
  weather_data: Record<string, WeatherData | null>
} | undefined

export async function getMockWeatherCurrent (query: string): Promise<ApiCallResult> {
  // Mock implementation for current weather
  return new Promise(resolve => {
    setTimeout(() => {
      const location = { ...mockResult.location }
      location.name = query
      resolve({
        location,
        weather_data: { [getTodayISO()]: getMockWeather(3) },
      })
    }, 1000)
  })
}

export async function getMockWeatherHistorical (query: string): Promise<ApiCallResult> {
  return new Promise(resolve => {
    const today = new Date()
    const dates = Array.from({ length: 3 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (3 - i))
      return getDateISO(date)
    })
    const weather_data: Record<string, WeatherData | null> = {}
    dates.forEach((date, i) => {
      weather_data[date] = getMockWeather(i)
    })
    setTimeout(() => {
      const location = { ...mockResult.location }
      location.name = query
      resolve({
        location,
        weather_data,
      })
    }, 1000)
  })
}

export async function getMockWeatherForecast (query: string): Promise<ApiCallResult> {
  return new Promise(resolve => {
    const today = new Date()
    const dates = Array.from({ length: 3 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + (i + 1))
      return getDateISO(date)
    })
    const weather_data: Record<string, WeatherData | null> = {}
    dates.forEach((date, i) => {
      weather_data[date] = getMockWeather(i+4) // Start from 4 to differentiate from historical
    })
    setTimeout(() => {
      const location = { ...mockResult.location }
      location.name = query
      resolve({
        location,
        weather_data,
      })
    }, 1000)
  })
}
