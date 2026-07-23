import { Map, Palette, Route, Satellite, type LucideIcon } from "lucide-react";

export type MapStyleId = "minimal" | "voyager" | "streets" | "satellite";

export interface MapStyleOption {
  id: MapStyleId;
  label: string;
  icon: LucideIcon;
  attribution: string;
  /** Either a single tile URL template, or separate light/dark variants that follow the site theme */
  url: string | { light: string; dark: string };
}

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const CARTO_ATTRIBUTION = `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`;

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: "minimal",
    label: "Minimal",
    icon: Map,
    attribution: CARTO_ATTRIBUTION,
    url: {
      light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    },
  },
  {
    id: "voyager",
    label: "Voyager",
    icon: Palette,
    attribution: CARTO_ATTRIBUTION,
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  },
  {
    id: "streets",
    label: "Streets",
    icon: Route,
    attribution: OSM_ATTRIBUTION,
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  {
    id: "satellite",
    label: "Satellite",
    icon: Satellite,
    attribution:
      "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
];

export function resolveTileUrl(style: MapStyleOption, isDark: boolean): string {
  return typeof style.url === "string" ? style.url : isDark ? style.url.dark : style.url.light;
}
