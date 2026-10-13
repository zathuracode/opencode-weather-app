import { expect, test } from "bun:test";
import { join } from "node:path";
import { rm } from "node:fs/promises";
import { createEmptyState, loadState, saveState } from "../src/storage/state.ts";

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
