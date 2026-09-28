import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { City, TemperatureUnit, WeatherState } from "./types.ts";

const FILE_NAME = "weather-cli.json";

export function createEmptyState(): WeatherState {
  return {
    version: 1,
    cities: [],
    defaultCityKey: null,
    temperatureUnit: "celsius",
  };
}

export function getStateFilePath(): string {
  const configDirectory = process.env.XDG_CONFIG_HOME ?? join(process.env.HOME ?? ".", ".config");
  return join(configDirectory, "weather-cli", FILE_NAME);
}

function isCity(value: unknown): value is City {
  if (typeof value !== "object" || value === null) return false;
  const city = value as Partial<City>;
  return (
    typeof city.key === "string" &&
    typeof city.name === "string" &&
    (typeof city.country === "string" || city.country === null) &&
    (typeof city.region === "string" || city.region === null) &&
    typeof city.latitude === "number" &&
    Number.isFinite(city.latitude) &&
    typeof city.longitude === "number" &&
    Number.isFinite(city.longitude)
  );
}

function isState(value: unknown): value is WeatherState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Partial<WeatherState>;
  const validUnit: TemperatureUnit[] = ["celsius", "fahrenheit"];
  return (
    state.version === 1 &&
    Array.isArray(state.cities) &&
    state.cities.every(isCity) &&
    (typeof state.defaultCityKey === "string" || state.defaultCityKey === null) &&
    validUnit.includes(state.temperatureUnit as TemperatureUnit)
  );
}

export async function loadState(filePath = getStateFilePath()): Promise<WeatherState> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) return createEmptyState();

  try {
    const parsed: unknown = await file.json();
    if (isState(parsed)) return parsed;
  } catch {
    // A corrupt state file must not prevent the CLI from starting.
  }

  return createEmptyState();
}

export async function saveState(state: WeatherState, filePath = getStateFilePath()): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await Bun.write(filePath, `${JSON.stringify(state, null, 2)}\n`);
}
