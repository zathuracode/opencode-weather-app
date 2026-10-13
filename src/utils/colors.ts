import { stdout } from "node:process";

type ColorCode = "31" | "32" | "33" | "36";

const RESET = "\u001B[0m";

function colorsEnabled(): boolean {
  return Boolean(stdout.isTTY) && !process.env.NO_COLOR;
}

export function colorize(text: string, code: ColorCode, enabled = colorsEnabled()): string {
  return enabled ? `\u001B[${code}m${text}${RESET}` : text;
}

export const cyan = (text: string): string => colorize(text, "36");
export const yellow = (text: string): string => colorize(text, "33");
export const green = (text: string): string => colorize(text, "32");
export const red = (text: string): string => colorize(text, "31");
