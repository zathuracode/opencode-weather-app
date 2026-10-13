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

export interface WeatherCliDependencies {
  input?: ConsoleInput;
  output?: typeof consoleOutput;
  loadCities?: typeof loadCities;
  loadSettings?: typeof loadSettings;
  renderMenu?: typeof renderMenu;
  getDefaultWeather?: typeof getDefaultWeather;
  listCities?: typeof listCities;
  addCity?: typeof addCity;
  removeCity?: typeof removeCity;
  setDefaultCity?: typeof setDefaultCity;
  toggleTemperatureUnit?: typeof toggleTemperatureUnit;
}

export async function runWeatherCli(dependencies: WeatherCliDependencies = {}): Promise<void> {
  const input = dependencies.input ?? new ConsoleInput();
  const output = dependencies.output ?? consoleOutput;
  const loadCitiesAction = dependencies.loadCities ?? loadCities;
  const loadSettingsAction = dependencies.loadSettings ?? loadSettings;
  const renderMenuAction = dependencies.renderMenu ?? renderMenu;
  const getDefaultWeatherAction = dependencies.getDefaultWeather ?? getDefaultWeather;
  const listCitiesAction = dependencies.listCities ?? listCities;
  const addCityAction = dependencies.addCity ?? addCity;
  const removeCityAction = dependencies.removeCity ?? removeCity;
  const setDefaultCityAction = dependencies.setDefaultCity ?? setDefaultCity;
  const toggleTemperatureUnitAction = dependencies.toggleTemperatureUnit ?? toggleTemperatureUnit;
  output.print(`\n${green("Bienvenido a WEATHER CLI.")}`);

  try {
    let running = true;
    while (running) {
      const [cities, settings] = await Promise.all([loadCitiesAction(), loadSettingsAction()]);
      renderMenuAction(output, cities.length, settings);
      const option = (await input.ask("Selecciona una opción: ")).trim();

      switch (option) {
        case "1":
          await getDefaultWeatherAction(output, cities, settings);
          break;
        case "2":
          await listCitiesAction(output, cities, settings);
          break;
        case "3":
          await addCityAction(input, output, cities, settings);
          break;
        case "4":
          await removeCityAction(input, output, cities, settings);
          break;
        case "5":
          await setDefaultCityAction(input, output, cities, settings);
          break;
        case "8":
          await toggleTemperatureUnitAction(output, settings);
          break;
        case "9":
          running = false;
          output.print(`\n${green("¡Hasta pronto!")}`);
          break;
        default:
          output.print(`\n${red("Opción inválida. Intenta nuevamente.")}`);
      }
    }
  } finally {
    input.close();
  }
}

if (import.meta.main) await runWeatherCli();
