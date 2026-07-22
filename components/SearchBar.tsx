"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPinned, Search, X } from "lucide-react";
import { searchPlaces, type GeocodeResult } from "@/lib/geocode";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SearchBar({
  onSelect,
  onClear,
}: {
  onSelect: (result: GeocodeResult) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (selected || trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      searchPlaces(trimmed, controller.signal).then((hits) => {
        setResults(hits);
        setLoading(false);
        setOpen(true);
      });
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, selected]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: GeocodeResult) {
    setSelected(result);
    setQuery(result.name);
    setOpen(false);
    onSelect(result);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear();
  }

  return (
    <div ref={containerRef} className="pointer-events-none absolute top-3 left-3 z-1000 w-[calc(100%-1.5rem)] max-w-xs">
      <div className="pointer-events-auto relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) setSelected(null);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search any place…"
          className="rounded-xl border-border/60 bg-card/95 pr-9 pl-9 shadow-md backdrop-blur"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!loading && query && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {open && results.length > 0 && (
        <Card className="pointer-events-auto mt-1.5 max-h-72 gap-0 overflow-y-auto rounded-xl border-border/60 bg-card/95 p-1.5 shadow-lg backdrop-blur trip-scroll">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result)}
              className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <MapPinned className="mt-0.5 size-4 shrink-0 text-accent" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">{result.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{result.displayName}</span>
              </span>
            </button>
          ))}
        </Card>
      )}

      {open && !loading && query.trim().length >= 3 && results.length === 0 && (
        <Card className="pointer-events-auto mt-1.5 rounded-xl border-border/60 bg-card/95 px-3 py-2.5 text-sm text-muted-foreground shadow-lg backdrop-blur">
          No places found.
        </Card>
      )}
    </div>
  );
}
