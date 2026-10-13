import { findCities } from "../api/geocoding.ts";
import { WeatherApiError } from "../api/client.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import type { City } from "../types/City.ts";
import type { WeatherSettings } from "../types/Settings.ts";
import { green, red } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import { ConsoleInput, selectCity } from "../presentation/input.ts";
import type { Output } from "../presentation/output.ts";

function errorMessage(error: unknown): string {
  return error instanceof WeatherApiError ? error.message : "Ocurrió un error inesperado.";
}

export async function addCity(
  input: ConsoleInput,
  output: Output,
  cities: City[],
  settings: WeatherSettings,
): Promise<void> {
  const cityName = (await input.ask("Nombre de la ciudad: ")).trim();
  if (!cityName) {
    output.print(`\n${red("Debes ingresar un nombre de ciudad.")}`);
    return;
  }

  try {
    const matches = await findCities(cityName);
    if (matches.length === 0) {
      output.print(`\n${red("No se encontró esa ciudad.")}`);
      return;
    }
    const city = matches.length === 1 ? (matches[0] ?? null) : await selectCity(input, output, matches, "Elige la ciudad que deseas agregar (0 para cancelar): ");
    if (!city) return;
    if (cities.some((savedCity) => savedCity.key === city.key)) {
      output.print(`\n${red(`${formatCity(city)} ya está guardada.`)}`);
      return;
    }

    await saveCities([...cities, city]);
    if (!settings.defaultCityKey) {
      await saveSettings({ ...settings, defaultCityKey: city.key });
    }
    output.print(`\n${green(`Ciudad agregada: ${formatCity(city)}.`)}`);
    if (!settings.defaultCityKey) output.print(green("Se estableció como ciudad default."));
  } catch (error) {
    output.print(`\n${red(errorMessage(error))}`);
  }
}
