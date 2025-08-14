import type { ApiCallResult, Location, WeatherData } from '../types/weather'

import isEqual from 'lodash-es/isEqual'
import { type Dispatch, useEffect, useReducer, useRef } from 'react'
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

// Define state and actions for the reducer
interface WeatherState {
  location: Location
  weather_data: Record<string, WeatherData | null>
  isLoading: boolean
  error: string | null
}

type WeatherAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: { weather_data: Record<string, WeatherData | null>; location: Location } }
  | { type: 'ADD_WEATHER_DATA'; payload: Record<string, WeatherData | null> }
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: WeatherState = {
  location: { name: '', country: '', region: '' },
  weather_data: {},
  isLoading: false,
  error: null,
}

function weatherReducer (state: WeatherState, action: WeatherAction): WeatherState {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state, isLoading: true, error: null,
        // location: { name: '-', country: '-', region: '-' },
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
        weather_data: action.payload.weather_data,
        location: action.payload.location,
      }
    case 'ADD_WEATHER_DATA':
      return { ...state, weather_data: { ...state.weather_data, ...action.payload } }
    case 'SET_LOCATION':
      if (isEqual(state.location, action.payload)) {
        return state
      }
      return { ...state, location: action.payload }
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

// Helper to safely dispatch only if mounted and not aborted

function createSafeDispatch (dispatch: Dispatch<WeatherAction>, abortController: AbortController, isMountedRef: {
  current: boolean
}) {
  return (action: WeatherAction) => {
    if (isMountedRef.current && !abortController.signal.aborted) {
      dispatch(action)
    }
  }
}

async function fetchAndMergeWeather (
  fetchFn: () => Promise<ApiCallResult>,
  safeDispatch: (action: WeatherAction) => void,
  mergeLocation = false,
) {
  try {
    const res = await fetchFn()
    safeDispatch({ type: 'ADD_WEATHER_DATA', payload: res.weather_data })
    if (mergeLocation && res.location) {
      safeDispatch({ type: 'SET_LOCATION', payload: res.location })
    }
  } catch (e: any) {
    safeDispatch({ type: 'FETCH_FAILURE', payload: extractErrorMessage(e, 'Failed to fetch weather data') })
  }
}

async function fetchWeather (
  query: string,
  safeDispatch: (action: WeatherAction) => void,
) {
  safeDispatch({ type: 'FETCH_INIT' })
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
    safeDispatch({ type: 'FETCH_SUCCESS', payload: { weather_data: weatherData, location: res.location } })
  } catch (e: any) {
    safeDispatch({ type: 'FETCH_FAILURE', payload: extractErrorMessage(e, 'Failed to fetch current weather') })
    return
  }

  if (arePaidEndpointsEnabled()) {
    await Promise.all([
      fetchAndMergeWeather(() => getWeatherHistorical(today, query), safeDispatch, true),
      fetchAndMergeWeather(() => getWeatherForecast(query), safeDispatch, true),
    ])
  }
  safeDispatch({ type: 'SET_LOADING', payload: false })
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
  const [state, dispatch] = useReducer(weatherReducer, initialState)
  const isMountedRef = useRef(true)

  useEffect(() => {
    if (!query) return

    const abortController = new AbortController()
    isMountedRef.current = true
    const safeDispatch = createSafeDispatch(dispatch, abortController, isMountedRef)

    fetchWeather(query, safeDispatch).catch(console.error)

    return () => {
      isMountedRef.current = false
      abortController.abort()
    }
  }, [query])

  return state
}