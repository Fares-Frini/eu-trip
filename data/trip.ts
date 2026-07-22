export type TransportMode = "ferry" | "car" | "train" | "plane";

export interface CityStop {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  /** Order in the itinerary, starting at 0 */
  order: number;
  /** Number of nights/days spent here, if known */
  days?: number;
  /** How you travel FROM the previous stop TO this stop */
  arriveBy?: TransportMode;
  /** Short one-liner shown on the map marker popup */
  summary?: string;
  /** Zoom level at which the detailed city panel should appear */
  detailZoom: number;
  /** Full city details — fill these in later */
  details?: {
    description?: string;
    highlights?: string[];
    activities?: string[];
    notes?: string;
    photos?: string[];
  };
}

export const tripStops: CityStop[] = [
  {
    id: "halk-el-oued",
    name: "Halk el Oued",
    country: "Tunisia",
    lat: 36.8189,
    lng: 10.2939,
    order: 0,
    arriveBy: undefined,
    summary: "Departure point — ferry to Civitavecchia",
    detailZoom: 11,
    details: {},
  },
  {
    id: "civitavecchia",
    name: "Civitavecchia",
    country: "Italy",
    lat: 42.0942,
    lng: 11.7955,
    order: 1,
    arriveBy: "ferry",
    summary: "Ferry arrival point, gateway to Rome",
    detailZoom: 11,
    details: {},
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    lat: 41.9028,
    lng: 12.4964,
    order: 2,
    days: 2,
    arriveBy: "car",
    summary: "2 days exploring Rome",
    detailZoom: 11,
    details: {},
  },
  {
    id: "florence",
    name: "Florence",
    country: "Italy",
    lat: 43.7696,
    lng: 11.2558,
    order: 3,
    arriveBy: "car",
    summary: "Renaissance art & architecture",
    detailZoom: 11,
    details: {},
  },
  {
    id: "bologna",
    name: "Bologna",
    country: "Italy",
    lat: 44.4949,
    lng: 11.3426,
    order: 4,
    arriveBy: "car",
    summary: "Food capital of Italy",
    detailZoom: 11,
    details: {},
  },
  {
    id: "venice",
    name: "Venice",
    country: "Italy",
    lat: 45.4408,
    lng: 12.3155,
    order: 5,
    arriveBy: "car",
    summary: "Canals and history",
    detailZoom: 11,
    details: {},
  },
  {
    id: "milano",
    name: "Milano",
    country: "Italy",
    lat: 45.4642,
    lng: 9.19,
    order: 6,
    arriveBy: "car",
    summary: "Fashion & design capital",
    detailZoom: 11,
    details: {},
  },
  {
    id: "lugano",
    name: "Lugano",
    country: "Switzerland",
    lat: 46.0037,
    lng: 8.9511,
    order: 7,
    arriveBy: "car",
    summary: "Swiss lakeside city",
    detailZoom: 11,
    details: {},
  },
  {
    id: "frankfurt",
    name: "Frankfurt",
    country: "Germany",
    lat: 50.1109,
    lng: 8.6821,
    order: 8,
    arriveBy: "car",
    summary: "Financial hub of Germany",
    detailZoom: 11,
    details: {},
  },
  {
    id: "brussels",
    name: "Bruxelles",
    country: "Belgium",
    lat: 50.8503,
    lng: 4.3517,
    order: 9,
    arriveBy: "car",
    summary: "EU capital",
    detailZoom: 11,
    details: {},
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    order: 10,
    arriveBy: "car",
    summary: "City of Light",
    detailZoom: 11,
    details: {},
  },
  {
    id: "lyon",
    name: "Lyon",
    country: "France",
    lat: 45.764,
    lng: 4.8357,
    order: 11,
    arriveBy: "car",
    summary: "Gastronomic capital of France",
    detailZoom: 11,
    details: {},
  },
  {
    id: "tunis",
    name: "Tunis",
    country: "Tunisia",
    lat: 36.8065,
    lng: 10.1815,
    order: 12,
    arriveBy: "plane",
    summary: "Flight home",
    detailZoom: 11,
    details: {},
  },
];

export const tripStopsSorted = [...tripStops].sort((a, b) => a.order - b.order);

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const tripStats = {
  stopCount: tripStopsSorted.length,
  countryCount: new Set(tripStopsSorted.map((s) => s.country)).size,
  totalDistanceKm: Math.round(
    tripStopsSorted.slice(1).reduce((sum, stop, i) => sum + haversineKm(tripStopsSorted[i], stop), 0)
  ),
};
