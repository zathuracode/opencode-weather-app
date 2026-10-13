import type { WeatherSettings } from "../types/Settings.ts";
import { loadState, saveState } from "./state.ts";

export async function loadSettings(): Promise<WeatherSettings> {
  const { defaultCityKey, temperatureUnit } = await loadState();
  return { defaultCityKey, temperatureUnit };
}

export async function saveSettings(settings: WeatherSettings): Promise<void> {
  const state = await loadState();
  await saveState({ ...state, ...settings });
}
