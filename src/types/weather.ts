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