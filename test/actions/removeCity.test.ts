import { beforeEach, expect, test } from "bun:test";
import { city, input, removeCity, resetMocks, saveCities, saveSettings, selectCity, settings, target } from "./helpers.test.ts";

beforeEach(resetMocks);

test("elimina una ciudad, limpia el valor predeterminado y permite cancelar", async () => {
  const result = target();
  await removeCity(input() as never, result.output, [], settings);
  await removeCity(input() as never, result.output, [city], { ...settings, defaultCityKey: city.key });
  expect(saveCities).toHaveBeenCalledWith([]);
  expect(saveSettings).toHaveBeenCalledWith({ ...settings, defaultCityKey: null });
  selectCity.mockResolvedValueOnce(null);
  await removeCity(input() as never, result.output, [city], settings);
  expect(result.messages).toEqual(expect.arrayContaining(["\nNo hay ciudades guardadas.", "\nCiudad eliminada: Madrid, España."]));
});
