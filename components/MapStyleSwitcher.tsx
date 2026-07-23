"use client";

import { MAP_STYLES, type MapStyleId } from "@/lib/mapStyles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MapStyleSwitcher({
  value,
  onChange,
}: {
  value: MapStyleId;
  onChange: (id: MapStyleId) => void;
}) {
  return (
    <Card className="pointer-events-auto absolute bottom-4 left-1/2 z-1000 -translate-x-1/2 flex-row gap-1 rounded-full border-border/60 bg-card/90 p-1 shadow-md backdrop-blur">
      {MAP_STYLES.map((style) => {
        const Icon = style.icon;
        const active = style.id === value;
        return (
          <Button
            key={style.id}
            type="button"
            size="sm"
            variant={active ? "default" : "ghost"}
            className={cn("gap-1.5 rounded-full px-3 text-xs", !active && "text-muted-foreground")}
            onClick={() => onChange(style.id)}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{style.label}</span>
          </Button>
        );
      })}
    </Card>
  );
}
