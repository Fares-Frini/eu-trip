export type LatLngPair = [number, number];

/**
 * Fetches a real driving-route geometry between two points from the public
 * OSRM demo server. Used to bend "car"/"train" legs onto actual roads
 * instead of drawing a straight line — there's no free rail-routing API,
 * so train legs use the driving profile as a close-enough road corridor.
 */
export async function fetchRoadRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<LatLngPair[] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    return coords.map(([lng, lat]) => [lat, lng] as LatLngPair);
  } catch {
    return null;
  }
}
