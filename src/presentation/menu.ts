import type { MenuOption } from "../types/MenuOption.ts";
import type { WeatherSettings } from "../types/Settings.ts";
import { cyan } from "../utils/colors.ts";
import { APP_NAME, MENU_BORDER } from "../utils/constants.ts";
import { formatTemperatureUnit } from "../utils/format.ts";
import type { Output } from "./output.ts";

export function buildMenuOptions(cityCount: number, settings: WeatherSettings): MenuOption[] {
  return [
    { value: "1", label: "Clima de ciudad default" },
    { value: "2", label: `Clima de todas las ciudades (${cityCount})` },
    { value: "3", label: "Buscar y agregar ciudad" },
    { value: "4", label: "Eliminar ciudad" },
    { value: "5", label: "Establecer ciudad default" },
    { value: "8", label: `Ajustes (${formatTemperatureUnit(settings.temperatureUnit)})` },
    { value: "9", label: "Salir" },
  ];
}

export function renderMenu(output: Output, cityCount: number, settings: WeatherSettings): void {
  output.print(cyan(`\n${MENU_BORDER}\n         ${APP_NAME}\n${MENU_BORDER}`));
  for (const option of buildMenuOptions(cityCount, settings)) output.print(cyan(`  ${option.value}. ${option.label}`));
  output.print(cyan(MENU_BORDER));
}
