import type { City } from "../types/City.ts";
import { loadState, saveState } from "./state.ts";

export async function loadCities(): Promise<City[]> {
  return (await loadState()).cities;
}

export async function saveCities(cities: City[]): Promise<void> {
  const state = await loadState();
  await saveState({ ...state, cities });
}
