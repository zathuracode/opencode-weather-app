import { saveSettings } from "../storage/settingsStorage.ts";
import type { City } from "../types/City.ts";
import type { WeatherSettings } from "../types/Settings.ts";
import { green, red } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import { ConsoleInput, selectCity } from "../presentation/input.ts";
import type { Output } from "../presentation/output.ts";

export async function setDefaultCity(input: ConsoleInput, output: Output, cities: City[], settings: WeatherSettings): Promise<void> {
  if (cities.length === 0) {
    output.print(`\n${red("No hay ciudades guardadas.")}`);
    return;
  }
  const city = await selectCity(input, output, cities, "Elige la ciudad default (0 para cancelar): ");
  if (!city) return;

  await saveSettings({ ...settings, defaultCityKey: city.key });
  output.print(`\n${green(`Ciudad default establecida: ${formatCity(city)}.`)}`);
}
