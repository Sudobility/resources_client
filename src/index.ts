/**
 * @sudobility/resources_client
 *
 * Cross-platform (web + React Native) client for the Sudobility resources
 * catalog — the sectioned aggregate each app's page reads in one call. Business
 * logic only; no UI, no platform SDK. The one seam is the injected
 * `@sudobility/types` NetworkClient.
 */
export { ResourcesApiClient } from "./network/ResourcesApiClient.js";
export type {
  Resource,
  ResourceSection,
  ResourceSectionWithResources,
  ResourceDataResponse,
  ResourcesApiClientConfig,
} from "./types/index.js";
export {
  ResourcesService,
  initializeResources,
  getResourcesService,
  resetResources,
  refreshResources,
  type InitializeResourcesConfig,
} from "./core/index.js";
export { useResources, type UseResourcesResult } from "./hooks/index.js";
export { shortenDomain } from "./utils/domain.js";
