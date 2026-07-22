"use client";

import { X, MapPin } from "lucide-react";
import type { CityStop } from "@/data/trip";
import { MODE_ICONS, MODE_LABELS } from "@/lib/modes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CityPanel({
  city,
  onClose,
}: {
  city: CityStop | null;
  onClose: () => void;
}) {
  const details = city?.details;
  const hasDetails =
    details &&
    (details.description || details.highlights?.length || details.activities?.length || details.notes);
  const ModeIcon = city?.arriveBy ? MODE_ICONS[city.arriveBy] : null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-3 bottom-3 z-[1000] transition-all duration-300 md:inset-x-auto md:right-3 md:top-3 md:bottom-auto md:w-96",
        city ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 md:translate-y-0 md:-translate-x-2"
      )}
    >
      {city && (
        <Card className="pointer-events-auto max-h-[70vh] gap-0 overflow-hidden rounded-2xl border-border/60 bg-card/95 py-0 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-3 px-4 pt-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5" />
                Stop {city.order + 1} of 13
              </div>
              <h2 className="mt-0.5 truncate text-xl font-bold tracking-tight">{city.name}</h2>
              <p className="text-sm text-muted-foreground">{city.country}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 px-4">
            {city.days && (
              <Badge variant="secondary">
                {city.days} day{city.days > 1 ? "s" : ""} planned
              </Badge>
            )}
            {ModeIcon && city.arriveBy && (
              <Badge variant="outline" className="gap-1">
                <ModeIcon className="size-3" />
                {MODE_LABELS[city.arriveBy]}
              </Badge>
            )}
          </div>

          <Separator className="mt-4" />

          <div className="trip-scroll max-h-[40vh] overflow-y-auto px-4 py-4">
            {hasDetails ? (
              <div className="space-y-4 text-sm">
                {details?.description && <p className="text-foreground/90">{details.description}</p>}

                {details?.highlights && details.highlights.length > 0 && (
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Highlights
                    </h3>
                    <ul className="space-y-1">
                      {details.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {details?.activities && details.activities.length > 0 && (
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Planned activities
                    </h3>
                    <ul className="space-y-1">
                      {details.activities.map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {details?.notes && (
                  <p className="border-l-2 border-accent/40 pl-3 text-xs text-muted-foreground italic">
                    {details.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No details added yet for {city.name}. Fill this in later in{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs not-italic">data/trip.ts</code>.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
