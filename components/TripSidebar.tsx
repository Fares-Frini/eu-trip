"use client";

import { tripStopsSorted, type CityStop } from "@/data/trip";
import { MODE_ICONS, MODE_LABELS } from "@/lib/modes";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function TripSidebar({
  activeCityId,
  onSelect,
}: {
  activeCityId: string | null;
  onSelect: (city: CityStop) => void;
}) {
  return (
    <ScrollArea className="trip-scroll h-full">
      <div className="flex flex-col gap-0 px-3 py-4">
        {tripStopsSorted.map((stop, i) => {
          const isActive = activeCityId === stop.id;
          const isLast = i === tripStopsSorted.length - 1;
          const ModeIcon = stop.arriveBy ? MODE_ICONS[stop.arriveBy] : null;

          return (
            <div key={stop.id}>
              {i > 0 && ModeIcon && (
                <div className="flex items-center gap-3 py-1 pl-[15px] text-muted-foreground">
                  <span className="h-5 w-px bg-border" />
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <ModeIcon className="size-3.5" />
                    {MODE_LABELS[stop.arriveBy!]}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelect(stop)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                  isActive ? "bg-primary/10" : "hover:bg-muted"
                )}
              >
                <span className="relative flex shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      "flex size-[30px] items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground group-hover:border-primary/60"
                    )}
                  >
                    {stop.order + 1}
                  </span>
                  {!isLast && <span className="mt-1 w-px flex-1 bg-border" style={{ minHeight: 4 }} />}
                </span>

                <span className="flex min-w-0 flex-1 flex-col pt-0.5">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-sm font-semibold",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {stop.name}
                    </span>
                    {stop.days && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                        {stop.days}d
                      </Badge>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{stop.country}</span>
                  {stop.summary && (
                    <span className="mt-0.5 truncate text-xs text-muted-foreground/80">{stop.summary}</span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
