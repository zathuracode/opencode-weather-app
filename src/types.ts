export type TemperatureUnit = "celsius" | "fahrenheit";

export interface City {
  key: string;
  name: string;
  country: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
}

export interface WeatherState {
  version: 1;
  cities: City[];
  defaultCityKey: string | null;
  temperatureUnit: TemperatureUnit;
}

export interface CurrentWeather {
  temperature: number;
  observedAt: string;
  unit: "°C" | "°F";
}
