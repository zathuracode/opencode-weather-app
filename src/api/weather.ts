import { asFiniteNumber, asNonEmptyString, getJson, isRecord, WeatherApiError, type Fetcher } from "./client.ts";
import type { City } from "../types/City.ts";
import type { CurrentWeather, TemperatureUnit } from "../types/Weather.ts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export function buildForecastUrl(city: City, unit: TemperatureUnit): URL {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("temperature_unit", unit);
  return url;
}

export async function getCurrentWeather(
  city: City,
  unit: TemperatureUnit,
  fetcher: Fetcher = fetch,
): Promise<CurrentWeather> {
  const payload = await getJson(buildForecastUrl(city, unit), fetcher);
  const current = isRecord(payload) && isRecord(payload.current) ? payload.current : null;
  const units = isRecord(payload) && isRecord(payload.current_units) ? payload.current_units : null;
  const temperature = current ? asFiniteNumber(current.temperature_2m) : null;
  const observedAt = current ? asNonEmptyString(current.time) : null;
  const responseUnit = units ? asNonEmptyString(units.temperature_2m) : null;

  if (temperature === null || observedAt === null) {
    throw new WeatherApiError("La respuesta del pronóstico no contiene la temperatura actual.");
  }

  return { temperature, observedAt, unit: responseUnit === "°F" ? "°F" : "°C" };
}
