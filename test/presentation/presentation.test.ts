import { expect, spyOn, test } from "bun:test";
import { stdout } from "node:process";
import { ConsoleInput, selectCity } from "../../src/presentation/input.ts";
import { buildMenuOptions, renderMenu } from "../../src/presentation/menu.ts";
import { consoleOutput, type Output } from "../../src/presentation/output.ts";
import type { City } from "../../src/types/City.ts";
import { formatCity, formatTemperatureUnit } from "../../src/utils/format.ts";

const city: City = { key: "madrid", name: "Madrid", region: null, country: "España", latitude: 1, longitude: 2 };
const settings = { defaultCityKey: null, temperatureUnit: "celsius" as const };

function output(): { messages: string[]; value: Output } {
  const messages: string[] = [];
  return { messages, value: { print: (message) => messages.push(message) } };
}

test("formatea ciudades, unidades y opciones de menú", () => {
  expect(formatCity(city)).toBe("Madrid, España");
  expect(formatTemperatureUnit("fahrenheit")).toBe("°F");
  expect(buildMenuOptions(2, settings)).toContainEqual({ value: "2", label: "Clima de todas las ciudades (2)" });
  const target = output();
  renderMenu(target.value, 2, settings);
  expect(target.messages).toHaveLength(9);
  expect(target.messages[1]).toContain("1. Clima de ciudad default");
});

test("selecciona una ciudad, permite cancelar y avisa selecciones inválidas", async () => {
  const target = output();
  const input = { ask: async () => "2" } as unknown as ConsoleInput;
  await expect(selectCity(input, target.value, [city, { ...city, key: "lima", name: "Lima" }], "Elige: ")).resolves.toMatchObject({ name: "Lima" });
  await expect(selectCity({ ask: async () => "0" } as unknown as ConsoleInput, target.value, [city], "Elige: ")).resolves.toBeNull();
  await expect(selectCity({ ask: async () => "x" } as unknown as ConsoleInput, target.value, [city], "Elige: ")).resolves.toBeNull();
  expect(target.messages).toContain("\nSelección inválida.");
});

test("escribe la salida de consola y cierra la entrada", async () => {
  const write = spyOn(stdout, "write").mockImplementation(() => true);
  consoleOutput.print("mensaje");
  expect(write).toHaveBeenCalledWith("mensaje\n");
  write.mockRestore();

  const realInput = new ConsoleInput();
  realInput.close();
  const input = new ConsoleInput({
    question: async (message: string) => `${message}respuesta`,
    close: () => {},
  } as never);
  await expect(input.ask("Pregunta: ")).resolves.toBe("  Pregunta: respuesta");
  input.close();
});
