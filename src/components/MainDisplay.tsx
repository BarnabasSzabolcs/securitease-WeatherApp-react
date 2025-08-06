export const MainDisplay = () => {

  const location = { name: 'Mock city', region: '-', country: 'Mockland' }
  const mockIconSrc = 'https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png'
  const data = {
    weather_icon: mockIconSrc,
    weather_description: 'Sunny',
    temperature: 25,
    wind_speed: 10,
    pressure: 1012,
    precip: 0,
  }

  function getLocation () {
    return (
      [location.name, location.region, location.country]
        .filter(x => x && x != '-')
        .join(', ')
    ) || 'No location selected'
  }

  return (
    <div className="overflow-hidden px-6 flex flex-col gap-4">
      <div className="font-semibold self-center text-sm mb-2">
        {getLocation()}
      </div>
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col items-center gap-2 pl-6">
          {data?.weather_icon ?
            <img src={data.weather_icon} alt="" className="w-12 h-12"/> :
            <div className="w-12 h-12"/>}
          <div className="text-sm">{data?.weather_description || '-'}</div>
        </div>
        <div className="text-3xl pt-3">{data ? data.temperature : '-'}&deg;c</div>
        <table className="text-xs">
          <tbody>
          <tr>
            <td className="pr-2">Wind:</td>
            <td>{data ? data.wind_speed : '-'} km/h</td>
          </tr>
          <tr>
            <td className="pr-2">Pressure:</td>
            <td>{data ? data.pressure : '-'} hPa</td>
          </tr>
          <tr>
            <td className="pr-2">Precip:</td>
            <td>{data ? data.precip : '-'} mm</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}