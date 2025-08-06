function getDayOfWeek (dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' })
}

export const Timeline = () => {
  const mockIconSrc = 'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png'
  const selectedDate = '2025-08-04'
  const weather: any = {
    weather_data: {
      '2025-08-03': { weather_icon: mockIconSrc, temperature: '10' },
      '2025-08-04': { weather_icon: mockIconSrc, temperature: '11' },
      '2025-08-05': { weather_icon: mockIconSrc, temperature: '12' },
      '2025-08-06': { weather_icon: mockIconSrc, temperature: '13' },
      '2025-08-07': { temperature: '-' },
      '2025-08-08': { temperature: '-' },
      '2025-08-09': { temperature: '-' },
    },
  }
  const days = weather ? Object.keys(weather.weather_data) : []
  if (!weather) {
    return <div className="text-center text-gray-500">No weather data available</div>
  }
  const today = new Date().toDateString()
  return (
    <div className="flex gap-1 mt-4 justify-evenly items-stretch" >
      {days.map(date => {
        const data = weather.weather_data[date]
        const isSelected = date === selectedDate
        const isToday = new Date(date).toDateString() === today
        return (
          <button
            key={date}
            className={`flex flex-col flex-grow gap-2 items-center p-2 min-w-[50px] rounded hover:bg-primary transition-colors duration-500 ${isSelected ? 'bg-selected' : ''}`}
            data-e2e={isToday ? 'timeline-today' : 'timeline-item'}
          >
              <span className={`text-xs capitalize ${isToday ? 'font-bold' : ''}`}>
                {getDayOfWeek(date)}
              </span>
            {data?.weather_icon && <img src={data?.weather_icon} alt="weather icon" className="w-8 h-8"/>}
            <span className={`${isToday ? 'font-bold' : ''}`} >{data?.temperature ?? '-'}&deg;c</span>
          </button>
        )
      })}
    </div>
  )
}