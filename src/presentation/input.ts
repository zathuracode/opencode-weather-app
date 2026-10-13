import { stdin, stdout } from "node:process";
import { createInterface, type Interface } from "node:readline/promises";
import type { City } from "../types/City.ts";
import { cyan, red } from "../utils/colors.ts";
import { formatCity } from "../utils/format.ts";
import type { Output } from "./output.ts";

export class ConsoleInput {
  private readonly reader: Interface = createInterface({ input: stdin, output: stdout });

  ask(message: string): Promise<string> {
    return this.reader.question(cyan(`  ${message}`));
  }

  close(): void {
    this.reader.close();
  }
}

export async function selectCity(
  input: ConsoleInput,
  output: Output,
  cities: City[],
  prompt: string,
): Promise<City | null> {
  output.print("");
  cities.forEach((city, index) => output.print(`  ${index + 1}. ${formatCity(city)}`));
  const selected = Number((await input.ask(prompt)).trim());
  if (selected === 0) return null;
  if (!Number.isInteger(selected) || selected < 1 || selected > cities.length) {
    output.print(`\n${red("Selección inválida.")}`);
    return null;
  }
  return cities[selected - 1] ?? null;
}
