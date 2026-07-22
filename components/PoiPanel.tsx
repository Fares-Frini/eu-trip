"use client";

import { ArrowLeft, ImageOff, MapPin } from "lucide-react";
import type { PointOfInterest } from "@/data/poi";
import { tripStopsSorted } from "@/data/trip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PoiPanel({
  poi,
  onBack,
}: {
  poi: PointOfInterest | null;
  onBack: () => void;
}) {
  const city = poi ? tripStopsSorted.find((s) => s.id === poi.cityId) : undefined;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-3 bottom-3 z-[1000] transition-all duration-300 md:inset-x-auto md:right-3 md:top-3 md:bottom-auto md:w-96",
        poi ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 md:translate-y-0 md:-translate-x-2"
      )}
    >
      {poi && (
        <Card className="pointer-events-auto max-h-[70vh] gap-0 overflow-hidden rounded-2xl border-border/60 bg-card/95 py-0 shadow-xl backdrop-blur">
          <div className="relative">
            {poi.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poi.image} alt={poi.name} className="h-44 w-full object-cover" />
            ) : (
              <div className="flex h-44 w-full items-center justify-center bg-muted text-muted-foreground">
                <ImageOff className="size-8" />
              </div>
            )}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-3 left-3 shadow-md"
              onClick={onBack}
              aria-label="Back to city"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </div>

          <div className="px-4 pt-4">
            {city && (
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5" />
                {city.name}
              </div>
            )}
            <h2 className="mt-0.5 text-xl font-bold tracking-tight">{poi.name}</h2>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 px-4">
            {poi.price && <Badge variant="secondary">{poi.price}</Badge>}
          </div>

          <Separator className="mt-4" />

          <div className="trip-scroll max-h-[30vh] overflow-y-auto px-4 py-4 text-sm">
            {poi.description ? (
              <p className="text-foreground/90">{poi.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No extra details yet for {poi.name}.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
