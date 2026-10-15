import { expect, test } from "bun:test";
import type { City } from "../../src/types/City.ts";
import {
  buildGeocodingUrl,
  findCities,
} from "../../src/api/geocoding.ts";
import { buildForecastUrl, getCurrentWeather } from "../../src/api/weather.ts";
import type { Fetcher } from "../../src/api/client.ts";

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
  expect(url.searchParams.get("count")).toBe("5");
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

test("convierte varias coincidencias de Open-Meteo al modelo de la aplicación", async () => {
  const geocodingFetcher: Fetcher = async () =>
    new Response(
      JSON.stringify({
        results: [
          { name: "Ottawa", country: "Canadá", admin1: "Ontario", latitude: 45.41117, longitude: -75.69812 },
          { name: "Ottawa", country: "Estados Unidos", admin1: "Illinois", latitude: 41.3456, longitude: -88.8426 },
        ],
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

  await expect(findCities("Ottawa", geocodingFetcher)).resolves.toEqual([
    ottawa,
    {
      key: "ottawa:41.3456:-88.8426",
      name: "Ottawa",
      country: "Estados Unidos",
      region: "Illinois",
      latitude: 41.3456,
      longitude: -88.8426,
    },
  ]);
  await expect(getCurrentWeather(ottawa, "celsius", forecastFetcher)).resolves.toEqual({
    temperature: 21.5,
    observedAt: "2026-09-28T12:00",
    unit: "°C",
  });
});

test("descarta coincidencias malformadas y devuelve una lista vacía si no hay ciudades válidas", async () => {
  const fetcher: Fetcher = async () =>
    new Response(
      JSON.stringify({
        results: [{ name: "Inválida", latitude: "45", longitude: -75 }, { country: "Canadá" }],
      }),
      { status: 200 },
    );

  await expect(findCities("Inválida", fetcher)).resolves.toEqual([]);
});

test("devuelve una lista vacía cuando Open-Meteo no encuentra coincidencias", async () => {
  const fetcher: Fetcher = async () => new Response(JSON.stringify({}), { status: 200 });

  await expect(findCities("Sin resultados", fetcher)).resolves.toEqual([]);
});

test("rechaza pronósticos incompletos y conserva la unidad Fahrenheit", async () => {
  const invalidFetcher: Fetcher = async () => new Response(JSON.stringify({ current: {} }), { status: 200 });
  const fahrenheitFetcher: Fetcher = async () => new Response(JSON.stringify({
    current: { temperature_2m: 70, time: "2026-09-28T12:00" },
    current_units: { temperature_2m: "°F" },
  }));

  await expect(getCurrentWeather(ottawa, "celsius", invalidFetcher)).rejects.toThrow(
    "La respuesta del pronóstico no contiene la temperatura actual.",
  );
  await expect(getCurrentWeather(ottawa, "fahrenheit", fahrenheitFetcher)).resolves.toEqual({
    temperature: 70,
    observedAt: "2026-09-28T12:00",
    unit: "°F",
  });
});
