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

export type ApiCallResult = {
  location: Location;
  weather_data: Record<string, WeatherData | null>;
};