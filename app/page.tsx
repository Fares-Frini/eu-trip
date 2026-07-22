"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Compass, ListTree, Sun, Route } from "lucide-react";
import { tripStats, type CityStop } from "@/data/trip";
import type { PointOfInterest } from "@/data/poi";
import type { GeocodeResult } from "@/lib/geocode";
import TripSidebar from "@/components/TripSidebar";
import CityPanel from "@/components/CityPanel";
import PoiPanel from "@/components/PoiPanel";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { FocusRequest } from "@/components/TripMap";

const TripMap = dynamic(() => import("@/components/TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground">
      <Compass className="size-4 animate-spin" />
      Loading map…
    </div>
  ),
});

export default function Home() {
  const [activeCity, setActiveCity] = useState<CityStop | null>(null);
  const [activePoi, setActivePoi] = useState<PointOfInterest | null>(null);
  const [searchResult, setSearchResult] = useState<GeocodeResult | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleSelect(stop: CityStop) {
    setActiveCity(stop);
    setActivePoi(null);
    setSearchResult(null);
    setFocusRequest({ id: stop.id, nonce: Date.now() });
    setMobileNavOpen(false);
  }

  function handleActiveCityChange(city: CityStop | null) {
    if (city?.id !== activeCity?.id) {
      setActivePoi(null);
    }
    setActiveCity(city);
  }

  return (
    <div className="flex h-dvh w-full flex-col">
      <header className="z-1100 flex shrink-0 items-center justify-between gap-4 border-b bg-card px-3 py-2.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              render={
                <Button size="icon" variant="ghost" className="md:hidden" aria-label="Open itinerary" />
              }
            >
              <ListTree className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b">
                <SheetTitle className="flex items-center gap-2">
                  <Route className="size-4 text-primary" />
                  Itinerary
                </SheetTitle>
                <SheetDescription>Tap a stop to jump to it on the map.</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1">
                <TripSidebar activeCityId={activeCity?.id ?? null} onSelect={handleSelect} />
              </div>
            </SheetContent>
          </Sheet>

          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm sm:size-9">
            <Sun className="size-4.5 sm:size-5" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-base leading-tight font-bold tracking-tight sm:text-lg">
              EU Trip <span className="text-accent">2026</span>
            </h1>
            <p className="hidden text-xs text-muted-foreground md:block">
              Tunisia → Italy → Switzerland → Germany → Belgium → France → Tunisia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <dl className="hidden items-center gap-4 text-right sm:flex">
            <div>
              <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Stops</dt>
              <dd className="text-sm font-semibold tabular-nums">{tripStats.stopCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Countries</dt>
              <dd className="text-sm font-semibold tabular-nums">{tripStats.countryCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Route</dt>
              <dd className="text-sm font-semibold tabular-nums">~{tripStats.totalDistanceKm.toLocaleString()} km</dd>
            </div>
          </dl>
          <ThemeToggle />
        </div>
      </header>
      <div className="summer-gradient-bar shrink-0" />

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-80 shrink-0 border-r bg-card md:block">
          <TripSidebar activeCityId={activeCity?.id ?? null} onSelect={handleSelect} />
        </aside>

        <main className="relative min-w-0 flex-1">
          <TripMap
            activeCityId={activeCity?.id ?? null}
            onActiveCityChange={handleActiveCityChange}
            focusRequest={focusRequest}
            activePoiId={activePoi?.id ?? null}
            onSelectPoi={setActivePoi}
            searchResult={searchResult}
          />
          <SearchBar onSelect={setSearchResult} onClear={() => setSearchResult(null)} />
          {activePoi ? (
            <PoiPanel poi={activePoi} onBack={() => setActivePoi(null)} />
          ) : (
            <CityPanel city={activeCity} onClose={() => setActiveCity(null)} />
          )}
        </main>
      </div>
    </div>
  );
}
