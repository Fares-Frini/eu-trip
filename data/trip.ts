export type TransportMode = "ferry" | "car" | "train" | "plane" | "foot";

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
  /** How you get around once you're in the city */
  exploreBy?: TransportMode;
  /** Short one-liner shown on the map marker popup */
  summary?: string;
  /** Zoom level at which the detailed city panel should appear */
  detailZoom: number;
  /** Arrival/departure timing for this stop, in human-readable form */
  schedule?: {
    arrival?: string;
    departure?: string;
  };
  /** Estimated budget for this stop */
  budget?: {
    accommodation?: string;
    activities?: string;
  };
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
    summary: "Departure point — ferry to Palermo, then Civitavecchia",
    detailZoom: 11,
    schedule: {
      departure: "Aug 1, 00:00 — ferry departure",
    },
    details: {},
  },
  {
    id: "palermo",
    name: "Palermo",
    country: "Italy",
    lat: 38.1157,
    lng: 13.3613,
    order: 1,
    arriveBy: "ferry",
    summary: "Ferry stopover in Sicily",
    detailZoom: 11,
    details: {
      notes: "Ferry stopover — exact dates not yet confirmed.",
    },
  },
  {
    id: "civitavecchia",
    name: "Civitavecchia",
    country: "Italy",
    lat: 42.0942,
    lng: 11.7955,
    order: 2,
    arriveBy: "ferry",
    summary: "Ferry arrival point, gateway to Rome",
    detailZoom: 11,
    details: {
      notes: "Ferry arrival — continue on to Rome the same day.",
    },
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    lat: 41.9028,
    lng: 12.4964,
    order: 3,
    days: 3,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "3 days exploring Rome",
    detailZoom: 11,
    schedule: {
      arrival: "Aug 3, 08:00",
      departure: "Aug 6, afternoon/evening",
    },
    budget: {
      accommodation: "≈€80/night",
      activities: "≈€70",
    },
    details: {
      description:
        "Ancient ruins, Renaissance piazzas, and Baroque fountains — the heart of the itinerary.",
      notes: "Estimated sightseeing cost: €19 (EU students 18–25) / €56 (standard), excluding transport & food.",
    },
  },
  {
    id: "florence",
    name: "Florence",
    country: "Italy",
    lat: 43.7696,
    lng: 11.2558,
    order: 4,
    days: 2,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "Renaissance art & architecture",
    detailZoom: 11,
    schedule: {
      arrival: "Aug 6, evening — meeting up with Sana",
      departure: "Aug 8, early morning",
    },
    budget: {
      accommodation: "€55 for 2 nights",
      activities: "≈€20",
    },
    details: {
      description: "Renaissance art and architecture centered on the Duomo and the Arno.",
      notes: "Estimated sightseeing cost: €11 (student) / €19 (standard).",
    },
  },
  {
    id: "bologna",
    name: "Bologna",
    country: "Italy",
    lat: 44.4949,
    lng: 11.3426,
    order: 5,
    days: 1,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "Food capital of Italy",
    detailZoom: 11,
    schedule: {
      arrival: "Aug 8, early morning",
      departure: "Aug 9, morning",
    },
    budget: {
      accommodation: "€27/night",
      activities: "≈€10",
    },
    details: {
      description:
        "A compact one-day stop for porticoes, towers, and Italy's oldest university quarter.",
      notes: "Estimated sightseeing cost: ≈€3.",
    },
  },
  {
    id: "venice",
    name: "Venice",
    country: "Italy",
    lat: 45.4408,
    lng: 12.3155,
    order: 6,
    days: 1,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "Canals and history",
    detailZoom: 11,
    schedule: {
      arrival: "Aug 9, morning",
      departure: "Aug 10, after lunch",
    },
    budget: {
      accommodation: "€47/night",
      activities: "≈€70",
    },
    details: {
      description: "Canals, basilicas, and glassblowing islands across the lagoon.",
      notes: "Estimated sightseeing cost: ≈€36, plus €19 round-trip boat to Murano & Burano.",
    },
  },
  {
    id: "milano",
    name: "Milano",
    country: "Italy",
    lat: 45.4642,
    lng: 9.19,
    order: 7,
    days: 2,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "Fashion & design capital",
    detailZoom: 11,
    schedule: {
      arrival: "Aug 10, evening",
      departure: "Aug 12, morning",
    },
    budget: {
      accommodation: "€70 for 2 nights",
      activities: "≈€30",
    },
    details: {
      description: "Fashion, opera, and Gothic spires in Italy's design capital.",
      notes: "Estimated sightseeing cost: ≈€20.5.",
    },
  },
  {
    id: "lugano",
    name: "Lugano",
    country: "Switzerland",
    lat: 46.0037,
    lng: 8.9511,
    order: 8,
    days: 1,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "Swiss lakeside city",
    detailZoom: 11,
    schedule: {
      arrival: "Aug 12, morning",
      departure: "Aug 13, evening",
    },
    budget: {
      accommodation: "€75",
      activities: "≈€80",
    },
    details: {
      description:
        "Lakeside old town with mountain viewpoints and a day trip to Bellinzona's castles.",
      notes: "Estimated activities: ≈45.5 CHF (student) / 71.5 CHF (standard).",
    },
  },
  {
    id: "frankfurt",
    name: "Frankfurt",
    country: "Germany",
    lat: 50.1109,
    lng: 8.6821,
    order: 9,
    days: 2,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "Financial hub of Germany",
    detailZoom: 11,
    schedule: {
      arrival: "Aug 14, morning",
      departure: "Aug 16 evening or Aug 17 morning",
    },
    budget: {
      accommodation: "≈€70",
      activities: "≈€60",
    },
    details: {
      description: "Skyline views, a rebuilt old town, and a cruise along the Main.",
      notes: "Estimated sightseeing cost: ≈€42 (student) / €49 (standard).",
    },
  },
  {
    id: "brussels",
    name: "Bruxelles",
    country: "Belgium",
    lat: 50.8503,
    lng: 4.3517,
    order: 10,
    days: 2,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "EU capital",
    detailZoom: 11,
    schedule: {
      arrival: "Aug 17, morning",
      departure: "Aug 19, evening",
    },
    details: {},
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    order: 11,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "City of Light",
    detailZoom: 11,
    details: {
      notes: "Dates and accommodation not yet planned.",
    },
  },
  {
    id: "lyon",
    name: "Lyon",
    country: "France",
    lat: 45.764,
    lng: 4.8357,
    order: 12,
    arriveBy: "car",
    exploreBy: "foot",
    summary: "Gastronomic capital of France — last stop before flying home",
    detailZoom: 11,
    details: {
      notes: "Last stop of the trip — dates and accommodation not yet planned.",
    },
  },
  {
    id: "tunis",
    name: "Tunis",
    country: "Tunisia",
    lat: 36.8065,
    lng: 10.1815,
    order: 13,
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
