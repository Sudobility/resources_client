/**
 * HTTP client for the resources catalog, over an injected `NetworkClient`.
 *
 * It talks to the *host app's own* API aggregate endpoint
 * (`GET /api/v1/resources/data?lang=`), which forwards to the central
 * sudobility_api — never to the central API directly, and never with an API
 * key (reads are public; the catalog is curated through the admin MCP).
 */
import type { NetworkClient } from "@sudobility/types";
import type {
  ResourceDataResponse,
  ResourcesApiClientConfig,
  ResourceSectionWithResources,
} from "../types/index.js";

export class ResourcesApiClient {
  private readonly baseUrl: string;
  private readonly networkClient: NetworkClient;
  private readonly path: string;
  private readonly getAuthToken?: ResourcesApiClientConfig["getAuthToken"];

  constructor(config: ResourcesApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.networkClient = config.networkClient;
    this.path = config.path ?? "/resources/data";
    this.getAuthToken = config.getAuthToken;
  }

  private buildUrl(lang: string): string {
    const url = new URL(`${this.baseUrl}${this.path}`);
    url.searchParams.set("lang", lang);
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

  /** Fetch the section→resources tree for `lang` (en fallback is applied upstream). */
  async data(lang: string): Promise<ResourceSectionWithResources[]> {
    const response = await this.networkClient.get<ResourceDataResponse>(
      this.buildUrl(lang),
      { headers: await this.headers() },
    );
    if (!response.ok) {
      throw new Error(
        response.error ||
          `Failed to load resources: ${response.status} ${response.statusText}`,
      );
    }
    const sections = response.data?.sections;
    return Array.isArray(sections) ? sections : [];
  }
}
