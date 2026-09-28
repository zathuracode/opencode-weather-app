# Weather CLI

- This is a Bun + TypeScript console application; the current executable entrypoint is `index.ts`. Run it with `bun index.ts`.
- Use Bun tooling exclusively: `bun install` for dependencies, `bunx <tool>` for one-off tools, and `bun test` for tests. Do not introduce Node/npm/pnpm, Vite, or dotenv; Bun loads `.env` files itself.
- There are no `package.json` scripts or committed tests yet. Type-check with `bunx tsc --noEmit`.
- The intended user flow is Spanish-language weather lookup: resolve a city through Open-Meteo's geocoding endpoint, then request its forecast with the resulting latitude and longitude. The README also defines persisted default/saved-city menu actions and temperature settings.
- Keep generated build outputs (`dist/`, `out/`) and local `.env` files untracked, as configured in `.gitignore`.
