import { beforeEach, expect, test } from "bun:test";
import { resetMocks, saveSettings, settings, target, toggleTemperatureUnit } from "./helpers.test.ts";

beforeEach(resetMocks);

test("alterna la unidad de temperatura", async () => {
  const result = target();
  await toggleTemperatureUnit(result.output, settings);
  expect(saveSettings).toHaveBeenCalledWith({ ...settings, temperatureUnit: "fahrenheit" });
  expect(result.messages).toContain("\nUnidad de temperatura actual: °F.");
});
