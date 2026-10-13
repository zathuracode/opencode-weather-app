import { getCurrentWeather } from "../api/weather.ts";
import { WeatherApiError } from "../api/client.ts";
import type { City } from "../types/City.ts";
import type { WeatherSettings } from "../types/Settings.ts";
import { green, red, yellow } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import type { Output } from "../presentation/output.ts";

function errorMessage(error: unknown): string {
  return error instanceof WeatherApiError ? error.message : "Ocurrió un error inesperado.";
}

export async function displayWeather(output: Output, city: City, settings: WeatherSettings): Promise<void> {
  try {
    const weather = await getCurrentWeather(city, settings.temperatureUnit);
    output.print(
      `${green(`  ${formatCity(city)}: `)}${yellow(`${weather.temperature}${weather.unit}`)}${green(` (actualizado: ${weather.observedAt})`)}`,
    );
  } catch (error) {
    output.print(red(`  ${formatCity(city)}: ${errorMessage(error)}`));
  }
}

export async function getDefaultWeather(output: Output, cities: City[], settings: WeatherSettings): Promise<void> {
  const city = cities.find((savedCity) => savedCity.key === settings.defaultCityKey);
  if (!city) {
    output.print(`\n${red("No hay una ciudad predeterminada. Agrega una ciudad y establécela como default.")}`);
    return;
  }
  await displayWeather(output, city, settings);
}
