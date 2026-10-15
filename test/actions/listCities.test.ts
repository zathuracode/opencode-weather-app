import { beforeEach, expect, test } from "bun:test";
import { city, listCities, resetMocks, settings, target } from "./helpers.test.ts";

beforeEach(resetMocks);

test("lista ciudades guardadas y avisa cuando no hay ninguna", async () => {
  const result = target();
  await listCities(result.output, [], settings);
  await listCities(result.output, [city], settings);
  expect(result.messages).toContain("\nNo hay ciudades guardadas.");
  expect(result.messages).toContain("\nClima de ciudades guardadas:");
  expect(result.messages.join("\n")).toContain("20°C");
});
