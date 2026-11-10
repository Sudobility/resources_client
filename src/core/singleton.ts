/**
 * Module-level singleton holding the configured ResourcesService.
 *
 * Mirrors consumables_client: no React Context. The host calls
 * `initializeResources({ apiClient })` once at startup; the `useResources`
 * hook reads the singleton. A host that prefers explicit wiring can skip the
 * singleton and pass a client straight to the connected page component.
 */
import { ResourcesService } from "./service.js";
import type { ResourcesApiClient } from "../network/ResourcesApiClient.js";

let service: ResourcesService | null = null;

export interface InitializeResourcesConfig {
  apiClient: ResourcesApiClient;
}

export function initializeResources(config: InitializeResourcesConfig): void {
  service = new ResourcesService(config.apiClient);
}

/** The configured service, or null if `initializeResources` was never called. */
export function getResourcesService(): ResourcesService | null {
  return service;
}

/** Test/HMR hook: forget the configured service. */
export function resetResources(): void {
  service = null;
}

/** Drop cached catalog data so the next read refetches. */
export function refreshResources(locale?: string): void {
  service?.refresh(locale);
}
