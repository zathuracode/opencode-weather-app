import { mock } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { WeatherSettings } from "../../src/types/Settings.ts";
import type { Output } from "../../src/presentation/output.ts";

export const city: City = { key: "madrid:1:2", name: "Madrid", country: "España", region: null, latitude: 1, longitude: 2 };
export const settings: WeatherSettings = { defaultCityKey: null, temperatureUnit: "celsius" };
export const findCities = mock(async (): Promise<City[]> => [city]);
export const getCurrentWeather = mock(async () => ({ temperature: 20, observedAt: "ahora", unit: "°C" as const }));
export const saveCities = mock(async () => {});
export const saveSettings = mock(async () => {});
export const selectCity = mock(async (): Promise<City | null> => city);

mock.module("../../src/api/geocoding.ts", () => ({ findCities }));
mock.module("../../src/api/weather.ts", () => ({ getCurrentWeather }));
mock.module("../../src/storage/citiesStorage.ts", () => ({ saveCities }));
mock.module("../../src/storage/settingsStorage.ts", () => ({ saveSettings }));
mock.module("../../src/presentation/input.ts", () => ({ ConsoleInput: class ConsoleInput {}, selectCity }));

export const { addCity } = await import("../../src/actions/addCity.ts");
export const { removeCity } = await import("../../src/actions/removeCity.ts");
export const { setDefaultCity } = await import("../../src/actions/setDefaultCity.ts");
export const { toggleTemperatureUnit } = await import("../../src/actions/setTemperatureUnit.ts");
export const { displayWeather, getDefaultWeather } = await import("../../src/actions/getWeather.ts");
export const { listCities } = await import("../../src/actions/listCities.ts");

export function resetMocks(): void {
  findCities.mockReset();
  findCities.mockResolvedValue([city]);
  getCurrentWeather.mockReset();
  getCurrentWeather.mockResolvedValue({ temperature: 20, observedAt: "ahora", unit: "°C" });
  saveCities.mockReset();
  saveSettings.mockReset();
  selectCity.mockReset();
  selectCity.mockResolvedValue(city);
}

export function target(): { messages: string[]; output: Output } {
  const messages: string[] = [];
  return { messages, output: { print: (message) => messages.push(message) } };
}

export function input(answer = "Madrid"): { ask: (message: string) => Promise<string> } {
  return { ask: async () => answer };
}
