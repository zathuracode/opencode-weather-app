export type TemperatureUnit = "celsius" | "fahrenheit";

export interface CurrentWeather {
  temperature: number;
  observedAt: string;
  unit: "°C" | "°F";
}
