import { saveSettings } from "../storage/settingsStorage.ts";
import type { WeatherSettings } from "../types/Settings.ts";
import { green } from "../utils/colors.ts";
import { formatTemperatureUnit } from "../utils/format.ts";
import type { Output } from "../presentation/output.ts";

export async function toggleTemperatureUnit(output: Output, settings: WeatherSettings): Promise<void> {
  const temperatureUnit = settings.temperatureUnit === "celsius" ? "fahrenheit" : "celsius";
  await saveSettings({ ...settings, temperatureUnit });
  output.print(`\n${green(`Unidad de temperatura actual: ${formatTemperatureUnit(temperatureUnit)}.`)}`);
}
