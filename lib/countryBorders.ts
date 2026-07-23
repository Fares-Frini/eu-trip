import type { FeatureCollection } from "geojson";

/**
 * Maps the `country` field used in data/trip.ts to the matching slug in the
 * georgique/world-geojson dataset (public, per-country boundary files).
 */
const COUNTRY_SLUGS: Record<string, string> = {
  Tunisia: "tunisia",
  Italy: "italy",
  Switzerland: "switzerland",
  Germany: "germany",
  Belgium: "belgium",
  France: "france",
};

const cache = new Map<string, FeatureCollection | null>();
const inFlight = new Map<string, Promise<FeatureCollection | null>>();

/** Fetches (and caches) a country's border polygon. Returns null if unavailable. */
export async function fetchCountryBorder(country: string): Promise<FeatureCollection | null> {
  if (cache.has(country)) return cache.get(country) ?? null;
  if (inFlight.has(country)) return inFlight.get(country)!;

  const slug = COUNTRY_SLUGS[country];
  if (!slug) {
    cache.set(country, null);
    return null;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/georgique/world-geojson/main/countries/${slug}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as FeatureCollection;
      cache.set(country, data);
      return data;
    } catch {
      cache.set(country, null);
      return null;
    } finally {
      inFlight.delete(country);
    }
  })();

  inFlight.set(country, promise);
  return promise;
}
