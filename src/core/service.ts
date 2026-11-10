/**
 * ResourcesService — a thin read-through cache over a `ResourcesApiClient`.
 *
 * The catalog is small and changes rarely, so each locale's list is fetched
 * once and memoized; concurrent callers for the same locale share one in-flight
 * request. `refresh()` drops the cache. There is no user/auth state here — the
 * catalog is public per (app, locale).
 */
import type { ResourcesApiClient } from "../network/ResourcesApiClient.js";
import type { Resource } from "../types/index.js";

export class ResourcesService {
  private readonly cache = new Map<string, Resource[]>();
  private readonly inFlight = new Map<string, Promise<Resource[]>>();

  constructor(private readonly client: ResourcesApiClient) {}

  private key(locale?: string): string {
    return locale ?? "__default__";
  }

  /** Cached list for a locale. Shares an in-flight request across callers. */
  async list(locale?: string): Promise<Resource[]> {
    const key = this.key(locale);
    const cached = this.cache.get(key);
    if (cached) return cached;

    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const promise = this.client
      .list(locale)
      .then((resources) => {
        this.cache.set(key, resources);
        this.inFlight.delete(key);
        return resources;
      })
      .catch((err) => {
        this.inFlight.delete(key);
        throw err;
      });
    this.inFlight.set(key, promise);
    return promise;
  }

  /** Drop cached data (all locales, or one) so the next read refetches. */
  refresh(locale?: string): void {
    if (locale === undefined) {
      this.cache.clear();
      this.inFlight.clear();
    } else {
      this.cache.delete(this.key(locale));
      this.inFlight.delete(this.key(locale));
    }
  }
}
