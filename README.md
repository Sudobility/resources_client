# @sudobility/resources_client

Cross-platform (web + React Native) client for the Sudobility **resources
catalog** — the language-specific list of helper links each app shows as tiles.

Business logic only: no UI, no platform SDK. It talks to the **host app's own**
`/resources` endpoint (which forwards to the central `sudobility_api`), over a
`NetworkClient` injected from `@sudobility/types`. That single seam is what lets
it run unchanged on a browser and on React Native.

## Install

```bash
bun add @sudobility/resources_client
```

## Usage

```ts
import {
  ResourcesApiClient,
  initializeResources,
  useResources,
  shortenDomain,
} from "@sudobility/resources_client";

// At app startup, with your platform's NetworkClient. baseUrl includes /api/v1:
const apiClient = new ResourcesApiClient({
  baseUrl: "https://api.myapp.com/api/v1", // the app's OWN api
  networkClient,
  // optional: getAuthToken: () => session.token,
});
initializeResources({ apiClient });

// In a component (one network call fetches the whole tree):
const { sections, isLoading, error, refetch } = useResources(locale);
sections.forEach((s) => {
  console.log(s.title);
  s.resources.forEach((r) => console.log(" ", r.title, shortenDomain(r.url)));
});
```

The UI lives in `@sudobility/resources_pages` (web) and
`@sudobility/resources_pages_rn` (React Native), which consume this client.

## Exports

- `ResourcesApiClient` — the HTTP client (read-only `data(lang)` → sections).
- `initializeResources` / `getResourcesService` / `refreshResources` / `resetResources` — the module singleton.
- `useResources(lang)` — `{ sections, isLoading, error, refetch }`.
- `shortenDomain(url)` — the small per-tile domain label.
- Types: `Resource`, `ResourceSection`, `ResourceDataResponse`, `ResourcesApiClientConfig`.

## Scripts

- `bun run verify` — typecheck + lint + unit tests + build (before pushing).
- `bun run test:unit` — Vitest. Do **not** run `bun test` (Bun's own runner).
- `bun run build` — `tsc -p tsconfig.build.json` + `fix-esm-imports.mjs`.
