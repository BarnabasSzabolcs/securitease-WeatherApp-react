import type { Location, WeatherData } from '../types/weather.ts'
import { getTodayISO } from '../utils/utils.ts'

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
const query = 'Pretoria'
const mockResult: {
  location: Location;
  weather_data: Record<string, WeatherData | null>
} = {
  location: {
    name: query,
    country: 'South Africa',
    region: 'Gauteng',
  },
  weather_data: {
    '2025-08-03': getMockWeather(0),
    '2025-08-04': getMockWeather(1),
    '2025-08-05': getMockWeather(2),
    '2025-08-06': getMockWeather(3),
    '2025-08-07': null,
    '2025-08-08': null,
    '2025-08-09': null,
  },
}

type ApiCallResult = {
  location: Location,
  weather_data: Record<string, WeatherData | null>
} | undefined

export async function getMockCurrentWeather (query: string): Promise<ApiCallResult> {
  // Mock implementation for current weather
  return new Promise(resolve => {
    setTimeout(() => {
      const location = {...mockResult.location}
      location.name = query
      resolve({
        location,
        weather_data: { [getTodayISO()]: getMockWeather(3) },
      })
    }, 1000)
  })
}

export async function getMockHistoricalWeather (query: string): Promise<ApiCallResult> {
  // Mock implementation for historical weather
  return new Promise(resolve => {
    setTimeout(() => {
      const location = {...mockResult.location}
      location.name = query
      resolve({
        location,
        weather_data: mockResult.weather_data,
      })
    }, 1000)
  })
}

