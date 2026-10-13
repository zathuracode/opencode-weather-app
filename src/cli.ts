import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { cyan, green, red, yellow } from "./colors.ts";
import { loadState, saveState } from "./storage.ts";
import type { City, TemperatureUnit, WeatherState } from "./types.ts";
import { findCities, getCurrentWeather, WeatherApiError } from "./weather-api.ts";

const BORDER = "════════════════════════════════════════";

function cityLabel(city: City): string {
  return [city.name, city.region, city.country].filter((part): part is string => Boolean(part)).join(", ");
}

function unitLabel(unit: TemperatureUnit): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}

function findDefaultCity(state: WeatherState): City | undefined {
  return state.cities.find((city) => city.key === state.defaultCityKey);
}

export class WeatherCli {
  private readonly reader = createInterface({ input: stdin, output: stdout });
  private state: WeatherState = {
    version: 1,
    cities: [],
    defaultCityKey: null,
    temperatureUnit: "celsius",
  };

  async run(): Promise<void> {
    this.state = await loadState();
    this.print(`\n${green("Bienvenido a WEATHER CLI.")}`);

    try {
      let running = true;
      while (running) {
        this.printMenu();
        const option = (await this.ask("Selecciona una opción: ")).trim();

        switch (option) {
          case "1":
            await this.showDefaultWeather();
            break;
          case "2":
            await this.showAllWeather();
            break;
          case "3":
            await this.addCity();
            break;
          case "4":
            await this.removeCity();
            break;
          case "5":
            await this.setDefaultCity();
            break;
          case "8":
            await this.toggleUnit();
            break;
          case "9":
            running = false;
            this.print(`\n${green("¡Hasta pronto!")}`);
            break;
          default:
            this.print(`\n${red("Opción inválida. Intenta nuevamente.")}`);
        }
      }
    } finally {
      this.reader.close();
    }
  }

  private print(message: string): void {
    stdout.write(`${message}\n`);
  }

  private ask(message: string): Promise<string> {
    return this.reader.question(cyan(`  ${message}`));
  }

  private printMenu(): void {
    this.print(cyan(`\n${BORDER}\n         WEATHER CLI\n${BORDER}`));
    this.print(cyan("  1. Clima de ciudad default"));
    this.print(cyan(`  2. Clima de todas las ciudades (${this.state.cities.length})`));
    this.print(cyan("  3. Buscar y agregar ciudad"));
    this.print(cyan("  4. Eliminar ciudad"));
    this.print(cyan("  5. Establecer ciudad default"));
    this.print(cyan(`  8. Ajustes (${unitLabel(this.state.temperatureUnit)})`));
    this.print(cyan("  9. Salir"));
    this.print(cyan(BORDER));
  }

  private async showDefaultWeather(): Promise<void> {
    const city = findDefaultCity(this.state);
    if (!city) {
      this.print(`\n${red("No hay una ciudad predeterminada. Agrega una ciudad y establécela como default.")}`);
      return;
    }
    await this.printWeather(city);
  }

  private async showAllWeather(): Promise<void> {
    if (this.state.cities.length === 0) {
      this.print(`\n${red("No hay ciudades guardadas.")}`);
      return;
    }

    this.print("\nClima de ciudades guardadas:");
    for (const city of this.state.cities) {
      await this.printWeather(city);
    }
  }

  private async printWeather(city: City): Promise<void> {
    try {
      const weather = await getCurrentWeather(city, this.state.temperatureUnit);
      this.print(
        `${green(`  ${cityLabel(city)}: `)}${yellow(`${weather.temperature}${weather.unit}`)}${green(` (actualizado: ${weather.observedAt})`)}`,
      );
    } catch (error) {
      this.print(red(`  ${cityLabel(city)}: ${this.errorMessage(error)}`));
    }
  }

  private async addCity(): Promise<void> {
    const cityName = (await this.ask("Nombre de la ciudad: ")).trim();
    if (!cityName) {
      this.print(`\n${red("Debes ingresar un nombre de ciudad.")}`);
      return;
    }

    try {
      const cities = await findCities(cityName);
      if (cities.length === 0) {
        this.print(`\n${red("No se encontró esa ciudad.")}`);
        return;
      }

      const city = await this.selectSearchResult(cities);
      if (!city) return;

      if (this.state.cities.some((savedCity) => savedCity.key === city.key)) {
        this.print(`\n${red(`${cityLabel(city)} ya está guardada.`)}`);
        return;
      }

      this.state.cities.push(city);
      if (!this.state.defaultCityKey) this.state.defaultCityKey = city.key;
      await saveState(this.state);
      this.print(`\n${green(`Ciudad agregada: ${cityLabel(city)}.`)}`);
      if (this.state.defaultCityKey === city.key) this.print(green("Se estableció como ciudad default."));
    } catch (error) {
      this.print(`\n${red(this.errorMessage(error))}`);
    }
  }

  private async removeCity(): Promise<void> {
    const city = await this.selectCity("Elige la ciudad que deseas eliminar (0 para cancelar): ");
    if (!city) return;

    this.state.cities = this.state.cities.filter((savedCity) => savedCity.key !== city.key);
    if (this.state.defaultCityKey === city.key) this.state.defaultCityKey = null;
    await saveState(this.state);
    this.print(`\n${green(`Ciudad eliminada: ${cityLabel(city)}.`)}`);
  }

  private async setDefaultCity(): Promise<void> {
    const city = await this.selectCity("Elige la ciudad default (0 para cancelar): ");
    if (!city) return;

    this.state.defaultCityKey = city.key;
    await saveState(this.state);
    this.print(`\n${green(`Ciudad default establecida: ${cityLabel(city)}.`)}`);
  }

  private async toggleUnit(): Promise<void> {
    this.state.temperatureUnit = this.state.temperatureUnit === "celsius" ? "fahrenheit" : "celsius";
    await saveState(this.state);
    this.print(`\n${green(`Unidad de temperatura actual: ${unitLabel(this.state.temperatureUnit)}.`)}`);
  }

  private async selectCity(prompt: string): Promise<City | null> {
    if (this.state.cities.length === 0) {
      this.print(`\n${red("No hay ciudades guardadas.")}`);
      return null;
    }

    return this.selectFromCities(this.state.cities, prompt);
  }

  private async selectSearchResult(cities: City[]): Promise<City | null> {
    if (cities.length === 1) return cities[0] ?? null;

    this.print("\nSe encontraron varias ciudades:");
    return this.selectFromCities(cities, "Elige la ciudad que deseas agregar (0 para cancelar): ");
  }

  private async selectFromCities(cities: City[], prompt: string): Promise<City | null> {
    this.print("");
    cities.forEach((city, index) => this.print(`  ${index + 1}. ${cityLabel(city)}`));
    const selected = Number((await this.ask(prompt)).trim());
    if (selected === 0) return null;
    if (!Number.isInteger(selected) || selected < 1 || selected > cities.length) {
      this.print(`\n${red("Selección inválida.")}`);
      return null;
    }
    return cities[selected - 1] ?? null;
  }

  private errorMessage(error: unknown): string {
    return error instanceof WeatherApiError ? error.message : "Ocurrió un error inesperado.";
  }
}

export async function runWeatherCli(): Promise<void> {
  await new WeatherCli().run();
}
