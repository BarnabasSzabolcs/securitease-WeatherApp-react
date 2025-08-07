export function unique (arr: any[]): any[] {
  return [...new Set(arr)]
}

export function getDateISO (date?: Date): string {
  // date.toLocaleDateString gives YYYY-MM-DD in the local timezone.
  return (date || new Date()).toLocaleDateString('en-CA') // en-CA: YYYY-MM-DD format
}

export function getTodayISO () {
  return getDateISO()
}

export function getDatesAround (date: string, range = 3) {
  const base = new Date(date)
  return Array.from({ length: range * 2 + 1 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() - range + i)
    return getDateISO(d)
  })
}

function getEnv (key: string) {
  // Vite exposes env as import.meta.env
  // @ts-ignore
  return typeof import.meta !== 'undefined' ? import.meta.env[key] : undefined
}

export function getApiKey () {
  return localStorage.getItem('WEATHERSTACK_API_KEY') || getEnv('VITE_WEATHERSTACK_API_KEY')
}

export function isMockEnabled () {
  return getEnv('VITE_USE_MOCK_API') === 'true'
}

export function arePaidEndpointsEnabled () {
  return getEnv('VITE_USE_PAID_ENDPOINTS') === 'true'
}