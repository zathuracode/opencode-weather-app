import type { City } from "./City.ts";
import type { TemperatureUnit } from "./Weather.ts";

export interface WeatherSettings {
  defaultCityKey: string | null;
  temperatureUnit: TemperatureUnit;
}

export interface WeatherState extends WeatherSettings {
  version: 1;
  cities: City[];
}
