/**
 * HTTP client for the resources catalog, over an injected `NetworkClient`.
 *
 * It talks to the *host app's own* API (which forwards to the central
 * sudobility_api) — never to the central API directly — so there is no API key
 * here. Reads only; the catalog is curated through the admin MCP, not the app.
 */
import type { NetworkClient } from "@sudobility/types";
import type {
  Resource,
  ResourceListResponse,
  ResourcesApiClientConfig,
} from "../types/index.js";

export class ResourcesApiClient {
  private readonly baseUrl: string;
  private readonly networkClient: NetworkClient;
  private readonly path: string;
  private readonly getAuthToken?: ResourcesApiClientConfig["getAuthToken"];

  constructor(config: ResourcesApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.networkClient = config.networkClient;
    this.path = config.path ?? "/resources";
    this.getAuthToken = config.getAuthToken;
  }

  private buildUrl(locale?: string): string {
    const url = new URL(`${this.baseUrl}${this.path}`);
    if (locale) url.searchParams.set("locale", locale);
    // `new URL` leaves no trailing slash on the path, which some RN URL
    // polyfills would otherwise add — the server routes the un-slashed form.
    return url.toString();
  }

  private async headers(): Promise<Record<string, string>> {
    const headers: Record<string, string> = { accept: "application/json" };
    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  /** Fetch the enabled resources for `locale` (or the app default). */
  async list(locale?: string): Promise<Resource[]> {
    const response = await this.networkClient.get<ResourceListResponse>(
      this.buildUrl(locale),
      { headers: await this.headers() },
    );
    if (!response.ok) {
      throw new Error(
        response.error ||
          `Failed to load resources: ${response.status} ${response.statusText}`,
      );
    }
    const resources = response.data?.resources;
    return Array.isArray(resources) ? resources : [];
  }
}
