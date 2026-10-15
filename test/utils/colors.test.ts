import { expect, test } from "bun:test";
import { colorize } from "../../src/utils/colors.ts";

test("aplica el código ANSI y lo reinicia cuando el color está habilitado", () => {
  expect(colorize("texto", "36", true)).toBe("\u001B[36mtexto\u001B[0m");
});

test("conserva el texto sin códigos ANSI cuando el color está deshabilitado", () => {
  expect(colorize("texto", "33", false)).toBe("texto");
});
