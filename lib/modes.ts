import { Car, Ship, TrainFront, Plane, type LucideIcon } from "lucide-react";
import type { TransportMode } from "@/data/trip";

// Keep these in sync with the --mode-* custom properties in app/globals.css.
export const MODE_COLORS: Record<"light" | "dark", Record<TransportMode, string>> = {
  light: {
    car: "oklch(0.68 0.19 35)",
    ferry: "oklch(0.65 0.13 205)",
    train: "oklch(0.58 0.17 320)",
    plane: "oklch(0.78 0.15 80)",
  },
  dark: {
    car: "oklch(0.74 0.19 35)",
    ferry: "oklch(0.76 0.12 195)",
    train: "oklch(0.72 0.15 315)",
    plane: "oklch(0.84 0.14 85)",
  },
};

export const MODE_LABELS: Record<TransportMode, string> = {
  car: "By road",
  ferry: "By ferry",
  train: "By train",
  plane: "By plane",
};

export const MODE_ICONS: Record<TransportMode, LucideIcon> = {
  car: Car,
  ferry: Ship,
  train: TrainFront,
  plane: Plane,
};

export const MODE_DASH: Record<TransportMode, string | undefined> = {
  car: undefined,
  ferry: "1 12",
  train: "8 6",
  plane: "2 10",
};
