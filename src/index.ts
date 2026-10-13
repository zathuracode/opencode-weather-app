import { addCity } from "./actions/addCity.ts";
import { getDefaultWeather } from "./actions/getWeather.ts";
import { listCities } from "./actions/listCities.ts";
import { removeCity } from "./actions/removeCity.ts";
import { setDefaultCity } from "./actions/setDefaultCity.ts";
import { toggleTemperatureUnit } from "./actions/setTemperatureUnit.ts";
import { ConsoleInput } from "./presentation/input.ts";
import { renderMenu } from "./presentation/menu.ts";
import { consoleOutput } from "./presentation/output.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings } from "./storage/settingsStorage.ts";
import { green, red } from "./utils/colors.ts";

export async function runWeatherCli(): Promise<void> {
  const input = new ConsoleInput();
  consoleOutput.print(`\n${green("Bienvenido a WEATHER CLI.")}`);

  try {
    let running = true;
    while (running) {
      const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
      renderMenu(consoleOutput, cities.length, settings);
      const option = (await input.ask("Selecciona una opción: ")).trim();

      switch (option) {
        case "1":
          await getDefaultWeather(consoleOutput, cities, settings);
          break;
        case "2":
          await listCities(consoleOutput, cities, settings);
          break;
        case "3":
          await addCity(input, consoleOutput, cities, settings);
          break;
        case "4":
          await removeCity(input, consoleOutput, cities, settings);
          break;
        case "5":
          await setDefaultCity(input, consoleOutput, cities, settings);
          break;
        case "8":
          await toggleTemperatureUnit(consoleOutput, settings);
          break;
        case "9":
          running = false;
          consoleOutput.print(`\n${green("¡Hasta pronto!")}`);
          break;
        default:
          consoleOutput.print(`\n${red("Opción inválida. Intenta nuevamente.")}`);
      }
    }
  } finally {
    input.close();
  }
}

if (import.meta.main) await runWeatherCli();
