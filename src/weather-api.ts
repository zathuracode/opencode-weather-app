import type { City, CurrentWeather, TemperatureUnit } from "./types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export type Fetcher = (url: URL, init?: RequestInit) => Promise<Response>;

interface GeocodingResult {
  name?: unknown;
  country?: unknown;
  admin1?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

interface GeocodingResponse {
  results?: unknown;
}

interface ForecastResponse {
  current?: unknown;
  current_units?: unknown;
}

export class WeatherApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherApiError";
  }
}

export function buildGeocodingUrl(cityName: string): URL {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", cityName);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");
  return url;
}

export function buildForecastUrl(city: City, unit: TemperatureUnit): URL {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("temperature_unit", unit);
  return url;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function cityKey(name: string, latitude: number, longitude: number): string {
  return `${name.toLocaleLowerCase("es")}:${latitude}:${longitude}`;
}

async function getJson(url: URL, fetcher: Fetcher): Promise<unknown> {
  let response: Response;

  try {
    response = await fetcher(url);
  } catch {
    throw new WeatherApiError("No fue posible conectar con Open-Meteo.");
  }

  if (!response.ok) {
    throw new WeatherApiError(`Open-Meteo respondió con el estado ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new WeatherApiError("Open-Meteo devolvió una respuesta inválida.");
  }
}

function toCity(result: unknown): City | null {
  if (!isRecord(result)) return null;

  const geocodingResult = result as GeocodingResult;
  const name = asNonEmptyString(geocodingResult.name);
  const latitude = asFiniteNumber(geocodingResult.latitude);
  const longitude = asFiniteNumber(geocodingResult.longitude);

  if (name === null || latitude === null || longitude === null) return null;

  return {
    key: cityKey(name, latitude, longitude),
    name,
    country: asNonEmptyString(geocodingResult.country),
    region: asNonEmptyString(geocodingResult.admin1),
    latitude,
    longitude,
  };
}

export async function findCities(cityName: string, fetcher: Fetcher = fetch): Promise<City[]> {
  const payload = await getJson(buildGeocodingUrl(cityName), fetcher);
  const results = isRecord(payload) ? (payload as GeocodingResponse).results : undefined;

  if (!Array.isArray(results)) return [];

  return results.map(toCity).filter((city): city is City => city !== null);
}

export async function getCurrentWeather(
  city: City,
  unit: TemperatureUnit,
  fetcher: Fetcher = fetch,
): Promise<CurrentWeather> {
  const payload = await getJson(buildForecastUrl(city, unit), fetcher);
  const response = isRecord(payload) ? (payload as ForecastResponse) : null;
  const current = response && isRecord(response.current) ? response.current : null;
  const units = response && isRecord(response.current_units) ? response.current_units : null;
  const temperature = current ? asFiniteNumber(current.temperature_2m) : null;
  const observedAt = current ? asNonEmptyString(current.time) : null;
  const responseUnit = units ? asNonEmptyString(units.temperature_2m) : null;

  if (temperature === null || observedAt === null) {
    throw new WeatherApiError("La respuesta del pronóstico no contiene la temperatura actual.");
  }

  return {
    temperature,
    observedAt,
    unit: responseUnit === "°F" ? "°F" : "°C",
  };
}
