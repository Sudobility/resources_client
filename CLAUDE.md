# resources_client (`@sudobility/resources_client`)

Cross-platform business-logic client for the resources catalog. Pure TS,
ESM-only, no UI, no platform SDK. Built with `tsc` + `fix-esm-imports.mjs`;
Vitest for tests; Bun as package manager.

## The one seam

The library makes **no direct HTTP calls**. It depends on a `NetworkClient`
injected from `@sudobility/types` (a peer dep). The host supplies the
platform-appropriate implementation. This is the whole reason it works on web
and RN from one build — never add a `fetch`/`axios`/`react-native` import.

## Shape

- `ResourcesApiClient` (`network/`) — read-only `list(locale?)` against the
  **app's own** `/resources` endpoint (not the central API; no API key). Reads
  `response.data.resources`, tolerant of a missing field.
- `ResourcesService` (`core/`) — read-through cache keyed by locale, in-flight
  dedup, `refresh()`.
- Module singleton (`core/singleton.ts`) — `initializeResources({ apiClient })`,
  no React Context (mirrors consumables_client). `useResources` reads it.
- `useResources(locale?)` (`hooks/`) — only imports `react`, so it runs on
  either renderer.
- `shortenDomain(url)` (`utils/`) — pure helper for the per-tile domain label.

## Conventions

- **DTOs come from `@sudobility/types`** (the one source shared with the
  backend) and are re-exported from `types/index.ts`; the frontend never depends
  on a backend package. `/data` returns `ResourceSectionWithResources[]`. Only
  `ResourcesApiClientConfig` is defined locally.
- The catalog is **public per (app, locale)**; there is no user/auth state. An
  optional `getAuthToken` exists only for apps that gate their own API.
- camelCase on the wire; the central API already maps from its snake_case
  columns, so no mapping is needed here.

## Build & test

- `bun run verify` before every push.
- Tests in `tests/*.test.ts` under Vitest; mock the `NetworkClient` with
  `vi.fn()`. Never run `bun test`.
- CI delegates to `johnqh/workflows` with `publish-target: github`.
