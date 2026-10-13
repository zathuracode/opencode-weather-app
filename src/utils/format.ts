import type { City } from "../types/City.ts";
import type { TemperatureUnit } from "../types/Weather.ts";

export function formatCity(city: City): string {
  return [city.name, city.region, city.country].filter((part): part is string => Boolean(part)).join(", ");
}

export function formatTemperatureUnit(unit: TemperatureUnit): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}
