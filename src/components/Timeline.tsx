/**
 * Timeline component for selecting a date and getting an overview of the upcoming and past weather.
 * Displays a horizontal list of days with weather icons and temperatures.
 * Enables selection of a specific date to view detailed weather information in MainDisplay.
 * Highlights the selected date and today.
 * @module
 */

import { getTodayISO } from '../utils/utils.ts'
import React from 'react'
import type { WeatherData } from '../types/weather.ts'

function getDayOfWeek (dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' })
}

interface TimelineProps {
  weather_data?: Record<string, WeatherData | null>;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ weather_data, selectedDate, onDateSelect }) => {
  const days = weather_data ? Object.keys(weather_data) : []
  if (!weather_data) {
    return <div className="text-center text-gray-500">No weather data available</div>
  }
  const today = getTodayISO()
  return (
    <div className="flex gap-1 mt-4 justify-evenly items-stretch" data-e2e="timeline">
      {days.map(date => {
        const data = weather_data[date]
        const isSelected = date === selectedDate
        const isToday = date === today
        return (
          <button
            key={date}
            className={`flex flex-col flex-grow gap-2 items-center p-2 min-w-[50px] rounded hover:bg-primary ${isSelected ? 'bg-selected' : ''} hover:shadow-lg active:scale-95 transition-all duration-500`}
            data-e2e={isToday ? 'timeline-today' : 'timeline-item'}
            onClick={() => onDateSelect(date)}
          >
              <span className={`text-xs capitalize ${isToday ? 'font-bold' : ''}`}>
                {getDayOfWeek(date)}
              </span>
            {data?.weather_icon && <img src={data?.weather_icon} alt="weather icon" className="w-8 h-8"/>}
            <span className={`${isToday ? 'font-bold' : ''}`} data-e2e="temperature">{data?.temperature ? `${data.temperature}°c`: '-'}</span>
          </button>
        )
      })}
    </div>
  )
}