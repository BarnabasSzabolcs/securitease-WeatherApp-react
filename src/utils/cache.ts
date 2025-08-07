/**
 * Cache utility for weather data
 *
 * NOTES:
 *  - Increment VERSION when the structure of the cached data changes, to bust old cached items.
 *  - Old caches do not get deleted, but it is ok because we don't store a lot of data.
 * @module
 */

import { getTodayISO, isMockEnabled } from './utils.ts'

const VERSION = '1'

function getKey (separator: string, today: string, callType: string, query: string): string {
  const mock_or_live = isMockEnabled() ? 'mock' : 'live'
  return [VERSION, today, mock_or_live, callType, encodeURIComponent(query)].join(separator)
}

function getCacheUrl (today: string, callType: string, query: string) {
  const key = getKey('/', today, callType, query)
  return `https://weather.local/${key}`
}

function getLocalStorageKey (today: string, callType: string, query: string) {
  const CACHE_PREFIX = 'weather:'
  const key = getKey(':', today, callType, query)
  return `${CACHE_PREFIX}:${key}`
}

async function cacheGet (callType: string, query: string): Promise<any | null> {
  const today = getTodayISO()
  if ('caches' in window) {
    const cache = await caches.open('weather')
    const res = await cache.match(getCacheUrl(today, callType, query))
    if (res) return res.json()
  }
  const raw = localStorage.getItem(getLocalStorageKey(today, callType, query))
  return raw ? JSON.parse(raw) : null
}

async function cacheSet (callType: string, query: string, data: any) {
  const today = getTodayISO()
  if ('caches' in window) {
    const cache = await caches.open('weather')
    await cache.put(getCacheUrl(today, callType, query), new Response(JSON.stringify(data)))
  } else {
    localStorage.setItem(getLocalStorageKey(today, callType, query), JSON.stringify(data))
  }
}

/**
 * Wrapper for cached API calls, used to fetch weather data.
 * It stores and retrieves data from cache based on the call type and query.
 * The cached data is stored using Cache API or LocalStorage API as fallback.
 *
 * Retrieves data from cache if available, otherwise fetches it using the provided function,
 * stores it in cache, and returns the result.
 *
 * @param callType - The type of weather data call (e.g., 'current', 'historical', 'forecast').
 * @param query - The location query string.
 * @param fetchFn - An async function that fetches the data if not cached.
 * @returns A promise resolving to the requested data.
 */
export async function cachedCall (
  callType: string,
  query: string,
  fetchFn: () => Promise<any>,
): Promise<any> {
  const cached = await cacheGet(callType, query)
  if (cached) return cached
  const data = await fetchFn()
  await cacheSet(callType, query, data)
  return data
}