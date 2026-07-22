export interface GeocodeResult {
  id: string;
  /** Short label (first segment of the address) */
  name: string;
  /** Full address as returned by Nominatim */
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
}

interface NominatimHit {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  name?: string;
}

/**
 * Searches OpenStreetMap's Nominatim geocoder for places matching `query`.
 * This is the same free, keyless search service the main openstreetmap.org
 * site uses. Per Nominatim's usage policy for client-side use: keep requests
 * to one at a time (callers should debounce), and the browser's own Referer
 * header identifies the site (a custom User-Agent can't be set from fetch).
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(trimmed)}&limit=6`;
    const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = (await res.json()) as NominatimHit[];
    if (!Array.isArray(data)) return [];

    return data.map((hit) => ({
      id: String(hit.place_id),
      name: hit.name || hit.display_name.split(",")[0].trim(),
      displayName: hit.display_name,
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      type: hit.type,
    }));
  } catch {
    return [];
  }
}
