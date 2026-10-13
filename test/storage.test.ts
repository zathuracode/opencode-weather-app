import { expect, test } from "bun:test";
import { join } from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createEmptyState, getStateFilePath, loadState, saveState } from "../src/storage/state.ts";
import { loadCities, saveCities } from "../src/storage/citiesStorage.ts";
import { loadSettings, saveSettings } from "../src/storage/settingsStorage.ts";

test("persiste y recupera las preferencias", async () => {
  const directory = join(import.meta.dir, ".tmp-storage-test");
  const filePath = join(directory, "weather-cli.json");
  const state = createEmptyState();
  state.cities.push({
    key: "madrid:40.4168:-3.7038",
    name: "Madrid",
    country: "España",
    region: "Comunidad de Madrid",
    latitude: 40.4168,
    longitude: -3.7038,
  });
  state.defaultCityKey = state.cities[0]?.key ?? null;
  state.temperatureUnit = "fahrenheit";

  try {
    await saveState(state, filePath);
    await expect(loadState(filePath)).resolves.toEqual(state);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("restablece el estado cuando el archivo no existe, está corrupto o es inválido", async () => {
  const directory = join(import.meta.dir, ".tmp-invalid-state");
  const filePath = join(directory, "weather-cli.json");
  const empty = createEmptyState();
  try {
    await expect(loadState(filePath)).resolves.toEqual(empty);
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, "{");
    await expect(loadState(filePath)).resolves.toEqual(empty);
    await writeFile(filePath, JSON.stringify({ ...empty, version: 2 }));
    await expect(loadState(filePath)).resolves.toEqual(empty);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("conserva ciudades y ajustes en los adaptadores de almacenamiento", async () => {
  const previous = process.env.XDG_CONFIG_HOME;
  const directory = join(import.meta.dir, ".tmp-storage-adapters");
  process.env.XDG_CONFIG_HOME = directory;
  try {
    expect(getStateFilePath()).toBe(join(directory, "weather-cli", "weather-cli.json"));
    const city = { key: "lima", name: "Lima", country: "Perú", region: null, latitude: 1, longitude: 2 };
    await saveCities([city]);
    await saveSettings({ defaultCityKey: city.key, temperatureUnit: "fahrenheit" });
    await expect(loadCities()).resolves.toEqual([city]);
    await expect(loadSettings()).resolves.toEqual({ defaultCityKey: city.key, temperatureUnit: "fahrenheit" });
  } finally {
    if (previous === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = previous;
    await rm(directory, { recursive: true, force: true });
  }
});
