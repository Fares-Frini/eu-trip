"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvent } from "react-leaflet";
import { useTheme } from "next-themes";
import { Maximize2 } from "lucide-react";
import { tripStopsSorted, type CityStop, type TransportMode } from "@/data/trip";
import { MODE_COLORS, MODE_DASH, MODE_LABELS } from "@/lib/modes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

function FitBoundsControl({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  return (
    <Button
      size="icon"
      variant="secondary"
      className="absolute right-3 top-3 z-[1000] shadow-md"
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
}: {
  activeCityId: string | null;
  onActiveCityChange: (city: CityStop | null) => void;
  focusRequest: FocusRequest | null;
}) {
  const { resolvedTheme } = useTheme();
  const palette = MODE_COLORS[resolvedTheme === "dark" ? "dark" : "light"];

  const segments = useMemo(() => {
    const result: { positions: [number, number][]; mode: TransportMode }[] = [];
    for (let i = 1; i < tripStopsSorted.length; i++) {
      const from = tripStopsSorted[i - 1];
      const to = tripStopsSorted[i];
      result.push({
        positions: [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ],
        mode: to.arriveBy ?? "car",
      });
    }
    return result;
  }, []);

  const bounds = useMemo(
    () => L.latLngBounds(tripStopsSorted.map((s) => [s.lat, s.lng] as [number, number])),
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
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {segments.map((seg, i) => (
          <Polyline
            key={`casing-${i}`}
            positions={seg.positions}
            pathOptions={{
              color: resolvedTheme === "dark" ? "#0b1220" : "#ffffff",
              weight: 6,
              opacity: 0.55,
              lineCap: "round",
            }}
          />
        ))}
        {segments.map((seg, i) => (
          <Polyline
            key={`line-${i}`}
            positions={seg.positions}
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

        <ZoomWatcher onChange={handleViewportChange} />
        <FlyToCity request={focusRequest} stops={tripStopsSorted} />
        <FitBoundsControl bounds={bounds} />
      </MapContainer>

      <Legend palette={palette} />
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
