import { beforeEach, expect, mock, test } from "bun:test";
import type { City } from "../src/types/City.ts";
import type { WeatherSettings } from "../src/types/Settings.ts";
import type { Output } from "../src/presentation/output.ts";
import { WeatherApiError } from "../src/api/client.ts";

const city: City = { key: "madrid:1:2", name: "Madrid", country: "España", region: null, latitude: 1, longitude: 2 };
const settings: WeatherSettings = { defaultCityKey: null, temperatureUnit: "celsius" };
const findCities = mock(async (): Promise<City[]> => [city]);
const getCurrentWeather = mock(async () => ({ temperature: 20, observedAt: "ahora", unit: "°C" as const }));
const saveCities = mock(async () => {});
const saveSettings = mock(async () => {});
const selectCity = mock(async (): Promise<City | null> => city);

mock.module("../src/api/geocoding.ts", () => ({ findCities }));
mock.module("../src/api/weather.ts", () => ({ getCurrentWeather }));
mock.module("../src/storage/citiesStorage.ts", () => ({ saveCities }));
mock.module("../src/storage/settingsStorage.ts", () => ({ saveSettings }));
mock.module("../src/presentation/input.ts", () => ({
  ConsoleInput: class ConsoleInput {},
  selectCity,
}));

const { addCity } = await import("../src/actions/addCity.ts");
const { removeCity } = await import("../src/actions/removeCity.ts");
const { setDefaultCity } = await import("../src/actions/setDefaultCity.ts");
const { toggleTemperatureUnit } = await import("../src/actions/setTemperatureUnit.ts");
const { displayWeather, getDefaultWeather } = await import("../src/actions/getWeather.ts");
const { listCities } = await import("../src/actions/listCities.ts");

function target(): { messages: string[]; output: Output } {
  const messages: string[] = [];
  return { messages, output: { print: (message) => messages.push(message) } };
}

function input(answer = "Madrid"): { ask: (message: string) => Promise<string> } {
  return { ask: async () => answer };
}

beforeEach(() => {
  findCities.mockReset();
  findCities.mockResolvedValue([city]);
  getCurrentWeather.mockReset();
  getCurrentWeather.mockResolvedValue({ temperature: 20, observedAt: "ahora", unit: "°C" });
  saveCities.mockReset();
  saveSettings.mockReset();
  selectCity.mockReset();
  selectCity.mockResolvedValue(city);
});

test("agrega una ciudad, la establece por defecto y maneja entradas no válidas", async () => {
  const result = target();
  await addCity(input() as never, result.output, [], settings);
  expect(saveCities).toHaveBeenCalledWith([city]);
  expect(saveSettings).toHaveBeenCalledWith({ ...settings, defaultCityKey: city.key });
  expect(result.messages).toContain("\nCiudad agregada: Madrid, España.");

  await addCity(input(" ") as never, result.output, [], settings);
  await addCity(input() as never, result.output, [city], settings);
  findCities.mockResolvedValueOnce([]);
  await addCity(input() as never, result.output, [], settings);
  expect(result.messages).toEqual(expect.arrayContaining([
    "\nDebes ingresar un nombre de ciudad.",
    "\nMadrid, España ya está guardada.",
    "\nNo se encontró esa ciudad.",
  ]));
});

test("permite cancelar la adición y muestra los errores del servicio", async () => {
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

test("elimina y selecciona ciudad predeterminada", async () => {
  const result = target();
  await removeCity(input() as never, result.output, [], settings);
  await removeCity(input() as never, result.output, [city], { ...settings, defaultCityKey: city.key });
  expect(saveCities).toHaveBeenCalledWith([]);
  expect(saveSettings).toHaveBeenCalledWith({ ...settings, defaultCityKey: null });
  await setDefaultCity(input() as never, result.output, [city], settings);
  expect(saveSettings).toHaveBeenCalledWith({ ...settings, defaultCityKey: city.key });
  selectCity.mockResolvedValueOnce(null);
  await removeCity(input() as never, result.output, [city], settings);
  await setDefaultCity(input() as never, result.output, [], settings);
  expect(result.messages).toEqual(expect.arrayContaining(["\nCiudad eliminada: Madrid, España.", "\nNo hay ciudades guardadas."]));
});

test("alterna unidad y muestra el clima, sus errores y listas vacías", async () => {
  const result = target();
  await toggleTemperatureUnit(result.output, settings);
  expect(saveSettings).toHaveBeenCalledWith({ ...settings, temperatureUnit: "fahrenheit" });
  await displayWeather(result.output, city, settings);
  getCurrentWeather.mockRejectedValueOnce(new WeatherApiError("no disponible"));
  await displayWeather(result.output, city, settings);
  await listCities(result.output, [], settings);
  await listCities(result.output, [city], settings);
  await getDefaultWeather(result.output, [], settings);
  await getDefaultWeather(result.output, [city], { ...settings, defaultCityKey: city.key });
  expect(result.messages.join("\n")).toContain("20°C");
  expect(result.messages.join("\n")).toContain("no disponible");
  expect(result.messages).toContain("\nNo hay ciudades guardadas.");
  expect(result.messages.join("\n")).toContain("No hay una ciudad predeterminada");
});
