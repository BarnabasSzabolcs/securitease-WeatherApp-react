import { LocationSelector } from './components/LocationSelector'
import { MainDisplay } from './components/MainDisplay'
import { Timeline } from './components/Timeline'
import './App.css'
import type { WeatherData } from './types/weather'
import React, { useEffect } from 'react'
import { useWeather } from './hooks/useWeather'
import { getTodayISO } from './utils/utils.ts'

function App () {
  const [query, setQuery] = React.useState<string>('Pretoria')

  const [selectedDate, setSelectedDate] = React.useState<string>(getTodayISO())
  const [selectedWeather, setSelectedWeather] = React.useState<WeatherData | null>(null)

  const { location, weather_data, isLoading, error } = useWeather(query)

  useEffect(() => {
    setSelectedDate(getTodayISO())
  }, [query])

  useEffect(() => {
    setSelectedWeather(weather_data[selectedDate] || null)
  }, [weather_data])

  function onDateSelect (date: string) {
    setSelectedDate(date)
    setSelectedWeather(weather_data[date])
  }

  return (
    <div className="m-2">
      <div className="max-w-lg mx-auto mt-8 bg-dark border-3 rounded-1xl text-text p-3">
        <LocationSelector onSubmit={setQuery}/>
      </div>
      <div className="max-w-lg mx-auto mt-2 bg-dark border-3 rounded-1xl text-text p-3">
        <MainDisplay location={location} weather={selectedWeather} isLoading={isLoading} selectedDate={selectedDate}/>
        <Timeline weather_data={weather_data} selectedDate={selectedDate} onDateSelect={onDateSelect}/>
      </div>
      {error && (
        <div className="max-w-lg mx-auto mt-2 bg-red-800 border-3 rounded-1xl text-text p-3">
          <div className="text-center text-text">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

export default App