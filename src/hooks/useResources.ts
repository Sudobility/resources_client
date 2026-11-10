/**
 * useResources — load the catalog for a locale from the configured singleton.
 *
 * Returns `{ resources, isLoading, error, refetch }`. Works identically on web
 * and React Native (only `react` is imported). A host that did not call
 * `initializeResources` gets a clear error state rather than a throw.
 */
import { useCallback, useEffect, useState } from "react";
import { getResourcesService } from "../core/singleton.js";
import type { Resource } from "../types/index.js";

export interface UseResourcesResult {
  resources: Resource[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useResources(locale?: string): UseResourcesResult {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const refetch = useCallback(() => {
    getResourcesService()?.refresh(locale);
    setNonce((n) => n + 1);
  }, [locale]);

  useEffect(() => {
    let active = true;
    const service = getResourcesService();
    if (!service) {
      setIsLoading(false);
      setError(
        new Error(
          "resources_client is not initialized — call initializeResources({ apiClient }) first",
        ),
      );
      return;
    }
    setIsLoading(true);
    setError(null);
    service
      .list(locale)
      .then((list) => {
        if (!active) return;
        setResources(list);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale, nonce]);

  return { resources, isLoading, error, refetch };
}
