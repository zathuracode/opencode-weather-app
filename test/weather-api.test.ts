import { expect, test } from "bun:test";
import type { City } from "../src/types.ts";
import {
  buildForecastUrl,
  buildGeocodingUrl,
  findCity,
  getCurrentWeather,
  type Fetcher,
} from "../src/weather-api.ts";

const ottawa: City = {
  key: "ottawa:45.41117:-75.69812",
  name: "Ottawa",
  country: "Canadá",
  region: "Ontario",
  latitude: 45.41117,
  longitude: -75.69812,
};

test("construye la URL de geocodificación en español", () => {
  const url = buildGeocodingUrl("Ciudad de México");

  expect(url.searchParams.get("name")).toBe("Ciudad de México");
  expect(url.searchParams.get("count")).toBe("1");
  expect(url.searchParams.get("language")).toBe("es");
  expect(url.searchParams.get("format")).toBe("json");
});

test("solicita el pronóstico con coordenadas y unidad", () => {
  const url = buildForecastUrl(ottawa, "fahrenheit");

  expect(url.searchParams.get("latitude")).toBe("45.41117");
  expect(url.searchParams.get("longitude")).toBe("-75.69812");
  expect(url.searchParams.get("current")).toBe("temperature_2m");
  expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
});

test("convierte las respuestas de Open-Meteo al modelo de la aplicación", async () => {
  const geocodingFetcher: Fetcher = async () =>
    new Response(
      JSON.stringify({
        results: [{ name: "Ottawa", country: "Canadá", admin1: "Ontario", latitude: 45.41117, longitude: -75.69812 }],
      }),
      { status: 200 },
    );
  const forecastFetcher: Fetcher = async () =>
    new Response(
      JSON.stringify({
        current: { temperature_2m: 21.5, time: "2026-09-28T12:00" },
        current_units: { temperature_2m: "°C" },
      }),
      { status: 200 },
    );

  await expect(findCity("Ottawa", geocodingFetcher)).resolves.toMatchObject(ottawa);
  await expect(getCurrentWeather(ottawa, "celsius", forecastFetcher)).resolves.toEqual({
    temperature: 21.5,
    observedAt: "2026-09-28T12:00",
    unit: "°C",
  });
});
