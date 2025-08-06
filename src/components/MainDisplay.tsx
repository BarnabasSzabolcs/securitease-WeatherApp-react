import type { Location, WeatherData } from '../types/weather'
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface WeatherDisplayProps {
  location: Location;
  weather: WeatherData | null;
  isLoading: boolean;
  selectedDate: string;
}

export const MainDisplay: React.FC<WeatherDisplayProps> = ({ location, weather, isLoading, selectedDate }) => {

  function getLocation () {
    return isLoading ? 'Loading...' : (
      [location.name, location.region, location.country]
        .filter(x => x && x != '-')
        .join(', ')
      || 'No location selected')
  }

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 100, scale: 1.1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -25, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="px-6 flex flex-col gap-4"
        >
          <div className="font-semibold self-center text-sm mb-2">
            {getLocation()}
          </div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-col items-center gap-2 pl-6">
              {weather?.weather_icon ?
                <img src={weather.weather_icon} alt="" className="w-12 h-12"/> :
                <div className="w-12 h-12"/>}
              <div className="text-sm">{weather?.weather_description || '-'}</div>
            </div>
            <div className="text-3xl pt-3">{weather ? weather.temperature : '-'}&deg;c</div>
            <table className="text-xs">
              <tbody>
              <tr>
                <td className="pr-2">Wind:</td>
                <td>{weather ? weather.wind_speed : '-'} km/h</td>
              </tr>
              <tr>
                <td className="pr-2">Pressure:</td>
                <td>{weather ? weather.pressure : '-'} hPa</td>
              </tr>
              <tr>
                <td className="pr-2">Precip:</td>
                <td>{weather ? weather.precip : '-'} mm</td>
              </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}