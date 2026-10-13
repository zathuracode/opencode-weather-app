import { expect, test } from "bun:test";
import { runWeatherCli } from "../src/index.ts";
import type { City } from "../src/types/City.ts";

const cities: City[] = [{ key: "madrid", name: "Madrid", country: "España", region: null, latitude: 1, longitude: 2 }];
const settings = { defaultCityKey: "madrid", temperatureUnit: "celsius" as const };

test("dirige todas las opciones del menú y cierra la entrada al salir", async () => {
  const answers = ["1", "2", "3", "4", "5", "8", "x", "9"];
  const calls: string[] = [];
  const messages: string[] = [];
  let closed = false;
  await runWeatherCli({
    input: { ask: async () => answers.shift() ?? "9", close: () => { closed = true; } } as never,
    output: { print: (message: string) => messages.push(message) },
    loadCities: async () => cities,
    loadSettings: async () => settings,
    renderMenu: () => { calls.push("menu"); },
    getDefaultWeather: async () => { calls.push("default"); },
    listCities: async () => { calls.push("list"); },
    addCity: async () => { calls.push("add"); },
    removeCity: async () => { calls.push("remove"); },
    setDefaultCity: async () => { calls.push("set-default"); },
    toggleTemperatureUnit: async () => { calls.push("toggle"); },
  });
  expect(calls).toEqual(expect.arrayContaining(["default", "list", "add", "remove", "set-default", "toggle"]));
  expect(calls.filter((call) => call === "menu")).toHaveLength(8);
  expect(messages).toEqual(expect.arrayContaining([
    "\nBienvenido a WEATHER CLI.",
    "\nOpción inválida. Intenta nuevamente.",
    "\n¡Hasta pronto!",
  ]));
  expect(closed).toBe(true);
});

test("cierra la entrada incluso cuando falla una dependencia", async () => {
  let closed = false;
  await expect(runWeatherCli({
    input: { ask: async () => "9", close: () => { closed = true; } } as never,
    loadCities: async () => { throw new Error("falló"); },
  })).rejects.toThrow("falló");
  expect(closed).toBe(true);
});
