/**
 * Derive a short, human-readable domain label from a resource URL, for the
 * small line shown under each tile (e.g. "https://www.musictheory.net/lessons"
 * → "musictheory.net"). Pure; safe to call during render on web and RN.
 */
export function shortenDomain(url: string): string {
  if (!url) return "";
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./i, "");
  } catch {
    // Not a parseable absolute URL — strip scheme/path heuristically.
    const bare = url.replace(/^[a-z]+:\/\//i, "").replace(/^www\./i, "");
    return bare.split("/")[0]?.split("?")[0] ?? "";
  }
}
