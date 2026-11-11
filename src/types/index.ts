/**
 * Client-side view of the resources catalog (the sectioned aggregate).
 *
 * The wire DTOs live in `@sudobility/types` — the one source shared with the
 * backend (`resources_service`, `sudobility_api`). They are re-exported here so
 * app code and the UI packages import them from the client they already depend
 * on. The `/data` aggregate each app serves is a list of
 * {@link ResourceSectionWithResources}. Only the client-construction config is
 * defined locally.
 */
import type { NetworkClient } from "@sudobility/types";

export type {
  Resource,
  ResourceSection,
  ResourceSectionWithResources,
  ResourceDataResponse,
} from "@sudobility/types";

/** Construction config for {@link ResourcesApiClient}. */
export interface ResourcesApiClientConfig {
  /** The host app's own API origin **including** the /api/v1 prefix,
   *  e.g. "https://api.music.app/api/v1". */
  baseUrl: string;
  /** Platform HTTP client, injected from `@sudobility/types`. */
  networkClient: NetworkClient;
  /** Path of the app's aggregate read endpoint (default "/resources/data"). */
  path?: string;
  /** Optional bearer token provider, attached as `Authorization` when present. */
  getAuthToken?: () => Promise<string | null> | string | null;
}
