export type Fetcher = (url: URL, init?: RequestInit) => Promise<Response>;

export class WeatherApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherApiError";
  }
}

export async function getJson(url: URL, fetcher: Fetcher): Promise<unknown> {
  let response: Response;

  try {
    response = await fetcher(url);
  } catch {
    throw new WeatherApiError("No fue posible conectar con Open-Meteo.");
  }

  if (!response.ok) {
    throw new WeatherApiError(`Open-Meteo respondió con el estado ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new WeatherApiError("Open-Meteo devolvió una respuesta inválida.");
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
