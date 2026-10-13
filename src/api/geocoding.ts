import { asFiniteNumber, asNonEmptyString, getJson, isRecord, type Fetcher } from "./client.ts";
import type { City } from "../types/City.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

interface GeocodingResult {
  name?: unknown;
  country?: unknown;
  admin1?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

export function buildGeocodingUrl(cityName: string): URL {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", cityName);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");
  return url;
}

function toCity(result: unknown): City | null {
  if (!isRecord(result)) return null;

  const geocodingResult = result as GeocodingResult;
  const name = asNonEmptyString(geocodingResult.name);
  const latitude = asFiniteNumber(geocodingResult.latitude);
  const longitude = asFiniteNumber(geocodingResult.longitude);
  if (name === null || latitude === null || longitude === null) return null;

  return {
    key: `${name.toLocaleLowerCase("es")}:${latitude}:${longitude}`,
    name,
    country: asNonEmptyString(geocodingResult.country),
    region: asNonEmptyString(geocodingResult.admin1),
    latitude,
    longitude,
  };
}

export async function findCities(cityName: string, fetcher: Fetcher = fetch): Promise<City[]> {
  const payload = await getJson(buildGeocodingUrl(cityName), fetcher);
  const results = isRecord(payload) ? payload.results : undefined;
  return Array.isArray(results) ? results.map(toCity).filter((city): city is City => city !== null) : [];
}
