/**
 * useResources — load the catalog's section tree for a language from the
 * configured singleton.
 *
 * Returns `{ sections, isLoading, error, refetch }`. Works identically on web
 * and React Native (only `react` is imported). A host that did not call
 * `initializeResources` gets a clear error state rather than a throw.
 */
import { useCallback, useEffect, useState } from "react";
import { getResourcesService } from "../core/singleton.js";
import type { ResourceSection } from "../types/index.js";

export interface UseResourcesResult {
  sections: ResourceSection[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useResources(lang: string): UseResourcesResult {
  const [sections, setSections] = useState<ResourceSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const refetch = useCallback(() => {
    getResourcesService()?.refresh(lang);
    setNonce((n) => n + 1);
  }, [lang]);

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
      .data(lang)
      .then((list) => {
        if (!active) return;
        setSections(list);
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
  }, [lang, nonce]);

  return { sections, isLoading, error, refetch };
}
