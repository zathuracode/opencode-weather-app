import { beforeEach, expect, test } from "bun:test";
import { city, input, resetMocks, saveSettings, setDefaultCity, settings, target } from "./helpers.test.ts";

beforeEach(resetMocks);

test("establece una ciudad predeterminada y maneja listas vacías", async () => {
  const result = target();
  await setDefaultCity(input() as never, result.output, [city], settings);
  expect(saveSettings).toHaveBeenCalledWith({ ...settings, defaultCityKey: city.key });
  await setDefaultCity(input() as never, result.output, [], settings);
  expect(result.messages).toEqual(expect.arrayContaining(["\nCiudad default establecida: Madrid, España.", "\nNo hay ciudades guardadas."]));
});
