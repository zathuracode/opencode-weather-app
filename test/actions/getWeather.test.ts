import { beforeEach, expect, test } from "bun:test";
import { WeatherApiError } from "../../src/api/client.ts";
import { city, displayWeather, getCurrentWeather, getDefaultWeather, resetMocks, settings, target } from "./helpers.test.ts";

beforeEach(resetMocks);

test("muestra el clima, errores y ausencia de ciudad predeterminada", async () => {
  const result = target();
  await displayWeather(result.output, city, settings);
  getCurrentWeather.mockRejectedValueOnce(new WeatherApiError("no disponible"));
  await displayWeather(result.output, city, settings);
  await getDefaultWeather(result.output, [], settings);
  await getDefaultWeather(result.output, [city], { ...settings, defaultCityKey: city.key });
  expect(result.messages.join("\n")).toContain("20°C");
  expect(result.messages.join("\n")).toContain("no disponible");
  expect(result.messages.join("\n")).toContain("No hay una ciudad predeterminada");
});
