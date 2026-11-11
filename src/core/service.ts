/**
 * ResourcesService — a thin read-through cache over a `ResourcesApiClient`.
 *
 * The catalog is small and changes rarely, so each language's section tree is
 * fetched once and memoized; concurrent callers for the same language share one
 * in-flight request. `refresh()` drops the cache. No user/auth state — the
 * catalog is public per (app, language).
 */
import type { ResourcesApiClient } from "../network/ResourcesApiClient.js";
import type { ResourceSection } from "../types/index.js";

export class ResourcesService {
  private readonly cache = new Map<string, ResourceSection[]>();
  private readonly inFlight = new Map<string, Promise<ResourceSection[]>>();

  constructor(private readonly client: ResourcesApiClient) {}

  private key(lang: string): string {
    return lang || "__default__";
  }

  /** Cached section tree for a language. Shares an in-flight request. */
  async data(lang: string): Promise<ResourceSection[]> {
    const key = this.key(lang);
    const cached = this.cache.get(key);
    if (cached) return cached;

    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const promise = this.client
      .data(lang)
      .then((sections) => {
        this.cache.set(key, sections);
        this.inFlight.delete(key);
        return sections;
      })
      .catch((err) => {
        this.inFlight.delete(key);
        throw err;
      });
    this.inFlight.set(key, promise);
    return promise;
  }

  /** Drop cached data (all languages, or one) so the next read refetches. */
  refresh(lang?: string): void {
    if (lang === undefined) {
      this.cache.clear();
      this.inFlight.clear();
    } else {
      this.cache.delete(this.key(lang));
      this.inFlight.delete(this.key(lang));
    }
  }
}
