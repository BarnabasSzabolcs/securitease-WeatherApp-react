export type Location = {
  name: string;
  country: string;
  region: string;
};
export type WeatherData = {
  temperature: number;
  weather_icon: string;
  weather_description: string;
  wind_speed: number;
  pressure: number;
  precip: number;
};

/**
 * ApiCallResult stores the parsed result of an API call to a weather service
 * (the part that is important for the app).
 * It contains the location information and a record of weather data for specific dates.
 * The weather data is keyed by date, and it can be null if no data is available for that date.
 */
export type ApiCallResult = {
  location: Location;
  weather_data: Record<string, WeatherData | null>;
};