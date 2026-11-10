/**
 * Client-side view of the resources catalog.
 *
 * The shape is the JSON contract the app APIs serve (which in turn comes from
 * the central `sudobility_api`). It is redeclared here — not imported from
 * `@sudobility/resources_service` — so the frontend never depends on a backend
 * package (Drizzle, node fetch, …). Same decoupling split as consumables.
 */

/** A single catalog tile, as served by an app's `GET /resources`. */
export interface Resource {
  id: string;
  app: string;
  locale: string;
  title: string;
  text: string;
  iconUrl: string;
  url: string;
  sortOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceListResponse {
  resources: Resource[];
}

/** Construction config for {@link ResourcesApiClient}. */
export interface ResourcesApiClientConfig {
  /** The host app's own API origin, e.g. "https://api.music.app". */
  baseUrl: string;
  /** Platform HTTP client, injected from `@sudobility/types`. */
  networkClient: import("@sudobility/types").NetworkClient;
  /** Path of the app's resources read endpoint (default "/resources"). */
  path?: string;
  /** Optional bearer token provider, attached as `Authorization` when present. */
  getAuthToken?: () => Promise<string | null> | string | null;
}
