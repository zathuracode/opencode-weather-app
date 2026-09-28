import { runWeatherCli } from "./src/cli.ts";

if (import.meta.main) {
  await runWeatherCli();
}
