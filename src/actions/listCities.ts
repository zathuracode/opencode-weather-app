import type { City } from "../types/City.ts";
import type { WeatherSettings } from "../types/Settings.ts";
import { red } from "../utils/colors.ts";
import type { Output } from "../presentation/output.ts";
import { displayWeather } from "./getWeather.ts";

export async function listCities(output: Output, cities: City[], settings: WeatherSettings): Promise<void> {
  if (cities.length === 0) {
    output.print(`\n${red("No hay ciudades guardadas.")}`);
    return;
  }

  output.print("\nClima de ciudades guardadas:");
  for (const city of cities) await displayWeather(output, city, settings);
}
