import { expect, test } from "bun:test";
import { asFiniteNumber, asNonEmptyString, getJson, isRecord, WeatherApiError } from "../../src/api/client.ts";

const url = new URL("https://example.test");

test("valida valores recibidos de la API", () => {
  expect(isRecord({})).toBe(true);
  expect(isRecord(null)).toBe(false);
  expect(asNonEmptyString("  Madrid ")).toBe("Madrid");
  expect(asNonEmptyString(" ")).toBeNull();
  expect(asNonEmptyString(1)).toBeNull();
  expect(asFiniteNumber(12.5)).toBe(12.5);
  expect(asFiniteNumber(Infinity)).toBeNull();
  expect(asFiniteNumber("12")).toBeNull();
});

test("getJson traduce los errores de conexión, HTTP y JSON", async () => {
  await expect(getJson(url, async () => { throw new Error("offline"); })).rejects.toEqual(
    expect.objectContaining({ name: "WeatherApiError", message: "No fue posible conectar con Open-Meteo." }),
  );
  await expect(getJson(url, async () => new Response("error", { status: 503 }))).rejects.toEqual(
    expect.objectContaining({ message: "Open-Meteo respondió con el estado 503." }),
  );
  await expect(getJson(url, async () => new Response("no-json"))).rejects.toEqual(
    expect.objectContaining({ message: "Open-Meteo devolvió una respuesta inválida." }),
  );
  await expect(getJson(url, async () => new Response(JSON.stringify({ ok: true })))).resolves.toEqual({ ok: true });
  expect(new WeatherApiError("falló")).toBeInstanceOf(Error);
});
