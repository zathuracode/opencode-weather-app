import { saveCities } from "../storage/citiesStorage.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import type { City } from "../types/City.ts";
import type { WeatherSettings } from "../types/Settings.ts";
import { green, red } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import { ConsoleInput, selectCity } from "../presentation/input.ts";
import type { Output } from "../presentation/output.ts";

export async function removeCity(input: ConsoleInput, output: Output, cities: City[], settings: WeatherSettings): Promise<void> {
  if (cities.length === 0) {
    output.print(`\n${red("No hay ciudades guardadas.")}`);
    return;
  }
  const city = await selectCity(input, output, cities, "Elige la ciudad que deseas eliminar (0 para cancelar): ");
  if (!city) return;

  await saveCities(cities.filter((savedCity) => savedCity.key !== city.key));
  if (settings.defaultCityKey === city.key) await saveSettings({ ...settings, defaultCityKey: null });
  output.print(`\n${green(`Ciudad eliminada: ${formatCity(city)}.`)}`);
}
