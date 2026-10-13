# Weather CLI

- This is a Bun + TypeScript console application; `src/index.ts` is the functional executable entrypoint and starts the CLI through `runWeatherCli`. Run it with `bun src/index.ts`.
- Use Bun tooling exclusively: `bun install` for dependencies, `bunx <tool>` for one-off tools, and `bun test` for tests. Do not introduce Node/npm/pnpm, Vite, or dotenv; Bun loads `.env` files itself.
- There are no `package.json` scripts. Run the committed test suite with `bun test` and type-check with `bunx tsc --noEmit`.
- The intended user flow is Spanish-language weather lookup: resolve a city through Open-Meteo's geocoding endpoint, then request its forecast with the resulting latitude and longitude. The README also defines persisted default/saved-city menu actions and temperature settings.
- Keep generated build outputs (`dist/`, `out/`) and local `.env` files untracked, as configured in `.gitignore`.
