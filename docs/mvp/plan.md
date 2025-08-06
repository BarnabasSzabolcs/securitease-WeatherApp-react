# Development Plan for Weather App

Chosen styling: Tailwind CSS. 
(It'll be probably easier to make it look more like the mockup,
although the backgrounds of the images from weatherstack don't match the mockup's background color and icons,
so perfect match is not achievable.)

## Excluded for now:
1. Location autocomplete - (it is available but not a requirement) http://api.weatherstack.com/autocomplete


## Component structure

Each component retrieves data from the weather service,
that either connects to the WeatherStack API or to the mock API,
driven by the environment variable `VITE_USE_MOCK_API`.

### Main Display
Detailed weather data for 
 - a specific location
 - for the current selected date (see Timeline, default: today)

Row1: location name, region, country
Row2:
 - left: weather icon, weather description
 - center: temperature
 - right: wind speed, pressure, precipitation as a table.
Row3:
 - Timeline

If no data: everything is set to '-',

### Timeline
A row of weather items for a specific location
 - today-3, ... today ... today+3
NOTE: WeatherStack API only support current weather data for free,
historical is on a paid plan, with forecast on an even more expensive plan.
So, we'll show '-' for dates that are not available for the plan of the API key.

Each weather item must show, vertically:
 - day of the week for the date
 - weather icon
 - temperature

Clicking on a weather item highlights it,
and updates the main display to show the weather for that date.

If no data for a date: everything is set to '-',

### Location Selector
A way to select a location (search by name)
 - input field (query)
 - search button

## Services

### WeatherService
A service that retrieves weather data from the WeatherStack API.

Format:
```
{
    'parameters': {
        'today': '2025-08-05', // can be used to select today
        'query': 'New York' // the location query, e.g. 'New York', 'Berlin', etc.
    },
    'location': {  // the location WeatherStack API identifies based on the query
        'name': 'New York',
        'country': 'United States of America',
        'region': 'New York',
    },
    'weather_data':{
        '2025-08-05': {  // or null if no data is available for this date
            "temperature": 13,
            "weather_icon": "https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png"
            "weather_description": "Sunny",
            "wind_speed": 0,
            "pressure": 1010,
            "precip": 0,
        },
        ...
    }
}
```
The service shall try to read cached data
with key 'version/date/[mock or live]/endpoint/query'.

The cached data shall be read from Cache Storage API (global availability: 95%, even without service workers), 
Fallback: localStorage, if Cache Storage API is not available.

The WeatherService shall be mockable.

## WeatherStack API discovery

Errors come in the form of:
```
{ // error object
    "success": false,
    "error": {
        "code": 101,
        "type": "unauthorized",
        "info": "User did not supply an access key / invalid access key"    
    }
}
```

The "free" plan of the WeatherStack API only allows access to current weather data.
This is in contradiction to the requirements.
**Solution:** we implement the Historical Weather endpoint regardless,
and if the call fails, we fall back to http://api.weatherstack.com/current

We default all historical and forecast values to '-', 
and display a warning on the UI that forecast and historical data requires a paid plan,
with a link to the WeatherStack pricing page, maybe an input field to enter an API key
that is then saved to localStore.

http://api.weatherstack.com/current
    ? access_key = YOUR_ACCESS_KEY
    & query = New%20York
    & units = m  // m for metric, f for imperial. For now, we only support metric, as per the mockup.

=> Example response:
```
{
    "location": {    // location object
        "name": "New York",
        "country": "United States of America",
        "region": "New York",
        ...
    },
    "current": {    // weather data object
        // "observation_time": "12:14 PM",
        "temperature": 13,
        "weather_icons": [
            "https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png"
        ],
        "weather_descriptions": [
            "Sunny"
        ],
        ...
        "wind_speed": 0,
        "pressure": 1010,
        "precip": 0,
    }
}
```

http://api.weatherstack.com/historical
    ? access_key = YOUR_ACCESS_KEY
    & query = New York
    & units = m
    & historical_date = 2015-01-21;2015-01-22;2015-01-23

language: is available but we don't implement it as it wasn't mentioned in the requirements.

=> Example response:
```
{
    "location":  // location object, see above
    "historical": {
        "2015-01-21": // weather data object, see above
        ...
    }
}
```
We'll get   Code 603 - historical_queries_not_supported_on_plan (see error object above)

http://api.weatherstack.com/forecast
    ? access_key = YOUR_ACCESS_KEY
    & query = New York
    & units = m
    & forecast_days = 3  // as per the requirements
    & hourly = 1  // to get wind, precipitation, and pressure data
    & interval = 24  // as per the requirements, this is average data for each day

=> Example response:
```
{
    ...
    "forecast": {
        "2023-10-01": {  // forecast object
            ...
            "hourly": [{
                "temperature": 18,
                "wind_speed": 28,
                "precip": 0,
                "pressure": 1008,
            }]
        },
        ...
    }
}
```

We'll get  Code 609 - forecast_days_not_supported_on_plan (see error object above)