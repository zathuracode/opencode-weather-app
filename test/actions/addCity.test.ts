import { beforeEach, expect, test } from "bun:test";
import { WeatherApiError } from "../../src/api/client.ts";
import { addCity, city, findCities, input, resetMocks, saveCities, saveSettings, selectCity, settings, target } from "./helpers.test.ts";

beforeEach(resetMocks);

test("agrega una ciudad y maneja entradas no válidas", async () => {
  const result = target();
  await addCity(input() as never, result.output, [], settings);
  expect(saveCities).toHaveBeenCalledWith([city]);
  expect(saveSettings).toHaveBeenCalledWith({ ...settings, defaultCityKey: city.key });
  await addCity(input(" ") as never, result.output, [], settings);
  await addCity(input() as never, result.output, [city], settings);
  findCities.mockResolvedValueOnce([]);
  await addCity(input() as never, result.output, [], settings);
  expect(result.messages).toEqual(expect.arrayContaining(["\nCiudad agregada: Madrid, España.", "\nDebes ingresar un nombre de ciudad.", "\nMadrid, España ya está guardada.", "\nNo se encontró esa ciudad."]));
});

test("permite cancelar y muestra errores del servicio", async () => {
  const result = target();
  findCities.mockResolvedValueOnce([city, { ...city, key: "lima", name: "Lima" }]);
  selectCity.mockResolvedValueOnce(null);
  await addCity(input() as never, result.output, [], settings);
  findCities.mockRejectedValueOnce(new WeatherApiError("sin conexión"));
  await addCity(input() as never, result.output, [], settings);
  findCities.mockRejectedValueOnce(new Error("error"));
  await addCity(input() as never, result.output, [], settings);
  expect(result.messages).toEqual(expect.arrayContaining(["\nsin conexión", "\nOcurrió un error inesperado."]));
});
