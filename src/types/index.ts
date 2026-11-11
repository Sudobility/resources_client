/**
 * Client-side view of the resources catalog (the sectioned aggregate).
 *
 * The shape is the JSON the app APIs serve at `GET /api/v1/resources/data`
 * (forwarded from the central sudobility_api's `/resources/{app}/{lang}/data`):
 * a list of sections, each with its enabled resources. Redeclared here — not
 * imported from the backend `resources_service` — so the frontend never depends
 * on a backend package.
 */

/** A tile under a section. */
export interface Resource {
  id: string;
  title: string;
  text: string;
  iconUrl: string;
  url: string;
  sortOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A section with its resources, as served by `/data`. */
export interface ResourceSection {
  id: string;
  title: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  resources: Resource[];
}

export interface ResourceDataResponse {
  sections: ResourceSection[];
}

/** Construction config for {@link ResourcesApiClient}. */
export interface ResourcesApiClientConfig {
  /** The host app's own API origin **including** the /api/v1 prefix,
   *  e.g. "https://api.music.app/api/v1". */
  baseUrl: string;
  /** Platform HTTP client, injected from `@sudobility/types`. */
  networkClient: import("@sudobility/types").NetworkClient;
  /** Path of the app's aggregate read endpoint (default "/resources/data"). */
  path?: string;
  /** Optional bearer token provider, attached as `Authorization` when present. */
  getAuthToken?: () => Promise<string | null> | string | null;
}
