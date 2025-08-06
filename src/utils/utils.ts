export function getDateISO(date?: Date): string {
  const d = date ?? new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

export function isHistoryEndpointEnabled () {
  return getEnv('VITE_USE_HISTORY_ENDPOINT') === 'true'
}