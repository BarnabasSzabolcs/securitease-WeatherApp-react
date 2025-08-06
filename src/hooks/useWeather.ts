import type { Location, WeatherData } from '../types/weather'

export function useWeather (query: string) {
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
  const result: {
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

  return result
}