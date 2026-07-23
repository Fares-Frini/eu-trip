"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  GeoJSON,
  useMap,
  useMapEvent,
} from "react-leaflet";
import { useTheme } from "next-themes";
import { Maximize2 } from "lucide-react";
import type { FeatureCollection } from "geojson";
import { tripStopsSorted, type CityStop, type TransportMode } from "@/data/trip";
import { getPoisForCity, type PointOfInterest } from "@/data/poi";
import type { GeocodeResult } from "@/lib/geocode";
import { MODE_COLORS, MODE_DASH, MODE_LABELS } from "@/lib/modes";
import { fetchRoadRoute, getSeaRoute, type LatLngPair } from "@/lib/routing";
import { MAP_STYLES, resolveTileUrl, type MapStyleId } from "@/lib/mapStyles";
import { fetchCountryBorder } from "@/lib/countryBorders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MapStyleSwitcher from "@/components/MapStyleSwitcher";

/** Below this zoom (i.e. zoomed way out), country borders are highlighted */
const COUNTRY_BORDER_MAX_ZOOM = 6;
const COUNTRY_BORDER_COLOR = { light: "oklch(0.76 0.15 75)", dark: "oklch(0.8 0.15 80)" };

function CountryBordersLayer({ countries }: { countries: string[] }) {
  const map = useMap();
  const { resolvedTheme } = useTheme();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [borders, setBorders] = useState<Record<string, FeatureCollection | null>>({});

  useMapEvent("zoom", () => setZoom(map.getZoom()));

  const visible = zoom <= COUNTRY_BORDER_MAX_ZOOM;

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    for (const country of countries) {
      if (country in borders) continue;
      fetchCountryBorder(country).then((data) => {
        if (!cancelled) setBorders((prev) => ({ ...prev, [country]: data }));
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, countries]);

  if (!visible) return null;

  const color = COUNTRY_BORDER_COLOR[resolvedTheme === "dark" ? "dark" : "light"];

  return (
    <>
      {countries.map((country) => {
        const data = borders[country];
        if (!data) return null;
        return (
          <GeoJSON
            key={country}
            data={data}
            interactive={false}
            pathOptions={{
              color,
              weight: 1.5,
              opacity: 0.6,
              fillColor: color,
              fillOpacity: 0.04,
              dashArray: "4 4",
            }}
          />
        );
      })}
    </>
  );
}

const searchPinIcon = L.divIcon({
  html: `<div class="search-pin"></div>`,
  className: "search-pin-icon",
  iconSize: [26, 26],
  iconAnchor: [13, 24],
  popupAnchor: [0, -22],
});

const POI_CARD_WIDTH = 120;
const POI_CARD_HEIGHT = 22;
const POI_CARD_GAP = 4;
/** Below this zoom, POIs show as small colored dots */
const POI_PIN_ZOOM = 13;
/** Below this zoom, POI pins have no name card — above it, the card appears */
const POI_LABEL_ZOOM = 14;

function isFreePoi(poi: PointOfInterest) {
  return !poi.price || poi.price.toLowerCase().startsWith("free");
}

function buildPoiIcon(isActive: boolean, free: boolean, pinStyle: boolean) {
  const color = free ? "var(--mode-foot)" : "var(--accent)";

  if (pinStyle) {
    const size = isActive ? 28 : 22;
    return L.divIcon({
      html: `<div class="poi-pin${isActive ? " poi-pin--active" : ""}" style="--marker-color:${color}"></div>`,
      className: "poi-pin-icon",
      iconSize: [size, size],
      iconAnchor: [size / 2, Math.round(size * 0.92)],
      popupAnchor: [0, -size],
    });
  }

  const size = isActive ? 13 : 10;
  return L.divIcon({
    html: `<div class="poi-marker${isActive ? " poi-marker--active" : ""}" style="--marker-color:${color}"></div>`,
    className: "poi-marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function PoiCard({ poi, onSelect }: { poi: PointOfInterest; onSelect: () => void }) {
  return (
    <div
      className="poi-card"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <span className="poi-card__name">{poi.name}</span>
    </div>
  );
}

/**
 * Renders one city's POI pins + floating cards, spreading cards that would
 * otherwise overlap (when their real-world points are close together at the
 * current zoom) into vertical stacks above their pin instead of piling up.
 */
function PoiLayer({
  pois,
  activePoiId,
  onSelect,
}: {
  pois: PointOfInterest[];
  activePoiId: string | null;
  onSelect: (poi: PointOfInterest) => void;
}) {
  const map = useMap();
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [zoom, setZoom] = useState(() => map.getZoom());

  function recompute() {
    if (pois.length === 0) {
      setLevels({});
      return;
    }
    const points = pois.map((poi) => ({
      id: poi.id,
      pt: map.latLngToContainerPoint([poi.lat, poi.lng]),
    }));
    points.sort((a, b) => a.pt.x - b.pt.x);

    const placed: { x1: number; x2: number; level: number }[] = [];
    const next: Record<string, number> = {};
    for (const { id, pt } of points) {
      const x1 = pt.x - POI_CARD_WIDTH / 2;
      const x2 = pt.x + POI_CARD_WIDTH / 2;
      let level = 0;
      while (placed.some((p) => p.level === level && p.x1 < x2 && p.x2 > x1)) {
        level++;
      }
      placed.push({ x1, x2, level });
      next[id] = level;
    }
    setLevels(next);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs layout state with the map's current pixel geometry, not React state
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pois]);

  useMapEvent("zoomend", () => {
    recompute();
    setZoom(map.getZoom());
  });
  useMapEvent("moveend", recompute);

  const pinStyle = zoom >= POI_PIN_ZOOM;
  const showLabels = zoom >= POI_LABEL_ZOOM;

  return (
    <>
      {pois.map((poi) => {
        const level = levels[poi.id] ?? 0;
        return (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={buildPoiIcon(activePoiId === poi.id, isFreePoi(poi), pinStyle)}
            eventHandlers={{ click: () => onSelect(poi) }}
          >
            {showLabels && (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -6 - level * (POI_CARD_HEIGHT + POI_CARD_GAP)]}
                opacity={1}
                className="poi-tooltip"
              >
                <PoiCard poi={poi} onSelect={() => onSelect(poi)} />
              </Tooltip>
            )}
          </Marker>
        );
      })}
    </>
  );
}

interface TripSegment {
  key: string;
  from: CityStop;
  to: CityStop;
  mode: TransportMode;
  positions: LatLngPair[];
}

/**
 * Bends "car"/"train" legs onto real road geometry (via OSRM) instead of a
 * straight line. Ferry legs are already bent onto shipping lanes up-front
 * (see `segments`, computed offline via searoute-ts). Plane legs stay
 * geodesic-straight since there's no route to follow. Falls back silently
 * to the straight line if the OSRM request fails.
 */
function useRoadRoutes(segments: TripSegment[]) {
  const [roaded, setRoaded] = useState<Record<string, LatLngPair[]>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (const seg of segments) {
        if (seg.mode !== "car" && seg.mode !== "train") continue;
        const route = await fetchRoadRoute(seg.from, seg.to);
        if (cancelled || !route) continue;
        setRoaded((prev) => ({ ...prev, [seg.key]: route }));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return roaded;
}

export interface FocusRequest {
  id: string;
  nonce: number;
}

function buildDivIcon(stop: CityStop, color: string, isActive: boolean) {
  const size = isActive ? 38 : 30;
  const classes = ["trip-marker"];
  if (isActive) classes.push("trip-marker--active", "trip-marker--pulse");
  const html = `<div class="${classes.join(" ")}" style="--marker-color:${color}">${stop.order + 1}</div>`;
  return L.divIcon({
    html,
    className: "trip-marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function ZoomWatcher({ onChange }: { onChange: (zoom: number, center: L.LatLng) => void }) {
  const map = useMap();

  useMapEvent("moveend", () => onChange(map.getZoom(), map.getCenter()));
  useMapEvent("zoomend", () => onChange(map.getZoom(), map.getCenter()));

  useEffect(() => {
    onChange(map.getZoom(), map.getCenter());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function FlyToCity({ request, stops }: { request: FocusRequest | null; stops: CityStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (!request) return;
    const target = stops.find((s) => s.id === request.id);
    if (target) {
      map.flyTo([target.lat, target.lng], target.detailZoom, { duration: 1.1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);
  return null;
}

function FlyToSearchResult({ result }: { result: GeocodeResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (!result) return;
    map.flyTo([result.lat, result.lng], 15, { duration: 1.1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);
  return null;
}

function FitBoundsControl({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  return (
    <Button
      size="icon"
      variant="secondary"
      className="absolute top-16 left-3 z-[999] shadow-md"
      onClick={() => map.flyToBounds(bounds, { padding: [60, 60], duration: 0.9 })}
      title="Fit whole trip"
    >
      <Maximize2 className="size-4" />
    </Button>
  );
}

function distanceKm(a: L.LatLng, b: { lat: number; lng: number }) {
  return a.distanceTo(L.latLng(b.lat, b.lng)) / 1000;
}

export default function TripMap({
  activeCityId,
  onActiveCityChange,
  focusRequest,
  activePoiId,
  onSelectPoi,
  searchResult,
}: {
  activeCityId: string | null;
  onActiveCityChange: (city: CityStop | null) => void;
  focusRequest: FocusRequest | null;
  activePoiId: string | null;
  onSelectPoi: (poi: PointOfInterest) => void;
  searchResult: GeocodeResult | null;
}) {
  const { resolvedTheme } = useTheme();
  const palette = MODE_COLORS[resolvedTheme === "dark" ? "dark" : "light"];
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>("voyager");
  const mapStyle = MAP_STYLES.find((s) => s.id === mapStyleId) ?? MAP_STYLES[0];

  const segments = useMemo(() => {
    const result: TripSegment[] = [];
    for (let i = 1; i < tripStopsSorted.length; i++) {
      const from = tripStopsSorted[i - 1];
      const to = tripStopsSorted[i];
      const mode = to.arriveBy ?? "car";
      const straight: LatLngPair[] = [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ];
      result.push({
        key: `${from.id}-${to.id}`,
        from,
        to,
        positions: mode === "ferry" ? getSeaRoute(from, to) ?? straight : straight,
        mode,
      });
    }
    return result;
  }, []);

  const roadRoutes = useRoadRoutes(segments);

  const activeCityPois = useMemo(
    () => (activeCityId ? getPoisForCity(activeCityId) : []),
    [activeCityId]
  );

  const bounds = useMemo(
    () => L.latLngBounds(tripStopsSorted.map((s) => [s.lat, s.lng] as [number, number])),
    []
  );

  const tripCountries = useMemo(
    () => Array.from(new Set(tripStopsSorted.map((s) => s.country))),
    []
  );

  function handleViewportChange(zoom: number, center: L.LatLng) {
    if (zoom < 8) {
      onActiveCityChange(null);
      return;
    }
    let closest: CityStop | null = null;
    let closestDist = Infinity;
    for (const stop of tripStopsSorted) {
      const d = distanceKm(center, stop);
      if (d < closestDist) {
        closestDist = d;
        closest = stop;
      }
    }
    if (closest && zoom >= closest.detailZoom && closestDist < 60) {
      onActiveCityChange(closest);
    } else {
      onActiveCityChange(null);
    }
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [60, 60] }}
        className="h-full w-full"
        scrollWheelZoom
        zoomControl={false}
        minZoom={4}
      >
        <TileLayer
          attribution={mapStyle.attribution}
          url={resolveTileUrl(mapStyle, resolvedTheme === "dark")}
          detectRetina
        />

        <CountryBordersLayer countries={tripCountries} />

        {segments.map((seg) => (
          <Polyline
            key={`casing-${seg.key}`}
            positions={roadRoutes[seg.key] ?? seg.positions}
            pathOptions={{
              color: resolvedTheme === "dark" ? "#0b1220" : "#ffffff",
              weight: 6,
              opacity: 0.55,
              lineCap: "round",
            }}
          />
        ))}
        {segments.map((seg) => (
          <Polyline
            key={`line-${seg.key}`}
            positions={roadRoutes[seg.key] ?? seg.positions}
            pathOptions={{
              color: palette[seg.mode],
              weight: 3.5,
              dashArray: MODE_DASH[seg.mode],
              opacity: 0.95,
              lineCap: "round",
            }}
          />
        ))}

        {tripStopsSorted.map((stop) => {
          const isActive = activeCityId === stop.id;
          const color = palette[stop.arriveBy ?? "car"];
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={buildDivIcon(stop, color, isActive)}
              eventHandlers={{
                click: () => onActiveCityChange(stop),
              }}
            >
              <Popup>
                <div className="font-semibold text-foreground">
                  {stop.order + 1}. {stop.name}
                </div>
                <div className="text-xs text-muted-foreground">{stop.country}</div>
                {stop.summary && <div className="mt-1 text-sm">{stop.summary}</div>}
                {stop.arriveBy && (
                  <div className="mt-1 text-xs text-muted-foreground">{MODE_LABELS[stop.arriveBy]}</div>
                )}
              </Popup>
            </Marker>
          );
        })}

        {activeCityPois.length > 0 && (
          <PoiLayer pois={activeCityPois} activePoiId={activePoiId} onSelect={onSelectPoi} />
        )}

        {searchResult && (
          <Marker position={[searchResult.lat, searchResult.lng]} icon={searchPinIcon}>
            <Popup>
              <div className="font-semibold text-foreground">{searchResult.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{searchResult.displayName}</div>
            </Popup>
          </Marker>
        )}

        <ZoomWatcher onChange={handleViewportChange} />
        <FlyToCity request={focusRequest} stops={tripStopsSorted} />
        <FlyToSearchResult result={searchResult} />
        <FitBoundsControl bounds={bounds} />
      </MapContainer>

      <Legend palette={palette} />
      <MapStyleSwitcher value={mapStyleId} onChange={setMapStyleId} />
    </div>
  );
}

function Legend({ palette }: { palette: Record<TransportMode, string> }) {
  const items: TransportMode[] = ["car", "ferry", "plane"];
  return (
    <Card className="pointer-events-none absolute bottom-4 left-4 z-[1000] gap-2 rounded-xl border-border/60 bg-card/90 p-3 py-3 shadow-md backdrop-blur">
      <div className="flex flex-col gap-1.5">
        {items.map((mode) => (
          <div key={mode} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="inline-block h-[3px] w-6 rounded-full"
              style={{ backgroundColor: palette[mode] }}
            />
            <span>{MODE_LABELS[mode]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
